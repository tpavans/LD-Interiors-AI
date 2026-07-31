"use client";
import { useState, useId } from 'react';
import { Calendar, Video, MapPin, Clock, X, CheckCircle2, User, Phone, MessageSquare, Sparkles } from 'lucide-react';

export default function WorkshopTourBookingModal({ onClose }) {
  const [tourType, setTourType] = useState('video_call'); // 'video_call' or 'in_person'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('11:00 AM');
  const [topic, setTopic] = useState('Burma Teak Wood Logs Inspection');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const nameInputId = useId();
  const phoneInputId = useId();
  const dateInputId = useId();
  const timeSelectId = useId();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone || !preferredDate) return;

    const tourTypeName = tourType === 'video_call' ? '📹 Live WhatsApp Video Call' : '📍 In-Person Workshop Visit (Alamuru)';
    
    const waMessage = `📅 *WORKSHOP TOUR & CONSULTATION BOOKING* / LD Interiors

Hello Nagaraju garu,

I would like to book a consultation slot:

👤 *Customer Name:* ${name}
📞 *Mobile Phone:* ${phone}
🎟️ *Booking Mode:* ${tourTypeName}
📅 *Preferred Date:* ${preferredDate} at ${preferredTime}
🪵 *Topic of Interest:* ${topic}

Please confirm the availability for this slot.

Thank you!`;

    window.open(`https://wa.me/919346325291?text=${encodeURIComponent(waMessage)}`, '_blank');
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 text-left p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#008DDA] bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              Alamuru Master Workshop
            </span>
            <h3 className="text-xl font-serif font-bold text-slate-900 mt-2 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#008DDA]" />
              Book Live Consultation Slot
            </h3>
            <p className="text-xs text-slate-500 font-medium">Inspect raw teak logs & speak with Master Craftsman Nagaraju.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-4 animate-fadeIn">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
            <h4 className="text-lg font-serif font-bold text-slate-900">Booking Requested!</h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Your appointment details have been sent via WhatsApp to Nagaraju garu. We will confirm your time slot within 2 hours.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 bg-[#008DDA] text-white text-xs font-bold uppercase rounded-full shadow-md"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Tour Type Selector */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setTourType('video_call')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer text-center ${
                  tourType === 'video_call'
                    ? 'border-[#008DDA] bg-sky-50 font-extrabold text-slate-900 ring-2 ring-[#008DDA]/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Video className="h-5 w-5 mx-auto text-[#008DDA] mb-1" />
                <span className="block text-xs font-bold">WhatsApp Video Call</span>
                <span className="text-[9px] text-slate-400 font-normal">Remote Log Inspection</span>
              </div>

              <div
                onClick={() => setTourType('in_person')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer text-center ${
                  tourType === 'in_person'
                    ? 'border-[#008DDA] bg-sky-50 font-extrabold text-slate-900 ring-2 ring-[#008DDA]/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MapPin className="h-5 w-5 mx-auto text-emerald-600 mb-1" />
                <span className="block text-xs font-bold">Workshop Visit</span>
                <span className="text-[9px] text-slate-400 font-normal">Alamuru, AP Workshop</span>
              </div>
            </div>

            <div>
              <label htmlFor={nameInputId} className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Your Full Name</label>
              <input
                id={nameInputId}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Varma"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-medium text-slate-900 focus:border-[#008DDA] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor={phoneInputId} className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Mobile Phone Number</label>
              <input
                id={phoneInputId}
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-medium text-slate-900 focus:border-[#008DDA] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor={dateInputId} className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Preferred Date</label>
                <input
                  id={dateInputId}
                  type="date"
                  required
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-medium text-slate-900 focus:border-[#008DDA] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor={timeSelectId} className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Time Slot</label>
                <select
                  id={timeSelectId}
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-medium text-slate-900 focus:border-[#008DDA] focus:outline-none"
                >
                  <option value="10:00 AM">10:00 AM Morning</option>
                  <option value="11:30 AM">11:30 AM Morning</option>
                  <option value="03:00 PM">03:00 PM Afternoon</option>
                  <option value="05:30 PM">05:30 PM Evening</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Discussion Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 font-medium text-slate-900 focus:border-[#008DDA] focus:outline-none"
              >
                <option value="Burma Teak Wood Logs Inspection">Burma Teak Wood Logs Inspection</option>
                <option value="Custom Main Door Carving Design">Custom Main Door Carving Design</option>
                <option value="Puja Mandiram Temple Sizing">Puja Mandiram Temple Sizing</option>
                <option value="Full House Furniture Package Discussion">Full House Furniture Package Discussion</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#008DDA] to-[#0077B6] hover:brightness-110 text-white font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md mt-2 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Request Appointment Slot</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
