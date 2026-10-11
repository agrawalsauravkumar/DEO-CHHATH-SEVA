import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { VolunteerService } from '../services/VolunteerService';
import { LocationService } from '../services/LocationService';
import { Volunteer, HelpRequest, LocationItem } from '../types';
import { DeoMap } from '../components/DeoMap';
import {
  ShieldCheck,
  MapPin,
  Compass,
  Navigation,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PhoneCall,
  X,
  Share2,
  UserCheck,
  AlertOctagon,
  WifiOff,
  Send,
  Flag,
} from 'lucide-react';

export const VolunteerModeScreen: React.FC = () => {
  const {
    deviceLocation,
    setSelectedMapItem,
    isOnline,
    navigate,
  } = useApp();

  const [volunteer, setVolunteer] = useState<Volunteer | undefined>(() =>
    VolunteerService.getVolunteerProfile()
  );

  const [activeTab, setActiveTab] = useState<'NEW' | 'ACTIVE' | 'COMPLETED' | 'MAP'>('NEW');
  const [escalateModalReq, setEscalateModalReq] = useState<HelpRequest | null>(null);
  const [escalateReason, setEscalateReason] = useState<string>('लोकेशन पर पहुंचना संभव नहीं है');
  const [callModalNumber, setCallModalNumber] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Refresh volunteer profile
  useEffect(() => {
    const vol = VolunteerService.getVolunteerProfile();
    setVolunteer(vol);
  }, []);

  const volunteerId = volunteer?.id || 'vol-rahul-01';
  const isAvailable = volunteer?.availability === 'AVAILABLE';

  // Open Requests (Unassigned)
  const openRequests = useMemo(() => {
    return VolunteerService.getOpenHelpRequests();
  }, [volunteerId, toastNotice]);

  // Assigned / In-Progress Requests
  const assignedRequests = useMemo(() => {
    const list = VolunteerService.getAssignedRequests(volunteerId);
    return list.filter((r) => r.status === 'स्वयंसेवक assigned' || r.status === 'सहायता जारी');
  }, [volunteerId, toastNotice]);

  // Completed Requests
  const completedRequests = useMemo(() => {
    const list = VolunteerService.getAssignedRequests(volunteerId);
    return list.filter((r) => r.status === 'समाधान किया गया');
  }, [volunteerId, toastNotice]);

  // Toggle Availability
  const handleToggleAvailability = () => {
    if (!volunteer) return;
    const nextStatus = isAvailable ? 'UNAVAILABLE' : 'AVAILABLE';
    VolunteerService.setAvailability(volunteer.id, nextStatus);
    setVolunteer(VolunteerService.getVolunteerProfile(volunteer.id));
    setToastNotice(
      nextStatus === 'AVAILABLE'
        ? '🟢 आप अब सहायता के लिए उपलब्ध हैं।'
        : '🔴 आपकी स्थिति अनुपलब्ध (Unavailable) कर दी गई है।'
    );
    setTimeout(() => setToastNotice(null), 3500);
  };

  // Toggle Location Sharing
  const handleToggleLocationSharing = () => {
    if (!volunteer) return;
    const nextVal = !volunteer.locationSharingEnabled;
    VolunteerService.updateLocationPermission(volunteer.id, nextVal);
    setVolunteer(VolunteerService.getVolunteerProfile(volunteer.id));
  };

  // Accept Request
  const handleAccept = (reqId: string) => {
    const ok = VolunteerService.acceptRequest(volunteerId, reqId);
    if (ok) {
      setToastNotice('🔵 सहायता अनुरोध स्वीकार कर लिया गया है।');
      setActiveTab('ACTIVE');
      setTimeout(() => setToastNotice(null), 3500);
    }
  };

  // Reject Request
  const handleReject = (reqId: string) => {
    VolunteerService.rejectRequest(volunteerId, reqId, 'स्वयंसेवक अन्य कार्य में व्यस्त');
    setToastNotice('अनुरोध अस्वीकार किया गया।');
    setTimeout(() => setToastNotice(null), 3500);
  };

  // Start Assistance
  const handleStartAssistance = (reqId: string) => {
    VolunteerService.startRequest(volunteerId, reqId);
    setToastNotice('🟠 सहायता शुरू कर दी गई है (IN_PROGRESS)।');
    setTimeout(() => setToastNotice(null), 3500);
  };

  // Complete Assistance
  const handleCompleteAssistance = (reqId: string) => {
    VolunteerService.completeRequest(volunteerId, reqId);
    setToastNotice('🟢 सहायता सफलतापूर्वक पूरी हुई (RESOLVED)।');
    setTimeout(() => setToastNotice(null), 3500);
  };

  // Navigate to Help Request Location using existing RouteService
  const handleNavigateToRequester = (req: HelpRequest) => {
    const distText = deviceLocation
      ? LocationService.formatDistanceHindi(
          { latitude: deviceLocation.latitude, longitude: deviceLocation.longitude },
          { latitude: req.latitude, longitude: req.longitude }
        )
      : 'दूरी उपलब्ध';

    const locationItem: LocationItem = {
      id: req.id,
      name: `सहायता स्थल: ${req.type}`,
      nameEn: `Help Request: ${req.type}`,
      category: 'help',
      distance: distText,
      walkingTime: 'पैदल मार्ग',
      description: req.description,
      landmark: 'श्रद्धालु द्वारा प्रेषित सहायता स्थान',
      latitude: req.latitude,
      longitude: req.longitude,
      status: 'सक्रिय',
      isDemo: false,
      x: 50,
      y: 50,
      isWheelchairAccessible: true,
    };

    setSelectedMapItem(locationItem);
    navigate('navigation-preview');
  };

  // Escalate to Admin
  const handleConfirmEscalation = () => {
    if (!escalateModalReq) return;
    VolunteerService.escalateRequest(volunteerId, escalateModalReq.id, escalateReason);
    setEscalateModalReq(null);
    setToastNotice('🚨 अनुरोध एडमिन को एस्केलेट (Escalate) कर दिया गया है।');
    setTimeout(() => setToastNotice(null), 4000);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 flex flex-col font-['Mukta',sans-serif]">
      <TopBar title="⚡ Volunteer Mode Dashboard" showBack />

      <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-4">
        {/* Offline Guard Banner */}
        {!isOnline && (
          <div className="bg-amber-50 border border-amber-300 text-amber-950 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-800 shrink-0" />
            <span>Offline Mode • Live sync इंटरनेट कनेक्शन के बिना संभव नहीं है।</span>
          </div>
        )}

        {/* Notice Toast */}
        {toastNotice && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastNotice}</span>
          </div>
        )}

        {/* Availability Control Card per Requirement 6 */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">
                ड्यूटी स्थिति (Availability)
              </span>
              <h3 className="text-base font-black text-stone-900">
                {isAvailable ? '🟢 मैं सहायता के लिए उपलब्ध हूँ' : '🔴 अभी उपलब्ध नहीं हूँ'}
              </h3>
            </div>

            <button
              onClick={handleToggleAvailability}
              className={`min-h-[42px] px-4 rounded-xl font-black text-xs transition-all active:scale-95 shadow-xs ${
                isAvailable
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              }`}
            >
              {isAvailable ? 'ON (उपलब्ध)' : 'OFF (अनुपलब्ध)'}
            </button>
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <div className="flex items-center gap-1.5 font-bold">
              <MapPin className="w-3.5 h-3.5 text-amber-700" />
              <span>सेवा क्षेत्र: {volunteer?.serviceArea || 'सूर्य मंदिर पूर्वी द्वार'}</span>
            </div>
            <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              ✅ VERIFIED
            </span>
          </div>

          {/* Location Permission Toggle per Requirement 7 */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-stone-800 block">स्थान साझाकरण (Location Sharing)</span>
              <span className="text-[11px] text-stone-500 block leading-tight">
                “आपकी location केवल सहायता समन्वय के लिए साझा की जाएगी।”
              </span>
            </div>

            <button
              onClick={handleToggleLocationSharing}
              className={`min-h-[34px] px-3 rounded-lg text-xs font-bold transition-colors ${
                volunteer?.locationSharingEnabled
                  ? 'bg-[#0B5E8E] text-white'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              {volunteer?.locationSharingEnabled ? 'सक्रिय' : 'बंद'}
            </button>
          </div>
        </div>

        {/* Queue Navigation Tabs: 4 Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-stone-200/80 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('NEW')}
            className={`py-2 px-1 rounded-xl transition-all relative ${
              activeTab === 'NEW' ? 'bg-white text-stone-900 shadow-xs font-black' : 'text-stone-600'
            }`}
          >
            <span>🔔 नए ({openRequests.length})</span>
            {openRequests.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeTab === 'ACTIVE' ? 'bg-white text-stone-900 shadow-xs font-black' : 'text-stone-600'
            }`}
          >
            <span>⚡ सक्रिय ({assignedRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeTab === 'COMPLETED' ? 'bg-white text-stone-900 shadow-xs font-black' : 'text-stone-600'
            }`}
          >
            <span>✅ पूर्ण ({completedRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('MAP')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeTab === 'MAP' ? 'bg-white text-stone-900 shadow-xs font-black' : 'text-stone-600'
            }`}
          >
            <span>🗺️ नक्शा</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: NEW HELP REQUESTS (Pending Acceptance)            */}
        {/* ======================================================== */}
        {activeTab === 'NEW' && (
          <div className="space-y-3">
            {openRequests.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center space-y-2">
                <span className="text-3xl">🕊️</span>
                <h4 className="text-base font-black text-stone-800">
                  वर्तमान में कोई नया सहायता अनुरोध नहीं है
                </h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  जैसे ही कोई श्रद्धालु सहायता का अनुरोध करेंगे, वह यहाँ तुरंत दिखाई देगा।
                </p>
              </div>
            ) : (
              openRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-300 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-block">
                        🟡 नया अनुरोध • {req.id}
                      </span>
                      <h4 className="text-base font-black text-stone-900 mt-1">
                        {req.type}
                      </h4>
                    </div>
                    <span className="text-xs text-stone-400 font-mono">
                      {req.createdAt}
                    </span>
                  </div>

                  <p className="text-xs text-stone-700 bg-stone-50 p-3 rounded-2xl border border-stone-200 leading-relaxed">
                    {req.description}
                  </p>

                  <div className="text-xs text-stone-500 flex items-center justify-between">
                    <span>स्थान: <strong>श्रद्धालु GPS टैग उपलब्ध</strong></span>
                    {req.userName && <span>नाम: {req.userName}</span>}
                  </div>

                  {/* Accept / Reject Buttons per Requirement 10 */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100">
                    <button
                      onClick={() => handleReject(req.id)}
                      className="min-h-[44px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl"
                    >
                      अस्वीकार करें
                    </button>
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="min-h-[44px] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>स्वीकार करें (Accept)</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ACTIVE REQUESTS (Assigned / In Progress)          */}
        {/* ======================================================== */}
        {activeTab === 'ACTIVE' && (
          <div className="space-y-3">
            {assignedRequests.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center space-y-2">
                <span className="text-3xl">☕</span>
                <h4 className="text-base font-black text-stone-800">
                  कोई सक्रिय कार्य नहीं है
                </h4>
                <p className="text-xs text-stone-500">
                  'नए अनुरोध' टैब से किसी अनुरोध को स्वीकार करें।
                </p>
              </div>
            ) : (
              assignedRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-emerald-400 shadow-md space-y-3.5"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2">
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900">
                        {req.status === 'स्वयंसेवक assigned' ? '🔵 Volunteer Assigned' : '🟠 Help In Progress'}
                      </span>
                      <h4 className="text-base font-black text-stone-900 mt-1">
                        {req.type}
                      </h4>
                    </div>
                    <span className="text-xs text-stone-400 font-mono">
                      {req.createdAt}
                    </span>
                  </div>

                  <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs space-y-1">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">समस्या विवरण:</span>
                    <p className="font-semibold text-stone-800">{req.description}</p>
                  </div>

                  {/* Navigation Action to Request Location per Requirement 11 */}
                  <button
                    onClick={() => handleNavigateToRequester(req)}
                    className="w-full min-h-[46px] bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <Navigation className="w-4 h-4 fill-white" />
                    <span>📍 सहायता स्थान (रास्ता दिखाएँ / Navigate)</span>
                  </button>

                  {/* Contact Requester (Only if user provided phone per Requirement 13) */}
                  {req.userPhone && (
                    <button
                      onClick={() => setCallModalNumber(req.userPhone!)}
                      className="w-full min-h-[42px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 border border-stone-200"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>📞 श्रद्धालु से संपर्क करें ({req.userPhone})</span>
                    </button>
                  )}

                  {/* Progress Lifecycle Buttons: Start & Complete */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100">
                    {req.status === 'स्वयंसेवक assigned' ? (
                      <button
                        onClick={() => handleStartAssistance(req.id)}
                        className="w-full min-h-[46px] bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs"
                      >
                        सहायता शुरू करें
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCompleteAssistance(req.id)}
                        className="w-full min-h-[46px] bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs"
                      >
                        ✅ सहायता पूरी हुई
                      </button>
                    )}

                    {/* Escalate / Report Button per Requirement 16 & 17 */}
                    <button
                      onClick={() => setEscalateModalReq(req)}
                      className="w-full min-h-[46px] bg-rose-50 hover:bg-rose-100 text-rose-800 font-black text-xs rounded-xl border border-rose-200"
                    >
                      🚨 Admin को भेजें
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: COMPLETED REQUESTS                                */}
        {/* ======================================================== */}
        {activeTab === 'COMPLETED' && (
          <div className="space-y-3">
            {completedRequests.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center space-y-2">
                <span className="text-3xl">📜</span>
                <h4 className="text-base font-black text-stone-800">
                  अभी तक कोई पूर्ण अनुरोध नहीं है
                </h4>
              </div>
            ) : (
              completedRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl p-4 border border-stone-200 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      🟢 RESOLVED • समाधान किया गया
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">{req.updatedAt}</span>
                  </div>
                  <h4 className="text-sm font-black text-stone-900">{req.type}</h4>
                  <p className="text-xs text-stone-600">{req.description}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: VOLUNTEER MAP (Requirement 8)                    */}
        {/* ======================================================== */}
        {activeTab === 'MAP' && (
          <div className="space-y-3 animate-fade-in">
            <div className="bg-white rounded-3xl p-4 border border-stone-200 shadow-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">🗺️</span>
                <h4 className="text-base font-black text-stone-900">
                  स्वयंसेवक सेवा क्षेत्र एवं सहायता नक्शा
                </h4>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                “गोपनीयता नियम: व्यक्तिगत स्वयंसेवकों का निजी सटीक स्थान सार्वजनिक रूप से नहीं दिखाया जाता। केवल अधिकृत सेवा पड़ाव और सहायता स्थल प्रदर्शित हैं।”
              </p>
            </div>

            <div className="h-[380px] rounded-3xl overflow-hidden shadow-md border border-stone-300">
              <DeoMap heightClass="h-full" showRouteLine={false} />
            </div>

            <p className="text-[11px] text-stone-500 text-center">
              मानचित्र पर किसी भी 🆘 सहायता या ☀️ सेवा केंद्र पर टैप करके तुरंत रास्ता देखें।
            </p>
          </div>
        )}
      </main>

      {/* Escalate / Report Modal per Requirement 16 & 17 */}
      {escalateModalReq && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h4 className="text-base font-black text-rose-700 flex items-center gap-1.5">
                <AlertOctagon className="w-5 h-5 text-rose-600" />
                <span>🚨 सुरक्षित सहायता / रिपोर्ट</span>
              </h4>
              <button
                onClick={() => setEscalateModalReq(null)}
                className="p-1 text-stone-400 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              यदि आप इस अनुरोध को पूरा करने में असमर्थ हैं अथवा कोई अप्रत्याशित समस्या है, तो कृपया कारण चुनें:
            </p>

            <div className="space-y-1.5 text-xs font-bold text-stone-800">
              {[
                'लोकेशन पर पहुंचना संभव नहीं है',
                'गलत या फर्जी request प्रतीत होती है',
                'असुरक्षित स्थिति (Unsafe Situation)',
                'आपातकालीन मेडिकल टीम (108) की तत्काल आवश्यकता',
                'डुप्लिकेट अनुरोध',
              ].map((reason, i) => (
                <label
                  key={i}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${
                    escalateReason === reason
                      ? 'bg-rose-50 border-rose-400 text-rose-950'
                      : 'bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="escalateReason"
                    value={reason}
                    checked={escalateReason === reason}
                    onChange={() => setEscalateReason(reason)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setEscalateModalReq(null)}
                className="min-h-[46px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl"
              >
                रद्द करें
              </button>
              <button
                onClick={handleConfirmEscalation}
                className="min-h-[46px] bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md"
              >
                Admin को भेजें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verified Call Confirmation Modal per Requirement 13 & 15 */}
      {callModalNumber && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <PhoneCall className="w-6 h-6 fill-emerald-700" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-black text-stone-900">
                क्या आप श्रद्धालु को call करना चाहते हैं?
              </h4>
              <p className="text-xl font-black text-stone-900 font-mono pt-1">
                {callModalNumber}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setCallModalNumber(null)}
                className="min-h-[46px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl"
              >
                रद्द करें
              </button>
              <a
                href={`tel:${callModalNumber}`}
                onClick={() => setCallModalNumber(null)}
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
