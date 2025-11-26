'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { Loader2, FileText, Printer, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ───────────── PDF Styles ─────────────
const pdfStyles = StyleSheet.create({
  page: { padding: 30, fontSize: 11, fontFamily: 'Helvetica' },
  title: { fontSize: 18, marginBottom: 12, fontWeight: 'bold' as const, textAlign: 'center' as const },
  section: { marginBottom: 16 },
  row: { flexDirection: 'row' as const, marginBottom: 6, alignItems: 'flex-start' as const },
  label: { fontWeight: 'bold' as const, width: 140, color: '#1f2937' },
  value: { flex: 1, color: '#374151' },
  footer: { marginTop: 30, fontSize: 9, color: '#6b7280', textAlign: 'center' as const },
});

// ───────────── Sale PDF Document ─────────────
const SalePdf = ({ sale }: { sale: Sale }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <Text style={pdfStyles.title}>Sales Receipt</Text>
      <Text style={{ textAlign: 'center' as const, marginBottom: 20, fontSize: 12 }}>
        Sale ID: {sale.id}
      </Text>

      <View style={pdfStyles.section}>
        <View style={pdfStyles.row}><Text style={pdfStyles.label}>Buyer:</Text><Text style={pdfStyles.value}>{sale.buyerName}</Text></View>
        <View style={pdfStyles.row}><Text style={pdfStyles.label}>Buyer Code:</Text><Text style={pdfStyles.value}>{sale.buyerCode}</Text></View>
        <View style={pdfStyles.row}><Text style={pdfStyles.label}>Sale Date:</Text><Text style={pdfStyles.value}>{new Date(sale.saleDate).toLocaleString('en-IN')}</Text></View>
        <View style={pdfStyles.row}><Text style={pdfStyles.label}>Category:</Text><Text style={pdfStyles.value}>{sale.categoryDescription}</Text></View>
        <View style={pdfStyles.row}><Text style={pdfStyles.label}>Grade:</Text><Text style={pdfStyles.value}>{sale.gradeDescription}</Text></View>
        <View style={pdfStyles.row}><Text style={pdfStyles.label}>Lot No:</Text><Text style={pdfStyles.value}>{sale.lotNo}</Text></View>
        <View style={pdfStyles.row}><Text style={pdfStyles.label}>Quantity:</Text><Text style={pdfStyles.value}>{sale.quantity}</Text></View>
        <View style={pdfStyles.row}><Text style={pdfStyles.label}>Net Weight:</Text><Text style={pdfStyles.value}>{sale.netWeight} kg</Text></View>
        <View style={pdfStyles.row}><Text style={pdfStyles.label}>Price:</Text><Text style={pdfStyles.value}>₹{sale.price.toLocaleString('en-IN')}</Text></View>
        <View style={pdfStyles.row}><Text style={pdfStyles.label}>Status:</Text><Text style={pdfStyles.value}>{sale.approvalStatusString || (sale.delivered ? 'Delivered' : 'Pending')}</Text></View>
      </View>

      <Text style={pdfStyles.footer}>
        Generated on {new Date().toLocaleString('en-IN')} | Sale ID: {sale.id}
      </Text>
    </Page>
  </Document>
);

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

        const res = await fetch('http://51.75.119.133:5243/api/Sales/approved', {
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