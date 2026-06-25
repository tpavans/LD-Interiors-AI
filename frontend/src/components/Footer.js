import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-wood-border/40 bg-wood-cream/90 py-12 text-wood-light">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 flex flex-col md:flex-row items-start justify-between gap-8">
        <div>
          <span className="font-serif text-lg font-bold tracking-widest gold-text-glow">
            LD INTERIORS & FURNITURES
          </span>
          <p className="mt-2 text-xs text-wood-light font-light max-w-xs leading-relaxed">
            Providing modern, high-end, and curated interior designs. Located in Mulasthanam, AP.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 text-xs">
          <div>
            <h4 className="font-serif font-bold text-wood-dark mb-3 uppercase tracking-wider text-[10px]">Quick Links</h4>
            <div className="flex flex-col gap-2 font-light">
              <Link href="/" className="hover:text-wood-dark transition-colors">Home</Link>
              <Link href="/products" className="hover:text-wood-dark transition-colors">Designs Portfolio</Link>
              <Link href="/contact" className="hover:text-wood-dark transition-colors">Contact Studio</Link>
              <a 
                href="https://www.instagram.com/ldinteriors.in?igsh=N2EydGxoZDNzZjF5" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-wood-dark transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-serif font-bold text-wood-dark mb-3 uppercase tracking-wider text-[10px]">Find Us</h4>
            <p className="font-light text-wood-light leading-relaxed">
              Mulasthanam, Alamuru Mandal,<br />
              Konaseema, AP - 533233
            </p>
          </div>
        </div>
      </div>
      
      <div className="mx-auto max-w-7xl px-6 sm:px-8 mt-8 pt-8 border-t border-wood-border/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-wood-light font-light">
        <div>
          &copy; {new Date().getFullYear()} LD Interiors & Furnitures. All rights reserved.
        </div>
        <div className="flex items-center gap-1.5">
          Developed & Maintained by <span className="font-semibold text-wood-dark">Pavan Sai</span>
        </div>
      </div>
    </footer>
  );
}
