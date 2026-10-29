import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { DataFreshnessNotice } from '../components/DataFreshnessNotice';
import { HelpService } from '../services/HelpService';
import { LocationService } from '../services/LocationService';
import { HelpPoint, LocationItem } from '../types';
import { apiUrl } from '../services/apiUrl';
import {
  LifeBuoy,
  PhoneCall,
  Shield,
  HeartPulse,
  Users,
  Compass,
  MapPin,
  Share2,
  Navigation,
  Send,
  AlertCircle,
  CheckCircle2,
  X,
  UserCheck,
  HeartHandshake,
  Clock,
  WifiOff,
} from 'lucide-react';

export const HelpScreen: React.FC = () => {
  const {
    deviceLocation,
    requestDeviceLocation,
    setSelectedMapItem,
    isOnline,
    navigate,
  } = useApp();

  // Active view section
  const [activeSection, setActiveSection] = useState<'MAIN' | 'REQUEST' | 'VOLUNTEERS' | 'POINTS'>('MAIN');
  const [selectedPointCategory, setSelectedPointCategory] = useState<string>('ALL');

  // Help Request Form State
  const [issueType, setIssueType] = useState<string>('चिकित्सा / स्वास्थ्य');
  const [issueDesc, setIssueDesc] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [locationAgreed, setLocationAgreed] = useState<boolean>(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState<boolean>(false);

  // Call Confirmation Modal State
  const [callModalContact, setCallModalContact] = useState<{ title: string; number: string } | null>(null);

  // Location Share Modal State
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  // Nearby Help Points
  const helpPoints = useMemo(() => {
    if (deviceLocation) {
      return HelpService.getNearbyHelpPoints(deviceLocation.latitude, deviceLocation.longitude);
    }
    return HelpService.getHelpPoints().map((hp) => ({
      ...hp,
      distanceMeters: 0,
      distanceDisplay: 'GPS उपलब्ध नहीं',
    }));
  }, [deviceLocation]);

  // Verified Volunteers
  const verifiedVolunteers = useMemo(() => {
    if (deviceLocation) {
      return HelpService.getVerifiedVolunteers(deviceLocation.latitude, deviceLocation.longitude);
    }
    return HelpService.getVerifiedVolunteers();
  }, [deviceLocation]);

  // Handle Form Submit
  const handleSendHelpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRequest) return;
    if (!isOnline) {
      setFormError('Internet connection उपलब्ध नहीं है। Internet connection वापस आने पर सहायता अनुरोध भेजें।');
      return;
    }
    if (!issueDesc.trim()) {
      setFormError('कृपया समस्या का विवरण दर्ज करें।');
      return;
    }
    if (!locationAgreed) {
      setFormError('सहायता हेतु स्थान साझा करने की अनुमति आवश्यक है।');
      return;
    }
    if (!deviceLocation) {
      setFormError('सहायता अनुरोध भेजने से पहले GPS स्थान उपलब्ध होना आवश्यक है। कृपया स्थान अनुमति देकर पुनः प्रयास करें।');
      return;
    }

    setIsSubmittingRequest(true);
    try {
      const response = await fetch(apiUrl('/api/help/request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: issueType,
          description: issueDesc.trim(),
          userName: userName.trim() || undefined,
          userPhone: userPhone.trim() || undefined,
          latitude: deviceLocation?.latitude,
          longitude: deviceLocation?.longitude,
        }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof result === 'object' &&
          result !== null &&
          'error' in result &&
          typeof result.error === 'string'
            ? result.error
            : 'सहायता अनुरोध सर्वर पर भेजा नहीं जा सका। कृपया दोबारा प्रयास करें।';
        throw new Error(message);
      }
      const requestNumber =
        typeof result === 'object' &&
        result !== null &&
        'success' in result &&
        result.success === true &&
        'request' in result &&
        typeof result.request === 'object' &&
        result.request !== null &&
        'requestNumber' in result.request &&
        typeof result.request.requestNumber === 'string'
          ? result.request.requestNumber
          : null;
      if (!requestNumber) {
        throw new Error('सर्वर से अनुरोध की पुष्टि नहीं मिली। कृपया दोबारा प्रयास करें।');
      }

      setIssueDesc('');
      setFormError(null);
      setActiveSection('MAIN');
      setCopiedNotice(
        `सर्वर प्रक्रिया ने अनुरोध ${requestNumber} प्राप्त किया है; स्थायी संग्रहण या सहायता भेजे जाने की पुष्टि नहीं। तत्काल खतरे में 112/108 पर कॉल करें।`
      );
      setTimeout(() => setCopiedNotice(null), 4000);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'सहायता अनुरोध भेजते समय त्रुटि हुई। कृपया दोबारा प्रयास करें।'
      );
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Navigate to Help Point
  const handleNavigateToPoint = (point: HelpPoint) => {
    const distText = deviceLocation
      ? LocationService.formatDistanceHindi(
          { latitude: deviceLocation.latitude, longitude: deviceLocation.longitude },
          { latitude: point.latitude, longitude: point.longitude }
        )
      : 'दूरी उपलब्ध';

    const locationItem: LocationItem = {
      id: point.id,
      name: point.name,
      nameEn: point.nameEn || point.name,
      category: 'help',
      distance: distText,
      walkingTime: 'पैदल मार्ग',
      description: point.description,
      landmark: point.address,
      latitude: point.latitude,
      longitude: point.longitude,
      status: point.verified ? 'सक्रिय' : undefined,
      isDemo: point.source === 'DEMO_DATA',
      x: 50,
      y: 50,
      isWheelchairAccessible: true,
    };

    setSelectedMapItem(locationItem);
    navigate('navigation-preview');
  };

  // Share Location Card
  const handleShareCurrentLocation = async () => {
    if (!deviceLocation) {
      const ok = await requestDeviceLocation();
      setFormError(
        ok
          ? 'GPS स्थान मिल गया है; साझा करने के लिए फिर से टैप करें।'
          : 'आपकी वास्तविक GPS location उपलब्ध नहीं है। कृपया GPS सक्षम करके दोबारा प्रयास करें।'
      );
      setTimeout(() => setFormError(null), 4000);
      return;
    }
    const lat = deviceLocation.latitude.toFixed(5);
    const lng = deviceLocation.longitude.toFixed(5);
    const acc = deviceLocation.accuracy ? `±${Math.round(deviceLocation.accuracy)}m` : 'उपलब्ध नहीं';
    const timeStr = new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
    const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;

    const textToShare = `🚨 DEO CHHATH SEVA - मेरा स्थान कार्ड\n` +
      `मेरा वर्तमान स्थान:\n` +
      `Latitude: ${lat}° N\n` +
      `Longitude: ${lng}° E\n` +
      `Accuracy: ${acc}\n` +
      `समय: ${timeStr}\n` +
      `नक्शा: ${mapsLink}\n` +
      `(NEXTGEN DEVBHOOMI FOUNDATION)`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DEO CHHATH SEVA - My Location',
          text: textToShare,
        });
        setCopiedNotice('स्थान सफलतापूर्वक साझा किया गया।');
        setTimeout(() => setCopiedNotice(null), 3000);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        await copyText(textToShare);
      }
    } else {
      await copyText(textToShare);
    }
  };

  const copyText = async (txt: string) => {
    try {
      await navigator.clipboard.writeText(txt);
      setCopiedNotice('स्थान की जानकारी कॉपी कर ली गई है।');
      setTimeout(() => setCopiedNotice(null), 3000);
    } catch {
      setCopiedNotice('स्थान की जानकारी साझा या कॉपी नहीं हो सकी। कृपया पुनः प्रयास करें।');
      setTimeout(() => setCopiedNotice(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 flex flex-col font-['Mukta',sans-serif]">
      <TopBar title="🆘 सहायता" showBack />
      <DataFreshnessNotice />

      <main className="flex-1 max-w-3xl sm:max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-5">
        {/* Notice Toast */}
        {copiedNotice && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{copiedNotice}</span>
          </div>
        )}

        {/* View Switcher: सहायता मेनू | अनुरोध भेजें | स्वयंसेवक दल | सहायता केंद्र */}
        <div className="grid grid-cols-4 gap-1 bg-stone-200/80 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveSection('MAIN')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeSection === 'MAIN' ? 'bg-white text-stone-900 shadow-xs font-black' : 'text-stone-600'
            }`}
          >
            🆘 मेनू
          </button>
          <button
            onClick={() => setActiveSection('REQUEST')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeSection === 'REQUEST' ? 'bg-white text-stone-900 shadow-xs font-black' : 'text-stone-600'
            }`}
          >
            📝 अनुरोध
          </button>
          <button
            onClick={() => setActiveSection('VOLUNTEERS')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeSection === 'VOLUNTEERS' ? 'bg-white text-stone-900 shadow-xs font-black' : 'text-stone-600'
            }`}
          >
            🙋 स्वयंसेवक
          </button>
          <button
            onClick={() => setActiveSection('POINTS')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeSection === 'POINTS' ? 'bg-white text-stone-900 shadow-xs font-black' : 'text-stone-600'
            }`}
          >
            📍 केंद्र
          </button>
        </div>

        {/* ======================================================== */}
        {/* SECTION 1: MAIN HELP OPTIONS (The 8 Specified Options)   */}
        {/* ======================================================== */}
        {activeSection === 'MAIN' && (
          <div className="space-y-3">
            {/* Top Red SOS Emergency Shortcut */}
            <button
              onClick={() => navigate('emergency')}
              className="w-full min-h-[72px] p-4 bg-gradient-to-r from-red-600 via-rose-700 to-red-800 text-white rounded-3xl shadow-lg flex items-center justify-between active:scale-98 transition-all group border-2 border-red-500"
            >
              <div className="flex items-center gap-3.5">
                <span className="text-3xl shrink-0 group-hover:scale-110 transition-transform">
                  🚨
                </span>
                <div className="text-left">
                  <span className="text-lg sm:text-xl font-black text-white block leading-tight">
                    आपातकालीन सहायता (SOS)
                  </span>
                  <span className="text-xs text-red-100 font-medium block mt-0.5">
                    तुरंत 108 मेडिकल, 112 पुलिस व अलार्म सायरन
                  </span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <span className="text-white font-black text-base">→</span>
              </div>
            </button>

            {/* 7 Other Specified Primary Options */}
            <div className="space-y-2.5">
              {/* 2. 👮 पुलिस सहायता */}
              <button
                onClick={() => {
                  setSelectedPointCategory('POLICE');
                  setActiveSection('POINTS');
                }}
                className="w-full min-h-[64px] p-3.5 bg-white border border-stone-200 hover:border-blue-400 rounded-2xl shadow-xs text-left flex items-center justify-between active:scale-98 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-2xl group-hover:scale-105 transition-transform">
                    👮
                  </div>
                  <div>
                    <span className="text-base font-black text-stone-900 block leading-tight">
                      पुलिस सहायता
                    </span>
                    <span className="text-xs text-stone-500">
                      थाना देव, मेला सुरक्षा बल एवं त्वरित सुरक्षा टीम
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                  देखें
                </span>
              </button>

              {/* 3. 🚑 मेडिकल सहायता */}
              <button
                onClick={() => navigate('medical')}
                className="w-full min-h-[64px] p-3.5 bg-white border border-stone-200 hover:border-rose-400 rounded-2xl shadow-xs text-left flex items-center justify-between active:scale-98 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 flex items-center justify-center shrink-0 text-2xl group-hover:scale-105 transition-transform">
                    🚑
                  </div>
                  <div>
                    <span className="text-base font-black text-stone-900 block leading-tight">
                      मेडिकल सहायता
                    </span>
                    <span className="text-xs text-stone-500">
                      प्राथमिक उपचार, ओआरएस, 108 एम्बुलेंस व अस्पताल
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                  खोलें
                </span>
              </button>

              {/* 4. 👩 महिला सहायता */}
              <button
                onClick={() => {
                  setSelectedPointCategory('WOMEN_HELP');
                  setActiveSection('POINTS');
                }}
                className="w-full min-h-[64px] p-3.5 bg-white border border-stone-200 hover:border-purple-400 rounded-2xl shadow-xs text-left flex items-center justify-between active:scale-98 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center shrink-0 text-2xl group-hover:scale-105 transition-transform">
                    👩
                  </div>
                  <div>
                    <span className="text-base font-black text-stone-900 block leading-tight">
                      महिला सहायता
                    </span>
                    <span className="text-xs text-stone-500">
                      महिला पुलिस डेस्क, सुरक्षा हेल्पलाइन एवं चेंजिंग रूम
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                  देखें
                </span>
              </button>

              {/* 5. 👴 वरिष्ठ नागरिक सहायता */}
              <button
                onClick={() => {
                  setSelectedPointCategory('SENIOR_HELP');
                  setActiveSection('POINTS');
                }}
                className="w-full min-h-[64px] p-3.5 bg-white border border-stone-200 hover:border-amber-400 rounded-2xl shadow-xs text-left flex items-center justify-between active:scale-98 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center shrink-0 text-2xl group-hover:scale-105 transition-transform">
                    👴
                  </div>
                  <div>
                    <span className="text-base font-black text-stone-900 block leading-tight">
                      वरिष्ठ नागरिक सहायता
                    </span>
                    <span className="text-xs text-stone-500">
                      व्हीलचेयर, ई-रिक्शा, आराम स्थल व विशेष सारथी सेवा
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                  देखें
                </span>
              </button>

              {/* 6. 👨‍👩‍👧 परिवार से जुड़ने में सहायता */}
              <button
                onClick={() => navigate('family')}
                className="w-full min-h-[64px] p-3.5 bg-white border border-stone-200 hover:border-teal-400 rounded-2xl shadow-xs text-left flex items-center justify-between active:scale-98 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0 text-2xl group-hover:scale-105 transition-transform">
                    👨‍👩‍👧
                  </div>
                  <div>
                    <span className="text-base font-black text-stone-900 block leading-tight">
                      परिवार से जुड़ने में सहायता
                    </span>
                    <span className="text-xs text-stone-500">
                      परिवार सुरक्षा समूह, मिलन बिंदु एवं खोया-पाया केंद्र
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
                  खोलें
                </span>
              </button>

              {/* 7. 🔎 Lost & Found (खोया-पाया सहायता) */}
              <button
                onClick={() => navigate('lost-found')}
                className="w-full min-h-[64px] p-3.5 bg-white border border-stone-200 hover:border-amber-400 rounded-2xl shadow-xs text-left flex items-center justify-between active:scale-98 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 flex items-center justify-center shrink-0 text-2xl group-hover:scale-105 transition-transform">
                    🔎
                  </div>
                  <div>
                    <span className="text-base font-black text-stone-900 block leading-tight">
                      Lost & Found (खोया-पाया सहायता)
                    </span>
                    <span className="text-xs text-stone-500">
                      लापता परिजन, बालक अथवा खोए/मिले सामान की रिपोर्ट
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg">
                  खोलें
                </span>
              </button>

              {/* 7b. 📢 महत्वपूर्ण सूचना व आधिकारिक बुलेटिन (Step 16) */}
              <button
                onClick={() => navigate('announcements')}
                className="w-full min-h-[64px] p-3.5 bg-white border border-stone-200 hover:border-amber-400 rounded-2xl shadow-xs text-left flex items-center justify-between active:scale-98 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 text-2xl group-hover:scale-105 transition-transform">
                    📢
                  </div>
                  <div>
                    <span className="text-base font-black text-stone-900 block leading-tight">
                      महत्वपूर्ण सूचना व बुलेटिन
                    </span>
                    <span className="text-xs text-stone-500">
                      मेला नियंत्रण कक्ष, मार्ग प्रतिबंध व सुरक्षा निर्देश
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg">
                  देखें
                </span>
              </button>

              {/* 8. 📍 अपना स्थान साझा करें */}
              <button
                onClick={() => setShowLocationModal(true)}
                className="w-full min-h-[64px] p-3.5 bg-white border border-stone-200 hover:border-emerald-400 rounded-2xl shadow-xs text-left flex items-center justify-between active:scale-98 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-2xl group-hover:scale-105 transition-transform">
                    📍
                  </div>
                  <div>
                    <span className="text-base font-black text-stone-900 block leading-tight">
                      अपना स्थान साझा करें
                    </span>
                    <span className="text-xs text-stone-500">
                      परिवार या पुलिस को अपना सटीक GPS स्थान भेजें
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  शेयर करें
                </span>
              </button>

              {/* 8. 🙋 स्वयंसेवक */}
              <div className="bg-white border border-stone-200 rounded-3xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 text-orange-700 flex items-center justify-center shrink-0 text-2xl">
                      🙋
                    </div>
                    <div>
                      <h4 className="text-base font-black text-stone-900 leading-tight">
                        स्वयंसेवक (NextGen सेवा दल)
                      </h4>
                      <p className="text-xs text-stone-500">
                        सत्यापित स्वयंसेवक दल एवं वालंटियर मोड
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSection('VOLUNTEERS')}
                    className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg"
                  >
                    दल देखें
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100">
                  <button
                    onClick={() => navigate('volunteer-register')}
                    className="min-h-[44px] p-2 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs rounded-xl border border-amber-200 text-center flex items-center justify-center transition-colors active:scale-95"
                  >
                    <span>स्वयंसेवक के रूप में जुड़ें</span>
                  </button>
                  <button
                    onClick={() => navigate('volunteer')}
                    className="min-h-[44px] p-2 bg-[#075985] hover:bg-[#073B5A] text-white font-bold text-xs rounded-xl text-center flex items-center justify-center transition-colors active:scale-95"
                  >
                    <span>Volunteer Mode</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 2: “सहायता अनुरोध भेजें” FORM                     */}
        {/* ======================================================== */}
        {activeSection === 'REQUEST' && (
          <form
            onSubmit={handleSendHelpRequest}
            className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-4 animate-fade-in"
          >
            <div className="border-b border-stone-100 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-700 block">
                NEXTGEN DEVBHOOMI FOUNDATION सेवा
              </span>
              <h3 className="text-lg font-black text-stone-900">
                सहायता अनुरोध भेजें
              </h3>
            </div>

            {/* Offline Alert if user is offline */}
            {!isOnline && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-950">
                <WifiOff className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <p>
                  <strong>Internet connection उपलब्ध नहीं है।</strong> Internet connection वापस आने पर सहायता अनुरोध भेजें।
                </p>
              </div>
            )}

            {formError && (
              <div className="bg-rose-50 border border-rose-300 text-rose-900 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* समस्या का प्रकार */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-stone-700 block">समस्या का प्रकार:</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
              >
                <option value="चिकित्सा / स्वास्थ्य">🚑 चिकित्सा / स्वास्थ्य सहायता</option>
                <option value="भीड़ में बिछड़ना / खोया-पाया">👨‍👩‍👧 भीड़ में बिछड़ना / खोया-पाया</option>
                <option value="वरिष्ठ नागरिक / व्हीलचेयर">👴 वरिष्ठ नागरिक / व्हीलचेयर आवश्यकता</option>
                <option value="महिला सुरक्षा / सहायता">👩 महिला सुरक्षा / सहायता</option>
                <option value="रास्ता भटकना">🧭 रास्ता भटकना / गाइडेंस</option>
                <option value="अन्य आपातकाल">🆘 अन्य आपातकाल</option>
              </select>
            </div>

            {/* विवरण */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-stone-700 block">विवरण (समस्या लिखें):</label>
              <textarea
                value={issueDesc}
                onChange={(e) => setIssueDesc(e.target.value)}
                placeholder="आप कहाँ हैं और क्या परेशानी हो रही है? (उदा. सूर्य कुंड घाट 2 के पास चक्कर आ रहा है)"
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                required
              />
            </div>

            {/* मेरा स्थान */}
            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs space-y-1">
              <span className="font-bold text-stone-700 block">मेरा स्थान (GPS Coordinates):</span>
              <p className="font-mono text-stone-900 font-bold">
                {deviceLocation
                  ? `${deviceLocation.latitude.toFixed(5)}° N, ${deviceLocation.longitude.toFixed(5)}° E (±${Math.round(deviceLocation.accuracy)}m)`
                  : 'GPS उपलब्ध नहीं; अनुरोध में स्थान शामिल नहीं होगा'}
              </p>
            </div>

            {/* Optional Name & Phone */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-600 block">नाम (वैकल्पिक):</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="आपका नाम"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-stone-600 block">फोन (वैकल्पिक):</label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="मोबाइल नंबर"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Privacy Requirement Consent */}
            <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200 text-xs space-y-2">
              <label className="flex items-start gap-2 cursor-pointer font-bold text-amber-950">
                <input
                  type="checkbox"
                  checked={locationAgreed}
                  onChange={(e) => setLocationAgreed(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                />
                <span>“GPS उपलब्ध होने पर ही location अनुरोध के साथ साझा होगी।”</span>
              </label>
              <p className="text-[11px] text-stone-600 leading-tight pl-5">
                अनुरोध सर्वर पर दर्ज होगा; यह पुष्टि नहीं है कि कोई स्वयंसेवक या अधिकारी सहायता भेज चुका है।
              </p>
            </div>

            {/* Buttons: [सहायता अनुरोध भेजें] & [रद्द करें] */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveSection('MAIN')}
                className="min-h-[46px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                disabled={!isOnline || isSubmittingRequest}
                className={`min-h-[46px] rounded-xl font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  isOnline && !isSubmittingRequest
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>{isSubmittingRequest ? 'भेजा जा रहा है…' : 'सहायता अनुरोध भेजें'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* SECTION 3: “पास के verified volunteers”                   */}
        {/* ======================================================== */}
        {activeSection === 'VOLUNTEERS' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-base font-black text-stone-900">
                  सत्यापित स्वयंसेवक
                </h3>
                <p className="text-xs text-stone-500">
                  इस ऐप में कोई लाइव सत्यापित स्वयंसेवक सूची उपलब्ध नहीं है।
                </p>
              </div>
            </div>

            {verifiedVolunteers.length === 0 ? (
              <div className="bg-white border border-amber-200 rounded-2xl p-4 text-xs text-stone-700">
                कोई सत्यापित स्वयंसेवक उपलब्ध नहीं दिखाया जा रहा है। तत्काल सहायता के लिए 112 या 108 पर कॉल करें।
              </div>
            ) : <div className="space-y-2.5">
              {verifiedVolunteers.map((vol) => (
                <div
                  key={vol.id}
                  className="bg-white rounded-3xl p-4 border border-stone-200 shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 font-bold text-sm flex items-center justify-center shrink-0">
                          🙋
                        </span>
                        <div>
                          <h4 className="text-sm font-black text-stone-900 leading-snug">
                            {vol.name}
                          </h4>
                          <span className="text-[10px] font-mono text-stone-500 block">
                            ID: {vol.volunteerId}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      ✓ Verified
                    </span>
                  </div>

                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-stone-700">
                      <span className="font-bold">सेवा क्षेत्र:</span>
                      <span className="font-bold text-stone-900">{vol.serviceArea}</span>
                    </div>
                    {vol.distanceDisplay && (
                      <div className="flex items-center justify-between text-stone-700">
                        <span className="font-bold">दूरी (GPS):</span>
                        <span className="font-black text-amber-800">{vol.distanceDisplay}</span>
                      </div>
                    )}
                    {vol.badge && (
                      <div className="flex items-center justify-between text-stone-700">
                        <span className="font-bold">विशेषता:</span>
                        <span className="text-emerald-700 font-bold">{vol.badge}</span>
                      </div>
                    )}
                  </div>

                  {/* “संपर्क करें” only if verified contact exists per rule */}
                  {vol.phone ? (
                    <button
                      onClick={() => setCallModalContact({ title: vol.name, number: vol.phone! })}
                      className="w-full min-h-[42px] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <PhoneCall className="w-3.5 h-3.5 fill-white" />
                      <span>संपर्क करें ({vol.phone})</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIssueType('वरिष्ठ नागरिक / व्हीलचेयर');
                        setIssueDesc(`स्वयंसेवक ${vol.name} (${vol.serviceArea}) से सहायता अनुरोध`);
                        setActiveSection('REQUEST');
                      }}
                      className="w-full min-h-[42px] bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>यहाँ सहायता का अनुरोध भेजें</span>
                    </button>
                  )}
                </div>
              ))}
            </div>}
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 4: HELP POINTS LIST                              */}
        {/* ======================================================== */}
        {activeSection === 'POINTS' && (
          <div className="space-y-3 animate-fade-in">
            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <button
                onClick={() => setSelectedPointCategory('ALL')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap ${
                  selectedPointCategory === 'ALL'
                    ? 'bg-[#075985] text-white shadow-xs'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                सभी
              </button>
              <button
                onClick={() => setSelectedPointCategory('POLICE')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap ${
                  selectedPointCategory === 'POLICE'
                    ? 'bg-[#075985] text-white shadow-xs'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                पुलिस चौकियाँ
              </button>
              <button
                onClick={() => setSelectedPointCategory('WOMEN_HELP')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap ${
                  selectedPointCategory === 'WOMEN_HELP'
                    ? 'bg-[#075985] text-white shadow-xs'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                महिला सुरक्षा
              </button>
              <button
                onClick={() => setSelectedPointCategory('SENIOR_HELP')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap ${
                  selectedPointCategory === 'SENIOR_HELP'
                    ? 'bg-[#075985] text-white shadow-xs'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                वरिष्ठ नागरिक
              </button>
            </div>

            <div className="space-y-2.5">
              {helpPoints
                .filter((p) =>
                  selectedPointCategory === 'ALL' ? true : p.category === selectedPointCategory
                )
                .map((hp) => (
                  <div
                    key={hp.id}
                    className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold text-sm flex items-center justify-center shrink-0">
                            🆘
                          </span>
                          <h4 className="text-base font-black text-stone-900 leading-snug truncate">
                            {hp.name}
                          </h4>
                        </div>
                        <p className="text-xs text-stone-500 font-semibold flex items-center gap-1 pt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{hp.address}</span>
                        </p>
                      </div>

                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                        स्थिर सूची • अपुष्ट
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {hp.description}
                    </p>

                    <div className="bg-stone-50 rounded-2xl p-2.5 border border-stone-200 flex items-center justify-between text-xs text-stone-700">
                      <div>
                        <span className="text-[10px] text-stone-400 block font-bold uppercase">GPS दूरी</span>
                        <span className="font-black text-stone-900">{hp.distanceDisplay}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 block font-bold uppercase">स्थिति</span>
                        <span className="font-bold text-amber-800">वर्तमान स्थिति अज्ञात</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100">
                      <button
                        onClick={() => handleNavigateToPoint(hp)}
                        className="min-h-[44px] bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Navigation className="w-4 h-4 fill-white" />
                        <span>📍 रास्ता दिखाएँ</span>
                      </button>

                      {hp.verified && hp.phone ? (
                        <button
                          onClick={() => setCallModalContact({ title: hp.name, number: hp.phone! })}
                          className="min-h-[44px] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <PhoneCall className="w-4 h-4 fill-white" />
                          <span>📞 कॉल करें</span>
                        </button>
                      ) : (
                        <div className="min-h-[44px] bg-stone-100 text-stone-500 font-bold text-[11px] rounded-xl flex items-center justify-center px-1 text-center border border-stone-200">
                          <span>फोन नंबर सत्यापित नहीं है। आपातकाल में 112/108 कॉल करें।</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>

      {/* Location Sharing Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h4 className="text-base font-black text-stone-900 flex items-center gap-1.5">
                <span>📍</span>
                <span>मेरा स्थान साझा करें</span>
              </h4>
              <button
                onClick={() => setShowLocationModal(false)}
                className="p-1 text-stone-400 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs text-amber-950 font-bold space-y-1">
              <p>“आपकी location केवल आपकी अनुमति के बाद साझा की जाएगी।”</p>
            </div>

            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 font-mono text-xs text-stone-700 space-y-1">
              <p className="font-bold font-sans text-stone-900 text-sm">DEO CHHATH SEVA</p>
              <p>Lat: {deviceLocation ? `${deviceLocation.latitude.toFixed(5)}° N` : 'GPS उपलब्ध नहीं'}</p>
              <p>Long: {deviceLocation ? `${deviceLocation.longitude.toFixed(5)}° E` : 'GPS उपलब्ध नहीं'}</p>
              <p>Accuracy: {deviceLocation?.accuracy ? `±${Math.round(deviceLocation.accuracy)}m` : 'उपलब्ध नहीं'}</p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setShowLocationModal(false);
                  handleShareCurrentLocation();
                }}
                className="w-full min-h-[48px] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>अनुमति दें और साझा करें (Share)</span>
              </button>
              <button
                onClick={() => setShowLocationModal(false)}
                className="w-full min-h-[44px] bg-stone-100 text-stone-700 font-bold text-xs rounded-xl"
              >
                रद्द करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Call Confirmation Modal */}
      {callModalContact && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in text-center">
            <div className="w-12 h-12 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto">
              <PhoneCall className="w-6 h-6 fill-red-700" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-black text-stone-900">
                क्या आप इस verified number पर call करना चाहते हैं?
              </h4>
              <p className="text-xs font-bold text-amber-800">{callModalContact.title}</p>
              <p className="text-xl font-black text-stone-900 font-mono pt-1">
                {callModalContact.number}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setCallModalContact(null)}
                className="min-h-[46px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl"
              >
                रद्द करें
              </button>
              <a
                href={`tel:${callModalContact.number}`}
                onClick={() => setCallModalContact(null)}
                className="min-h-[46px] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-4 h-4 fill-white" />
                <span>📞 कॉल करें</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
