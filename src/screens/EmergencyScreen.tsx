import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { startEmergencySiren, stopEmergencySiren } from '../utils/audioBuzzer';
import { ChhathSafetyBadgeModal } from '../components/ChhathSafetyBadgeModal';
import {
  PhoneCall,
  Volume2,
  VolumeX,
  MapPin,
  Share2,
  AlertTriangle,
  X,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

interface ContactToCall {
  title: string;
  number: string;
  description: string;
}

export const EmergencyScreen: React.FC = () => {
  const { deviceLocation, requestDeviceLocation, navigate } = useApp();

  const [sirenOn, setSirenOn] = useState<boolean>(false);
  const [callModalContact, setCallModalContact] = useState<ContactToCall | null>(null);
  const [locationSharedNotice, setLocationSharedNotice] = useState<string | null>(null);
  const [showSafetyBadgeModal, setShowSafetyBadgeModal] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      stopEmergencySiren();
    };
  }, []);

  const handleToggleSiren = () => {
    if (sirenOn) {
      stopEmergencySiren();
      setSirenOn(false);
    } else {
      startEmergencySiren();
      setSirenOn(true);
    }
  };

  // Emergency Categories
  const emergencyOptions = [
    {
      id: 'medical',
      icon: '🚑',
      title: 'मेडिकल सहायता',
      number: '108',
      desc: 'सरकारी एम्बुलेंस एवं प्राथमिक चिकित्सा',
      color: 'from-rose-600 to-red-700',
    },
    {
      id: 'police',
      icon: '👮',
      title: 'पुलिस सहायता',
      number: '112',
      desc: 'राष्ट्रीय आपातकालीन पुलिस हेल्पलाइन',
      color: 'from-blue-600 to-indigo-800',
    },
    {
      id: 'fire',
      icon: '🔥',
      title: 'आग / अग्निशमन',
      number: '101',
      desc: 'आपातकालीन दमकल सेवा',
      color: 'from-amber-600 to-orange-700',
    },
    {
      id: 'women',
      icon: '👩',
      title: 'महिला सहायता',
      number: '181',
      desc: 'महिला एवं बाल सुरक्षा हेल्पलाइन',
      color: 'from-purple-600 to-indigo-700',
    },
    {
      id: 'senior',
      icon: '👴',
      title: 'वरिष्ठ नागरिक',
      number: '14567',
      desc: 'एल्डरलाइन राष्ट्रीय बुजुर्ग हेल्पलाइन',
      color: 'from-teal-600 to-emerald-700',
    },
  ];

  // Initiate call confirmation
  const handleInitiateCall = (option: { title: string; number: string; desc: string }) => {
    setCallModalContact({
      title: option.title,
      number: option.number,
      description: option.desc,
    });
  };

  // Perform verified call
  const handleConfirmCall = () => {
    if (!callModalContact) return;
    window.location.href = `tel:${callModalContact.number}`;
    setCallModalContact(null);
  };

  // Share directly via WhatsApp link (no-app needed for recipient)
  const handleWhatsAppShare = async () => {
    if (!deviceLocation) {
      const success = await requestDeviceLocation();
      if (!success) {
        setLocationSharedNotice('आपकी location उपलब्ध नहीं है। कृपया GPS ऑन करें।');
        setTimeout(() => setLocationSharedNotice(null), 4000);
        return;
      }
    }
    const lat = deviceLocation ? deviceLocation.latitude.toFixed(5) : '24.6538';
    const lng = deviceLocation ? deviceLocation.longitude.toFixed(5) : '84.4375';
    const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
    const text = encodeURIComponent(
      `🚨 *आपातकालीन संदेश (देव छठ सेवा)*\n` +
      `मैं इस समय देव (औरंगाबाद) छठ मेले में हूँ और मुझे सहायता चाहिए।\n` +
      `📍 मेरी वर्तमान लोकेशन: ${mapsLink}\n` +
      `सटीकता: ±${deviceLocation?.accuracy ? Math.round(deviceLocation.accuracy) : 10} मीटर\n` +
      `समय: ${new Date().toLocaleTimeString('hi-IN')}\n` +
      `(NEXTGEN DEVBHOOMI FOUNDATION)`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Share current GPS location card
  const handleShareLocation = async () => {
    if (!deviceLocation) {
      const success = await requestDeviceLocation();
      setLocationSharedNotice(
        success
          ? 'वास्तविक GPS स्थान मिलने के बाद साझा करने के लिए फिर से टैप करें।'
          : 'आपकी location उपलब्ध नहीं है। कृपया GPS ऑन करके दोबारा प्रयास करें।'
      );
      setTimeout(() => setLocationSharedNotice(null), 4000);
      return;
    }

    const lat = deviceLocation.latitude.toFixed(5);
    const lng = deviceLocation.longitude.toFixed(5);
    const acc = deviceLocation?.accuracy ? `लगभग ${Math.round(deviceLocation.accuracy)} मीटर` : 'उपलब्ध नहीं';
    const timeStr = new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
    const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;

    const textToShare = `🚨 DEO CHHATH SEVA - आपातकालीन स्थान कार्ड\n` +
      `मेरा वर्तमान स्थान:\n` +
      `Latitude: ${lat}° N\n` +
      `Longitude: ${lng}° E\n` +
      `सटीकता (Accuracy): ${acc}\n` +
      `समय: ${timeStr}\n` +
      `नक्शा लिंक: ${mapsLink}\n` +
      `(NEXTGEN DEVBHOOMI FOUNDATION - देव छठ सेवा)`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DEO CHHATH SEVA - Emergency Location',
          text: textToShare,
        });
        setLocationSharedNotice('स्थान सफलतापूर्वक साझा किया गया।');
        setTimeout(() => setLocationSharedNotice(null), 4000);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        await copyToClipboard(textToShare);
      }
    } else {
      await copyToClipboard(textToShare);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setLocationSharedNotice('स्थान की जानकारी कॉपी कर ली गई है। आप इसे WhatsApp/SMS पर भेज सकते हैं।');
      setTimeout(() => setLocationSharedNotice(null), 4000);
    } catch {
      setLocationSharedNotice('स्थान की जानकारी साझा या कॉपी नहीं हो सकी। कृपया पुनः प्रयास करें।');
      setTimeout(() => setLocationSharedNotice(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white pb-20 flex flex-col font-['Noto_Sans_Devanagari','Inter',sans-serif] select-none">
      <TopBar title="🚨 आपातकालीन सहायता" showBack />

      <main className="flex-1 max-w-3xl sm:max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-5">
        {/* Success Alert */}
        {locationSharedNotice && (
          <div className="bg-emerald-900/90 border border-emerald-500 text-emerald-100 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{locationSharedNotice}</span>
          </div>
        )}

        {/* Emergency Prompt */}
        <div className="bg-[#C62828] border-2 border-[#EF5350] rounded-3xl p-4 text-center space-y-1 shadow-lg text-white">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#FFCDD2] block">
            तत्काल आपातकालीन सहायता • 24x7
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            किसी भी सहायता के लिए हम आपके साथ हैं
          </h2>
          <p className="text-xs text-[#FFEBEE]">
            सीधे कॉल करने हेतु नीचे संबंधित आपातकालीन सेवा पर टैप करें।
          </p>
        </div>

        {/* Audible Siren Alert Toggle */}
        <button
          onClick={handleToggleSiren}
          className={`w-full min-h-[50px] rounded-2xl flex items-center justify-center gap-2.5 font-black text-sm transition-all active:scale-98 shadow-md border ${
            sirenOn
              ? 'bg-red-600 text-white border-red-400 animate-pulse'
              : 'bg-stone-900 hover:bg-stone-800 text-stone-200 border-stone-800'
          }`}
        >
          {sirenOn ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-amber-400" />}
          <span>{sirenOn ? 'अलार्म सायरन बंद करें (STOP SIREN)' : '🔊 भीड़ में ध्यान आकर्षित करने हेतु अलार्म सायरन बजाएं'}</span>
        </button>

        {/* Large Emergency Action Buttons */}
        <div className="space-y-2.5">
          {emergencyOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleInitiateCall(opt)}
              className={`w-full min-h-[64px] p-3.5 bg-gradient-to-r ${opt.color} rounded-2xl shadow-md text-left flex items-center justify-between active:scale-98 transition-all group border border-white/10`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="text-3xl shrink-0 group-hover:scale-110 transition-transform">
                  {opt.icon}
                </span>
                <div className="min-w-0">
                  <span className="text-base sm:text-lg font-black text-white block leading-tight">
                    {opt.title}
                  </span>
                  <span className="text-xs text-white/80 font-medium truncate block mt-0.5">
                    {opt.desc}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-stone-950 font-black text-xs rounded-xl shrink-0 shadow-sm">
                <PhoneCall className="w-3.5 h-3.5 fill-stone-950" />
                <span>{opt.number}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Emergency Location Card & Sharing */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>आपातकालीन स्थान कार्ड (Emergency Location)</span>
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono text-stone-300 bg-stone-950 p-3 rounded-2xl border border-stone-800">
            <p className="text-amber-300 font-sans font-bold text-xs mb-1">DEO CHHATH SEVA</p>
            <p>
              Latitude: <span className="text-white font-bold">{deviceLocation ? `${deviceLocation.latitude.toFixed(5)}° N` : 'GPS उपलब्ध नहीं'}</span>
            </p>
            <p>
              Longitude: <span className="text-white font-bold">{deviceLocation ? `${deviceLocation.longitude.toFixed(5)}° E` : 'GPS उपलब्ध नहीं'}</span>
            </p>
            <p>
              Accuracy: <span className="text-white">{deviceLocation?.accuracy ? `±${Math.round(deviceLocation.accuracy)}m` : 'उपलब्ध नहीं'}</span>
            </p>
          </div>

          <p className="text-[11px] text-stone-400">
            “आपकी location केवल आपकी अनुमति के बाद साझा की जाएगी।”
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShareLocation}
              className="min-h-[48px] bg-stone-800 hover:bg-stone-700 active:scale-95 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all border border-stone-700"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>📍 स्थान साझा करें</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="min-h-[48px] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all"
            >
              <span className="text-sm">📲</span>
              <span>WhatsApp पर भेजें</span>
            </button>
          </div>
        </div>

        {/* On-Demand Vrati & Senior Citizen Assistance Dispatch (Feature 7) */}
        <div className="bg-gradient-to-r from-amber-950 via-orange-950 to-stone-900 border border-[#FFB52E]/40 rounded-3xl p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎋</span>
            <div>
              <h4 className="text-sm font-black text-white leading-tight">
                छठ व्रती व वृद्ध ऑन-डिमांड सहायता
              </h4>
              <p className="text-[11px] text-amber-200/80">
                घाट पर तत्काल व्हीलचेयर, स्ट्रेचर या जल-सेवा हेतु
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleInitiateCall({
                title: '🦽 स्ट्रेचर / व्हीलचेयर सहायता',
                number: '108',
                desc: 'अस्वस्थ व्रतियों व वरिष्ठ नागरिकों हेतु घाट पर स्ट्रेचर/एम्बुलेंस',
              })}
              className="p-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 rounded-2xl text-left transition-all active:scale-95"
            >
              <span className="text-xl block mb-1">🦽</span>
              <span className="text-xs font-black text-white block">स्ट्रेचर सहायता</span>
              <span className="text-[10px] text-amber-200 block">108 आपातकालीन</span>
            </button>

            <button
              onClick={() => handleInitiateCall({
                title: '💧 स्वयंसेवक जल-सेवा सहायता',
                number: '06186-222100',
                desc: 'पारण पूर्व पवित्र जल, ओआरएस एवं प्राथमिक सहायता दल',
              })}
              className="p-3 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/50 rounded-2xl text-left transition-all active:scale-95"
            >
              <span className="text-xl block mb-1">💧</span>
              <span className="text-xs font-black text-white block">जल-सेवा दल</span>
              <span className="text-[10px] text-sky-200 block">स्वयंसेवक डेस्क</span>
            </button>
          </div>
        </div>

        {/* Child & Senior Digital QR Safety Badge */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 border border-emerald-500/40 rounded-3xl p-4 shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl shrink-0 font-bold border border-emerald-400/30">
              🛡️
            </div>
            <div>
              <h4 className="text-sm font-black text-white leading-tight">
                बालक व वृद्ध डिजिटल सुरक्षा बैज
              </h4>
              <p className="text-[11px] text-emerald-200/80">
                भीड़ में खोने से सुरक्षा हेतु आपातकालीन QR कार्ड
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSafetyBadgeModal(true)}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-stone-950 font-black text-xs rounded-xl shadow-xs shrink-0 transition-all"
          >
            बैज खोलें
          </button>
        </div>
      </main>

      <ChhathSafetyBadgeModal
        isOpen={showSafetyBadgeModal}
        onClose={() => setShowSafetyBadgeModal(false)}
      />

      {/* Emergency Call Confirmation Modal */}
      {callModalContact && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 text-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-stone-700 animate-fade-in text-center">
            <div className="w-14 h-14 bg-red-600/20 border border-red-500 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <PhoneCall className="w-7 h-7 fill-red-500 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-black text-white">
                क्या आप इस verified number पर call करना चाहते हैं?
              </h4>
              <p className="text-sm font-bold text-amber-400">{callModalContact.title}</p>
              <p className="text-2xl font-black text-white font-mono pt-1">
                {callModalContact.number}
              </p>
              <p className="text-xs text-stone-400 pt-1">
                {callModalContact.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setCallModalContact(null)}
                className="min-h-[46px] bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl"
              >
                रद्द करें
              </button>
              <button
                onClick={handleConfirmCall}
                className="min-h-[46px] bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-4 h-4 fill-white" />
                <span>📞 कॉल करें</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
