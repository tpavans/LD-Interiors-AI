"use client";
import React from 'react';
import { X, Printer, Package, Truck, MapPin, Phone, ShieldCheck, Tag, Calendar, CheckCircle2 } from 'lucide-react';

export default function ShippingSlipModal({ order, userProfile, onClose }) {
  if (!order) return null;

  const orderShortId = order._id ? order._id.substring(18).toUpperCase() : '2026-X';
  const createdDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : new Date().toLocaleDateString('en-IN');

  const customerName = order.name || userProfile?.name || 'Valued Customer';
  const customerPhone = order.phone || userProfile?.phone || 'N/A';
  const customerAddress = order.address || userProfile?.address || 'Alamuru, East Godavari District, AP - 533232';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn overflow-y-auto" onClick={onClose}>
      
      {/* Container Card */}
      <div 
        className="w-full max-w-2xl bg-white text-neutral-900 rounded-3xl shadow-2xl overflow-hidden relative border border-neutral-300 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Control Bar (Non-Printable) */}
        <div className="bg-[#1d0f07] px-6 py-4 flex items-center justify-between text-white shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-amber-400" />
            <h3 className="font-serif text-sm font-bold text-amber-300">E-Commerce Package Shipping & Billing Label</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-black font-extrabold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer active:scale-95"
            >
              <Printer className="h-4 w-4" />
              <span>Print Slip / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE SHIPPING SLIP / DISPATCH LABEL AREA */}
        <div className="p-6 sm:p-8 overflow-y-auto font-sans print:p-0 print:m-0 print:overflow-visible text-neutral-900">
          
          {/* Main Label Box */}
          <div className="border-4 border-black p-5 sm:p-6 rounded-2xl bg-white space-y-5 print:border-4 print:p-4 print:rounded-none">
            
            {/* Header / Brand & Barcode Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b-2 border-black">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-600 block">OFFICIAL E-COMMERCE DISPATCH MANIFEST</span>
                <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-black">LD INTERIORS & FURNITURES</h1>
                <p className="text-[11px] text-neutral-700 font-medium">Alamuru Workshops • Handcrafted Custom Woodwork</p>
              </div>

              {/* Barcode & Tracking ID Box */}
              <div className="text-right sm:text-right w-full sm:w-auto flex flex-col items-start sm:items-end">
                <div className="bg-neutral-900 text-white px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-1.5 inline-block">
                  PREPAID / EXPRESS DISPATCH
                </div>
                {/* SVG Simulated Barcode */}
                <div className="font-mono text-center font-bold tracking-widest text-xs bg-neutral-100 p-2 border border-black rounded-md inline-block w-48">
                  <div className="h-8 flex items-center justify-between gap-1 px-1 bg-white mb-1 overflow-hidden">
                    {[3,1,2,4,1,3,1,2,3,1,4,2,1,3,2,1,3,4,1,2,1,3,2,4,1].map((w, i) => (
                      <span key={i} className="bg-black inline-block h-full" style={{ width: `${w * 1.5}px` }}></span>
                    ))}
                  </div>
                  <span>AWB: LD-{orderShortId}</span>
                </div>
              </div>
            </div>

            {/* Courier & Logistic Partner Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-neutral-100 p-3 rounded-xl border border-neutral-400 text-xs text-neutral-900 font-medium">
              <div>
                <span className="text-[9px] uppercase font-bold text-neutral-500 block">Order Date</span>
                <span className="font-bold">{createdDate}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-neutral-500 block">Logistics Partner</span>
                <span className="font-extrabold text-black">📦 {order.carrier || 'Xpressbees'}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-neutral-500 block">Order ID</span>
                <span className="font-mono font-bold">LD-{orderShortId}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-neutral-500 block">Payment Status</span>
                <span className="font-extrabold text-emerald-800 uppercase">{order.paymentStatus || 'Verified'}</span>
              </div>
            </div>

            {/* ADDRESSES GRID: SHIP TO & SHIP FROM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-2 border-black rounded-xl p-4 bg-neutral-50">
              
              {/* SHIP TO (CUSTOMER DELIVERY ADDRESS) */}
              <div className="space-y-1.5 sm:border-r sm:border-neutral-400 sm:pr-4">
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-black bg-amber-300 px-2 py-0.5 rounded-md inline-block">
                  <MapPin className="h-3 w-3 inline shrink-0" /> SHIP TO (DELIVERY ADDRESS)
                </div>
                <h2 className="text-base font-extrabold text-black uppercase leading-tight pt-1">{customerName}</h2>
                <p className="text-xs font-semibold text-neutral-800 leading-relaxed whitespace-pre-line">
                  {customerAddress}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-extrabold text-black">
                  <Phone className="h-3.5 w-3.5 text-neutral-700" />
                  <span>TEL: +91 {customerPhone}</span>
                </div>
              </div>

              {/* SHIP FROM (SELLER RETURN ADDRESS) */}
              <div className="space-y-1.5 sm:pl-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-300">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-700 bg-neutral-200 px-2 py-0.5 rounded-md inline-block">
                  RETURN ADDRESS (SELLER)
                </div>
                <h3 className="text-sm font-bold text-black uppercase">LD Interiors Workshops</h3>
                <p className="text-[11px] text-neutral-700 leading-tight">
                  Main Road, Alamuru, East Godavari District,<br />
                  Andhra Pradesh - 533232, India.
                </p>
                <div className="pt-1 text-[11px] font-bold text-neutral-800 space-y-0.5">
                  <p>Contact: Nagaraju (Owner) - +91 62816 53998</p>
                  <p>Tech Admin: Pavan Sai - +91 93463 25291</p>
                </div>
              </div>
            </div>

            {/* ORDER ITEMS TABLE */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-700 block mb-2">PACKAGE CONTENTS & INVOICE BREAKDOWN</span>
              <table className="w-full text-left border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-neutral-900 text-white font-bold text-[10px] uppercase">
                    <th className="p-2.5 border border-black">Item Description</th>
                    <th className="p-2.5 border border-black text-center w-16">Qty</th>
                    <th className="p-2.5 border border-black text-right w-24">Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black">
                    <td className="p-3 border border-black">
                      <span className="font-bold text-black block text-sm">{order.product}</span>
                      {order.customSize && (
                        <span className="text-[10px] text-neutral-600 block">Size/Spec: {order.customSize}</span>
                      )}
                      {order.notes && (
                        <span className="text-[10px] text-neutral-600 block italic">Notes: {order.notes}</span>
                      )}
                    </td>
                    <td className="p-3 border border-black text-center font-bold">1 Unit</td>
                    <td className="p-3 border border-black text-right font-serif font-bold text-sm">
                      ₹{order.totalPrice ? order.totalPrice.toLocaleString('en-IN') : 'Quote'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* FINANCIAL SUMMARY & COD / DUE BADGE */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-neutral-900 text-white p-4 rounded-xl border border-black">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 block font-bold">Collectible Balance</span>
                <span className="text-xl font-serif font-extrabold text-amber-400">
                  {order.remainingBalance > 0 ? `₹${order.remainingBalance.toLocaleString('en-IN')}` : '₹0.00 (FULLY PAID)'}
                </span>
              </div>
              <div className="text-right flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-bold text-neutral-200">Quality Verified & Inspected Package</span>
              </div>
            </div>

            {/* FOOTER & HANDLING NOTICE */}
            <div className="pt-3 border-t border-dashed border-neutral-400 flex flex-col sm:flex-row justify-between items-center text-[10px] text-neutral-600 gap-2">
              <p>⚠️ <strong>FRAGILE FURNITURE PACKAGE:</strong> Handle with care. Open in presence of delivery personnel.</p>
              <span className="font-mono font-semibold">Authorized Slip • LD Interiors</span>
            </div>

          </div>
        </div>

      </div>

      {/* Print CSS Rules */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-shipping-slip, #printable-shipping-slip * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

    </div>
  );
}
