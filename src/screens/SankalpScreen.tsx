/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import {
  Sparkles,
  Download,
  Share2,
  CheckCircle,
  FileText,
  Heart,
  ShieldCheck,
  User,
  MapPin,
  Calendar,
  Award,
} from 'lucide-react';

interface SankalpRecord {
  id: string;
  name: string;
  guardianName: string;
  gotra: string;
  city: string;
  familyMembers: string;
  purpose: string;
  customPrayer?: string;
  createdAt: string;
}

const SANKALP_STORAGE_KEY = 'deo_chhath_devotee_sankalp';

const SANKALP_PURPOSES = [
  'आरोग्य एवं कुष्ठ/चर्म रोग निवारण (स्वास्थ लाभ)',
  'संतान सुख, दीर्घायु एवं उज्ज्वल भविष्य',
  'पारिवारिक सुख, शांति एवं अखंड सौभाग्य',
  'व्यापार, आजीविका व कार्यक्षेत्र में उन्नति',
  'समस्त ग्रह-दोष व संकट निवारण',
  'विश्व कल्याण व प्रकृति संरक्षण',
];

export const SankalpScreen: React.FC = () => {
  const { navigate } = useApp();
  const [name, setName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [gotra, setGotra] = useState('');
  const [city, setCity] = useState('');
  const [familyMembers, setFamilyMembers] = useState('');
  const [purpose, setPurpose] = useState(SANKALP_PURPOSES[0]);
  const [customPrayer, setCustomPrayer] = useState('');
  const [activeSankalp, setActiveSankalp] = useState<SankalpRecord | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Load saved sankalp if exists
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SANKALP_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setActiveSankalp(parsed);
        setShowCertificate(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim()) {
      alert('कृपया अपना नाम और शहर का नाम अवश्य दर्ज करें।');
      return;
    }

    const newRecord: SankalpRecord = {
      id: `DEO-SKLP-${Math.floor(100000 + Math.random() * 900000)}`,
      name: name.trim(),
      guardianName: guardianName.trim() || 'सर्वजन',
      gotra: gotra.trim() || 'कश्यप / सर्वगोत्र',
      city: city.trim(),
      familyMembers: familyMembers.trim() || 'सपरिवार',
      purpose,
      customPrayer: customPrayer.trim(),
      createdAt: new Date().toLocaleDateString('hi-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };

    try {
      localStorage.setItem(SANKALP_STORAGE_KEY, JSON.stringify(newRecord));
    } catch {
      // ignore
    }

    setActiveSankalp(newRecord);
    setShowCertificate(true);
  };

  const handleShare = () => {
    if (!activeSankalp) return;
    const text = `🚩 *देव सूर्य मंदिर दूरस्थ ई-संकल्प पत्र*\nपंजीकरण सं: ${activeSankalp.id}\nयजमान: ${activeSankalp.name} (${activeSankalp.gotra})\nस्थान: ${activeSankalp.city}\nसंकल्प: ${activeSankalp.purpose}\n\nभगवान भास्कर एवं षष्ठी मैया का पावन आशीर्वाद आपके और आपके परिवार पर सदा बना रहे!\nसेवा एवं संकल्प: https://seva.nextgendevbhoomi.org/`;

    if (navigator.share) {
      navigator.share({ title: 'देवार्क धाम ई-संकल्प पत्र', text, url: 'https://seva.nextgendevbhoomi.org/' }).catch(() => undefined);
    } else {
      navigator.clipboard?.writeText(text);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  const handleNewSankalp = () => {
    setShowCertificate(false);
  };

  return (
    <div className="min-h-screen bg-[#FFF8E1] text-stone-900 pb-28 flex flex-col font-['Noto_Sans_Devanagari','Inter',sans-serif]">
      <TopBar title="देवार्क धाम दूरस्थ ई-संकल्प" showBack />

      <main className="flex-1 max-w-2xl mx-auto w-full p-4 sm:p-6 space-y-5">
        {/* Divine Intro Card */}
        <div className="bg-gradient-to-br from-[#0B5E8E] via-[#07476F] to-[#04283F] text-white rounded-3xl p-5 shadow-lg border-2 border-amber-400 relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 border border-amber-300 text-amber-300 px-2.5 py-0.5 rounded-full inline-block">
              घर बैठे देव सूर्य मंदिर संकल्प सेवा
            </span>
            <h2 className="text-xl font-black text-white">
              देवार्क धाम दूरस्थ ई-संकल्प (Virtual Vrat Sankalp)
            </h2>
            <p className="text-xs text-amber-100 leading-relaxed">
              जो भक्त किसी कारणवश देव नहीं आ सकते, वे यहाँ अपने व परिवार के नाम से पावन संकल्प दर्ज कर डिजिटल आशीर्वाद पत्र प्राप्त कर सकते हैं।
            </p>
          </div>
        </div>

        {/* E-Sankalp Certificate View */}
        {showCertificate && activeSankalp ? (
          <div className="space-y-4 animate-fade-in">
            {/* The Certificate Sheet */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-amber-400 shadow-2xl relative overflow-hidden text-stone-900 space-y-5">
              {/* Decorative Corner Ornaments */}
              <div className="absolute top-2 left-2 text-amber-400 text-xl font-serif">卐</div>
              <div className="absolute top-2 right-2 text-amber-400 text-xl font-serif">卐</div>
              <div className="absolute bottom-2 left-2 text-amber-400 text-xl font-serif">卐</div>
              <div className="absolute bottom-2 right-2 text-amber-400 text-xl font-serif">卐</div>

              {/* Watermark Logo */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-5">
                <span className="text-9xl font-black text-amber-600">☀️</span>
              </div>

              {/* Certificate Header */}
              <div className="text-center space-y-1 border-b-2 border-amber-300 pb-4">
                <span className="text-[11px] font-black text-[#F47B20] tracking-widest uppercase block">
                  ॥ श्री सूर्य नारायणाय नमः • जय छठी मइया ॥
                </span>
                <h3 className="text-2xl font-black text-[#0B5E8E] font-serif">
                  देवार्क धाम पावन ई-संकल्प पत्र
                </h3>
                <p className="text-xs font-bold text-stone-600">
                  NEXTGEN DEVBHOOMI FOUNDATION • DEO CHHATH SEVA
                </p>
                <div className="inline-block mt-1 bg-amber-100 text-amber-900 px-3 py-0.5 rounded-full text-xs font-black border border-amber-300">
                  प्रमाणित पंजीकरण सं: {activeSankalp.id}
                </div>
              </div>

              {/* Devotee Info Grid */}
              <div className="space-y-3 text-sm leading-relaxed">
                <p className="text-center italic text-stone-700 text-xs sm:text-sm">
                  “प्रमाणित किया जाता है कि भगवान भुवन भास्कर के पावन देव सूर्य मंदिर एवं सूर्य कुंड महातीर्थ के निमित्त निम्नलिखित यजमान का ई-संकल्प श्रद्धापूर्वक समर्पित किया गया है।”
                </p>

                <div className="bg-[#FFF8E1] p-4 rounded-2xl border border-amber-300/80 space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between border-b border-amber-200 pb-1.5">
                    <span className="font-bold text-stone-600">यजमान (Devotee):</span>
                    <span className="font-black text-[#0B5E8E] text-base">{activeSankalp.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-amber-200 pb-1.5">
                    <span className="font-bold text-stone-600">पिता/पति का नाम:</span>
                    <span className="font-bold text-stone-800">{activeSankalp.guardianName}</span>
                  </div>
                  <div className="flex justify-between border-b border-amber-200 pb-1.5">
                    <span className="font-bold text-stone-600">गोत्र (Gotra):</span>
                    <span className="font-bold text-stone-800">{activeSankalp.gotra}</span>
                  </div>
                  <div className="flex justify-between border-b border-amber-200 pb-1.5">
                    <span className="font-bold text-stone-600">स्थान / नगर (Location):</span>
                    <span className="font-bold text-stone-800">{activeSankalp.city}</span>
                  </div>
                  <div className="flex justify-between border-b border-amber-200 pb-1.5">
                    <span className="font-bold text-stone-600">परिवार जन:</span>
                    <span className="font-bold text-stone-800">{activeSankalp.familyMembers}</span>
                  </div>
                  <div className="pt-1">
                    <span className="font-bold text-stone-600 block text-xs">संकल्प प्रयोजन:</span>
                    <span className="font-black text-[#D35400] text-sm block mt-0.5">
                      {activeSankalp.purpose}
                    </span>
                  </div>
                  {activeSankalp.customPrayer && (
                    <div className="pt-1 text-xs text-stone-600 italic border-t border-amber-200">
                      “{activeSankalp.customPrayer}”
                    </div>
                  )}
                </div>
              </div>

              {/* Certificate Footer with Blessing */}
              <div className="pt-2 border-t-2 border-amber-200 flex items-center justify-between text-[11px] text-stone-600">
                <div>
                  <p className="font-bold">तिथि: {activeSankalp.createdAt}</p>
                  <p className="text-[#2E7D32] font-black">स्थिति: संकल्प स्वीकृत एवं समर्पित ✓</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 font-black text-[#0B5E8E]">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    संस्था डिजिटल मुहर
                  </div>
                  <p className="text-[9px] text-stone-500">देवार्क सेवा अभियान</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#0B5E8E] to-[#07476F] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>{shareSuccess ? 'विवरण कॉपी हुआ!' : 'प्रमाणपत्र शेयर करें'}</span>
              </button>

              <button
                onClick={handleNewSankalp}
                className="py-3 px-4 rounded-2xl bg-amber-400 text-black font-black text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <span>नया संकल्प दर्ज करें</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sankalp Input Form */
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-md space-y-4"
          >
            <div className="border-b border-stone-200 pb-2">
              <h3 className="text-base font-black text-[#0B5E8E]">
                यजमान व संकल्प विवरण दर्ज करें
              </h3>
              <p className="text-xs text-stone-500">
                यह सेवा पूर्णतः निःशुल्क एवं श्रद्धा-आधारित है
              </p>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  यजमान का पूरा नाम (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. राहुल कुमार"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] bg-stone-50 text-stone-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    पिता / पति का नाम
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. श्री रमेश सिंह"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] bg-stone-50 text-stone-900 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    गोत्र (Gotra)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. कश्यप / शांडिल्य"
                    value={gotra}
                    onChange={(e) => setGotra(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] bg-stone-50 text-stone-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    वर्तमान नगर / राज्य *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. पटना, दिल्ली, मुंबई"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] bg-stone-50 text-stone-900 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    परिवार के अन्य सदस्य
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. सीमा, रोहन, आर्या"
                    value={familyMembers}
                    onChange={(e) => setFamilyMembers(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] bg-stone-50 text-stone-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  संकल्प का मुख्य प्रयोजन (Purpose)
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] bg-stone-50 text-stone-900 font-medium"
                >
                  {SANKALP_PURPOSES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  विशेष प्रार्थना अथवा मनोकामना (वैकल्पिक)
                </label>
                <textarea
                  rows={2}
                  placeholder="भगवान भास्कर एवं षष्ठी मैया से अपनी विशेष प्रार्थना लिखें..."
                  value={customPrayer}
                  onChange={(e) => setCustomPrayer(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] bg-stone-50 text-stone-900 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all hover:brightness-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>संकल्प पूर्ण करें एवं आशीर्वाद पत्र प्राप्त करें</span>
            </button>
          </form>
        )}
      </main>
    </div>
  );
};
