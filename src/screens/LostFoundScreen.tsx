/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import {
  LostFoundReport,
  LostFoundType,
} from '../types';
import { apiUrl } from '../services/apiUrl';
import {
  Search,
  UserX,
  UserCheck,
  PackageX,
  PackageCheck,
  AlertTriangle,
  PhoneCall,
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle2,
  Filter,
  Flag,
  ChevronRight,
  WifiOff,
  Compass,
} from 'lucide-react';

const LOST_FOUND_TYPES: LostFoundType[] = [
  'LOST_PERSON',
  'FOUND_PERSON',
  'LOST_ITEM',
  'FOUND_ITEM',
];
const LOST_FOUND_STATUSES: LostFoundReport['status'][] = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'MATCH_FOUND',
  'VERIFICATION_REQUIRED',
  'TRANSFERRED_TO_HELP_POINT',
  'RESOLVED',
  'CLOSED',
  'CANCELLED',
];

function parsePublicReport(value: unknown): LostFoundReport | null {
  if (typeof value !== 'object' || value === null) return null;
  const report = value as Record<string, unknown>;
  if (
    typeof report.reportId !== 'string' ||
    typeof report.type !== 'string' ||
    !LOST_FOUND_TYPES.includes(report.type as LostFoundType) ||
    typeof report.category !== 'string' ||
    typeof report.createdAt !== 'string' ||
    typeof report.status !== 'string' ||
    !LOST_FOUND_STATUSES.includes(report.status as LostFoundReport['status'])
  ) {
    return null;
  }
  const title = typeof report.title === 'string'
    ? report.title
    : `रिपोर्ट ${report.reportId}`;
  const description = typeof report.description === 'string'
    ? report.description
    : 'व्यक्तिगत विवरण सार्वजनिक रूप से साझा नहीं किया जाता।';
  const location = typeof report.locationName === 'string'
    ? report.locationName
    : 'सत्यापित सहायता केंद्र से जानकारी लें।';
  return {
    id: typeof report.id === 'string' ? report.id : report.reportId,
    reportId: report.reportId,
    type: report.type as LostFoundType,
    category: report.category,
    title,
    description,
    location,
    createdBy: 'server',
    createdAt: report.createdAt,
    updatedAt: typeof report.updatedAt === 'string' ? report.updatedAt : report.createdAt,
    status: report.status as LostFoundReport['status'],
    verificationStatus: 'PENDING',
  };
}

export const LostFoundScreen: React.FC = () => {
  const { navigate, deviceLocation, isOnline } = useApp();

  // Active view: MENU | FORM | LIST | DETAIL
  const [currentView, setCurrentView] = useState<'MENU' | 'FORM' | 'LIST' | 'DETAIL'>('MENU');
  const [selectedReportType, setSelectedReportType] = useState<LostFoundType>('LOST_PERSON');
  const [selectedReport, setSelectedReport] = useState<LostFoundReport | null>(null);

  // Filter for reports list
  const [listFilter, setListFilter] = useState<'ALL' | 'PERSON' | 'ITEM'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form Fields
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('सामान्य');
  const [description, setDescription] = useState<string>('');
  const [locationStr, setLocationStr] = useState<string>('');
  const [includeLocation, setIncludeLocation] = useState<boolean>(false);
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('कोई भी');
  const [clothes, setClothes] = useState<string>('');
  const [identifyingFeatures, setIdentifyingFeatures] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [photoConsent, setPhotoConsent] = useState<boolean>(false);
  const [allReports, setAllReports] = useState<LostFoundReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState<boolean>(false);
  const [reportLoadError, setReportLoadError] = useState<string | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);

  // Success Confirmation modal
  const [submittedReport, setSubmittedReport] = useState<LostFoundReport | null>(null);

  // Report Misuse Modal
  const [misuseReportId, setMisuseReportId] = useState<string | null>(null);
  const [misuseReason, setMisuseReason] = useState<string>('Fake report / गलत जानकारी');

  // Claim Verification Modal
  const [showClaimModal, setShowClaimModal] = useState<boolean>(false);
  const [claimDetails, setClaimDetails] = useState<string>('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (currentView !== 'LIST') return;
    if (!isOnline) {
      setReportLoadError('रिपोर्ट देखने के लिए इंटरनेट कनेक्शन आवश्यक है।');
      return;
    }

    const controller = new AbortController();
    setIsLoadingReports(true);
    setReportLoadError(null);
    fetch(apiUrl('/api/lost-found'), { signal: controller.signal })
      .then(async (response) => {
        const result: unknown = await response.json();
        if (!response.ok) {
          const message =
            typeof result === 'object' && result !== null && 'error' in result &&
            typeof result.error === 'string'
              ? result.error
              : 'रिपोर्टें लोड नहीं हो सकीं। कृपया दोबारा प्रयास करें।';
          throw new Error(message);
        }
        if (
          typeof result !== 'object' ||
          result === null ||
          !('reports' in result) ||
          !Array.isArray(result.reports)
        ) {
          throw new Error('सर्वर से रिपोर्टों की सही जानकारी नहीं मिली।');
        }
        const reports = result.reports
          .map(parsePublicReport)
          .filter((report): report is LostFoundReport => report !== null);
        setAllReports(reports);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setReportLoadError(
            error instanceof Error
              ? error.message
              : 'रिपोर्टें लोड करते समय त्रुटि हुई।'
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingReports(false);
      });

    return () => controller.abort();
  }, [currentView, isOnline]);

  const filteredReports = useMemo(() => {
    let list = allReports;
    if (listFilter === 'PERSON') {
      list = list.filter((r) => r.type === 'LOST_PERSON' || r.type === 'FOUND_PERSON');
    } else if (listFilter === 'ITEM') {
      list = list.filter((r) => r.type === 'LOST_ITEM' || r.type === 'FOUND_ITEM');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.reportId.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allReports, listFilter, searchQuery]);

  const handleOpenForm = (type: LostFoundType) => {
    setSelectedReportType(type);
    setTitle('');
    setDescription('');
    setLocationStr('');
    setIncludeLocation(false);
    setAge('');
    setClothes('');
    setIdentifyingFeatures('');
    setContactName('');
    setContactPhone('');
    setCurrentView('FORM');
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOnline) {
      showToast('रिपोर्ट सर्वर पर भेजने के लिए इंटरनेट कनेक्शन आवश्यक है।');
      return;
    }
    if (!contactName.trim()) {
      showToast('कृपया सत्यापन के लिए अपना नाम दर्ज करें।');
      return;
    }

    const compiledDesc =
      selectedReportType === 'LOST_PERSON' || selectedReportType === 'FOUND_PERSON'
        ? `${description} | उम्र: ${age || 'अज्ञात'} | कपड़े: ${clothes || 'विवरण नहीं'} | पहचान: ${identifyingFeatures || 'सामान्य'}`
        : `${description} | पहचान विशेषता: ${identifyingFeatures || 'सामान्य'}`;

    setIsSubmittingReport(true);
    try {
      const response = await fetch(apiUrl('/api/lost-found'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedReportType,
          category,
          title: title.trim(),
          description: compiledDesc.trim(),
          locationName: locationStr.trim(),
          ...(includeLocation && deviceLocation
            ? {
                latitude: deviceLocation.latitude,
                longitude: deviceLocation.longitude,
              }
            : {}),
          contactName: contactName.trim(),
          contactPhone: contactPhone.trim() || undefined,
          identifyingFeatures: identifyingFeatures.trim() || undefined,
        }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof result === 'object' && result !== null && 'error' in result &&
          typeof result.error === 'string'
            ? result.error
            : 'रिपोर्ट सर्वर पर भेजी नहीं जा सकी। कृपया दोबारा प्रयास करें।';
        throw new Error(message);
      }
      const reportData =
        typeof result === 'object' && result !== null && 'report' in result
          ? result.report
          : null;
      const newReport = parsePublicReport(reportData);
      if (!newReport) {
        throw new Error('सर्वर से रिपोर्ट की पुष्टि नहीं मिली। कृपया सहायता से संपर्क करें।');
      }

      setAllReports((reports) => [newReport, ...reports.filter((report) => report.id !== newReport.id)]);
      setSubmittedReport(newReport);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : 'रिपोर्ट भेजते समय त्रुटि हुई। कृपया दोबारा प्रयास करें।'
      );
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleReportMisuseConfirm = () => {
    if (!misuseReportId) return;
    setMisuseReportId(null);
    showToast('दुरुपयोग रिपोर्ट भेजी नहीं गई है; इस ऐप में यह सुविधा अभी उपलब्ध नहीं है। कृपया सहायता डेस्क से संपर्क करें।');
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowClaimModal(false);
    setClaimDetails('');
    showToast('दावा भेजा नहीं गया है; इस ऐप में यह सुविधा अभी उपलब्ध नहीं है। कृपया सहायता डेस्क से संपर्क करें।');
  };

  return (
    <div className="min-h-screen bg-stone-100/70 pb-20 flex flex-col font-['Mukta',sans-serif]">
      <TopBar title="खोया-पाया सहायता" showBack />

      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 max-w-sm w-11/12 text-center animate-fade-in border border-amber-400">
          <span>🔔</span>
          <span className="flex-1">{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-lg mx-auto w-full p-3 sm:p-4 space-y-3.5">
        {/* ======================================================== */}
        {/* TOP NOTICE: PRIVACY & OFFICIAL CENTRAL DESK             */}
        {/* ======================================================== */}
        <div className="bg-gradient-to-r from-amber-700 via-stone-800 to-stone-900 text-white rounded-3xl p-4 shadow-sm space-y-2 border border-amber-600/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🔎</span>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-amber-200">
                  खोया-पाया रिपोर्टिंग
                </h2>
                <span className="text-xs text-stone-300 block">
                  सर्वर प्रक्रिया रिपोर्ट प्राप्त करेगी; स्थायी संग्रहण या सहायता की पुष्टि नहीं।
                </span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-stone-300 leading-relaxed">
            रिपोर्ट की सार्वजनिक सूची से संपर्क विवरण हटाए जाते हैं। कृपया यहाँ संवेदनशील जानकारी न लिखें।
          </p>

          {/* Quick Safety Shortcuts (Req 12) */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px] font-black">
            <a
              href="tel:112"
              className="p-2 rounded-xl bg-red-700/80 hover:bg-red-700 text-white flex items-center justify-center gap-1 shadow-xs"
            >
              <span>🚨 112 पुलिस</span>
            </a>
            <a
              href="tel:108"
              className="p-2 rounded-xl bg-rose-700/80 hover:bg-rose-700 text-white flex items-center justify-center gap-1 shadow-xs"
            >
              <span>🚑 108 एम्बुलेंस</span>
            </a>
            <button
              onClick={() => navigate('help')}
              className="p-2 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white flex items-center justify-center gap-1 shadow-xs"
            >
              <span>🆘 हेल्प डेस्क</span>
            </button>
          </div>
        </div>

        {/* View Switcher: MENU | LIST */}
        <div className="grid grid-cols-2 gap-1 bg-stone-200/80 p-1 rounded-2xl text-xs font-black">
          <button
            onClick={() => setCurrentView('MENU')}
            className={`py-2 px-1 rounded-xl transition-all ${
              currentView === 'MENU' || currentView === 'FORM'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600'
            }`}
          >
            📝 नई रिपोर्ट दर्ज करें
          </button>
          <button
            onClick={() => setCurrentView('LIST')}
            className={`py-2 px-1 rounded-xl transition-all ${
              currentView === 'LIST' || currentView === 'DETAIL'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600'
            }`}
          >
            📋 दर्ज रिपोर्ट देखें ({allReports.length})
          </button>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: FOUR LARGE MAIN OPTIONS (Requirement 1)          */}
        {/* ======================================================== */}
        {currentView === 'MENU' && (
          <div className="space-y-3 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. 👤 व्यक्ति खो गया */}
              <button
                onClick={() => handleOpenForm('LOST_PERSON')}
                className="min-h-[100px] p-4 bg-white border-2 border-rose-300 hover:border-rose-500 rounded-3xl shadow-xs text-left flex items-start gap-3.5 active:scale-98 transition-all group"
              >
                <div className="w-13 h-13 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform">
                  👤
                </div>
                <div>
                  <span className="text-lg font-black text-rose-950 block leading-tight">
                    व्यक्ति खो गया
                  </span>
                  <span className="text-xs text-stone-600 font-medium block mt-1">
                    लापता परिजन, बालक अथवा वृद्ध की रिपोर्ट दर्ज करें; तत्काल खतरे में 112 पर कॉल करें
                  </span>
                </div>
              </button>

              {/* 2. 👤 व्यक्ति मिला */}
              <button
                onClick={() => handleOpenForm('FOUND_PERSON')}
                className="min-h-[100px] p-4 bg-white border-2 border-emerald-300 hover:border-emerald-500 rounded-3xl shadow-xs text-left flex items-start gap-3.5 active:scale-98 transition-all group"
              >
                <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform">
                  👤
                </div>
                <div>
                  <span className="text-lg font-black text-emerald-950 block leading-tight">
                    व्यक्ति मिला
                  </span>
                  <span className="text-xs text-stone-600 font-medium block mt-1">
                    बिछड़े व्यक्ति की जानकारी दर्ज करें; सहायता स्थल की उपलब्धता यहाँ सत्यापित नहीं है
                  </span>
                </div>
              </button>

              {/* 3. 🎒 सामान खो गया */}
              <button
                onClick={() => handleOpenForm('LOST_ITEM')}
                className="min-h-[100px] p-4 bg-white border-2 border-amber-300 hover:border-amber-500 rounded-3xl shadow-xs text-left flex items-start gap-3.5 active:scale-98 transition-all group"
              >
                <div className="w-13 h-13 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform">
                  🎒
                </div>
                <div>
                  <span className="text-lg font-black text-amber-950 block leading-tight">
                    सामान खो गया
                  </span>
                  <span className="text-xs text-stone-600 font-medium block mt-1">
                    मोबाइल, बैग, दस्तावेज, पूजा सामग्री आदि
                  </span>
                </div>
              </button>

              {/* 4. 🎒 सामान मिला */}
              <button
                onClick={() => handleOpenForm('FOUND_ITEM')}
                className="min-h-[100px] p-4 bg-white border-2 border-indigo-300 hover:border-indigo-500 rounded-3xl shadow-xs text-left flex items-start gap-3.5 active:scale-98 transition-all group"
              >
                <div className="w-13 h-13 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-800 flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform">
                  🎒
                </div>
                <div>
                  <span className="text-lg font-black text-indigo-950 block leading-tight">
                    सामान मिला
                  </span>
                  <span className="text-xs text-stone-600 font-medium block mt-1">
                    सामान मिलने की सूचना दर्ज करें; जमा करने का स्थान स्थानीय प्रशासन से पूछें
                  </span>
                </div>
              </button>
            </div>

            {/* Missing Family shortcut */}
            <div className="bg-purple-50 border border-purple-200 rounded-3xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">👨👩👧</span>
                <div>
                  <h4 className="text-sm font-black text-purple-950">
                    क्या परिवार का सदस्य नहीं मिल रहा?
                  </h4>
                  <p className="text-[11px] text-purple-700">
                    परिवार की लाइव लोकेशन इस ऐप में उपलब्ध नहीं है। सहायता के लिए परिवार स्क्रीन देखें।
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('family')}
                className="px-3 py-2 bg-purple-800 text-white font-black text-xs rounded-xl shadow-xs shrink-0 active:scale-95"
              >
                परिवार देखें
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: FORM FOR REPORT SUBMISSION                       */}
        {/* ======================================================== */}
        {currentView === 'FORM' && (
          <form
            onSubmit={handleSubmitForm}
            className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                  {selectedReportType === 'LOST_PERSON' && '👤 व्यक्ति खो गया'}
                  {selectedReportType === 'FOUND_PERSON' && '👤 व्यक्ति मिला'}
                  {selectedReportType === 'LOST_ITEM' && '🎒 सामान खो गया'}
                  {selectedReportType === 'FOUND_ITEM' && '🎒 सामान मिला'}
                </span>
                <h3 className="text-base font-black text-stone-900 mt-0.5">
                  विस्तृत विवरण दर्ज करें
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCurrentView('MENU')}
                className="text-xs font-bold text-stone-500 hover:text-stone-800 px-2 py-1"
              >
                रद्द करें
              </button>
            </div>

            {/* Child or Vulnerable warning */}
            {selectedReportType === 'FOUND_PERSON' && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  “तत्काल खतरे में 112 पर कॉल करें या पास के पुलिस कर्मी से संपर्क करें। बच्चे की संवेदनशील जानकारी सार्वजनिक न करें।”
                </p>
              </div>
            )}

            {/* Title / Name */}
            <div className="space-y-1">
              <label className="text-xs font-black text-stone-700 block">
                {selectedReportType.includes('PERSON') ? 'व्यक्ति की पहचान / अस्थायी नाम *:' : 'सामान का प्रकार व नाम *:'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  selectedReportType.includes('PERSON')
                    ? 'नाम अज्ञात हो तो “नाम अज्ञात” लिखें'
                    : 'उदा. सैमसंग मोबाइल फोन / काला चमड़े का बैग'
                }
                className="w-full min-h-[46px] px-3.5 rounded-2xl border border-stone-300 text-sm font-bold bg-stone-50"
              />
            </div>

            {/* Category */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">श्रेणी:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full min-h-[46px] px-3 rounded-2xl border border-stone-300 text-xs font-bold bg-stone-50"
                >
                  {selectedReportType.includes('PERSON') ? (
                    <>
                      <option value="बालक / बच्ची">बालक / बच्ची (Child)</option>
                      <option value="वृद्ध नागरिक">वृद्ध नागरिक (Senior)</option>
                      <option value="महिला">महिला (Woman)</option>
                      <option value="पुरुष">पुरुष (Man)</option>
                      <option value="दिव्यांग">दिव्यांग जन (Specially-abled)</option>
                    </>
                  ) : (
                    <>
                      <option value="मोबाइल / इलेक्ट्रॉनिक्स">मोबाइल / इलेक्ट्रॉनिक्स</option>
                      <option value="बैग / पर्स">बैग / पर्स / थैला</option>
                      <option value="दस्तावेज / कार्ड">दस्तावेज / आधार / कार्ड</option>
                      <option value="कपड़े / चादर">कपड़े / शॉल</option>
                      <option value="चश्मा / अन्य">चश्मा / आभूषण / अन्य</option>
                    </>
                  )}
                </select>
              </div>

              {selectedReportType.includes('PERSON') && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">
                    उम्र या अनुमानित उम्र:
                  </label>
                  <input
                    type="text"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="उदा. 8 वर्ष / 70 वर्ष"
                    className="w-full min-h-[46px] px-3.5 rounded-2xl border border-stone-300 text-xs font-bold bg-stone-50"
                  />
                </div>
              )}
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="text-xs font-black text-stone-700 block">
                📍 {selectedReportType.includes('LOST') ? 'आखिरी बार कहाँ देखा गया?' : 'कहाँ मिला?'}
              </label>
              <input
                type="text"
                required
                value={locationStr}
                onChange={(e) => setLocationStr(e.target.value)}
                placeholder="नजदीकी landmark लिखें"
                className="w-full min-h-[46px] px-3.5 rounded-2xl border border-stone-300 text-sm font-bold bg-stone-50"
              />
              <label className="flex min-h-11 items-center gap-2 rounded-xl bg-amber-50 px-3 text-xs text-amber-950">
                <input
                  type="checkbox"
                  checked={includeLocation}
                  disabled={!deviceLocation}
                  onChange={(e) => setIncludeLocation(e.target.checked)}
                  className="h-4 w-4 accent-[#0B5E8E]"
                />
                <span>
                  {deviceLocation
                    ? 'मैं इस रिपोर्ट के साथ अपना वर्तमान GPS स्थान भेजने की सहमति देता/देती हूँ। (वैकल्पिक)'
                    : 'GPS निर्देशांक उपलब्ध नहीं हैं; रिपोर्ट में केवल ऊपर दिया गया स्थान भेजा जाएगा।'}
                </span>
              </label>
            </div>

            {/* Identifying features */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 block">
                {selectedReportType.includes('PERSON')
                  ? 'कपड़ों का विवरण एवं अन्य पहचान:'
                  : 'पहचान की विशेषता (रंग, कंपनी, विशेष निशान):'}
              </label>
              <textarea
                rows={2}
                value={identifyingFeatures}
                onChange={(e) => setIdentifyingFeatures(e.target.value)}
                placeholder={
                  selectedReportType.includes('PERSON')
                    ? 'उदा. पीला कुर्ता, चश्मा, हाथ में कड़ा'
                    : 'उदा. नीले रंग का बैग, लाल चाभी का छल्ला'
                }
                className="w-full p-3 rounded-2xl border border-stone-300 text-xs font-medium bg-stone-50"
              />
            </div>

            {/* General Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 block">
                अतिरिक्त जानकारी / स्थिति:
              </label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="कोई अन्य आवश्यक विवरण लिखें..."
                className="w-full p-3 rounded-2xl border border-stone-300 text-xs font-medium bg-stone-50"
              />
            </div>

            {/* Contact details (Only for backend verification) */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-stone-700 block">
                🔒 संपर्क विवरण (केवल सत्यापन हेतु - सार्वजनिक नहीं होगा):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="आपका नाम"
                  className="w-full min-h-[42px] px-3 rounded-xl border border-stone-300 text-xs font-bold bg-white"
                />
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="मोबाइल नंबर"
                  className="w-full min-h-[42px] px-3 rounded-xl border border-stone-300 text-xs font-bold bg-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmittingReport}
                className="w-full min-h-[50px] bg-[#0B5E8E] hover:bg-[#073B5A] disabled:opacity-60 disabled:cursor-not-allowed active:scale-98 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>{isSubmittingReport ? 'रिपोर्ट भेजी जा रही है…' : 'रिपोर्ट दर्ज करें'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: REPORTS LIST (Privacy Protected)                */}
        {/* ======================================================== */}
        {currentView === 'LIST' && (
          <div className="space-y-3 animate-fade-in">
            {/* Search and Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Report ID, नाम या स्थान से खोजें..."
                  className="w-full min-h-[44px] pl-10 pr-4 rounded-2xl border border-stone-300 text-xs font-bold bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-1 text-[11px] font-black">
                <button
                  onClick={() => setListFilter('ALL')}
                  className={`py-1.5 rounded-xl border ${
                    listFilter === 'ALL'
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-700 border-stone-300'
                  }`}
                >
                  सभी
                </button>
                <button
                  onClick={() => setListFilter('PERSON')}
                  className={`py-1.5 rounded-xl border ${
                    listFilter === 'PERSON'
                      ? 'bg-rose-800 text-white border-rose-800'
                      : 'bg-white text-stone-700 border-stone-300'
                  }`}
                >
                  व्यक्ति
                </button>
                <button
                  onClick={() => setListFilter('ITEM')}
                  className={`py-1.5 rounded-xl border ${
                    listFilter === 'ITEM'
                      ? 'bg-indigo-800 text-white border-indigo-800'
                      : 'bg-white text-stone-700 border-stone-300'
                  }`}
                >
                  सामान
                </button>
              </div>
            </div>

            {/* Reports Cards */}
            {reportLoadError ? (
              <div className="bg-rose-50 rounded-3xl p-5 text-center text-xs text-rose-900 border border-rose-200">
                {reportLoadError}
              </div>
            ) : isLoadingReports ? (
              <div className="bg-white rounded-3xl p-8 text-center text-xs text-stone-500 border border-stone-200">
                रिपोर्टें लोड हो रही हैं…
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center text-xs text-stone-500 border border-stone-200">
                कोई रिपोर्ट नहीं मिली।
              </div>
            ) : (
              filteredReports.map((rep) => {
                const isPerson = rep.type.includes('PERSON');
                const isLost = rep.type.includes('LOST');

                return (
                  <div
                    key={rep.id}
                    className="bg-white rounded-3xl p-4 border border-stone-200 shadow-xs space-y-2.5 hover:border-amber-400 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              isLost
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {isLost ? 'खोया हुआ' : 'मिला हुआ'} • {rep.category}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-stone-400">
                            {rep.reportId}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-stone-900 mt-1">{rep.title}</h4>
                      </div>

                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                        {rep.status}
                      </span>
                    </div>

                    <p className="text-xs text-stone-700 line-clamp-2 leading-relaxed">
                      {rep.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span className="truncate max-w-[170px]">{rep.location}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedReport(rep);
                            setCurrentView('DETAIL');
                          }}
                          className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-lg active:scale-95"
                        >
                          विवरण देखें
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 4: REPORT DETAIL VIEW                               */}
        {/* ======================================================== */}
        {currentView === 'DETAIL' && selectedReport && (
          <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-xs font-mono font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                  {selectedReport.reportId}
                </span>
                <h3 className="text-lg font-black text-stone-900 mt-1">
                  {selectedReport.title}
                </h3>
              </div>
              <button
                onClick={() => setCurrentView('LIST')}
                className="text-xs font-bold text-stone-500 hover:text-stone-800"
              >
                ← वापस
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-500">स्थिति:</span>
                  <span className="font-black text-emerald-800">{selectedReport.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">स्थान:</span>
                  <span className="font-bold text-stone-800">{selectedReport.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">दर्ज समय:</span>
                  <span className="font-mono text-stone-700">{selectedReport.createdAt}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-black text-stone-800 block">विवरण:</span>
                <p className="text-stone-700 leading-relaxed p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  {selectedReport.description}
                </p>
              </div>

              {selectedReport.identifyingFeatures && (
                <div className="space-y-1">
                  <span className="font-black text-stone-800 block">पहचान विशेषता:</span>
                  <p className="text-stone-700 p-2.5 bg-amber-50/60 rounded-xl border border-amber-200">
                    {selectedReport.identifyingFeatures}
                  </p>
                </div>
              )}
            </div>

            {/* Claim / Handover Action */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => setShowClaimModal(true)}
                className="w-full min-h-[46px] bg-purple-800 hover:bg-purple-900 active:scale-95 text-white font-black text-xs rounded-2xl shadow-xs flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>यह मेरा परिजन / सामान है (सत्यापन का दावा करें)</span>
              </button>

              <button
                onClick={() => setMisuseReportId(selectedReport.reportId)}
                className="w-full py-2 text-rose-700 hover:text-rose-900 text-xs font-bold flex items-center justify-center gap-1"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>🚩 रिपोर्ट दुरुपयोग की सूचना दें</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* SUBMISSION CONFIRMATION MODAL (Requirement 6)           */}
      {/* ======================================================== */}
      {submittedReport && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-black text-stone-900">
                सर्वर प्रक्रिया ने रिपोर्ट प्राप्त की है।
              </h4>
              <p className="text-xs text-stone-500">
                यह पुष्टि नहीं है कि रिपोर्ट स्थायी रूप से सहेजी, सत्यापित या किसी सहायता डेस्क को भेजी गई है।
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-left text-xs space-y-1 font-mono">
              <div>
                <span className="text-stone-500">Report ID:</span>{' '}
                <strong className="text-amber-950 font-black">{submittedReport.reportId}</strong>
              </div>
              <div>
                <span className="text-stone-500">प्रकार:</span>{' '}
                <strong>{submittedReport.type}</strong>
              </div>
              <div>
                <span className="text-stone-500">स्थिति:</span>{' '}
                <span className="text-emerald-800 font-bold">{submittedReport.status}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSubmittedReport(null);
                setCurrentView('LIST');
              }}
              className="w-full min-h-[46px] bg-stone-900 hover:bg-stone-800 text-white font-black text-xs rounded-xl shadow-md"
            >
              ठीक है, रिपोर्ट देखें
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MISUSE REPORT MODAL (Requirement 20)                     */}
      {/* ======================================================== */}
      {misuseReportId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
              <span className="text-xl">🚩</span>
              <h4 className="text-base font-black text-rose-800">
                दुरुपयोग रिपोर्ट करें ({misuseReportId})
              </h4>
            </div>

            <div className="space-y-1.5 text-xs font-bold text-stone-800">
              {[
                'Fake report / फर्जी सूचना',
                'Wrong information / गलत जानकारी',
                'Suspicious claim / संदेहास्पद दावा',
                'Harassment / अनुचित व्यवहार',
                'Duplicate report / डुप्लिकेट रिपोर्ट',
              ].map((reason, i) => (
                <label key={i} className="flex items-center gap-2 p-2 rounded-xl border bg-stone-50">
                  <input
                    type="radio"
                    name="misuseReason"
                    value={reason}
                    checked={misuseReason === reason}
                    onChange={() => setMisuseReason(reason)}
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setMisuseReportId(null)}
                className="min-h-[46px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl"
              >
                रद्द करें
              </button>
              <button
                onClick={handleReportMisuseConfirm}
                className="min-h-[46px] bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md"
              >
                प्रशासन को भेजें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CLAIM VERIFICATION MODAL (Requirement 10)                */}
      {/* ======================================================== */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleClaimSubmit}
            className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in"
          >
            <div className="space-y-1">
              <h4 className="text-base font-black text-stone-900">
                स्वामित्व / परिजन सत्यापन दावा
              </h4>
              <p className="text-xs text-stone-500">
                पहचान साबित करने के लिए ऐसा विवरण दें जो केवल आपको ज्ञात हो।
              </p>
            </div>

            <textarea
              required
              rows={3}
              value={claimDetails}
              onChange={(e) => setClaimDetails(e.target.value)}
              placeholder="उदा. बैग के अंदर मौजूद विशिष्ट सामान / परिजन का जन्म चिन्ह आदि..."
              className="w-full p-3 rounded-2xl border border-stone-300 text-xs bg-stone-50"
            />

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowClaimModal(false)}
                className="min-h-[46px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                className="min-h-[46px] bg-purple-800 hover:bg-purple-900 active:scale-95 text-white font-black text-xs rounded-xl shadow-md"
              >
                सत्यापन भेजें
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
