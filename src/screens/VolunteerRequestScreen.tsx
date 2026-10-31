import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { SampleDataBanner } from '../components/SampleDataBanner';
import {
  HeartHandshake,
  Accessibility,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Send,
} from 'lucide-react';

export const VolunteerRequestScreen: React.FC = () => {
  const { volunteerRequests, submitVolunteerRequest, navigate } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('सूर्य कुंड घाट 2, तोरण के पास');
  const [serviceNeeded, setServiceNeeded] = useState<
    'wheelchair' | 'elderly-assist' | 'lost-help' | 'stretcher' | 'general'
  >('wheelchair');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    submitVolunteerRequest({
      requesterName: name,
      phone,
      serviceNeeded,
      location,
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setPhone('');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[var(--chhath-cream)] pb-20 flex flex-col font-['Noto_Sans_Devanagari','Inter',sans-serif]">
      <TopBar title="सहायता का अनुरोध" showBack />

      <main className="flex-1 max-w-3xl sm:max-w-4xl mx-auto w-full p-4 space-y-4">
        {/* Intro Banner */}
        <div className="bg-amber-600 text-white rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center gap-2">
            <Accessibility className="w-6 h-6 text-white" />
            <h2 className="text-base sm:text-lg font-bold">निःशुल्क स्वयंसेवक सहायता मांगें</h2>
          </div>
          <p className="text-xs text-amber-100">
            NextGen देवभूमि सेवा दल के 200+ स्वयंसेवक देव मेला क्षेत्र में आपकी सेवा हेतु तत्पर हैं।
          </p>
        </div>

        {/* Request Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5"
        >
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-stone-900">सहायता फॉर्म भरें</h3>
            <p className="text-xs text-stone-500">निकटतम स्वयंसेवक तत्काल आपके स्थान पर पहुंचेंगे</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              किस प्रकार की सहायता चाहिए? *
            </label>
            <select
              value={serviceNeeded}
              onChange={(e) =>
                setServiceNeeded(
                  e.target.value as 'wheelchair' | 'elderly-assist' | 'lost-help' | 'stretcher' | 'general'
                )
              }
              className="w-full min-h-[44px] px-3 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium"
            >
              <option value="wheelchair">♿ व्हीलचेयर सहायता (वरिष्ठ/दिव्यांगजन)</option>
              <option value="elderly-assist">🧓 बुजुर्ग को घाट तक ले जाने में सहारा</option>
              <option value="general">🧺 भारी दौरा / अर्घ्य सूप उठाने में सहायता</option>
              <option value="stretcher">🚑 स्ट्रेचर व आपात चिकित्सा सहायता</option>
              <option value="lost-help">📢 बिछड़े परिजन को खोजने में मदद</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">आपका वर्तमान स्थान (Landmark) *</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="उदा. सूर्य कुंड घाट 2, तोरण द्वार के निकट"
              className="w-full min-h-[44px] px-3 bg-stone-50 border border-stone-300 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">श्रद्धालु का नाम *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="नाम लिखें"
                className="w-full min-h-[44px] px-3 bg-stone-50 border border-stone-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">मोबाइल नंबर *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98XXXXXXXX"
                className="w-full min-h-[44px] px-3 bg-stone-50 border border-stone-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {submitted && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                अनुरोध स्वीकृत! निकटतम NextGen सेवादार आपके दिए गए स्थान पर रवाना हो चुके हैं।
              </span>
            </div>
          )}

          <button
            type="submit"
            className="w-full min-h-[48px] bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>सहायता अनुरोध भेजें (Send Request)</span>
          </button>
        </form>

        {/* Recent Active Requests Status */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
            आपके हालिया अनुरोध स्थिति
          </h3>

          {volunteerRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-stone-900">
                  {req.serviceNeeded === 'wheelchair'
                    ? '♿ व्हीलचेयर अनुरोध'
                    : req.serviceNeeded === 'elderly-assist'
                    ? '🧓 बुजुर्ग सहायता'
                    : '🤝 सेवा सहायता'}
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                  {req.status}
                </span>
              </div>
              <p className="text-xs text-stone-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>स्थान: {req.location}</span>
              </p>
              <p className="text-[11px] text-stone-500">
                अनुरोधकर्ता: {req.requesterName} • {req.timestamp}
              </p>
            </div>
          ))}
        </div>

        <SampleDataBanner text="यह सहायता प्रणाली मेला के दौरान स्वयंसेवकों को कॉल/एसएमएस द्वारा अलर्ट करती है।" />
      </main>
    </div>
  );
};
