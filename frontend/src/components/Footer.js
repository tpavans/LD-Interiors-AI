import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-wood-border/40 bg-wood-cream/95 py-14 text-wood-light">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 text-left">
        {/* Column 1: About LD Interiors */}
        <div className="space-y-4">
          <h4 className="font-serif font-bold text-wood-accent uppercase tracking-wider text-xs border-b border-wood-border/20 pb-2">
            About LD Interiors
          </h4>
          <div className="flex flex-col gap-2.5 text-xs font-light">
            <Link href="/contact" className="hover:text-wood-dark transition-colors">About Us</Link>
            <div>
              <p className="font-semibold text-wood-dark mt-1">Studio Location:</p>
              <p className="mt-1 leading-relaxed">
                Mulasthanam, Alamuru Mandal,<br />
                Konaseema District, AP - 533233
              </p>
              <a 
                href="https://maps.google.com/?q=Mulasthanam,Alamuru,AP" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-block mt-2 text-[10px] font-bold text-wood-accent hover:underline uppercase tracking-wider"
              >
                📍 View on Google Maps
              </a>
            </div>
            <div>
              <p className="font-semibold text-wood-dark mt-2.5">Working Hours:</p>
              <p className="mt-1 leading-relaxed">
                Morning 7:00 AM - 10:00 PM<br />
                All 7 Days a week
              </p>
            </div>
          </div>
        </div>

        {/* Column 2: Services */}
        <div className="space-y-4">
          <h4 className="font-serif font-bold text-wood-accent uppercase tracking-wider text-xs border-b border-wood-border/20 pb-2">
            Our Services
          </h4>
          <div className="flex flex-col gap-2.5 text-xs font-light">
            <Link href="/contact" className="hover:text-wood-dark transition-colors">• Re-installation Works</Link>
            <Link href="/products" className="hover:text-wood-dark transition-colors">• Loose Fittings carpentry</Link>
            <Link href="/contact" className="hover:text-wood-dark transition-colors">• Complete Interior Design</Link>
            <Link href="/products" className="hover:text-wood-dark transition-colors">• Custom Designs & Furniture</Link>
          </div>
        </div>

        {/* Column 3: Need Help */}
        <div className="space-y-4">
          <h4 className="font-serif font-bold text-wood-accent uppercase tracking-wider text-xs border-b border-wood-border/20 pb-2">
            Need Help?
          </h4>
          <div className="flex flex-col gap-2.5 text-xs font-light">
            <Link href="/orders" className="hover:text-wood-dark transition-colors">My Account</Link>
            <Link href="/orders" className="hover:text-wood-dark transition-colors">Track Order</Link>
            <Link href="/contact" className="hover:text-wood-dark transition-colors">Contact Us</Link>
            <Link href="/contact" className="hover:text-wood-dark transition-colors">Customer Support</Link>
          </div>
        </div>

        {/* Column 4: Studio Connect */}
        <div className="space-y-4">
          <h4 className="font-serif font-bold text-wood-accent uppercase tracking-wider text-xs border-b border-wood-border/20 pb-2">
            Studio Connect
          </h4>
          <p className="text-xs font-light leading-relaxed">
            Follow our design daily logs and workshop reels on our social channels.
          </p>
          {/* Social Media Circular Logo Buttons */}
          <div className="flex flex-wrap gap-3.5 pt-2">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/ldinteriors.in?igsh=N2EydGxoZDNzZjF5"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-wood-beige hover:bg-wood-accent text-wood-dark hover:text-white shadow-sm transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-wood-border/30"
              title="Instagram"
            >
              <svg className="h-4.5 w-4.5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com/@ldinteriors"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-wood-beige hover:bg-red-600 text-wood-dark hover:text-white shadow-sm transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-wood-border/30"
              title="YouTube"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.495 20.455 12 20.455 12 20.455s7.505 0 9.388-.511a3.003 3.003 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com/ldinteriors"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-wood-beige hover:bg-blue-600 text-wood-dark hover:text-white shadow-sm transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-wood-border/30"
              title="Facebook"
            >
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            {/* Pinterest */}
            <a
              href="https://pin.it/MQWrrk2VP"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-wood-beige hover:bg-red-700 text-wood-dark hover:text-white shadow-sm transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-wood-border/30"
              title="Pinterest"
            >
              {/* Pinterest SVG logo */}
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.4 7.62 11.18-.1-.95-.2-2.4.04-3.43.22-.93 1.4-5.96 1.4-5.96s-.36-.72-.36-1.77c0-1.66.96-2.9 2.17-2.9 1.02 0 1.51.77 1.51 1.68 0 1.03-.65 2.56-.99 3.98-.28 1.19.6 2.16 1.77 2.16 2.12 0 3.76-2.24 3.76-5.47 0-2.86-2.06-4.86-5-4.86-3.4 0-5.4 2.56-5.4 5.2 0 1.03.4 2.14.9 2.74.1.12.11.23.08.35-.1.39-.31 1.25-.35 1.42-.05.21-.18.25-.41.14-1.53-.7-2.48-2.94-2.48-4.73 0-3.85 2.8-7.39 8.07-7.39 4.24 0 7.53 3.02 7.53 7.05 0 4.2-2.65 7.6-6.33 7.6-1.24 0-2.4-.64-2.8-1.4l-.76 2.9c-.27 1.05-1.02 2.37-1.52 3.19C8.96 23.82 10.45 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 sm:px-8 mt-10 pt-8 border-t border-wood-border/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-wood-light font-light text-left">
        <div>
          &copy; {new Date().getFullYear()} LD Interiors & Furnitures. All rights reserved.
        </div>
        <div className="flex items-center gap-1.5">
          Developed & Maintained by <span className="font-semibold text-wood-dark hover:text-wood-accent transition-colors">Pavan Sai</span>
        </div>
      </div>
    </footer>
  );
}
