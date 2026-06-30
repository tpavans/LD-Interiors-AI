"use client";
import React, { useState, useEffect } from 'react';
import { Mail, Phone, User, AlertCircle, Check, Send, MessageSquare } from 'lucide-react';
import api from '../../utils/api';

export default function SupportPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [issue, setIssue] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Autofill customer profile from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('ld_user_name') || '';
      const storedPhone = localStorage.getItem('ld_user_phone') || '';
      const storedEmail = localStorage.getItem('ld_user_email') || '';
      
      if (storedName) setName(storedName);
      if (storedPhone) setPhone(storedPhone);
      if (storedEmail) setEmail(storedEmail);
    }
  }, []);

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !email || !issue) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccess(false);

    try {
      // 2. Submit the support ticket to the backend
      const response = await api.post('/support', {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        issue: issue.trim(),
      });

      const ticket = response.data;

      // 3. Save details to localStorage to maintain local session if not already stored
      localStorage.setItem('ld_user_name', name.trim());
      localStorage.setItem('ld_user_phone', phone.trim());
      localStorage.setItem('ld_user_email', email.trim());
      window.dispatchEvent(new Event('storage')); // notify other components

      setSuccess(true);
      setIssue(''); // clear issue box

      // 4. Construct WhatsApp dispatch redirect message
      const cleanPhone = phone.replace(/\D/g, '');
      const targetPhone = '919346325291'; // Admin Pavan Sai's mobile number
      const whatsappMsg = `Hello Pavan Sai! I submitted a Customer Support ticket on the LD Interiors website:

*Customer Details:*
- Name: ${name.trim()}
- Phone: ${phone.trim()}
- Email: ${email.trim()}

*My Issue/Problem:*
"${issue.trim()}"

Please help me resolve this. Thank you!`;

      const encodedMsg = encodeURIComponent(whatsappMsg);
      const waUrl = `https://wa.me/${targetPhone}?text=${encodedMsg}`;

      // Redirect current window directly to bypass pop-up blockers
      window.location.href = waUrl;
    } catch (err) {
      console.error('Failed to submit support ticket:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit support request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
      {/* Header Section */}
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-[10px] font-extrabold tracking-widest text-wood-accent uppercase bg-wood-beige px-3.5 py-1 rounded-full">
          Customer Care Portal
        </span>
        <h1 className="font-serif text-3xl font-extrabold tracking-tight text-wood-dark sm:text-4xl mt-3">
          Customer Support
        </h1>
        <p className="mt-3 text-xs text-wood-light font-light leading-relaxed">
          Facing an issue with your order timeline, delivery setup, custom designs, or wood installations? Open a support ticket, and our team will get in touch with you.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-wood-cream border border-wood-border/60 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-wood-beige/40 -z-10"></div>
        
        <form onSubmit={handleSupportSubmit} className="space-y-5">
          {/* Grid fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-wood-accent mb-1.5">
                Your Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-wood-light/50" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-wood-border bg-white pl-9 pr-3 py-2.5 text-xs text-wood-dark focus:outline-none focus:border-wood-dark font-medium"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-wood-accent mb-1.5">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-wood-light/50" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-wood-border bg-white pl-9 pr-3 py-2.5 text-xs text-wood-dark focus:outline-none focus:border-wood-dark font-medium"
                  placeholder="Enter your contact number"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-wood-accent mb-1.5">
              Gmail / Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-wood-light/50" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-wood-border bg-white pl-9 pr-3 py-2.5 text-xs text-wood-dark focus:outline-none focus:border-wood-dark font-medium"
                placeholder="name@gmail.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-wood-accent mb-1.5">
              What is the problem? / Support Details *
            </label>
            <textarea
              required
              rows="5"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="w-full rounded-xl border border-wood-border bg-white px-4 py-3 text-xs text-wood-dark focus:outline-none focus:border-wood-dark placeholder-neutral-400 font-light"
              placeholder="Please describe the issue in detail (e.g., cot wood polishing questions, modular kitchen design modification details, billing and pricing inquiries...)"
            ></textarea>
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 flex items-center gap-2">
              <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 animate-bounce" />
              <div>
                <p className="font-bold">Support Request Submitted successfully!</p>
                <p className="text-[10px] text-emerald-700/95 mt-0.5">An email notification has been dispatched to the admin team. Redirecting you to chat on WhatsApp...</p>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-650 px-4 py-3.5 text-xs font-bold tracking-widest text-white uppercase shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Send className="h-4 w-4 animate-pulse" />
                <span>Submitting request...</span>
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4" />
                <span>Open WhatsApp Help Chat & Submit ticket</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
