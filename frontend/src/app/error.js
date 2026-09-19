'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, ShoppingBag } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Unhandled app error caught:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-950 text-white font-sans text-center">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400 text-3xl font-mono font-bold">
          !
        </div>

        <div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
            Unexpected Loading Error
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            We encountered a temporary loading error. Click reload below to refresh smoothly.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                try {
                  sessionStorage.removeItem('ld_cached_products');
                } catch (e) {}
              }
              if (reset) {
                reset();
              } else {
                window.location.reload();
              }
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Page / మళ్ళీ ప్రయత్నించండి</span>
          </button>

          <Link
            href="/products"
            className="w-full py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Go to Furniture Catalog</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
