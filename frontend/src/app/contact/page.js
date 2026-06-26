"use client";
import { Phone, MessageSquare, MapPin, Sparkles, Hammer, Mail } from 'lucide-react';

export default function ContactPage() {
  const admin1 = {
    name: "Pavan Sai",
    role: "Website Developer & Administrator",
    desc: "Handles website development, server management, feature updates, and online portfolio maintenance.",
    phone: "9346325291",
    whatsapp: true
  };

  const admin2 = {
    name: "Nagaraju",
    role: "Head of LD Interiors & Furnitures",
    desc: "Oversees all interior design projects, on-site executions, structural design finalizations, price estimations, and contracts.",
    phone: "6281653998",
    whatsappPhone: "6301290966"
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-8 sm:py-16">
      {/* Header Section */}
      <div className="text-center max-w-xl mx-auto mb-16">
        <span className="text-[10px] font-extrabold tracking-widest text-wood-accent uppercase">
          Get in Touch
        </span>
        <h1 className="font-serif text-4xl font-extrabold tracking-tight text-wood-dark sm:text-5xl mt-2">
          Contact Our Studio
        </h1>
        <p className="mt-4 text-sm text-wood-light font-light leading-relaxed">
          Have an interior design project, contract inquiry, or website feedback? Reach out to our dedicated admins directly via call or message.
        </p>
      </div>

      {/* Grid containing Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto mb-16">
        {/* Admin 2 Card (Nagaraju - Head, placed first to prioritize business leads) */}
        <div className="group relative overflow-hidden rounded-2xl bg-wood-cream border border-wood-border/60 p-8 shadow-sm hover:shadow-xl hover:border-wood-accent/30 transition-all duration-500 flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-wood-beige/50 group-hover:scale-150 transition-transform duration-500 -z-10"></div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="p-2.5 rounded-xl bg-wood-beige text-wood-accent">
                <Hammer className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-extrabold tracking-widest text-wood-accent uppercase">
                Studio Lead
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-wood-dark">
              {admin2.name}
            </h2>
            <p className="text-xs font-semibold text-wood-light mt-1 uppercase tracking-wider">
              {admin2.role}
            </p>
            <p className="mt-4 text-sm text-wood-medium/80 font-light leading-relaxed">
              {admin2.desc}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-wood-border/40 flex flex-col sm:flex-row gap-3">
            <a
              href={`tel:+91${admin2.phone}`}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-wood-border hover:border-wood-dark hover:bg-wood-dark hover:text-white px-4 py-3.5 text-xs font-bold tracking-widest text-wood-dark uppercase shadow-sm transition-all duration-300 cursor-pointer"
            >
              <Phone className="h-4 w-4" />
              Call ({admin2.phone})
            </a>
            <a
              href={`https://wa.me/91${admin2.whatsappPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-650 px-4 py-3.5 text-xs font-bold tracking-widest text-white uppercase shadow-sm transition-all duration-300 cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>

        {/* Admin 1 Card (Pavan Sai - Developer) */}
        <div className="group relative overflow-hidden rounded-2xl bg-wood-cream border border-wood-border/60 p-8 shadow-sm hover:shadow-xl hover:border-wood-accent/30 transition-all duration-500 flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-wood-beige/50 group-hover:scale-150 transition-transform duration-500 -z-10"></div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="p-2.5 rounded-xl bg-wood-beige text-wood-accent">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-extrabold tracking-widest text-wood-accent uppercase">
                System Admin
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-wood-dark">
              {admin1.name}
            </h2>
            <p className="text-xs font-semibold text-wood-light mt-1 uppercase tracking-wider">
              {admin1.role}
            </p>
            <p className="mt-4 text-sm text-wood-medium/80 font-light leading-relaxed">
              {admin1.desc}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-wood-border/40 flex flex-col sm:flex-row gap-3">
            <a
              href={`tel:+91${admin1.phone}`}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-wood-border hover:border-wood-dark hover:bg-wood-dark hover:text-white px-3 py-3.5 text-xs font-bold tracking-widest text-wood-dark uppercase shadow-sm transition-all duration-300 cursor-pointer"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
            <a
              href={`https://wa.me/91${admin1.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-650 px-3 py-3.5 text-xs font-bold tracking-widest text-white uppercase shadow-sm transition-all duration-300 cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              WhatsApp
            </a>
            <a
              href="mailto:ldinteriors.in@gmail.com"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-wood-border hover:border-wood-dark hover:bg-wood-dark hover:text-white px-3 py-3.5 text-xs font-bold tracking-widest text-wood-dark uppercase shadow-sm transition-all duration-300 cursor-pointer"
            >
              <Mail className="h-4 w-4" />
              Email
            </a>
          </div>
        </div>
      </div>

      {/* Address & Social Block */}
      <div className="max-w-5xl mx-auto rounded-3xl bg-wood-cream border border-wood-border/60 p-8 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-1/2 left-0 -z-10 -translate-y-1/2 translate-x-[-30%] h-64 w-64 rounded-full bg-wood-beige/25 blur-3xl"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          {/* Address */}
          <div className="md:col-span-6 flex gap-4">
            <div className="p-3.5 rounded-2xl bg-wood-beige text-wood-accent shrink-0 h-fit">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-wood-accent uppercase">
                Studio Address
              </span>
              <h3 className="font-serif text-xl font-bold text-wood-dark mt-1">
                LD Interiors & Furnitures Office
              </h3>
              <p className="mt-2 text-sm text-wood-medium font-light leading-relaxed">
                6-132, Mulasthanam,<br />
                Alamuru Mandal, Konaseema District,<br />
                Andhra Pradesh, PIN: 533233
              </p>
            </div>
          </div>

          {/* Contact Details (Email & Social) */}
          <div className="md:col-span-6 md:border-l border-wood-border/40 md:pl-8 flex flex-col justify-between gap-6">
            {/* Email Contact */}
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-wood-accent uppercase">
                Email Contact
              </span>
              <h3 className="font-serif text-xl font-bold text-wood-dark mt-1 flex items-center gap-2 flex-wrap">
                <Mail className="h-5 w-5 text-wood-accent" />
                <a href="mailto:ldinteriors.in@gmail.com" className="hover:text-wood-accent transition-colors font-semibold underline">
                  ldinteriors.in@gmail.com
                </a>
              </h3>
            </div>

            {/* Social / Instagram */}
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-wood-accent uppercase">
                Social Media
              </span>
              <h3 className="font-serif text-xl font-bold text-wood-dark mt-1 mb-3">
                Follow Us on Instagram
              </h3>
              <a
                href="https://www.instagram.com/ldinteriors.in?igsh=N2EydGxoZDNzZjF5"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-800 via-pink-700 to-amber-600 px-6 py-3.5 text-xs font-bold tracking-widest text-white uppercase shadow-sm hover:opacity-90 transition-opacity duration-300 cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                @ldinteriors.in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
