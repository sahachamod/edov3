'use client'

import { useState, useEffect, useMemo, useRef, SetStateAction } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Users,
  UserCog,
  TrendingUp,
  ShieldCheck,
  LogOut,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Clock,
  LayoutDashboard,
  Settings,
  HelpCircle,
  Calendar,
  DollarSign,
  Eye
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Interface definitions with optional properties
interface User {
  id: number;
  name: string;
  email: string;
  buyerCode: string;
  roleId: number;
  roleName?: string;
  approvalStatus?: number;
  approvalStatusString?: string;
  created?: string;
  updated?: string;
}

interface Payment {
  id: number;
  salesRequestId: number;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  status: number;
  paymentDate: string;
  paymentReference: string;
  bankDetails: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateBuyerForm {
  buyerCode: string;
  buyerName: string;
  vatNo: string;
  address: string;
  contactPerson: string;
  phoneNo: string;
  mobBuyer: string;
  frequent: string;
  svatNo: string;
  vatType: string;
  bGrantee: boolean;
}

interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  buyerCode: string;
  roleId: number;
}

interface UpdateUserForm {
  name: string;
  email: string;
  buyerCode: string;
  roleId: number;
}

interface SalesApprovalRequest {
  salesTransactionId: number;
  isApproved: boolean;
  remarks: string;
}

interface SalesApprovalResponse {
  success: boolean;
  message: string;
  data?: string;
  errors?: {
    field: string;
    message: string;
  }[];
  details?: string;
  statusCode?: number;
  timestamp?: string;
}

interface PendingSalesResponse {
  success: boolean;
  message: string;
  data?: PendingSale[];
  errors?: {
    field: string;
    message: string;
  }[];
  details?: string;
  statusCode?: number;
  timestamp?: string;
}

interface Buyer {
  buyerCode: string;
  buyerName: string;
  vatNo: string;
  address: string;
  contactPerson: string;
  phoneNo: string;
  mobBuyer: string;
  frequent: string;
  svatNo: string;
  vatType: string;
  bGrantee: boolean;
}

interface PendingSale {
  id: number;
  buyerName: string;
  buyerCode: string;
  price: number;
  quantity: number;
  totalNetWeight: number;
  gradeDescription: string;
  categoryDescription: string;
  approvalStatus: number;
  saleDate: string;
  invoiceNo: string;
}

interface Sale {
  id: number;
  date: string;
  total: number;
}

// Payment response interface for the new endpoint
interface PaymentDetailsResponse {
  success: boolean;
  message: string;
  data?: Payment[];
  errors?: {
    field: string;
    message: string;
  }[];
  details?: string;
  statusCode?: number;
  timestamp?: string;
}

// Payment approval request interface
interface PaymentApprovalRequest {
  paymentId: number;
  isApproved: boolean;
  remarks: string;
}

// Payment approval response interface
interface PaymentApprovalResponse {
  success: boolean;
  message: string;
  data?: string;
  errors?: {
    field: string;
    message: string;
  }[];
  details?: string;
  statusCode?: number;
  timestamp?: string;
}

/* ------------------------------------------------------------------ */
/* CSS Styles */
/* ------------------------------------------------------------------ */
const styles = `
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}
.neu {
  background: linear-gradient(145deg, #1e293b, #334155);
  border-radius: 16px;
  box-shadow: 5px 5px 10px #0f172a, -5px -5px 10px #334155;
}
.input {
  width: 100%;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  transition: all 0.2s;
}
.input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
}
.input::placeholder {
  color: #94a3b8;
}
.btn {
  position: relative;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.btn-primary {
  background: linear-gradient(45deg, #8b5cf6, #6366f1);
  color: white;
}
.btn-primary:hover:not(:disabled) {
  background: linear-gradient(45deg, #7c3aed, #4f46e5);
  transform: translateY(-1px);
}
.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}
.btn-danger {
  background: linear-gradient(45deg, #ef4444, #dc2626);
  color: white;
}
.btn-danger:hover:not(:disabled) {
  background: linear-gradient(45deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
}
.btn-indigo {
  background: linear-gradient(45deg, #6366f1, #4f46e5);
  color: white;
}
.btn-indigo:hover:not(:disabled) {
  background: linear-gradient(45deg, #4f46e5, #4338ca);
  transform: translateY(-1px);
}
.btn-success {
  background: linear-gradient(45deg, #10b981, #059669);
  color: white;
}
.btn-success:hover:not(:disabled) {
  background: linear-gradient(45deg, #059669, #047857);
  transform: translateY(-1px);
}
.btn-amber {
  background: linear-gradient(45deg, #f59e0b, #d97706);
  color: white;
}
.btn-amber:hover:not(:disabled) {
  background: linear-gradient(45deg, #d97706, #b45309);
  transform: translateY(-1px);
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}
.pagination-btn {
  padding: 8px 12px;
  margin: 0 2px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.pagination-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}
.pagination-btn.active {
  background: linear-gradient(45deg, #8b5cf6, #6366f1);
  border-color: transparent;
}
.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pagination-info {
  color: #94a3b8;
  font-size: 14px;
  margin: 0 10px;
}
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: #94a3b8;
  transition: all 0.2s;
  cursor: pointer;
  font-weight: 500;
}
.sidebar-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}
.sidebar-item.active {
  background: linear-gradient(45deg, #8b5cf6, #6366f1);
  color: white;
}
.sidebar-item-icon {
  width: 20px;
  height: 20px;
}
.footer {
  background: linear-gradient(145deg, #1e293b, #334155);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
  position: relative;
  z-index: 10;
}
.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}
.footer-logo {
  font-weight: 700;
  background: linear-gradient(45deg, #8b5cf6, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}
`;

/* ------------------------------------------------------------------ */
/* Toast System */
/* ------------------------------------------------------------------ */
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -50 }}
    className={`fixed top-4 right-4 z-50 glass p-4 flex items-center gap-3 min-w-[300px] ${type === 'success' ? 'border-emerald-500' : type === 'error' ? 'border-red-500' : 'border-blue-500'
      }`}
  >
    {type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
    {type === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
    {type === 'info' && <AlertCircle className="w-5 h-5 text-blue-400" />}
    <span className="text-white flex-1">{message}</span>
    <button onClick={onClose} className="text-gray-400 hover:text-white">
      <X className="w-4 h-4" />
    </button>
  </motion.div>
);

/* ------------------------------------------------------------------ */
/* Re‑usable UI Atoms */
/* ------------------------------------------------------------------ */
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-700/50 rounded-xl ${className}`} />
);

const Stat = ({
  icon: Icon,
  title,
  value,
  loading,
  grad,
}: {
  icon: React.ElementType;
  title: string;
  value: React.ReactNode;
  loading?: boolean;
  grad: string;
}) => (
  <motion.div whileHover={{ scale: 1.03 }} className="neu p-6 flex flex-col h-full">
    <div className="flex items-center justify-between mb-4">
      <div
        className={`w-12 h-12 bg-gradient-to-br ${grad} rounded-full flex items-center justify-center opacity-80`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      {loading ? <Skeleton className="h-9 w-24" /> : <span className="text-3xl font-bold text-white">{value}</span>}
    </div>
    <p className="text-sm text-gray-400">{title}</p>
  </motion.div>
);

const Input = ({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: 'text' | 'password' | 'email' | 'date';
  required?: boolean;
  disabled?: boolean;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1.5">
      {label}
      {required && <span className="text-emerald-400">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="input disabled:opacity-50 disabled:cursor-not-allowed"
    />
  </div>
);

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="glass w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

const RippleButton = ({
  onClick,
  children,
  className,
  disabled,
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
  };
  return (
    <button
      onClick={(e) => {
        addRipple(e);
        onClick();
      }}
      disabled={disabled}
      className={`btn ${className} ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {children}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute animate-ping rounded-full bg-white/30"
          style={{
            width: 120,
            height: 120,
            left: r.x,
            top: r.y,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </button>
  );
};

/* ------------------------------------------------------------------ */
/* Pagination Component */
/* ------------------------------------------------------------------ */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  onItemsPerPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
  onItemsPerPageChange: (count: number) => void;
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      const endPage = Math.min(totalPages, startPage + maxVisible - 1);
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">Items per page:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="input w-20 py-1 px-2 text-sm"
        >
          {[5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="pagination-info">
          {startItem}-{endItem} of {totalItems}
        </span>
        <div className="flex items-center">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Sidebar Component */
/* ------------------------------------------------------------------ */
const Sidebar = ({ activeSection, setActiveSection }: {
  activeSection: string;
  setActiveSection: (section: string) => void;
}) => {
  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pending-sales', label: 'Pending Sales', icon: ShieldCheck },
    { id: 'pending-payments', label: 'Pending Payments', icon: DollarSign },
    { id: 'buyer-list', label: 'Buyer List', icon: Users },
    { id: 'user-list', label: 'User List', icon: UserCog },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    window.location.href = '/login';
  };

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-40">
      <div className="p-6">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Admin Portal
        </h1>
      </div>
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {sections.map((section) => (
            <li key={section.id}>
              <div
                onClick={() => {
                  setActiveSection(section.id);
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
              >
                <section.icon className="sidebar-item-icon" />
                <span>{section.label}</span>
              </div>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div
          onClick={handleLogout}
          className="sidebar-item text-red-400 hover:text-red-300"
        >
          <LogOut className="sidebar-item-icon" />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Footer Component */
/* ------------------------------------------------------------------ */
const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-logo">Orysone Technologies</div>
      <p>© {new Date().getFullYear()} All rights reserved by Orysone Technologies</p>
    </div>
  </footer>
);

/* ------------------------------------------------------------------ */
/* Dashboard */
/* ------------------------------------------------------------------ */
export default function AdminDashboard() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [activeSection, setActiveSection] = useState('dashboard');

  // ── Loading ─────────────────────────────────────
  const [buyersLoading, setBuyersLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [pendingSalesLoading, setPendingSalesLoading] = useState(true);
  const [pendingPaymentsLoading, setPendingPaymentsLoading] = useState(true);

  // ── Data ────────────────────────────────────────
  const [totalBuyers, setTotalBuyers] = useState(0);
  const [salesData, setSalesData] = useState<any>({ labels: [], datasets: [] });
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingSales, setPendingSales] = useState<PendingSale[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);

  // ── UI ──────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [saleSearchTerm, setSaleSearchTerm] = useState('');
  const [pendingPaymentSearchTerm, setPendingPaymentSearchTerm] = useState('');
  const [showPaymentSlipModal, setShowPaymentSlipModal] = useState(false);
  const [paymentSlipUrl, setPaymentSlipUrl] = useState('');
  const [paymentSlipLoading, setPaymentSlipLoading] = useState(false);
  const [paymentSlipError, setPaymentSlipError] = useState(false);
  const [isCreateBuyerOpen, setIsCreateBuyerOpen] = useState(false);
  const [isEditBuyerOpen, setIsEditBuyerOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteUserConfirmOpen, setIsDeleteUserConfirmOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedSale, setSelectedSale] = useState<PendingSale | null>(null);
  const [isSaleDetailOpen, setIsSaleDetailOpen] = useState(false);
  const [processingSaleId, setProcessingSaleId] = useState<number | null>(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');

  // ── Payment States ─────────────────────────────
  const [selectedPendingPayment, setSelectedPendingPayment] = useState<Payment | null>(null);
  const [isPendingPaymentDetailOpen, setIsPendingPaymentDetailOpen] = useState(false);
  const [processingPaymentId, setProcessingPaymentId] = useState<number | null>(null);
  const [paymentApprovalRemarks, setPaymentApprovalRemarks] = useState('');

  // ── Bulk Approval States ───────────────────────
  const [selectedSales, setSelectedSales] = useState<number[]>([]);
  const [processingBulk, setProcessingBulk] = useState(false);

  // ── Pagination States ──────────────────────────
  const [buyerCurrentPage, setBuyerCurrentPage] = useState(1);
  const [buyerItemsPerPage, setBuyerItemsPerPage] = useState(10);
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userItemsPerPage, setUserItemsPerPage] = useState(10);
  const [saleCurrentPage, setSaleCurrentPage] = useState(1);
  const [saleItemsPerPage, setSaleItemsPerPage] = useState(10);
  const [pendingPaymentCurrentPage, setPendingPaymentCurrentPage] = useState(1);
  const [pendingPaymentItemsPerPage, setPendingPaymentItemsPerPage] = useState(10);

  // ── Form Loading ───────────────────────────────
  const [createBuyerLoading, setCreateBuyerLoading] = useState(false);
  const [editBuyerLoading, setEditBuyerLoading] = useState(false);
  const [deleteBuyerLoading, setDeleteBuyerLoading] = useState(false);
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);

  const [buyerForm, setBuyerForm] = useState<CreateBuyerForm>({
    buyerCode: '',
    buyerName: '',
    vatNo: '',
    address: '',
    contactPerson: '',
    phoneNo: '',
    mobBuyer: '',
    frequent: '',
    svatNo: '',
    vatType: '',
    bGrantee: true,
  });

  const [userForm, setUserForm] = useState<CreateUserForm>({
    name: '',
    email: '',
    password: '',
    buyerCode: '',
    roleId: 3,
  });

  const [updateUserForm, setUpdateUserForm] = useState<UpdateUserForm>({
    name: '',
    email: '',
    buyerCode: '',
    roleId: 3,
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ────────────────────── Auth ────────────────────── */
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      showToast('Login required', 'error');
      setTimeout(() => window.location.href = '/login', 1000);
      return;
    }
    setAuthToken(token);
  }, []);

  /* ────────────────────── Fetchers ────────────────────── */
  const fetchBuyers = async () => {
    if (!authToken) return;
    setBuyersLoading(true);
    try {
      const res = await fetch('http://51.75.119.133:5243/api/Buyer', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const txt = await res.text();
      if (!res.ok) throw new Error(txt || 'Buyers fetch failed');
      const data = txt.trim() ? JSON.parse(txt) : [];
      const buyersArray: Buyer[] = Array.isArray(data) ? data : [];
      setBuyers(buyersArray);
      setTotalBuyers(buyersArray.length);
    } catch (e: any) {
      console.error('Fetch buyers error:', e);
      showToast(e.message, 'error');
      setBuyers([]);
      setTotalBuyers(0);
    } finally {
      setBuyersLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!authToken) return;
    setUsersLoading(true);
    try {
      const res = await fetch('http://51.75.119.133:5243/api/v1/User', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        },
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Users fetch failed');
      }
      const txt = await res.text();
      console.log('Users API Response:', txt);
      const data = txt.trim() ? JSON.parse(txt) : [];
      console.log('Parsed users data:', data);
      let usersArray: User[] = [];
      if (Array.isArray(data)) {
        usersArray = data;
      } else if (data && typeof data === 'object') {
        usersArray = data.users || data.data || [];
      }
      setUsers(usersArray);
      console.log('Users set in state:', usersArray);
    } catch (e: any) {
      console.error('Fetch users error:', e);
      showToast(e.message || 'Failed to load users', 'error');
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchSales = async () => {
    if (!authToken) return;
    setSalesLoading(true);
    try {
      const res = await fetch('http://51.75.119.133:5243/api/Sales', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const txt = await res.text();
      if (!res.ok) throw new Error(txt || 'Sales fetch failed');
      const data = txt.trim() ? JSON.parse(txt) : [];
      const monthly: Record<string, number> = {};
      if (Array.isArray(data)) {
        data.forEach((s: Sale) => {
          if (s.date) {
            const month = s.date.split('T')[0].slice(0, 7);
            monthly[month] = (monthly[month] || 0) + s.total;
          }
        });
      }
      const labels = Object.keys(monthly).sort();
      setSalesData({
        labels,
        datasets: [
          {
            label: 'Sales ($)',
            data: labels.map((m) => monthly[m]),
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139,92,246,0.15)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#c4b5fd',
            pointHoverRadius: 8,
          },
        ],
      });
    } catch (e: any) {
      console.error('Fetch sales error:', e);
      showToast(e.message, 'error');
      setSalesData({ labels: [], datasets: [] });
    } finally {
      setSalesLoading(false);
    }
  };

  const fetchPendingSales = async () => {
    if (!authToken) return;
    setPendingSalesLoading(true);
    try {
      console.log('Fetching pending sales with token:', authToken.substring(0, 10) + '...');
      const res = await fetch('http://51.75.119.133:5243/api/Sales/pending', {
        headers: {
          'Authorization': `Bearer ${authToken.trim()}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      console.log('Response status:', res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        throw new Error(errorText || 'Pending sales fetch failed');
      }
      const responseText = await res.text();
      console.log('Pending Sales API Response:', responseText);
      if (!responseText || !responseText.trim()) {
        setPendingSales([]);
        return;
      }
      let response: PendingSalesResponse;
      try {
        response = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        throw new Error('Invalid response format from server');
      }
      console.log('Parsed response:', response);
      let pendingSalesData: SetStateAction<PendingSale[]> | (PendingSalesResponse & any[]) = [];
      if (response.success && response.data) {
        pendingSalesData = response.data;
      } else if (Array.isArray(response)) {
        pendingSalesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        pendingSalesData = response.data;
      }
      console.log('Setting pending sales:', pendingSalesData);
      setPendingSales(pendingSalesData);
    } catch (e: any) {
      console.error('Fetch pending sales error:', e);
      showToast(e.message || 'Failed to load pending sales', 'error');
      setPendingSales([]);
    } finally {
      setPendingSalesLoading(false);
    }
  };

  const fetchPendingPayments = async () => {
    if (!authToken) return;
    setPendingPaymentsLoading(true);
    try {
      const res = await fetch('http://51.75.119.133:5243/api/Payment/admin/all?status=0', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Pending payments fetch failed');
      }

      const responseText = await res.text();
      console.log('Pending Payments API Response:', responseText);

      if (!responseText || !responseText.trim()) {
        setPendingPayments([]);
        return;
      }

      let response: PaymentDetailsResponse;
      try {
        response = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        throw new Error('Invalid response format from server');
      }

      console.log('Parsed response:', response);

      let pendingPaymentsData: SetStateAction<Payment[]> | (PaymentDetailsResponse & any[]) = [];
      if (response.success && response.data) {
        pendingPaymentsData = response.data;
      } else if (Array.isArray(response)) {
        pendingPaymentsData = response;
      } else if (response.data && Array.isArray(response.data)) {
        pendingPaymentsData = response.data;
      }

      console.log('Setting pending payments:', pendingPaymentsData);
      setPendingPayments(pendingPaymentsData);
    } catch (e: any) {
      console.error('Fetch pending payments error:', e);
      showToast(e.message || 'Failed to load pending payments', 'error');
      setPendingPayments([]);
    } finally {
      setPendingPaymentsLoading(false);
    }
  };

  const fetchPaymentDetailsBySalesId = async (salesId: number) => {
    if (!authToken) return;
    setProcessingPaymentId(0); // Using 0 as a general loading indicator
    try {
      const res = await fetch(`http://51.75.119.133:5243/api/Payment/sales-txn/${salesId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Payment details fetch failed');
      }

      const responseText = await res.text();
      console.log('Payment Details API Response:', responseText);

      if (!responseText || !responseText.trim()) {
        showToast('No payment details found', 'info');
        return;
      }

      let response: PaymentDetailsResponse;
      try {
        response = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        throw new Error('Invalid response format from server');
      }

      console.log('Parsed response:', response);

      if (response.success && response.data && response.data.length > 0) {
        setSelectedPendingPayment(response.data[0]);
        setPaymentApprovalRemarks('');
        setIsPendingPaymentDetailOpen(true);
      } else {
        showToast('No payment details found for this sales ID', 'info');
      }
    } catch (e: any) {
      console.error('Fetch payment details error:', e);
      showToast(e.message || 'Failed to load payment details', 'error');
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const handleApprovePayment = async () => {
    if (!selectedPendingPayment || !authToken) return;
    setProcessingPaymentId(selectedPendingPayment.id);
    try {
      const response = await fetch('http://51.75.119.133:5243/api/Payment/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          paymentId: selectedPendingPayment.id,
          isApproved: true,
          remarks: paymentApprovalRemarks || "Approved by admin"
        }),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        let errorMessage = `Request failed with status: ${response.status}`;
        try {
          const errorResponse = JSON.parse(responseText);
          errorMessage = errorResponse.message || errorResponse.details || errorMessage;
        } catch (e) {
          if (responseText) {
            errorMessage = responseText;
          }
        }
        throw new Error(errorMessage);
      }

      let result: PaymentApprovalResponse;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        // Create a minimal valid response object
        result = {
          success: true,
          message: 'Payment approved successfully',
          data: '',
          errors: [],
          details: '',
          statusCode: response.status,
          timestamp: new Date().toISOString()
        };
      }

      console.log('Approval result:', result);

      if (result.success === true || response.ok) {
        showToast(result.message || 'Payment approved successfully', 'success');
        setIsPendingPaymentDetailOpen(false);
        setSelectedPendingPayment(null);
        setPaymentApprovalRemarks('');
        await fetchPendingPayments();
      } else {
        throw new Error(result.message || 'Failed to approve payment');
      }
    } catch (error: any) {
      console.error('Error approving payment:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to approve payment';
      showToast(errorMessage, 'error');
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const handleViewPaymentSlip = async (paymentId: number) => {
    if (!authToken) {
      showToast('Authentication required', 'error');
      return;
    }

    setPaymentSlipLoading(true);
    setPaymentSlipError(false);

    try {
      // Create a blob URL with authentication
      const slipUrl = `http://51.75.119.133:5243/api/Payment/${paymentId}/slip`;

      // Fetch the image with authentication
      const response = await fetch(slipUrl, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payment slip: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error('Payment slip image is empty');
      }

      // Create a blob URL for the image
      const blobUrl = URL.createObjectURL(blob);
      setPaymentSlipUrl(blobUrl);
      setShowPaymentSlipModal(true);

    } catch (error) {
      console.error('Error loading payment slip:', error);
      setPaymentSlipLoading(false);
      setPaymentSlipError(true);
      showToast('Failed to load payment slip. Please try again.', 'error');
    }
  };

  // Clean up blob URLs when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (paymentSlipUrl && paymentSlipUrl.startsWith('blob:')) {
        URL.revokeObjectURL(paymentSlipUrl);
      }
    };
  }, [paymentSlipUrl]);

  const handleClosePaymentSlipModal = () => {
    setShowPaymentSlipModal(false);
    setPaymentSlipLoading(false);
    setPaymentSlipError(false);

    // Clean up blob URL
    if (paymentSlipUrl && paymentSlipUrl.startsWith('blob:')) {
      URL.revokeObjectURL(paymentSlipUrl);
    }
    setPaymentSlipUrl('');
  };

  useEffect(() => {
    if (authToken) {
      const fetchData = async () => {
        try {
          await Promise.all([
            fetchBuyers(),
            fetchUsers(),
            fetchSales(),
            fetchPendingSales(),
            fetchPendingPayments()
          ]);
        } catch (error) {
          console.error('Error fetching data:', error);
          showToast('Failed to load dashboard data', 'error');
        }
      };
      fetchData();
    }
  }, [authToken]);

  /* ────────────────────── CRUD - Buyers ────────────────────── */
  const handleCreateBuyer = async () => {
    if (!buyerForm.buyerCode || !buyerForm.buyerName) {
      showToast('Code & Name required', 'error');
      return;
    }
    setCreateBuyerLoading(true);
    try {
      const res = await fetch('http://51.75.119.133:5243/api/Buyer', {
        method: 'POST',
        headers: {
          accept: 'text/plain',
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buyerForm),
      });
      const txt = await res.text();
      if (!res.ok) throw new Error(txt || 'Create failed');
      showToast('Buyer created successfully', 'success');
      setIsCreateBuyerOpen(false);
      resetBuyerForm();
      fetchBuyers();
    } catch (e: any) {
      console.error('Create buyer error:', e);
      showToast(e.message, 'error');
    } finally {
      setCreateBuyerLoading(false);
    }
  };

  const openEdit = (b: Buyer) => {
    setSelectedBuyer(b);
    setBuyerForm({ ...b });
    setIsEditBuyerOpen(true);
  };

  const handleEditBuyer = async () => {
    if (!selectedBuyer) return;
    setEditBuyerLoading(true);
    try {
      const res = await fetch(`http://51.75.119.133:5243/api/Buyer/${selectedBuyer.buyerCode}`, {
        method: 'PUT',
        headers: {
          accept: 'text/plain',
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buyerForm),
      });
      const txt = await res.text();
      if (!res.ok) throw new Error(txt || 'Update failed');
      showToast('Buyer updated successfully', 'success');
      setIsEditBuyerOpen(false);
      resetBuyerForm();
      fetchBuyers();
    } catch (e: any) {
      console.error('Edit buyer error:', e);
      showToast(e.message, 'error');
    } finally {
      setEditBuyerLoading(false);
    }
  };

  const openDelete = (b: Buyer) => {
    setSelectedBuyer(b);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteBuyer = async () => {
    if (!selectedBuyer || !selectedBuyer.buyerCode) {
      showToast('Invalid buyer selected', 'error');
      return;
    }
    setDeleteBuyerLoading(true);
    try {
      const res = await fetch(`http://51.75.119.133:5243/api/Buyer/${encodeURIComponent(selectedBuyer.buyerCode)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Delete failed');
      }
      showToast('Buyer deleted successfully', 'success');
      setIsDeleteConfirmOpen(false);
      setSelectedBuyer(null);
      fetchBuyers();
    } catch (e: any) {
      console.error('Delete buyer error:', e);
      showToast(e.message, 'error');
    } finally {
      setDeleteBuyerLoading(false);
    }
  };

  /* ────────────────────── CRUD - Users ────────────────────── */
  const handleCreateUser = async () => {
    if (!userForm.name || !userForm.email || !userForm.password || !userForm.buyerCode) {
      showToast('All fields required', 'error');
      return;
    }
    setCreateUserLoading(true);
    try {
      const res = await fetch('http://51.75.119.133:5243/api/Auth/register-user', {
        method: 'POST',
        headers: {
          accept: 'text/plain',
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userForm),
      });
      const txt = await res.text();
      if (!res.ok) throw new Error(txt || 'Create user failed');
      showToast('User created successfully', 'success');
      setIsCreateUserOpen(false);
      resetUserForm();
      fetchUsers();
    } catch (e: any) {
      console.error('Create user error:', e);
      showToast(e.message, 'error');
    } finally {
      setCreateUserLoading(false);
    }
  };

  const openEditUser = (u: User) => {
    setSelectedUser(u);
    setUpdateUserForm({
      name: u.name,
      email: u.email,
      buyerCode: u.buyerCode,
      roleId: u.roleId,
    });
    setIsEditUserOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    if (!updateUserForm.name || !updateUserForm.email || !updateUserForm.buyerCode) {
      showToast('All fields required', 'error');
      return;
    }
    setEditUserLoading(true);
    try {
      const res = await fetch(`http://51.75.119.133:5243/api/v1/User/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          accept: 'text/plain',
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateUserForm),
      });
      const txt = await res.text();
      if (!res.ok) throw new Error(txt || 'Update user failed');
      showToast('User updated successfully', 'success');
      setIsEditUserOpen(false);
      setSelectedUser(null);
      resetUpdateUserForm();
      fetchUsers();
    } catch (e: any) {
      console.error('Update user error:', e);
      showToast(e.message, 'error');
    } finally {
      setEditUserLoading(false);
    }
  };

  const openDeleteUser = (u: User) => {
    setSelectedUser(u);
    setIsDeleteUserConfirmOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser || !selectedUser.id) {
      showToast('Invalid user selected', 'error');
      return;
    }
    setDeleteUserLoading(true);
    try {
      const res = await fetch(`http://51.75.119.133:5243/api/v1/User/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Delete user failed');
      }

      const responseText = await res.text();
      console.log('Delete user response:', responseText);

      let response: {
        success?: boolean;
        message?: string;
        data?: any;
        errors?: any;
        details?: string;
        statusCode?: number;
        timestamp?: string;
      };
      try {
        response = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        // If response is not JSON but status is OK, consider it a success
        if (res.ok) {
          response = {
            success: true,
            message: 'User deleted successfully',
            data: null,
            errors: [],
            details: '',
            statusCode: res.status,
            timestamp: new Date().toISOString()
          };
        } else {
          throw new Error('Invalid response format from server');
        }
      }

      if (response.success === true || res.ok) {
        showToast('User deleted successfully', 'success');
        setIsDeleteUserConfirmOpen(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (e: any) {
      console.error('Delete user error:', e);
      showToast(e.message || 'Failed to delete user', 'error');
    } finally {
      setDeleteUserLoading(false);
    }
  };

  /* ────────────────────── Pending Sales Actions ────────────────────── */
  const handleSaleApproval = async (saleId: number, isApproved: boolean, remarks: string) => {
    if (!authToken) return;
    setProcessingSaleId(saleId);
    try {
      console.log('Processing sale approval:', { saleId, isApproved, remarks });

      const response = await fetch('http://51.75.119.133:5243/api/Approval/approve-sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          salesTransactionId: saleId,
          isApproved: isApproved,
          remarks: remarks || (isApproved ? "Approved by admin" : "Rejected by admin")
        }),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        let errorMessage = `Request failed with status: ${response.status}`;
        try {
          const errorResponse = JSON.parse(responseText);
          errorMessage = errorResponse.message || errorResponse.details || errorMessage;
        } catch (e) {
          if (responseText) {
            errorMessage = responseText;
          }
        }
        throw new Error(errorMessage);
      }

      let result: SalesApprovalResponse;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        // Create a minimal valid response object
        result = {
          success: true,
          message: isApproved ? 'Sale approved successfully' : 'Sale rejected successfully',
          data: '',
          errors: [],
          details: '',
          statusCode: response.status,
          timestamp: new Date().toISOString()
        };
      }

      console.log('Approval result:', result);

      if (selectedSales.includes(saleId)) {
        setSelectedSales(selectedSales.filter(id => id !== saleId));
      }

      await fetchPendingSales();

      showToast(
        result.message || (isApproved ? 'Sale approved successfully' : 'Sale rejected successfully'),
        'success'
      );

      if (isSaleDetailOpen && selectedSale?.id === saleId) {
        setIsSaleDetailOpen(false);
      }
    } catch (error: any) {
      console.error('Error processing sale:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to process sale';
      showToast(errorMessage, 'error');
    } finally {
      setProcessingSaleId(null);
      setApprovalRemarks('');
    }
  };

  const handleApproveSale = (saleId: number) => {
    handleSaleApproval(saleId, true, "Approved by admin");
  };

  const handleRejectSale = (saleId: number) => {
    handleSaleApproval(saleId, false, "Rejected by admin");
  };

  const openSaleDetail = (sale: PendingSale) => {
    setSelectedSale(sale);
    setApprovalRemarks('');
    setIsSaleDetailOpen(true);
  };

  /* ────────────────────── Bulk Approval Actions ────────────────────── */
  const handleBulkApproval = async (isApproved: boolean) => {
    if (selectedSales.length === 0) {
      showToast('Please select at least one sale', 'error');
      return;
    }
    setProcessingBulk(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const saleId of selectedSales) {
        try {
          const response = await fetch('http://51.75.119.133:5243/api/Approval/approve-sales', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`,
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              salesTransactionId: saleId,
              isApproved: isApproved,
              remarks: isApproved ? "Bulk approved by admin" : "Bulk rejected by admin"
            }),
          });

          const responseText = await response.text();
          console.log(`Processing sale ${saleId}, response status: ${response.status}, response: ${responseText}`);

          if (responseText && responseText.trim()) {
            try {
              const result = JSON.parse(responseText);
              if (response.ok && (result.success === true || result.success === undefined)) {
                successCount++;
              } else {
                errorCount++;
                console.error(`Failed to process sale ${saleId}:`, result.message || result.details || responseText);
              }
            } catch (parseError) {
              if (response.ok) {
                successCount++;
              } else {
                errorCount++;
                console.error(`Failed to parse response for sale ${saleId}:`, parseError);
              }
            }
          } else {
            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
              console.error(`Failed to process sale ${saleId}: Status ${response.status}`);
            }
          }
        } catch (error) {
          errorCount++;
          console.error(`Error processing sale ${saleId}:`, error);
        }
      }

      if (errorCount === 0) {
        showToast(`Successfully ${isApproved ? 'approved' : 'rejected'} ${selectedSales.length} sales`, 'success');
      } else if (successCount > 0) {
        showToast(`${successCount} out of ${selectedSales.length} sales processed successfully. ${errorCount} failed.`, 'info');
      } else {
        showToast(`Failed to process any of the selected sales`, 'error');
      }

      setSelectedSales([]);
      await fetchPendingSales();
    } catch (error: any) {
      console.error('Bulk approval error:', error);
      showToast(error.message || 'Failed to process bulk approval', 'error');
    } finally {
      setProcessingBulk(false);
    }
  };

  /* ────────────────────── Selection Handlers ────────────────────── */
  const handleSelectAll = () => {
    if (selectedSales.length === filteredSales.length) {
      setSelectedSales([]);
    } else {
      setSelectedSales(filteredSales.map(sale => sale.id));
    }
  };

  const handleSelectSale = (saleId: number) => {
    setSelectedSales(prev =>
      prev.includes(saleId)
        ? prev.filter(id => id !== saleId)
        : [...prev, saleId]
    );
  };

  /* ────────────────────── Pagination Handlers ────────────────────── */
  const handleBuyerPageChange = (page: number) => {
    setBuyerCurrentPage(page);
  };

  const handleBuyerItemsPerPageChange = (count: number) => {
    setBuyerItemsPerPage(count);
    setBuyerCurrentPage(1);
  };

  const handleUserPageChange = (page: number) => {
    setUserCurrentPage(page);
  };

  const handleUserItemsPerPageChange = (count: number) => {
    setUserItemsPerPage(count);
    setUserCurrentPage(1);
  };

  const handleSalePageChange = (page: number) => {
    setSaleCurrentPage(page);
  };

  const handleSaleItemsPerPageChange = (count: number) => {
    setSaleItemsPerPage(count);
    setSaleCurrentPage(1);
  };

  const handlePendingPaymentPageChange = (page: number) => {
    setPendingPaymentCurrentPage(page);
  };

  const handlePendingPaymentItemsPerPageChange = (count: number) => {
    setPendingPaymentItemsPerPage(count);
    setPendingPaymentCurrentPage(1);
  };

  /* ────────────────────── Helpers ────────────────────── */
  const resetBuyerForm = () =>
    setBuyerForm({
      buyerCode: '',
      buyerName: '',
      vatNo: '',
      address: '',
      contactPerson: '',
      phoneNo: '',
      mobBuyer: '',
      frequent: '',
      svatNo: '',
      vatType: '',
      bGrantee: true,
    });

  const resetUserForm = () =>
    setUserForm({ name: '', email: '', password: '', buyerCode: '', roleId: 3 });

  const resetUpdateUserForm = () =>
    setUpdateUserForm({ name: '', email: '', buyerCode: '', roleId: 3 });

  const filtered = useMemo(() => {
    if (!Array.isArray(buyers)) return [];
    if (!searchTerm) return buyers;
    const q = searchTerm.toLowerCase();
    return buyers.filter(
      (b) =>
        (b.buyerCode?.toLowerCase() || '').includes(q) ||
        (b.buyerName?.toLowerCase() || '').includes(q)
    );
  }, [buyers, searchTerm]);

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    if (!userSearchTerm) return users;
    const q = userSearchTerm.toLowerCase();
    return users.filter(
      (u) =>
        (u.name?.toLowerCase() || '').includes(q) ||
        (u.email?.toLowerCase() || '').includes(q) ||
        (u.buyerCode?.toLowerCase() || '').includes(q)
    );
  }, [users, userSearchTerm]);

  const filteredSales = useMemo(() => {
    if (!Array.isArray(pendingSales)) return [];
    if (!saleSearchTerm) return pendingSales;
    const q = saleSearchTerm.toLowerCase();
    return pendingSales.filter(
      (s) =>
        (s.buyerName?.toLowerCase() || '').includes(q) ||
        (s.buyerCode?.toLowerCase() || '').includes(q) ||
        s.id.toString().includes(q)
    );
  }, [pendingSales, saleSearchTerm]);

  const filteredPendingPayments = useMemo(() => {
    if (!Array.isArray(pendingPayments)) return [];
    if (!pendingPaymentSearchTerm) return pendingPayments;
    const q = pendingPaymentSearchTerm.toLowerCase();
    return pendingPayments.filter(
      (p) =>
        (p.transactionId?.toLowerCase() || '').includes(q) ||
        (p.paymentReference?.toLowerCase() || '').includes(q) ||
        p.id.toString().includes(q)
    );
  }, [pendingPayments, pendingPaymentSearchTerm]);

  // Paginated data
  const paginatedBuyers = useMemo(() => {
    const startIndex = (buyerCurrentPage - 1) * buyerItemsPerPage;
    return filtered.slice(startIndex, startIndex + buyerItemsPerPage);
  }, [filtered, buyerCurrentPage, buyerItemsPerPage]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (userCurrentPage - 1) * userItemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + userItemsPerPage);
  }, [filteredUsers, userCurrentPage, userItemsPerPage]);

  const paginatedSales = useMemo(() => {
    const startIndex = (saleCurrentPage - 1) * saleItemsPerPage;
    return filteredSales.slice(startIndex, startIndex + saleItemsPerPage);
  }, [filteredSales, saleCurrentPage, saleItemsPerPage]);

  const paginatedPendingPayments = useMemo(() => {
    const startIndex = (pendingPaymentCurrentPage - 1) * pendingPaymentItemsPerPage;
    return filteredPendingPayments.slice(startIndex, startIndex + pendingPaymentItemsPerPage);
  }, [filteredPendingPayments, pendingPaymentCurrentPage, pendingPaymentItemsPerPage]);

  const getRoleName = (roleId: number) => {
    switch (roleId) {
      case 1:
        return 'Admin';
      case 2:
        return 'Manager';
      case 3:
        return 'User';
      default:
        return 'Unknown';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return 'Pending';
      case 1:
        return 'Approved';
      case 2:
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return 'bg-yellow-900/50 text-yellow-300';
      case 1:
        return 'bg-emerald-900/50 text-emerald-300';
      case 2:
        return 'bg-red-900/50 text-red-300';
      default:
        return 'bg-gray-900/50 text-gray-300';
    }
  };

  const getPaymentStatusText = (status: number) => {
    switch (status) {
      case 0:
        return 'Pending';
      case 1:
        return 'Success';
      case 2:
        return 'Failed';
      case 3:
        return 'Refunded';
      default:
        return 'Unknown';
    }
  };

  const getPaymentStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return 'bg-yellow-900/50 text-yellow-300';
      case 1:
        return 'bg-emerald-900/50 text-emerald-300';
      case 2:
        return 'bg-red-900/50 text-red-300';
      case 3:
        return 'bg-blue-900/50 text-blue-300';
      default:
        return 'bg-gray-900/50 text-gray-300';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#e2e8f0' } },
      tooltip: { backgroundColor: '#1e293b', titleColor: '#e2e8f0', bodyColor: '#e2e8f0' },
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
    },
  };

  /* ────────────────────── Render ────────────────────── */
  return (
    <>
      <style>{styles}</style>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          animate={{ x: [-100, 100], y: [-80, 80] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute top-20 left-20 w-96 h-96 bg-purple-700/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [100, -100], y: [80, -80] }}
          transition={{ duration: 25, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-pink-700/30 rounded-full blur-3xl"
        />
      </div>

      <div className="flex flex-col min-h-screen">
        <div className="flex flex-1">
          <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

          <main className="flex-1 ml-64 px-6 md:px-8 pb-12 space-y-10 pt-6">
            {/* Dashboard Section */}
            <section id="dashboard" className="space-y-10">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Stat
                  icon={Users}
                  title="Total Buyers"
                  value={totalBuyers}
                  loading={buyersLoading}
                  grad="from-emerald-500 to-teal-500"
                />
                <Stat
                  icon={UserCog}
                  title="Total Users"
                  value={users.length}
                  loading={usersLoading}
                  grad="from-blue-500 to-cyan-500"
                />
                <Stat
                  icon={TrendingUp}
                  title="Sales Trend"
                  value={salesData.labels.length ? 'Active' : '—'}
                  loading={salesLoading}
                  grad="from-violet-500 to-purple-500"
                />
                <Stat
                  icon={ShieldCheck}
                  title="Pending Sales"
                  value={pendingSales.length}
                  loading={pendingSalesLoading}
                  grad="from-yellow-500 to-red-500"
                />
              </div>

              {/* Chart */}
              <div className="grid grid-cols-1 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass p-6 h-72 lg:h-96"
                >
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                    <TrendingUp className="w-5 h-5 text-violet-400" /> Sales Trend
                  </h3>
                  {salesLoading ? <Skeleton className="h-full" /> : <Line data={salesData} options={chartOpts} />}
                </motion.div>
              </div>
            </section>

            {/* Pending Sales Table */}
            <section id="pending-sales" className="glass p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                  <ShieldCheck className="w-5 h-5 text-yellow-400" /> Pending Sales
                </h2>
                <div className="flex gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search sales…"
                      value={saleSearchTerm}
                      onChange={(e) => setSaleSearchTerm(e.target.value)}
                      className="input pl-10 w-full sm:w-64"
                    />
                  </div>
                  <div className="flex gap-2">
                    <RippleButton
                      onClick={() => handleBulkApproval(true)}
                      disabled={selectedSales.length === 0 || processingBulk}
                      className="btn-success"
                    >
                      {processingBulk ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve ({selectedSales.length})
                    </RippleButton>
                    <RippleButton
                      onClick={() => handleBulkApproval(false)}
                      disabled={selectedSales.length === 0 || processingBulk}
                      className="btn-danger"
                    >
                      {processingBulk ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Reject ({selectedSales.length})
                    </RippleButton>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                {pendingSalesLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : filteredSales.length === 0 ? (
                  <div className="text-center py-16">
                    <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-400 text-lg">No pending sales</p>
                  </div>
                ) : (
                  <>
                    <table className="w-full text-sm text-left text-gray-300">
                      <thead className="text-xs uppercase bg-slate-800/50 border-b border-slate-700">
                        <tr>
                          <th className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedSales.length === filteredSales.length && filteredSales.length > 0}
                              onChange={handleSelectAll}
                              className="w-4 h-4 text-emerald-500 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500"
                              disabled={processingBulk}
                            />
                          </th>
                          <th className="px-4 py-3">ID</th>
                          <th className="px-4 py-3">BUYER</th>
                          <th className="px-4 py-3 hidden md:table-cell">CODE</th>
                          <th className="px-4 py-3">AMOUNT</th>
                          <th className="px-4 py-3 hidden lg:table-cell">QTY</th>
                          <th className="px-4 py-3 hidden lg:table-cell">TIME</th>

                          <th className="px-4 py-3 text-center">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedSales.map((sale, i) => (
                          <motion.tr
                            key={sale.id}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="border-b border-slate-700 hover:bg-white/5 transition cursor-pointer"
                            onClick={() => openSaleDetail(sale)}
                          >
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedSales.includes(sale.id)}
                                onChange={() => handleSelectSale(sale.id)}
                                className="w-4 h-4 text-emerald-500 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500"
                                disabled={processingBulk}
                              />
                            </td>
                            <td className="px-4 py-3 font-medium text-yellow-300">#{sale.id}</td>
                            <td className="px-4 py-3 font-medium">{sale.buyerName || 'N/A'}</td>
                            <td className="px-4 py-3 hidden md:table-cell text-purple-300">{sale.buyerCode || 'N/A'}</td>
                            <td className="px-4 py-3 font-semibold text-emerald-300">{formatCurrency((sale.price || 0) * (sale.quantity || 0))}</td>
                            <td className="px-4 py-3 hidden lg:table-cell">{sale.quantity || 0}</td>
                            <td className="px-4 py-3 hidden lg:table-cell text-gray-400">{formatDate(sale.saleDate)}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sale.approvalStatus)}`}>
                                {sale.approvalStatus === 0 && <Clock className="w-3 h-3" />}
                                {sale.approvalStatus === 1 && <CheckCircle className="w-3 h-3" />}
                                {sale.approvalStatus === 2 && <XCircle className="w-3 h-3" />}
                                {getStatusText(sale.approvalStatus)}
                              </span>
                            </td>
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleApproveSale(sale.id)}
                                  disabled={processingSaleId === sale.id || processingBulk}
                                  className="text-emerald-400 hover:text-emerald-300 p-1 rounded hover:bg-emerald-900/30 transition disabled:opacity-50"
                                  title="Approve"
                                >
                                  {processingSaleId === sale.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleRejectSale(sale.id)}
                                  disabled={processingSaleId === sale.id || processingBulk}
                                  className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/30 transition disabled:opacity-50"
                                  title="Reject"
                                >
                                  {processingSaleId === sale.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <XCircle className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                    <Pagination
                      currentPage={saleCurrentPage}
                      totalPages={Math.ceil(filteredSales.length / saleItemsPerPage)}
                      onPageChange={handleSalePageChange}
                      itemsPerPage={saleItemsPerPage}
                      totalItems={filteredSales.length}
                      onItemsPerPageChange={handleSaleItemsPerPageChange}
                    />
                  </>
                )}
              </div>
            </section>

            {/* Pending Payments Table */}
            <section id="pending-payments" className="glass p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                  <DollarSign className="w-5 h-5 text-amber-400" /> Pending Payments
                </h2>
                <div className="flex gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search payments…"
                      value={pendingPaymentSearchTerm}
                      onChange={(e) => setPendingPaymentSearchTerm(e.target.value)}
                      className="input pl-10 w-full sm:w-64"
                    />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                {pendingPaymentsLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : filteredPendingPayments.length === 0 ? (
                  <div className="text-center py-16">
                    <DollarSign className="w-16 h-16 text-amber-400 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-400 text-lg">No pending payments</p>
                  </div>
                ) : (
                  <>
                    <table className="w-full text-sm text-left text-gray-300">
                      <thead className="text-xs uppercase bg-slate-800/50 border-b border-slate-700">
                        <tr>
                          <th className="px-4 py-3">ID</th>
                          <th className="px-4 py-3">TRANSACTION ID</th>
                          <th className="px-4 py-3 hidden md:table-cell">REFERENCE</th>
                          <th className="px-4 py-3">AMOUNT</th>
                          <th className="px-4 py-3 hidden lg:table-cell">METHOD</th>
                          <th className="px-4 py-3 hidden lg:table-cell">DATE</th>

                          <th className="px-4 py-3 text-center">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedPendingPayments.map((payment, i) => (
                          <motion.tr
                            key={payment.id}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="border-b border-slate-700 hover:bg-white/5 transition cursor-pointer"
                            onClick={() => {
                              setSelectedPendingPayment(payment);
                              setIsPendingPaymentDetailOpen(true);
                            }}
                          >
                            <td className="px-4 py-3 font-medium text-amber-300">#{payment.id}</td>
                            <td className="px-4 py-3 font-medium">{payment.transactionId || 'N/A'}</td>
                            <td className="px-4 py-3 hidden md:table-cell text-purple-300">{payment.paymentReference || 'N/A'}</td>
                            <td className="px-4 py-3 font-semibold text-emerald-300">{formatCurrency(payment.amount || 0)}</td>
                            <td className="px-4 py-3 hidden lg:table-cell">{payment.paymentMethod || 'N/A'}</td>
                            <td className="px-4 py-3 hidden lg:table-cell text-gray-400">{formatDate(payment.paymentDate)}</td>
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-2">
                                <RippleButton
                                  onClick={() => handleViewPaymentSlip(payment.id)}
                                  className="btn-amber"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Slip
                                </RippleButton>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                    <Pagination
                      currentPage={pendingPaymentCurrentPage}
                      totalPages={Math.ceil(filteredPendingPayments.length / pendingPaymentItemsPerPage)}
                      onPageChange={handlePendingPaymentPageChange}
                      itemsPerPage={pendingPaymentItemsPerPage}
                      totalItems={filteredPendingPayments.length}
                      onItemsPerPageChange={handlePendingPaymentItemsPerPageChange}
                    />
                  </>
                )}
              </div>
            </section>

            {/* Buyer Table */}
            <section id="buyer-list" className="glass p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                  <Users className="w-5 h-5 text-emerald-400" /> Buyer List
                </h2>
                <div className="flex gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10 w-full sm:w-64"
                    />
                  </div>
                  <RippleButton onClick={() => setIsCreateBuyerOpen(true)} className="btn-primary">
                    <Plus className="w-5 h-5" /> Add Buyer
                  </RippleButton>
                </div>
              </div>
              <div className="overflow-x-auto">
                {buyersLoading ? (
                  <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <p className="text-center text-gray-400 py-12">No buyers found</p>
                ) : (
                  <>
                    <table className="w-full text-sm text-left text-gray-300">
                      <thead className="text-xs uppercase bg-slate-800/50 border-b border-slate-700">
                        <tr>
                          <th className="px-4 py-3">CODE</th>
                          <th className="px-4 py-3">NAME</th>
                          <th className="px-4 py-3 hidden md:table-cell">VAT</th>
                          <th className="px-4 py-3 hidden lg:table-cell">CONTACT</th>
                          <th className="px-4 py-3">GRANTEE</th>
                          <th className="px-4 py-3 text-center">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedBuyers.map((b, i) => (
                          <motion.tr
                            key={b.buyerCode}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="border-b border-slate-700 hover:bg-white/5 transition"
                          >
                            <td className="px-4 py-3 font-medium text-purple-300">{b.buyerCode || 'N/A'}</td>
                            <td className="px-4 py-3">{b.buyerName || 'N/A'}</td>
                            <td className="px-4 py-3 hidden md:table-cell">{b.vatNo || '-'}</td>
                            <td className="px-4 py-3 hidden lg:table-cell">{b.contactPerson || '-'}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${b.bGrantee ? 'bg-emerald-900/50 text-emerald-300' : 'bg-red-900/50 text-red-300'
                                  }`}
                              >
                                {b.bGrantee ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-3">
                                <button onClick={() => openEdit(b)} className="text-blue-400 hover:text-blue-300">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => openDelete(b)} className="text-red-400 hover:text-red-300">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                    <Pagination
                      currentPage={buyerCurrentPage}
                      totalPages={Math.ceil(filtered.length / buyerItemsPerPage)}
                      onPageChange={handleBuyerPageChange}
                      itemsPerPage={buyerItemsPerPage}
                      totalItems={filtered.length}
                      onItemsPerPageChange={handleBuyerItemsPerPageChange}
                    />
                  </>
                )}
              </div>
            </section>

            {/* User Table */}
            <section id="user-list" className="glass p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                  <UserCog className="w-5 h-5 text-blue-400" /> User List
                </h2>
                <div className="flex gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users…"
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="input pl-10 w-full sm:w-64"
                    />
                  </div>
                  <RippleButton onClick={() => setIsCreateUserOpen(true)} className="btn-indigo">
                    <UserPlus className="w-5 h-5" /> Add User
                  </RippleButton>
                </div>
              </div>
              <div className="overflow-x-auto">
                {usersLoading ? (
                  <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-center text-gray-400 py-12">No users found</p>
                ) : (
                  <>
                    <table className="w-full text-sm text-left text-gray-300">
                      <thead className="text-xs uppercase bg-slate-800/50 border-b border-slate-700">
                        <tr>
                          <th className="px-4 py-3">ID</th>
                          <th className="px-4 py-3">NAME</th>
                          <th className="px-4 py-3 hidden md:table-cell">EMAIL</th>
                          <th className="px-4 py-3 hidden lg:table-cell">BUYER CODE</th>
                          <th className="px-4 py-3">ROLE</th>
                          <th className="px-4 py-3 text-center">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedUsers.map((u, i) => (
                          <motion.tr
                            key={u.id}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="border-b border-slate-700 hover:bg-white/5 transition"
                          >
                            <td className="px-4 py-3 font-medium text-blue-300">#{u.id}</td>
                            <td className="px-4 py-3">{u.name || 'N/A'}</td>
                            <td className="px-4 py-3 hidden md:table-cell">{u.email || 'N/A'}</td>
                            <td className="px-4 py-3 hidden lg:table-cell">{u.buyerCode || 'N/A'}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${u.roleId === 1
                                  ? 'bg-red-900/50 text-red-300'
                                  : u.roleId === 2
                                    ? 'bg-yellow-900/50 text-yellow-300'
                                    : 'bg-blue-900/50 text-blue-300'
                                  }`}
                              >
                                {getRoleName(u.roleId)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-3">
                                <button onClick={() => openEditUser(u)} className="text-blue-400 hover:text-blue-300">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => openDeleteUser(u)} className="text-red-400 hover:text-red-300">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                    <Pagination
                      currentPage={userCurrentPage}
                      totalPages={Math.ceil(filteredUsers.length / userItemsPerPage)}
                      onPageChange={handleUserPageChange}
                      itemsPerPage={userItemsPerPage}
                      totalItems={filteredUsers.length}
                      onItemsPerPageChange={handleUserItemsPerPageChange}
                    />
                  </>
                )}
              </div>
            </section>

            {/* Settings Section */}
            <section id="settings" className="glass p-6">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white mb-6">
                <Settings className="w-5 h-5 text-gray-400" /> Settings
              </h2>
              <div className="text-center py-16">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400 text-lg">Settings panel coming soon</p>
              </div>
            </section>

            {/* Help Section */}
            <section id="help" className="glass p-6">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white mb-6">
                <HelpCircle className="w-5 h-5 text-gray-400" /> Help & Support
              </h2>
              <div className="text-center py-16">
                <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400 text-lg">Help & Support section coming soon</p>
              </div>
            </section>
          </main>
        </div>

        {/* Footer */}
        <Footer />
      </div>

      {/* ── Modals ── */}
      <Modal
        isOpen={isCreateBuyerOpen}
        onClose={() => {
          setIsCreateBuyerOpen(false);
          resetBuyerForm();
        }}
        title="Create Buyer"
      >
        <BuyerForm form={buyerForm} setForm={setBuyerForm} onSubmit={handleCreateBuyer} loading={createBuyerLoading} />
      </Modal>
      <Modal
        isOpen={isEditBuyerOpen}
        onClose={() => {
          setIsEditBuyerOpen(false);
          resetBuyerForm();
        }}
        title="Edit Buyer"
      >
        <BuyerForm form={buyerForm} setForm={setBuyerForm} onSubmit={handleEditBuyer} loading={editBuyerLoading} />
      </Modal>
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Delete Buyer?"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-gray-300 mb-6">
            Delete{' '}
            <span className="font-semibold text-purple-300">{selectedBuyer?.buyerName}</span>? This cannot be
            undone.
          </p>
          <div className="flex justify-center gap-3">
            <RippleButton onClick={() => setIsDeleteConfirmOpen(false)} className="btn-secondary">
              Cancel
            </RippleButton>
            <RippleButton onClick={handleDeleteBuyer} disabled={deleteBuyerLoading} className="btn-danger">
              {deleteBuyerLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Deleting…
                </>
              ) : (
                'Delete'
              )}
            </RippleButton>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isCreateUserOpen}
        onClose={() => {
          setIsCreateUserOpen(false);
          resetUserForm();
        }}
        title="Create User"
      >
        <CreateUserForm form={userForm} setForm={setUserForm} onSubmit={handleCreateUser} loading={createUserLoading} />
      </Modal>
      <Modal
        isOpen={isEditUserOpen}
        onClose={() => {
          setIsEditUserOpen(false);
          resetUpdateUserForm();
        }}
        title="Edit User"
      >
        <UpdateUserForm
          form={updateUserForm}
          setForm={setUpdateUserForm}
          onSubmit={handleUpdateUser}
          loading={editUserLoading}
          userId={selectedUser?.id}
        />
      </Modal>
      <Modal
        isOpen={isDeleteUserConfirmOpen}
        onClose={() => setIsDeleteUserConfirmOpen(false)}
        title="Delete User?"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-gray-300 mb-6">
            Delete user{' '}
            <span className="font-semibold text-blue-300">{selectedUser?.name}</span>? This cannot be
            undone.
          </p>
          <div className="flex justify-center gap-3">
            <RippleButton onClick={() => setIsDeleteUserConfirmOpen(false)} className="btn-secondary">
              Cancel
            </RippleButton>
            <RippleButton onClick={handleDeleteUser} disabled={deleteUserLoading} className="btn-danger">
              {deleteUserLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Deleting…
                </>
              ) : (
                'Delete'
              )}
            </RippleButton>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isSaleDetailOpen}
        onClose={() => setIsSaleDetailOpen(false)}
        title={`Sale Details #${selectedSale?.id}`}
      >
        {selectedSale && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Buyer Name</p>
                <p className="text-white font-semibold">{selectedSale.buyerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Buyer Code</p>
                <p className="text-purple-300 font-semibold">{selectedSale.buyerCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Amount</p>
                <p className="text-emerald-300 font-bold text-xl">{formatCurrency((selectedSale.price || 0) * (selectedSale.quantity || 0))}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Quantity</p>
                <p className="text-white font-semibold">{selectedSale.quantity || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Weight</p>
                <p className="text-white font-semibold">{selectedSale.totalNetWeight || 0} kg</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Grade</p>
                <p className="text-white font-semibold">{selectedSale.gradeDescription || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Category</p>
                <p className="text-white font-semibold">{selectedSale.categoryDescription || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedSale.approvalStatus)}`}>
                  {getStatusText(selectedSale.approvalStatus)}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-400 mb-1">Sale Date</p>
                <p className="text-white">{selectedSale.saleDate ? `${new Date(selectedSale.saleDate).toLocaleString()} (${formatDate(selectedSale.saleDate)})` : 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-400 mb-1">Invoice Number</p>
                <p className="text-white">{selectedSale.invoiceNo || 'N/A'}</p>
              </div>
            </div>
            {selectedSale.approvalStatus !== 0 && (
              <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 text-yellow-300 text-sm">
                This sale has already been {getStatusText(selectedSale.approvalStatus).toLowerCase()}.
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Approval Remarks</label>
              <textarea
                value={approvalRemarks}
                onChange={(e) => setApprovalRemarks(e.target.value)}
                placeholder="Add approval or rejection remarks..."
                className="input h-24 resize-none"
                disabled={selectedSale.approvalStatus !== 0}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
              <RippleButton
                onClick={() => {
                  handleRejectSale(selectedSale.id);
                }}
                disabled={processingSaleId === selectedSale.id || selectedSale.approvalStatus !== 0}
                className="btn-danger"
              >
                {processingSaleId === selectedSale.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" /> Reject Sale
                  </>
                )}
              </RippleButton>
              <RippleButton
                onClick={() => {
                  handleApproveSale(selectedSale.id);
                }}
                disabled={processingSaleId === selectedSale.id || selectedSale.approvalStatus !== 0}
                className="btn-success"
              >
                {processingSaleId === selectedSale.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Approve Sale
                  </>
                )}
              </RippleButton>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        isOpen={isPendingPaymentDetailOpen}
        onClose={() => setIsPendingPaymentDetailOpen(false)}
        title={`Payment Approval #${selectedPendingPayment?.id}`}
      >
        {selectedPendingPayment && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Transaction ID</p>
                <p className="text-white font-semibold">{selectedPendingPayment.transactionId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Payment Reference</p>
                <p className="text-purple-300 font-semibold">{selectedPendingPayment.paymentReference || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Amount</p>
                <p className="text-emerald-300 font-bold text-xl">{formatCurrency(selectedPendingPayment.amount || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Payment Method</p>
                <p className="text-white font-semibold">{selectedPendingPayment.paymentMethod || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Bank Details</p>
                <p className="text-white font-semibold">{selectedPendingPayment.bankDetails || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(selectedPendingPayment.status)}`}>
                  {getPaymentStatusText(selectedPendingPayment.status)}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-400 mb-1">Payment Date</p>
                <p className="text-white">{selectedPendingPayment.paymentDate ? `${new Date(selectedPendingPayment.paymentDate).toLocaleString()} (${formatDate(selectedPendingPayment.paymentDate)})` : 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-400 mb-1">Remarks</p>
                <p className="text-white">{selectedPendingPayment.remarks || 'N/A'}</p>
              </div>
            </div>
            {selectedPendingPayment.status !== 0 && (
              <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 text-yellow-300 text-sm">
                This payment has already been {getPaymentStatusText(selectedPendingPayment.status).toLowerCase()}.
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Approval Remarks</label>
              <textarea
                value={paymentApprovalRemarks}
                onChange={(e) => setPaymentApprovalRemarks(e.target.value)}
                placeholder="Add approval remarks..."
                className="input h-24 resize-none"
                disabled={selectedPendingPayment.status !== 0}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
              <RippleButton
                onClick={() => setIsPendingPaymentDetailOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </RippleButton>
              <RippleButton
                onClick={handleApprovePayment}
                disabled={processingPaymentId === selectedPendingPayment.id || selectedPendingPayment.status !== 0}
                className="btn-success"
              >
                {processingPaymentId === selectedPendingPayment.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Approve Payment
                  </>
                )}
              </RippleButton>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Slip Image Modal */}
      {showPaymentSlipModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={handleClosePaymentSlipModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-5xl max-h-[90vh] overflow-auto bg-slate-800 rounded-lg p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Payment Slip</h3>
              <button
                onClick={handleClosePaymentSlipModal}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center">
              {paymentSlipLoading ? (
                <div className="flex items-center justify-center h-64 w-96">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                  <span className="ml-2 text-amber-400">Loading payment slip...</span>
                </div>
              ) : paymentSlipError ? (
                <div className="text-center py-8">
                  <XCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                  <p className="text-red-400">Failed to load payment slip</p>
                  <p className="text-gray-400 text-sm mt-1">The payment slip image may not be available</p>
                </div>
              ) : (
                <img
                  src={paymentSlipUrl}
                  alt="Payment Slip"
                  className="max-w-full max-h-[75vh] rounded-lg shadow-2xl"
                  onLoad={() => setPaymentSlipLoading(false)}
                  onError={() => {
                    setPaymentSlipLoading(false);
                    setPaymentSlipError(true);
                  }}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

/* ────────────────────── Buyer Form ────────────────────── */
const BuyerForm = ({
  form,
  setForm,
  onSubmit,
  loading,
}: {
  form: CreateBuyerForm;
  setForm: React.Dispatch<React.SetStateAction<CreateBuyerForm>>;
  onSubmit: () => void;
  loading: boolean;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input
      label="Buyer Code"
      value={form.buyerCode}
      onChange={(v) => setForm({ ...form, buyerCode: v })}
      required
    />
    <Input
      label="Buyer Name"
      value={form.buyerName}
      onChange={(v) => setForm({ ...form, buyerName: v })}
      required
    />
    <Input label="VAT No" value={form.vatNo} onChange={(v) => setForm({ ...form, vatNo: v })} />
    <Input label="SVAT No" value={form.svatNo} onChange={(v) => setForm({ ...form, svatNo: v })} />
    <Input label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
    <Input
      label="Contact Person"
      value={form.contactPerson}
      onChange={(v) => setForm({ ...form, contactPerson: v })}
    />
    <Input label="Phone No" value={form.phoneNo} onChange={(v) => setForm({ ...form, phoneNo: v })} />
    <Input label="Mobile" value={form.mobBuyer} onChange={(v) => setForm({ ...form, mobBuyer: v })} />
    <Input label="Frequent" value={form.frequent} onChange={(v) => setForm({ ...form, frequent: v })} />
    <Input label="VAT Type" value={form.vatType} onChange={(v) => setForm({ ...form, vatType: v })} />
    <div className="md:col-span-2 flex items-center gap-3">
      <input
        type="checkbox"
        id="bGrantee"
        checked={form.bGrantee}
        onChange={(e) => setForm({ ...form, bGrantee: e.target.checked })}
        className="w-5 h-5 text-emerald-500 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500"
      />
      <label htmlFor="bGrantee" className="text-sm font-medium text-gray-300">
        B Grantee
      </label>
    </div>
    <div className="md:col-span-2 flex justify-end gap-3 pt-4">
      <RippleButton onClick={onSubmit} disabled={loading} className="btn-primary">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Saving…
          </>
        ) : (
          'Save Buyer'
        )}
      </RippleButton>
    </div>
  </div>
);

/* ────────────────────── Create User Form ────────────────────── */
const CreateUserForm = ({
  form,
  setForm,
  onSubmit,
  loading,
}: {
  form: CreateUserForm;
  setForm: React.Dispatch<React.SetStateAction<CreateUserForm>>;
  onSubmit: () => void;
  loading: boolean;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
    <Input
      label="Email"
      type="email"
      value={form.email}
      onChange={(v) => setForm({ ...form, email: v })}
      required
    />
    <Input
      label="Password"
      type="password"
      value={form.password}
      onChange={(v) => setForm({ ...form, password: v })}
      required
    />
    <Input
      label="Buyer Code"
      value={form.buyerCode}
      onChange={(v) => setForm({ ...form, buyerCode: v })}
      required
    />
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-300 mb-1.5">Role</label>
      <select
        value={form.roleId}
        onChange={(e) => setForm({ ...form, roleId: Number(e.target.value) })}
        className="input"
      >
        <option value={1}>Admin (1)</option>
        <option value={2}>Manager (2)</option>
        <option value={3}>User (3)</option>
      </select>
    </div>
    <div className="md:col-span-2 flex justify-end gap-3 pt-4">
      <RippleButton onClick={onSubmit} disabled={loading} className="btn-indigo">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Creating…
          </>
        ) : (
          'Create User'
        )}
      </RippleButton>
    </div>
  </div>
);

/* ────────────────────── Update User Form ────────────────────── */
const UpdateUserForm = ({
  form,
  setForm,
  onSubmit,
  loading,
  userId,
}: {
  form: UpdateUserForm;
  setForm: React.Dispatch<React.SetStateAction<UpdateUserForm>>;
  onSubmit: () => void;
  loading: boolean;
  userId?: number;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input label="User ID" value={String(userId ?? '')} onChange={() => { }} disabled />
    <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
    <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
    <Input
      label="Buyer Code"
      value={form.buyerCode}
      onChange={(v) => setForm({ ...form, buyerCode: v })}
      required
    />
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-300 mb-1.5">Role</label>
      <select
        value={form.roleId}
        onChange={(e) => setForm({ ...form, roleId: Number(e.target.value) })}
        className="input"
      >
        <option value={1}>Admin (1)</option>
        <option value={2}>Manager (2)</option>
        <option value={3}>User (3)</option>
      </select>
    </div>
    <div className="md:col-span-2 flex justify-end gap-3 pt-4">
      <RippleButton onClick={onSubmit} disabled={loading} className="btn-indigo">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Updating…
          </>
        ) : (
          'Update User'
        )}
      </RippleButton>
    </div>
  </div>
);