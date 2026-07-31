"use client";
import { Printer, Download, X, ShieldCheck, Check } from 'lucide-react';

export default function GSTInvoiceModal({ order, onClose }) {
  if (!order) return null;

  const invoiceNo = `INV-LD-${order._id ? order._id.toString().slice(-6).toUpperCase() : '2026'}`;
  const invoiceDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
  const hsnCode = 'HSN 9403'; // Wooden Furniture classification
  
  const totalPrice = order.price || 0;
  const taxableAmount = Math.round(totalPrice / 1.18);
  const gstTaxTotal = totalPrice - taxableAmount;
  const cgstAmount = Math.round(gstTaxTotal / 2);
  const sgstAmount = Math.round(gstTaxTotal / 2);
  const paidAmount = order.paidAmount || 0;
  const balanceDue = order.remainingBalance || 0;

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 text-left p-6 sm:p-10 flex flex-col max-h-[90vh]">
        {/* Header Controls (Hidden on Print) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5 mb-6 print:hidden">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#008DDA] bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              Tax Invoice & Receipt
            </span>
            <h3 className="text-xl font-serif font-bold text-slate-900 mt-2">
              GST Tax Invoice #{invoiceNo}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintInvoice}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Slip */}
        <div className="space-y-6 flex-1 overflow-y-auto pr-1 text-slate-900 text-xs">
          {/* Company Branding & Customer Details */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-200 pb-6 gap-4">
            <div>
              <h1 className="font-serif text-xl font-black text-slate-900 uppercase tracking-wide">LD INTERIORS & FURNITURES</h1>
              <p className="text-[11px] text-slate-600 mt-0.5">Master Carpentry & Burma Teakwood Workshop</p>
              <p className="text-[11px] text-slate-600">Main Road, Alamuru, East Godavari, AP - 533232</p>
              <p className="text-[11px] text-slate-600 font-bold mt-1">📞 +91 93463 25291 | 🌐 www.ldinteriors.in</p>
              <p className="text-[10px] font-mono text-slate-500 mt-1">GSTIN: 37AAAAA0000A1Z5 (Composite Scheme)</p>
            </div>

            <div className="sm:text-right bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">TAX INVOICE / RECEIPT</span>
              <p className="font-mono text-sm font-bold text-[#008DDA] mt-0.5">#{invoiceNo}</p>
              <p className="text-[11px] text-slate-600 mt-1">Date: {invoiceDate}</p>
              <p className="text-[11px] text-slate-600">Status: <span className="font-bold uppercase text-emerald-700">{order.status || 'Active'}</span></p>
            </div>
          </div>

          {/* Billed To Customer Info */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">BILLED TO CUSTOMER:</span>
            <p className="text-sm font-extrabold text-slate-900">{order.name || 'Customer'}</p>
            <p className="text-xs text-slate-700 mt-0.5">📞 Phone: {order.phone || 'N/A'}</p>
            <p className="text-xs text-slate-700 mt-0.5">📍 Address: {order.address || 'AP / Telangana'}</p>
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse border border-slate-200 text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-wider">
                <th className="p-3 border border-slate-200">Description</th>
                <th className="p-3 border border-slate-200">HSN Code</th>
                <th className="p-3 border border-slate-200 text-right">Taxable Value</th>
                <th className="p-3 border border-slate-200 text-right">GST (18%)</th>
                <th className="p-3 border border-slate-200 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-3 border border-slate-200">
                  <p className="font-bold text-slate-900">{order.product || 'Custom Furniture'}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Category: {order.category || 'Teakwood'}</p>
                </td>
                <td className="p-3 border border-slate-200 font-mono text-[11px] text-slate-600">{hsnCode}</td>
                <td className="p-3 border border-slate-200 text-right font-mono">₹{taxableAmount.toLocaleString('en-IN')}</td>
                <td className="p-3 border border-slate-200 text-right font-mono">₹{gstTaxTotal.toLocaleString('en-IN')}</td>
                <td className="p-3 border border-slate-200 text-right font-mono font-bold text-slate-900">₹{totalPrice.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          {/* Tax Breakdown & Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start pt-2 gap-4">
            <div className="space-y-1 text-[10px] text-slate-500">
              <p>CGST (9%): ₹{cgstAmount.toLocaleString('en-IN')}</p>
              <p>SGST (9%): ₹{sgstAmount.toLocaleString('en-IN')}</p>
              <p className="pt-2 font-bold text-slate-700">Terms & Conditions:</p>
              <p>1. Lifetime warranty against natural wood termites.</p>
              <p>2. Goods once sold & custom-carved are non-refundable.</p>
            </div>

            <div className="w-full sm:w-64 space-y-2 bg-sky-50/70 p-4 rounded-2xl border border-sky-100 text-xs">
              <div className="flex justify-between font-medium text-slate-700">
                <span>Total Invoice Value:</span>
                <span className="font-mono font-bold">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700">
                <span>Total Payments Received:</span>
                <span className="font-mono">₹{paidAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-purple-700 border-t border-sky-200 pt-2 text-sm">
                <span>Balance Remaining:</span>
                <span className="font-mono font-black">₹{balanceDue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
            <div className="text-[10px] text-slate-500">
              <p className="font-bold text-slate-700">Thank you for choosing LD Interiors!</p>
              <p>Computer-generated invoice. Authorized digital signature attached.</p>
            </div>
            <div className="text-center">
              <span className="font-serif text-sm font-bold text-slate-900 block">LD Interiors & Furnitures</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase block mt-4">Authorized Signatory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
