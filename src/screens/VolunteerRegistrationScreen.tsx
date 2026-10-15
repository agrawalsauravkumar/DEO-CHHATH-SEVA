import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { VolunteerService } from '../services/VolunteerService';
import { isValidIndianMobileNumber } from '../utils/indianMobileNumber';
import {
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  Languages,
  Shield,
  Send,
} from 'lucide-react';

const SERVICE_OPTIONS = [
  '🧭 रास्ता बताना',
  '🆘 सहायता',
  '🚑 मेडिकल सहायता',
  '👴 वरिष्ठ नागरिक सहायता',
  '👩 महिला सहायता',
  '🧑‍🦽 दिव्यांग सहायता',
  '👨‍👩‍👧 परिवार सहायता',
  '🔎 Lost & Found',
  '🛺 Shuttle सहायता',
  'अमृत जल व स्वच्छता सेवा',
];

const SERVICE_AREAS = [
  'सूर्य मंदिर पूर्वी तोरण द्वार एवं गर्भगृह',
  'सूर्य कुंड घाट (अर्घ्य सरोवर)',
  'रुद्र कुंड एवं परिक्रमा पथ',
  'P1 राजा जगन्नाथ उच्च विद्यालय पड़ाव',
  'P2 देव डिग्री कॉलेज मैदान पड़ाव',
  'P3 अंबा मोड़ मुख्य चेकपोस्ट',
  'थाना मोड़ केंद्रीय नियंत्रण कक्ष',
];

const TIME_SLOTS = [
  '24 घंटे निरंतर सेवा (छठ महापर्व)',
  'सुबह की पाली (4:00 AM - 12:00 PM)',
  'शाम की अर्घ्य पाली (12:00 PM - 8:00 PM)',
  'रात्रि सेवा (8:00 PM - 4:00 AM)',
];

export const VolunteerRegistrationScreen: React.FC = () => {
  const { navigate } = useApp();

  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [serviceArea, setServiceArea] = useState<string>(SERVICE_AREAS[0]);
  const [selectedServices, setSelectedServices] = useState<string[]>([
    '🧭 रास्ता बताना',
    '🆘 सहायता',
  ]);
  const [selectedTime, setSelectedTime] = useState<string>(TIME_SLOTS[0]);
  const [languages, setLanguages] = useState<string[]>(['हिन्दी', 'मगही']);
  const [formError, setFormError] = useState<string | null>(null);
  const [successSubmitted, setSuccessSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const toggleService = (srv: string) => {
    if (selectedServices.includes(srv)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((s) => s !== srv));
      }
    } else {
      setSelectedServices([...selectedServices, srv]);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      if (languages.length > 1) {
        setLanguages(languages.filter((l) => l !== lang));
      }
    } else {
      setLanguages([...languages, lang]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('कृपया अपना पूरा नाम दर्ज करें।');
      return;
    }
    if (!isValidIndianMobileNumber(phone)) {
      setFormError('कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      await VolunteerService.registerVolunteer({
        name: name.trim(),
        phone: phone.trim(),
        serviceArea,
        services: selectedServices,
        languages,
        availabilityTime: selectedTime,
      });
      setSuccessSubmitted(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'पंजीकरण भेजा नहीं जा सका। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 flex flex-col font-['Mukta',sans-serif]">
      <TopBar title="🙋 स्वयंसेवक पंजीकरण" showBack />

      <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-4">
        {/* Success Confirmation Modal / Banner */}
        {successSubmitted ? (
          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-400 shadow-xl space-y-4 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-3xl">
              ✅
            </div>
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-amber-700 block">
                NEXTGEN DEVBHOOMI FOUNDATION
              </span>
              <h3 className="text-xl font-black text-stone-900">
                पंजीकरण सफलतापूर्वक दर्ज हुआ!
              </h3>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-300 text-xs text-amber-950 font-bold leading-relaxed">
              <p>
                <strong>“आपका volunteer registration verification के लिए भेज दिया गया है।”</strong>
              </p>
              <p className="mt-1 text-[11px] font-normal text-stone-600">
                सुरक्षा एवं सेवा गुणवत्ता सुनिश्चित करने हेतु प्रशासन / सेवा दल द्वारा सत्यापन के बाद आपका Volunteer Mode सक्रिय होगा।
              </p>
            </div>

            <button
              onClick={() => navigate('volunteer')}
              className="w-full min-h-[48px] bg-[#0B5E8E] hover:bg-[#073B5A] text-white font-black text-sm rounded-xl shadow-md transition-all active:scale-95"
            >
              <span>स्वयंसेवक पोर्टल पर वापस जाएं</span>
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-4"
          >
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-700 block">
                निःस्वार्थ लोकसेवा संकल्प
              </span>
              <h2 className="text-xl font-black text-stone-900">
                स्वयंसेवक पंजीकरण फॉर्म
              </h2>
              <p className="text-xs text-stone-500">
                कृपया अपनी सही जानकारी भरें। सत्यापन के बाद आपको अधिकृत बैज प्रदान किया जाएगा।
              </p>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-300 text-rose-900 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* नाम */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-stone-700 block">पूरा नाम (Full Name) *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="उदा. राहुल कुमार"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            {/* मोबाइल नंबर */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-stone-700 block">मोबाइल नंबर (Phone) *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10 अंकों का मोबाइल नंबर"
                maxLength={10}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            {/* सेवा क्षेत्र */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-stone-700 block">प्राथमिक सेवा क्षेत्र (Service Area) *</label>
              <select
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
              >
                {SERVICE_AREAS.map((area, i) => (
                  <option key={i} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            {/* उपलब्ध सेवा (Checkboxes per Requirement 2) */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-stone-700 block">
                आप किन सेवाओं में सहयोग कर सकते हैं? (कम से कम एक चुनें) *
              </label>
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                {SERVICE_OPTIONS.map((srv, i) => {
                  const isChecked = selectedServices.includes(srv);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleService(srv)}
                      className={`p-2 rounded-xl text-left text-xs font-bold transition-all border ${
                        isChecked
                          ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-xs'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <span>{isChecked ? '✓ ' : '+ '}</span>
                      <span>{srv}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* उपलब्ध समय */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-stone-700 block">उपलब्ध समय (Availability Slot) *</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
              >
                {TIME_SLOTS.map((slot, i) => (
                  <option key={i} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            {/* भाषा */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-stone-700 block">भाषा ज्ञान (Languages):</label>
              <div className="flex flex-wrap gap-1.5">
                {['हिन्दी', 'मगही', 'भोजपुरी', 'English'].map((lang, i) => {
                  const isChecked = languages.includes(lang);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isChecked
                          ? 'bg-[#0B5E8E] text-white border-[#0B5E8E]'
                          : 'bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      {lang} {isChecked && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Verification Disclaimer */}
            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-[11px] text-stone-600 leading-relaxed">
              <p>
                ⚠️ <strong>नोट:</strong> पंजीकरण के तुरंत बाद सेवा असाइनमेंट नहीं मिलेंगे। एडमिन सत्यापन पूरा होने पर आपको एसएमएस/सूचना द्वारा सूचित किया जाएगा।
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[50px] bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 hover:from-amber-700 hover:to-orange-800 active:scale-98 text-white font-black text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all border border-amber-500/40"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'भेजा जा रहा है…' : 'पंजीकरण भेजें (Submit Application)'}</span>
            </button>
          </form>
        )}
      </main>
    </div>
  );
};
