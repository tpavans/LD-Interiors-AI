'use client';
import Link from 'next/link';
import { Home, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-950 text-white font-sans text-center">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="w-20 h-20 bg-amber-500/10 border-2 border-amber-500/40 rounded-full flex items-center justify-center mx-auto text-amber-400 text-3xl font-mono font-bold">
          404
        </div>

        <div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
            Page Not Found / పేజీ అందుబాటులో లేదు
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            The page or furniture design link you are looking for might have been moved or updated.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href="/products"
            className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Furniture Catalog</span>
          </Link>

          <Link
            href="/"
            className="w-full py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span>Return to Home Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
