import React, { useState, useEffect } from 'react';
import useAppStore from '../../store/useAppStore';
import { BarChart3, Download, FileText, Filter, Calendar as CalendarIcon, DownloadCloud } from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

const Reports = () => {
  const { orders, fetchOrders } = useAppStore();
  const [filterType, setFilterType] = useState('All Types');
  
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Actually filter orders based on filterType
  const filteredOrders = orders.filter(order => {
    if (filterType === 'All Types') return true;
    if (filterType === 'Dine-in') return order.type === 'Dine-in';
    if (filterType === 'Self-order') return order.type === 'Self-order';
    return true;
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Brew Haven - Sales Report', 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
    doc.text(`Filter: ${filterType}`, 20, 36);
    
    let y = 50;
    doc.setFontSize(12);
    doc.text('Order ID', 20, y);
    doc.text('Date', 70, y);
    doc.text('Amount', 130, y);
    doc.text('Status', 170, y);
    
    y += 10;
    doc.line(20, y-5, 190, y-5);
    
    filteredOrders.forEach((order) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(order.orderNumber, 20, y);
      doc.text(new Date(order.createdAt).toLocaleDateString(), 70, y);
      doc.text(`Rs.${order.totalAmount.toFixed(2)}`, 130, y);
      doc.text(order.paymentStatus, 170, y);
      y += 10;
    });
    
    doc.save('sales_report.pdf');
  };

  const exportToExcel = () => {
    const data = filteredOrders.map(order => ({
      'Order Number': order.orderNumber,
      'Date': new Date(order.createdAt).toLocaleString(),
      'Amount (₹)': order.totalAmount,
      'Payment Status': order.paymentStatus,
      'Type': order.type,
      'Table': order.tableId?.number || 'N/A'
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales');
    XLSX.writeFile(wb, 'sales_report.xlsx');
  };

  const totals = filteredOrders.reduce((acc, order) => {
    acc.revenue += order.totalAmount;
    acc.count += 1;
    if (order.paymentStatus === 'Paid') acc.paidCount += 1;
    return acc;
  }, { revenue: 0, count: 0, paidCount: 0 });

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h3 className="text-2xl font-bold text-slate-800">Sales Intelligence</h3>
           <p className="text-slate-500">Analyze your restaurant's performance</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={exportToPDF} className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <FileText className="w-4 h-4 text-rose-500" />
            <span>Export PDF</span>
          </button>
          <button onClick={exportToExcel} className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <DownloadCloud className="w-4 h-4 text-emerald-500" />
            <span>Export XLS</span>
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <BarChart3 className="w-20 h-20" />
           </div>
           <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Revenue</p>
           <p className="text-4xl font-black text-slate-800">₹{totals.revenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
           <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Orders Processed</p>
           <p className="text-4xl font-black text-slate-800">{totals.count}</p>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
           <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Paid Transactions</p>
           <p className="text-4xl font-black text-emerald-500">{totals.paidCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h4 className="font-bold text-slate-800">Detailed Transaction Log</h4>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select 
              className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm font-medium focus:ring-0"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option>All Types</option>
              <option>Dine-in</option>
              <option>Self-order</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Table</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">
                    No orders found{filterType !== 'All Types' ? ` for "${filterType}"` : ''}.
                  </td>
                </tr>
              )}
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">{order.orderNumber}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 underline decoration-slate-200 underline-offset-4">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">Table {order.tableId?.number || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                      order.type === 'Self-order' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {order.type || 'Dine-in'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                      order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800 text-right">₹{order.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
