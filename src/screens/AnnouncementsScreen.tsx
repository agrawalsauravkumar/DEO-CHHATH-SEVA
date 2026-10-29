/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { VerifiedAnnouncementService } from '../services/VerifiedAnnouncementService';
import { VoiceService } from '../services/VoiceService';
import {
  OfficialAnnouncement,
  RouteAlert,
  AnnouncementCategory,
  AnnouncementPriority,
  LocationItem,
} from '../types';
import {
  Bell,
  AlertTriangle,
  ShieldCheck,
  Clock,
  MapPin,
  Volume2,
  VolumeX,
  Compass,
  ArrowRight,
  Filter,
  CheckCircle2,
  Share2,
  Info,
  Car,
  Bus,
  HeartPulse,
  LifeBuoy,
  WifiOff,
  Radio,
} from 'lucide-react';
import { CachedAnnouncement } from '../services/OfflineDataService';

interface CategoryFilterOption {
  key: AnnouncementCategory | 'ALL';
  label: string;
  icon: string;
}

const CATEGORY_FILTERS: CategoryFilterOption[] = [
  { key: 'ALL', label: 'सभी सूचनाएं', icon: '📋' },
  { key: 'EMERGENCY', label: 'आपातकालीन', icon: '🚨' },
  { key: 'ROUTE', label: 'मार्ग व डायवर्जन', icon: '🛣️' },
  { key: 'PARKING', label: 'पार्किंग स्थिति', icon: '🅿️' },
  { key: 'SHUTTLE', label: 'शटल सेवा', icon: '🛺' },
  { key: 'MEDICAL', label: 'चिकित्सा', icon: '🚑' },
  { key: 'HELP', label: 'सहायता केंद्र', icon: '🆘' },
  { key: 'CHHATH_INFO', label: 'छठ अर्घ्य समय', icon: '🙏' },
  { key: 'SAFETY', label: 'सुरक्षा अलर्ट', icon: '⚠️' },
  { key: 'GENERAL', label: 'सामान्य', icon: '📢' },
];

export const AnnouncementsScreen: React.FC = () => {
  const { navigate, setSelectedMapItem, isOnline, seniorMode } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<AnnouncementCategory | 'ALL'>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<AnnouncementPriority | 'ALL'>('ALL');
  const [activeAnnouncementModal, setActiveAnnouncementModal] = useState<OfficialAnnouncement | null>(null);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [announcementData, setAnnouncementData] = useState<CachedAnnouncement[]>([]);
  const [announcementSource, setAnnouncementSource] = useState<'LOADING' | 'NETWORK' | 'CACHE' | 'NONE' | 'ERROR'>('LOADING');
  const [lastUpdated, setLastUpdated] = useState<string>('उपलब्ध नहीं');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setAnnouncementSource('LOADING');
    VerifiedAnnouncementService.getAnnouncements(controller.signal)
      .then((result) => {
        setAnnouncementData(result.announcements);
        setAnnouncementSource(result.announcements.length ? result.source : 'NONE');
        setLoadError(null);
        setLastUpdated(
          result.syncedAt
            ? new Intl.DateTimeFormat('hi-IN', {
                timeZone: 'Asia/Kolkata',
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(result.syncedAt)
            : 'उपलब्ध नहीं'
        );
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error('Verified announcements could not be loaded:', error);
        setLoadError(error instanceof Error ? error.message : 'सर्वर त्रुटि');
        setAnnouncementSource('ERROR');
      });
    return () => controller.abort();
  }, [isOnline, refreshTrigger]);

  const announcements = useMemo(() => {
    let list = announcementData;

    if (selectedCategory !== 'ALL') {
      list = list.filter((a) => a.category === selectedCategory);
    }

    if (selectedPriority !== 'ALL') {
      list = list.filter((a) => a.priority === selectedPriority);
    }

    return list;
  }, [announcementData, selectedCategory, selectedPriority]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSpeak = (item: OfficialAnnouncement) => {
    if (isSpeakingId === item.id) {
      VoiceService.stopSpeaking();
      setIsSpeakingId(null);
    } else {
      setIsSpeakingId(item.id);
      const speechText = `आधिकारिक सूचना: ${item.title}। ${item.shortDescription}`;
      VoiceService.speak(speechText, true);
      setTimeout(() => {
        setIsSpeakingId(null);
      }, 7000);
    }
  };

  const handleViewOnMap = (alert: RouteAlert) => {
    const locItem: LocationItem = {
      id: 'route_alert_' + alert.id,
      name: `${alert.title} (मार्ग अलर्ट)`,
      nameEn: alert.roadName,
      category: 'other',
      latitude: alert.latitude,
      longitude: alert.longitude,
      distance: 'अलर्ट क्षेत्र',
      walkingTime: 'चेकपोस्ट',
      description: `${alert.reason} • ${alert.alternativeRouteAdvice || 'मार्ग बाधित'}`,
      landmark: alert.affectedArea,
      x: 50,
      y: 50,
      status: 'भीड़',
    };
    setSelectedMapItem(locItem);
    navigate('map');
  };

  const handleAlternativeRoute = (alert: RouteAlert) => {
    showToast(
      alert.alternativeRouteAdvice
        ? `वैकल्पिक मार्ग सलाह: ${alert.alternativeRouteAdvice}`
        : 'इस मार्ग अलर्ट के साथ सत्यापित वैकल्पिक मार्ग उपलब्ध नहीं है।'
    );
  };

  const getPriorityBadge = (priority: AnnouncementPriority) => {
    switch (priority) {
      case 'EMERGENCY':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white tracking-wider animate-pulse shadow-xs">
            🚨 EMERGENCY
          </span>
        );
      case 'URGENT':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-500 text-white tracking-wider shadow-xs">
            ⚠️ URGENT
          </span>
        );
      case 'IMPORTANT':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            📌 IMPORTANT
          </span>
        );
      case 'NORMAL':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
            सूचना
          </span>
        );
    }
  };

  const getCategoryIcon = (category: AnnouncementCategory) => {
    switch (category) {
      case 'EMERGENCY':
        return '🚨';
      case 'ROUTE':
        return '🛣️';
      case 'PARKING':
        return '🅿️';
      case 'SHUTTLE':
        return '🛺';
      case 'MEDICAL':
        return '🚑';
      case 'HELP':
        return '🆘';
      case 'CHHATH_INFO':
        return '🙏';
      case 'SAFETY':
        return '⚠️';
      case 'GENERAL':
      default:
        return '📢';
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/70 pb-20 flex flex-col font-['Mukta',sans-serif]">
      <TopBar title="📢 महत्वपूर्ण सूचनाएँ" showBack />

      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 max-w-sm w-11/12 text-center animate-fade-in border border-amber-400">
          <span>🔔</span>
          <span className="flex-1">{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-3xl sm:max-w-4xl mx-auto w-full px-3.5 sm:px-6 py-4 space-y-4">
        {/* Official Header Banner */}
        <div className="bg-gradient-to-br from-[#075985] via-[#073B5A] to-[#041E2F] text-white rounded-3xl p-4 sm:p-5 shadow-md border-2 border-amber-500/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-lg text-amber-300">
                  📢
                </div>
                <h1 className="text-lg sm:text-xl font-black text-amber-300 tracking-tight">
                  मेला नियंत्रण कक्ष बुलेटिन
                </h1>
              </div>
              <p className="text-xs text-stone-200 mt-1 leading-relaxed">
                केवल अधिकृत स्रोत से प्राप्त सक्रिय और सत्यापित सार्वजनिक घोषणाएँ।
              </p>
            </div>

            <span className={`shrink-0 inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-xl border ${
              announcementSource === 'NONE' || announcementSource === 'ERROR' || announcementSource === 'LOADING'
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                : 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{announcementSource === 'CACHE' ? 'सहेजा सत्यापित' :
                announcementSource === 'NETWORK' ? 'सत्यापित' :
                  announcementSource === 'LOADING' ? 'लोड हो रहा है' :
                    announcementSource === 'ERROR' ? 'फ़ीड अनुपलब्ध' : 'कोई सक्रिय सूचना नहीं'}</span>
            </span>
          </div>

          {/* Sync & Offline Status Strip */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-stone-300">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>अंतिम अपडेट: {lastUpdated}</span>
            </div>

            {announcementSource === 'CACHE' ? (
              <span className="text-amber-300 font-bold flex items-center gap-1 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/40">
                <WifiOff className="w-3 h-3" />
                <span>सहेजी सूचना • लाइव नहीं</span>
              </span>
            ) : announcementSource === 'NETWORK' ? (
              <span className="text-emerald-300 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>स्रोत से प्राप्त</span>
              </span>
            ) : (
              <span className="text-amber-200 font-bold">
                {isOnline ? 'कोई सक्रिय सत्यापित सूचना उपलब्ध नहीं' : 'ऑफ़लाइन कैश उपलब्ध नहीं'}
              </span>
            )}
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <section aria-label="श्रेणी फिल्टर">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
            {CATEGORY_FILTERS.map((cat) => {
              const active = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-all active:scale-95 ${
                    active
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Priority Filter Row */}
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-bold text-stone-600">
            कुल सूचनाएँ: <strong className="text-stone-900">{announcements.length}</strong>
          </span>

          <div className="flex items-center gap-1">
            <span className="text-[11px] text-stone-500">प्राथमिकता:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as any)}
              className="text-xs font-bold bg-white border border-stone-200 rounded-lg px-2 py-1 text-stone-800 focus:outline-hidden"
            >
              <option value="ALL">सभी (All)</option>
              <option value="EMERGENCY">🚨 आपातकालीन (Emergency)</option>
              <option value="URGENT">⚠️ अति आवश्यक (Urgent)</option>
              <option value="IMPORTANT">📌 महत्वपूर्ण (Important)</option>
              <option value="NORMAL">सामान्य (Normal)</option>
            </select>
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-3">
          {announcements.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center space-y-2">
              <span className="text-3xl block">📋</span>
              <h3 className="text-sm font-bold text-stone-800">
                {announcementSource === 'LOADING'
                  ? 'सत्यापित घोषणाएँ लोड हो रही हैं…'
                  : announcementSource === 'ERROR'
                    ? 'घोषणाएँ लोड नहीं हो सकीं'
                    : announcementSource === 'NONE'
                      ? selectedCategory === 'ALL' && selectedPriority === 'ALL'
                        ? 'अभी कोई सक्रिय सत्यापित सूचना उपलब्ध नहीं है'
                        : 'चुने गए फ़िल्टर में कोई सक्रिय सूचना उपलब्ध नहीं है'
                      : 'इस श्रेणी में कोई सक्रिय सूचना नहीं है'}
              </h3>
              <p className="text-xs text-stone-500">
                {announcementSource === 'NONE'
                  ? isOnline
                    ? 'अधिकृत स्रोत से सत्यापित और समय-सीमा वाली सूचना प्रकाशित होने पर यहाँ दिखाई जाएगी।'
                    : 'इस डिवाइस पर अभी कोई समय-सीमा के भीतर सहेजी गई सत्यापित सूचना उपलब्ध नहीं है।'
                  : announcementSource === 'ERROR'
                    ? loadError || 'कृपया कनेक्शन जाँचकर पुनः प्रयास करें।'
                  : 'समाप्त घोषणाएँ नहीं दिखाई जातीं।'}
              </p>
              {announcementSource === 'ERROR' && (
                <button
                  onClick={() => setRefreshTrigger((count) => count + 1)}
                  className="mt-2 min-h-[44px] px-4 bg-[#075985] text-white text-sm font-bold rounded-xl"
                >
                  फिर से प्रयास करें
                </button>
              )}
            </div>
          ) : (
            announcements.map((item) => {
              const hasRouteAlert = !!item.routeAlert && item.routeAlert.isActive;
              const isUrgent = item.priority === 'EMERGENCY' || item.priority === 'URGENT';

              return (
                <article
                  key={item.id}
                  className={`bg-white border rounded-2xl p-4 shadow-xs transition-all space-y-3 ${
                    item.priority === 'EMERGENCY'
                      ? 'border-rose-400 ring-2 ring-rose-100 bg-rose-50/20'
                      : item.priority === 'URGENT'
                      ? 'border-orange-400 ring-2 ring-orange-100 bg-orange-50/20'
                      : item.priority === 'IMPORTANT'
                      ? 'border-amber-300'
                      : 'border-stone-200'
                  }`}
                >
                  {/* Top Header Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-base">{getCategoryIcon(item.category)}</span>
                      {getPriorityBadge(item.priority)}

                      {/* Official Verified Badge - Only admin-approved */}
                      {item.isVerifiedOfficial && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>✅ VERIFIED OFFICIAL</span>
                        </span>
                      )}
                    </div>

                    {/* Published time */}
                    <div className="flex flex-col items-end gap-0.5 text-[10px] text-stone-500 shrink-0">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {item.publishedTime}
                      </span>
                      <span>
                        वैधता समाप्ति:{' '}
                        {new Intl.DateTimeFormat('hi-IN', {
                          timeZone: 'Asia/Kolkata',
                          dateStyle: 'short',
                          timeStyle: 'short',
                        }).format(new Date(item.expiresAt))}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-base sm:text-lg font-black text-stone-900 leading-snug">
                    {item.title}
                  </h2>

                  {/* Short Description */}
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal bg-stone-50/90 p-3 rounded-xl border border-stone-100">
                    {item.shortDescription}
                  </p>

                  {/* ROUTE ALERT INTEGRATION CARD */}
                  {hasRouteAlert && item.routeAlert && (
                    <div className="bg-amber-50/90 border-2 border-amber-300 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-black text-amber-950 text-xs">
                          {item.routeAlert.type === 'ROAD_CLOSURE' ? (
                            <span className="text-sm">🚧</span>
                          ) : (
                            <span className="text-sm">⚠️</span>
                          )}
                          <span>
                            {item.routeAlert.type === 'ROAD_CLOSURE'
                              ? 'सड़क बंद (Road Closure)'
                              : 'मार्ग डायवर्जन (Traffic Diversion)'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                          {item.routeAlert.startTime} - {item.routeAlert.endTime || 'आदेश तक'}
                        </span>
                      </div>

                      <div className="text-[11px] text-stone-700 space-y-0.5">
                        <p>
                          <strong className="text-stone-900">प्रभावित मार्ग:</strong>{' '}
                          {item.routeAlert.roadName} ({item.routeAlert.affectedArea})
                        </p>
                        <p>
                          <strong className="text-stone-900">कारण:</strong>{' '}
                          {item.routeAlert.reason}
                        </p>
                        {item.routeAlert.alternativeRouteAdvice && (
                          <p className="text-emerald-800 font-bold pt-0.5">
                            ↪️ वैकल्पिक सुझाव: {item.routeAlert.alternativeRouteAdvice}
                          </p>
                        )}
                      </div>

                      {/* Map & Alternative Route Action Buttons */}
                      <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60">
                        <button
                          onClick={() => handleViewOnMap(item.routeAlert!)}
                          className="flex-1 py-1.5 px-2 bg-stone-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs hover:bg-stone-800 active:scale-95 transition-all"
                        >
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>नक्शे पर देखें</span>
                        </button>

                        {item.routeAlert.alternativeRouteAvailable && (
                          <button
                            onClick={() => handleAlternativeRoute(item.routeAlert!)}
                            className="flex-1 py-1.5 px-2 bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs hover:bg-emerald-800 active:scale-95 transition-all"
                          >
                            <Info className="w-3.5 h-3.5" />
                            <span>मार्ग सलाह पढ़ें</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* FACILITY STATUS IMPACT CARD */}
                  {item.facilityImpact && (
                    <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-2.5 text-xs text-blue-950 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">
                          {item.facilityImpact.facilityType === 'PARKING'
                            ? '🅿️'
                            : item.facilityImpact.facilityType === 'SHUTTLE'
                            ? '🛺'
                            : item.facilityImpact.facilityType === 'MEDICAL'
                            ? '🚑'
                            : '🆘'}
                        </span>
                        <div>
                          <strong className="block text-stone-900 leading-tight">
                            {item.facilityImpact.facilityName}
                          </strong>
                          <span className="text-[11px] text-blue-800">
                            स्थिति बदलाव: {item.facilityImpact.statusChange}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bottom Action Footer */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-stone-500 font-medium">
                      स्रोत: <strong className="text-stone-700">{item.source}</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Voice Listen Button */}
                      <button
                        onClick={() => handleSpeak(item)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border transition-all active:scale-95 ${
                          isSpeakingId === item.id
                            ? 'bg-amber-600 text-white border-amber-600 animate-pulse'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                        title="आवाज़ में सुनें"
                      >
                        {isSpeakingId === item.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            <span>रोकें</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                            <span>सुनें</span>
                          </>
                        )}
                      </button>

                      {/* Detail View Modal Button */}
                      {item.details && (
                        <button
                          onClick={() => setActiveAnnouncementModal(item)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 active:scale-95 transition-all flex items-center gap-1"
                        >
                          <span>पूरा विवरण</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Offline Disclaimer Banner per Requirement 11 */}
        {announcementSource === 'CACHE' && (
          <div className="bg-stone-900 text-white rounded-2xl p-3.5 text-xs space-y-1 shadow-sm">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <WifiOff className="w-4 h-4" />
              <span>सहेजी गई सूचना • लाइव नहीं</span>
            </div>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              “इन घोषणाओं का अंतिम सफल सिंक: {lastUpdated}। समाप्त घोषणाएँ नहीं दिखाई जातीं।”
            </p>
          </div>
        )}

      </main>

      {/* Detail Modal Dialog */}
      {activeAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-stone-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">
                    {getCategoryIcon(activeAnnouncementModal.category)}
                  </span>
                  {getPriorityBadge(activeAnnouncementModal.priority)}
                </div>
                <h3 className="text-lg font-black text-stone-900 leading-snug">
                  {activeAnnouncementModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveAnnouncementModal(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Official Badge */}
            {activeAnnouncementModal.isVerifiedOfficial && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 flex items-center gap-2 text-xs font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>यह जिला प्रशासन व मेला समिति द्वारा अधिकृत आधिकारिक सूचना है।</span>
              </div>
            )}

            <div className="space-y-2 text-xs text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
              <p className="font-semibold text-stone-900">{activeAnnouncementModal.shortDescription}</p>
              {activeAnnouncementModal.details && (
                <p className="pt-2 border-t border-stone-200/80">{activeAnnouncementModal.details}</p>
              )}
            </div>

            {/* Route Alert if applicable */}
            {activeAnnouncementModal.routeAlert && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs space-y-2">
                <span className="font-black text-amber-950 block">मार्ग विवरण:</span>
                <p className="text-stone-700">मार्ग: {activeAnnouncementModal.routeAlert.roadName}</p>
                <p className="text-stone-700">प्रभावित परिधि: {activeAnnouncementModal.routeAlert.affectedArea}</p>
                {activeAnnouncementModal.routeAlert.alternativeRouteAdvice && (
                  <p className="text-emerald-800 font-bold">
                    वैकल्पिक मार्ग: {activeAnnouncementModal.routeAlert.alternativeRouteAdvice}
                  </p>
                )}
                <button
                  onClick={() => {
                    const alert = activeAnnouncementModal.routeAlert!;
                    setActiveAnnouncementModal(null);
                    handleViewOnMap(alert);
                  }}
                  className="w-full py-2 bg-stone-900 text-white rounded-xl font-bold flex items-center justify-center gap-1.5"
                >
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>नक्शे पर देखें</span>
                </button>
              </div>
            )}

            <div className="text-[11px] text-stone-500 pt-2 border-t border-stone-100 flex items-center justify-between">
              <span>स्रोत: {activeAnnouncementModal.source}</span>
              <span>प्रकाशित: {activeAnnouncementModal.publishedTime}</span>
            </div>
            {'expiresAt' in activeAnnouncementModal && typeof activeAnnouncementModal.expiresAt === 'string' && (
              <p className="text-[11px] text-stone-500">
                समाप्ति: {new Intl.DateTimeFormat('hi-IN', {
                  timeZone: 'Asia/Kolkata',
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(activeAnnouncementModal.expiresAt))}
              </p>
            )}

            <button
              onClick={() => setActiveAnnouncementModal(null)}
              className="w-full py-3 bg-stone-900 text-white text-xs font-bold rounded-2xl shadow-sm hover:bg-stone-800"
            >
              बंद करें
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
