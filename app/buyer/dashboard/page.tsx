'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { Loader2, FileText, Printer, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ───────────── PDF Styles ─────────────
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    position: 'relative'
  },

  // Main Layout Containers
  contentContainer: {
    marginLeft: 100,
  },

  // Vertical Line
  verticalLine: {
    position: 'absolute',
    left: 90,
    top: 20,
    bottom: 20,
    width: 1,
    backgroundColor: '#000'
  },

  // Sidebar
  sidebarContainer: {
    position: 'absolute',
    left: 0,
    top: 50,
    width: 90,
    height: '100%',
  },
  sidebarItem: {
    position: 'absolute',
    transform: 'rotate(-90deg)',
    width: 100, // Fixed width for rotation center
    textAlign: 'center',
    fontSize: 9,
  },

  // Header Section
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: 'flex-start'
  },
  logoSection: {
    flexDirection: 'row',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 15
  },
  companyDetailBox: {
    fontSize: 9,
    lineHeight: 1.4
  },
  mainTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
    textAlign: 'right'
  },
  subTitle: {
    fontSize: 9,
    textAlign: 'right',
  },

  // Info Grid - Single Line
  infoRowMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 15,
    paddingRight: 20
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  infoLabel: {
    fontWeight: 'bold',
    fontSize: 9,
    marginRight: 5
  },
  infoValue: {
    fontSize: 9,
    fontWeight: 'bold'
  },

  // Delivery To Section
  deliverySection: {
    marginTop: 5,
    marginBottom: 10,
  },
  storeKeeperRow: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'flex-start'
  },
  storeKeeperLabel: {
    fontWeight: 'bold',
    fontSize: 9,
    width: 90
  },
  storeKeeperValue: {
    fontSize: 9,
    fontWeight: 'bold',
    flex: 1
  },
  lotMarkRow: {
    flexDirection: 'row',
    marginTop: 2
  },
  lotItem: {
    flexDirection: 'row',
    marginRight: 40
  },

  // Table
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#000',
    marginTop: 10,
    marginBottom: 10
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    backgroundColor: '#fff',
    height: 25,
    alignItems: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 9
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minHeight: 35,
    alignItems: 'center',
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 'bold'
  },
  col1: { width: '15%', borderRightWidth: 1, borderRightColor: '#000', height: '100%', justifyContent: 'center' },
  col2: { width: '10%', borderRightWidth: 1, borderRightColor: '#000', height: '100%', justifyContent: 'center' },
  col3: { width: '15%', borderRightWidth: 1, borderRightColor: '#000', height: '100%', justifyContent: 'center' },
  col4: { width: '20%', borderRightWidth: 1, borderRightColor: '#000', height: '100%', justifyContent: 'center' },
  col5: { width: '20%', borderRightWidth: 1, borderRightColor: '#000', height: '100%', justifyContent: 'center' },
  col6: { width: '20%', height: '100%', justifyContent: 'center' }, // Total Net Weight

  // Footer Section
  footerSection: {
    marginTop: 20
  },
  soldByText: {
    fontSize: 10,
    marginBottom: 5
  },
  sellerName: {
    fontSize: 11,
    fontWeight: 'heavy', // 'bold' sometimes has issues in some pdf renderers, but standard fonts support bold
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10
  },
  storageText: {
    fontSize: 9,
    marginBottom: 20
  },
  deliveryLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40
  },
  dots: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'dotted', // React-pdf dotted support can be tricky, solid is safer
    flex: 1,
    marginLeft: 10
  },

  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingRight: 20
  },
  signatureBox: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    width: 200,
    paddingTop: 5,
    textAlign: 'center',
    fontSize: 9
  },
  brokerSignature: {
    textAlign: 'right',
    width: 200
  },

  disclaimer: {
    marginTop: 30,
    fontSize: 8,
    textAlign: 'justify',
    lineHeight: 1.3,
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderStyle: 'dashed',
    paddingTop: 5
  },
});

// ───────────── Sale PDF Document ─────────────
const SalePdf = ({ sale }: { sale: Sale }) => {
  // Current date for the "Date" field
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  // Format Sale Date for storage calculation
  const saleDateObj = new Date(sale.saleDate);
  const freeStorageDate = new Date(saleDateObj);
  freeStorageDate.setDate(saleDateObj.getDate() + 14);
  const formattedStorageDate = freeStorageDate.toLocaleDateString('en-GB');

  // Generate Invoice No based on ID if not available
  const invoiceNo = `0${sale.id}R`;
  // User requested "Sales no is invoice no", so we use invoiceNo for Sale No field too
  const saleNo = invoiceNo;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={pdfStyles.page}>

        {/* Vertical Separator Line */}
        <View style={pdfStyles.verticalLine}></View>

        {/* Sidebar Items - Adjusted positions to match image */}
        <View style={pdfStyles.sidebarContainer}>
          {/* Top Group */}
          <Text style={[pdfStyles.sidebarItem, { top: 60, left: -10 }]}>{currentDate}</Text>
          <Text style={[pdfStyles.sidebarItem, { top: 60, left: 15 }]}>{sale.categoryDescription || 'KINELLAN'}</Text>

          <Text style={[pdfStyles.sidebarItem, { top: 120, left: -10, fontSize: 8 }]}>Date</Text>
          <Text style={[pdfStyles.sidebarItem, { top: 120, left: 15, fontSize: 8 }]}>Mark</Text>
          <Text style={[pdfStyles.sidebarItem, { top: 120, left: 40, fontSize: 8 }]}>Stores</Text>

          {/* Bottom Group */}
          <Text style={[pdfStyles.sidebarItem, { top: 250, left: 15 }]}>{invoiceNo}</Text>
          <Text style={[pdfStyles.sidebarItem, { top: 300, left: -25 }]}>{saleNo}</Text>

          <Text style={[pdfStyles.sidebarItem, { top: 350, left: -25, fontSize: 8 }]}>Sale No.</Text>
          <Text style={[pdfStyles.sidebarItem, { top: 350, left: 0, fontSize: 8 }]}>Invoice No.</Text>
          <Text style={[pdfStyles.sidebarItem, { top: 350, left: 25, fontSize: 8 }]}>Order No.</Text>
          <Text style={[pdfStyles.sidebarItem, { top: 350, left: 50, fontSize: 8 }]}>Lot No.</Text>
        </View>

        <View style={pdfStyles.contentContainer}>
          {/* Header */}
          <View style={pdfStyles.headerContainer}>
            <View style={pdfStyles.logoSection}>
              <Text style={pdfStyles.logoText}>EB</Text>
              <View style={pdfStyles.companyDetailBox}>
                <Text>891 2nd Division,</Text>
                <Text>Maradana, Punchi Borella</Text>
                <Text>Colombo 10.</Text>
              </View>
            </View>

            <View>
              <Text style={pdfStyles.mainTitle}>EASTERN BROKERS LTD.</Text>
              <Text style={pdfStyles.subTitle}>TEA DELIVERY ORDER - Main Buyer</Text>
            </View>
          </View>

          {/* Info Rows - Single Line */}
          <View style={pdfStyles.infoRowMain}>
            <View style={pdfStyles.infoItem}>
              <Text style={pdfStyles.infoLabel}>Sale No. :</Text>
              <Text style={pdfStyles.infoValue}>{saleNo}</Text>
            </View>
            <View style={pdfStyles.infoItem}>
              <Text style={pdfStyles.infoLabel}>Order No. :</Text>
              <Text style={pdfStyles.infoValue}>{sale.id}</Text>
            </View>
            <View style={pdfStyles.infoItem}>
              <Text style={pdfStyles.infoLabel}>Date. :</Text>
              <Text style={pdfStyles.infoValue}>{currentDate}</Text>
            </View>
          </View>

          <View style={pdfStyles.deliverySection}>
            <View style={pdfStyles.storeKeeperRow}>
              <Text style={pdfStyles.storeKeeperLabel}>To the Storekeeper :</Text>
              <Text style={pdfStyles.storeKeeperValue}>{sale.buyerName?.toUpperCase()}</Text>
            </View>
            <View style={pdfStyles.lotMarkRow}>
              <View style={pdfStyles.lotItem}>
                <Text style={pdfStyles.storeKeeperLabel}>Lot No. :</Text>
                <Text style={pdfStyles.infoValue}>{sale.lotNo || '450'}</Text>
              </View>
              <View style={pdfStyles.lotItem}>
                <Text style={pdfStyles.storeKeeperLabel}>Mark :</Text>
                <Text style={pdfStyles.infoValue}>{sale.categoryDescription || 'KINELLAN'}</Text>
              </View>
            </View>
          </View>

          {/* Invoice Table */}
          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader}>
              <View style={pdfStyles.col1}><Text>Inv. No.</Text></View>
              <View style={pdfStyles.col2}><Text>Pkgs.</Text></View>
              <View style={pdfStyles.col3}><Text>Type</Text></View>
              <View style={pdfStyles.col4}><Text>NETT</Text></View>
              <View style={pdfStyles.col5}><Text>GRADE</Text></View>
              <View style={pdfStyles.col6}><Text>Total Net Weight</Text></View>
            </View>

            <View style={pdfStyles.tableRow}>
              <View style={pdfStyles.col1}><Text>{invoiceNo}</Text></View>
              <View style={pdfStyles.col2}><Text>{sale.quantity}</Text></View>
              <View style={pdfStyles.col3}><Text>Bags</Text></View> {/* Hardcoded as Type isn't in Sale */}
              <View style={pdfStyles.col4}><Text>{(sale.netWeight / (sale.quantity || 1)).toFixed(1)}</Text></View>
              <View style={pdfStyles.col5}><Text>{sale.gradeDescription || 'DUST'}</Text></View>
              <View style={pdfStyles.col6}><Text>{sale.netWeight.toFixed(1)}</Text></View>
            </View>
          </View>

          {/* Footer Area */}
          <View style={pdfStyles.footerSection}>
            <Text style={pdfStyles.soldByText}>The above mentioned lot has been purchased by messrs.</Text>
            <Text style={pdfStyles.sellerName}>CEYEM COMMODITIES PVT LTD</Text>
            <Text style={pdfStyles.storageText}>Last date of free storage :   {formattedStorageDate}</Text>

            <View style={pdfStyles.deliveryLine}>
              <Text>Please deliver to bearer. N.I.C. No.</Text>
              <View style={pdfStyles.dots}></View>
            </View>

            <View style={pdfStyles.signatureRow}>
              <Text style={{ width: 250 }}></Text>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ marginBottom: 30, fontSize: 10 }}>EASTERN BROKERS LTD.</Text>
                <Text style={pdfStyles.signatureBox}>FOR DIRECTOR</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 }}>
              <View style={{ width: 250, borderTopWidth: 1, borderTopColor: '#000', paddingTop: 5 }}>
                <Text style={{ textAlign: 'center', fontSize: 9 }}>Buyer's authorised signatory</Text>
              </View>
            </View>

            <Text style={pdfStyles.disclaimer}>
              The tea lots purchased by you at the auction are stored in our warehouse subject to the risks of the buyer on the same as provided in rule no 32 (I) of 'Bye laws and conditions for the sale of tea by public auction and by treaty' of the Ceylon Chamber of Commerce.
            </Text>
          </View>

        </View> {/* End contentContainer */}

      </Page>
    </Document>
  );
};

// ───────────── Sale Type ─────────────
interface Sale {
  id: number;
  buyerName: string;
  buyerCode: string;
  saleDate: string;
  categoryDescription: string;
  gradeDescription: string;
  lotNo: number;
  quantity: number;
  netWeight: number;
  price: number;
  delivered: boolean;
  approvalStatusString?: string; // Added this field based on API response
  status?: string; // Optional status field from API
}

// ───────────── Buyer Dashboard ─────────────
export default function BuyerDashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [printingId, setPrintingId] = useState<number | null>(null);
  const [userType, setUserType] = useState<string>('Buyer');
  const router = useRouter();

  // Load userType
  useEffect(() => {
    const type = localStorage.getItem('userType');
    if (type) setUserType(type);
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) router.push('/login');
  }, [router]);

  // Fetch approved sales
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return router.push('/login');

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Sales/approved`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error(await res.text() || 'Failed to load sales');

        const json = await res.json();
        if (json.success && Array.isArray(json.data)) setSales(json.data);
        else setSales([]);
      } catch (e: any) {
        setError(e.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [router]);

  // Logout
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    router.push('/login');
  };

  // Get status display with proper styling
  const getStatusDisplay = (sale: Sale) => {
    // Use approvalStatusString from API response
    if (sale.approvalStatusString) {
      const statusLower = sale.approvalStatusString.toLowerCase();
      if (statusLower === 'delivered') {
        return { text: 'Delivered', class: 'bg-green-500/20 text-green-300' };
      } else if (statusLower === 'pending') {
        return { text: 'Pending', class: 'bg-yellow-500/20 text-yellow-300' };
      } else if (statusLower === 'shipped') {
        return { text: 'Shipped', class: 'bg-blue-500/20 text-blue-300' };
      } else if (statusLower === 'cancelled') {
        return { text: 'Cancelled', class: 'bg-red-500/20 text-red-300' };
      } else if (statusLower === 'processing') {
        return { text: 'Processing', class: 'bg-purple-500/20 text-purple-300' };
      } else if (statusLower === 'approved') {
        return { text: 'Approved', class: 'bg-green-500/20 text-green-300' };
      }
      return { text: sale.approvalStatusString, class: 'bg-gray-500/20 text-gray-300' };
    }

    // Fallback to delivered field if approvalStatusString is not available
    return {
      text: sale.delivered ? 'Delivered' : 'Pending',
      class: sale.delivered ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
    };
  };

  // Print PDF
  const printSale = async (sale: Sale) => {
    setPrintingId(sale.id);
    try {
      const blob = await pdf(<SalePdf sale={sale} />).toBlob();
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (win) win.onload = () => setTimeout(() => win.print(), 500);
      else alert('Allow pop-ups to print');
    } catch {
      alert('Print failed');
    } finally {
      setPrintingId(null);
    }
  };

  // Download PDF
  const downloadSale = async (sale: Sale) => {
    const blob = await pdf(<SalePdf sale={sale} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sale_${sale.id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Buyer Dashboard
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Welcome, <strong>{userType}</strong>
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg border border-red-500/30 transition"
            >
              Logout
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-200 text-sm mb-6">
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && sales.length === 0 && !error && (
            <div className="text-center py-16 text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>No sales found.</p>
            </div>
          )}

          {/* Table */}
          {sales.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="py-4 px-6 text-purple-300 font-medium">Sale ID</th>
                    <th className="py-4 px-6 text-purple-300 font-medium">Buyer</th>
                    <th className="py-4 px-6 text-purple-300 font-medium">Date</th>
                    <th className="py-4 px-6 text-purple-300 font-medium">Amount</th>
                    <th className="py-4 px-6 text-purple-300 font-medium">Status</th>
                    <th className="py-4 px-6 text-purple-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => {
                    const statusDisplay = getStatusDisplay(s);
                    return (
                      <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="py-4 px-6 text-white">{s.id}</td>
                        <td className="py-4 px-6">
                          <p className="font-medium text-white">{s.buyerName}</p>
                          <p className="text-xs text-gray-400">{s.buyerCode}</p>
                        </td>
                        <td className="py-4 px-6 text-gray-300">{new Date(s.saleDate).toLocaleDateString('en-IN')}</td>
                        <td className="py-4 px-6 text-gray-300">₹{s.price.toLocaleString('en-IN')}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusDisplay.class}`}>
                            {statusDisplay.text}
                          </span>
                        </td>
                        <td className="py-4 px-6 flex gap-2">
                          <button
                            onClick={() => printSale(s)}
                            disabled={printingId === s.id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white text-sm rounded-lg disabled:opacity-70"
                          >
                            {printingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                            Print
                          </button>
                          <button
                            onClick={() => downloadSale(s)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-sm rounded-lg border border-cyan-500/30"
                          >
                            <Download className="w-4 h-4" />
                            PDF
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}