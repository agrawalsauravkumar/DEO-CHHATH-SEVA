/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { DeoMap } from '../components/DeoMap';
import { FamilyService } from '../services/FamilyService';

const FAMILY_SAFETY_BACKEND_AVAILABLE = true;
import {
  FamilyGroup,
  FamilyGroupMember,
  FamilyAlertItem,
  LocationItem,
} from '../types';
import {
  Users,
  UserPlus,
  MapPin,
  Compass,
  AlertTriangle,
  Clock,
  Shield,
  Copy,
  Share2,
  Check,
  CheckCircle2,
  Trash2,
  LogOut,
  Radio,
  RadioTower,
  Eye,
  EyeOff,
  Navigation,
  RefreshCw,
  Search,
  WifiOff,
} from 'lucide-react';

export const FamilyScreen: React.FC = () => {
  const { navigate, deviceLocation, isOnline, startNavigation } = useApp();

  // Active section tab: MEMBERS | SHARING | MAP | LOST_FLOW | ALERTS
  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'SHARING' | 'MAP' | 'LOST_FLOW' | 'ALERTS'>(
    'MEMBERS'
  );

  // Group state
  const [group, setGroup] = useState<FamilyGroup | null>(() => FamilyService.getFamilyGroup());
  const [members, setMembers] = useState<FamilyGroupMember[]>(() =>
    FamilyService.getFamilyMembers()
  );
  const [alerts, setAlerts] = useState<FamilyAlertItem[]>(() => FamilyService.getFamilyAlerts());
  const [isSharing, setIsSharing] = useState<boolean>(() => FamilyService.isSharingActive());
  const [expiryString, setExpiryString] = useState<string>(() =>
    FamilyService.getSharingExpiresTimeString()
  );

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('हमारा Chhath परिवार');

  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [joinNameInput, setJoinNameInput] = useState<string>('');

  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(60); // 60 minutes default

  const [memberToRemove, setMemberToRemove] = useState<FamilyGroupMember | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  const [showEmergencyAlertModal, setShowEmergencyAlertModal] = useState<boolean>(false);
  const [attachLocationToAlert, setAttachLocationToAlert] = useState<boolean>(true);

  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Lost member selection
  const [selectedLostMember, setSelectedLostMember] = useState<FamilyGroupMember | null>(null);

  const refreshState = () => {
    setGroup(FamilyService.getFamilyGroup());
    setMembers(FamilyService.getFamilyMembers());
    setAlerts(FamilyService.getFamilyAlerts());
    setIsSharing(FamilyService.isSharingActive());
    setExpiryString(FamilyService.getSharingExpiresTimeString());
  };

  useEffect(() => {
    refreshState();
    const interval = setInterval(refreshState, 5000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newGrp = FamilyService.createFamilyGroup(newGroupName);
      setShowCreateModal(false);
      refreshState();
      showToast(`नया परिवार समूह "${newGrp.name}" बनाया गया! कोड: ${newGrp.inviteCode}`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'परिवार समूह बनाने में समस्या हुई।');
    }
  };

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const result = FamilyService.joinFamilyGroup(joinCodeInput, joinNameInput);
    if (result.success) {
      setShowJoinModal(false);
      refreshState();
      showToast(result.message);
    } else {
      showToast(result.message);
    }
  };

  const handleCopyCode = () => {
    if (!group) return;
    try {
      navigator.clipboard.writeText(group.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
      showToast('परिवार कोड कॉपी किया गया: ' + group.inviteCode);
    } catch {
      showToast('कोड: ' + group.inviteCode);
    }
  };

  const handleShareCode = () => {
    if (!group) return;
    const shareText = `देव छठ सेवा में हमारे परिवार समूह से जुड़ें। कोड: ${group.inviteCode}`;
    if (navigator.share) {
      navigator.share({ title: 'देव छठ सेवा परिवार', text: shareText }).catch(() => {});
    } else {
      handleCopyCode();
    }
  };

  const handleStartSharing = () => {
    if (!deviceLocation) {
      showToast('GPS स्थान उपलब्ध नहीं है। कृपया खुले स्थान पर जाएं।');
      setShowConsentModal(false);
      return;
    }
    FamilyService.updateLocationSharing(
      selectedDuration,
      deviceLocation.latitude,
      deviceLocation.longitude,
      deviceLocation.accuracy
    );
    setShowConsentModal(false);
    refreshState();
    showToast('आपकी Location Sharing शुरू हो गई है।');
  };

  const handleStopSharing = () => {
    FamilyService.stopLocationSharing();
    refreshState();
    showToast('आपकी location अब family members को दिखाई नहीं देगी।');
  };

  const handleConfirmRemoveMember = () => {
    if (!memberToRemove) return;
    FamilyService.removeFamilyMember(memberToRemove.id);
    setMemberToRemove(null);
    refreshState();
    showToast('सदस्य को परिवार समूह से हटा दिया गया है।');
  };

  const handleConfirmLeave = () => {
    FamilyService.leaveFamilyGroup();
    setShowLeaveModal(false);
    refreshState();
    showToast('आप परिवार समूह से बाहर निकल गए हैं।');
  };

  const handleSendEmergencyAlert = () => {
    FamilyService.sendFamilyAlert(
      '🚨 मुझे सहायता चाहिए। कृपया मुझसे तुरंत संपर्क करें।',
      'EMERGENCY',
      attachLocationToAlert && deviceLocation ? deviceLocation.latitude : undefined,
      attachLocationToAlert && deviceLocation ? deviceLocation.longitude : undefined
    );
    setShowEmergencyAlertModal(false);
    refreshState();
    showToast('परिवार के सभी सदस्यों को आपातकालीन सहायता अलर्ट भेज दिया गया है।');
  };

  // Helper for location freshness
  const getLocationFreshness = (timeStr?: string) => {
    if (!timeStr) return { label: '⚪ पुरानी location', color: 'text-stone-400 bg-stone-100' };
    return { label: '🟢 अभी-अभी', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  // Convert member to LocationItem for navigation
  const handleNavigateToMember = (mem: FamilyGroupMember) => {
    if (!mem.lastLatitude || !mem.lastLongitude) {
      showToast('इस सदस्य की हाल की shared location उपलब्ध नहीं है।');
      return;
    }

    const memberLocationItem: LocationItem = {
      id: 'family_' + mem.id,
      name: `${mem.name} (परिवार सदस्य)`,
      nameEn: `${mem.name} (Family Member)`,
      category: 'other',
      latitude: mem.lastLatitude,
      longitude: mem.lastLongitude,
      distance: 'निकट',
      walkingTime: '~5 min',
      description: `अंतिम अपडेट: ${mem.lastLocationUpdatedAt || 'हाल ही में'}`,
      landmark: 'देव सूर्य मंदिर परिसर',
      x: 50,
      y: 50,
      status: 'सक्रिय',
    };

    startNavigation(memberLocationItem);
  };

  if (!FAMILY_SAFETY_BACKEND_AVAILABLE) {
    return (
      <div className="min-h-screen bg-[#FFF7E5] px-4 py-8 font-['Mukta',sans-serif]">
        <TopBar title="मेरा परिवार" showBack />
        <main className="mx-auto mt-6 max-w-lg rounded-3xl border border-[#075985]/15 bg-white p-6 text-center shadow-lg">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#FFF7E5] text-3xl">
            👨‍👩‍👧
          </div>
          <h1 className="text-xl font-black text-[#063B5C]">
            परिवार सुरक्षा अभी उपलब्ध नहीं है
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-700">
            इस build में परिवार समूह और लोकेशन साझा करने की सुविधा स्थायी, दूसरे डिवाइस से जुड़ी सेवा नहीं है।
            इसलिए इस स्क्रीन से कोई समूह, लोकेशन या आपातकालीन अलर्ट सक्रिय या भेजा नहीं जाता।
          </p>
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-950">
            परिवार-सुरक्षा backend, स्पष्ट सदस्य-सहमति और वास्तविक डिवाइस परीक्षण के बाद ही यह सुविधा चालू की जाएगी।
          </p>
          <button
            onClick={() => navigate('more')}
            className="mt-5 min-h-12 w-full rounded-xl bg-[#075985] px-4 text-sm font-black text-white"
          >
            अन्य सेवाएँ देखें
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--chhath-cream)] pb-20 flex flex-col font-['Mukta',sans-serif]">
      <TopBar title="मेरा परिवार" showBack />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 max-w-sm w-11/12 text-center animate-fade-in border border-amber-400">
          <span>🔔</span>
          <span className="flex-1">{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-3xl sm:max-w-4xl mx-auto w-full p-3 sm:p-6 space-y-4">
        {/* ======================================================== */}
        {/* HEADER HERO RIBBON                                       */}
        {/* ======================================================== */}
        <div className="bg-gradient-to-br from-[#075985] via-[#063B5C] to-[#04243A] text-white rounded-3xl p-4 shadow-md space-y-2 border border-[#FFB52E]/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">👨👩👧</span>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  {group ? group.name : 'मेरा परिवार'}
                </h2>
                <span className="text-xs text-[#FFF7E5]/90 block">
                  “अपने परिवार के सदस्यों से सुरक्षित रूप से जुड़े रहें।”
                </span>
              </div>
            </div>

            {group && (
              <span className="text-[11px] font-mono font-black bg-[#FFB52E]/20 border border-[#FFB52E]/60 px-2.5 py-1 rounded-xl text-[#FFB52E] shadow-xs">
                {group.inviteCode}
              </span>
            )}
          </div>

          <p className="text-[11px] text-[#FFF7E5]/80 leading-relaxed pt-0.5">
            छठ मेले की अपार भीड़ में परिजनों के साथ सुरक्षित रहें। स्थान साझा केवल आपके द्वारा अनुमोदित सदस्यों को ही दिखाई देता है।
          </p>

          {/* Offline Sync Banner if offline */}
          {!isOnline && (
            <div className="bg-[#031B2B]/90 border border-[#FFB52E]/40 p-2.5 rounded-2xl text-[11px] text-[#FFB52E] flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-[#FFB52E] shrink-0" />
              <span>Offline Mode: Location update इंटरनेट कनेक्शन उपलब्ध होने पर sync होगी।</span>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* NO GROUP STATE: CREATE OR JOIN                           */}
        {/* ======================================================== */}
        {!group ? (
          <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs space-y-4 text-center">
            <div className="w-14 h-14 bg-[#FFF7E5] text-[#075985] rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-xs border border-[#075985]/15">
              👨👩👧
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-stone-900">
                परिवार सुरक्षा समूह से जुड़ें
              </h3>
              <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
                मेले में बिछड़ने से बचने के लिए एक अस्थायी परिवार समूह बनाएं या परिवार कोड डालकर जुड़ें।
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => setShowCreateModal(true)}
                className="min-h-[48px] bg-[#075985] hover:bg-[#063B5C] active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-sm flex items-center justify-center gap-1.5 transition-all border border-[#075985]"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ समूह बनाएँ</span>
              </button>

              <button
                onClick={() => setShowJoinModal(true)}
                className="min-h-[48px] bg-white hover:bg-[#FFF7E5]/50 active:scale-95 text-[#075985] border-2 border-[#075985]/30 font-black text-xs sm:text-sm rounded-2xl shadow-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <span>🔑 कोड से जुड़ें</span>
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* ACTIVE GROUP CONTROLS BAR                                */
          /* ======================================================== */
          <div className="bg-white rounded-3xl p-3.5 border border-[#075985]/20 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#075985] block">
                  Family Invite Code
                </span>
                <span className="text-lg font-black text-stone-900 font-mono tracking-wider">
                  {group.inviteCode}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyCode}
                  className="min-h-[38px] px-3 bg-[#FFF7E5] hover:bg-amber-100/70 text-[#075985] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-[#075985]/20"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'कॉपी हुआ' : 'कोड कॉपी'}</span>
                </button>

                <button
                  onClick={handleShareCode}
                  className="min-h-[38px] px-3 bg-[#075985] hover:bg-[#063B5C] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share करें</span>
                </button>
              </div>
            </div>

            {/* Quick Location Sharing Status Card */}
            <div
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                isSharing
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-stone-50 border-stone-200 text-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isSharing ? 'bg-emerald-600 text-white' : 'bg-stone-300 text-stone-700'
                  }`}
                >
                  {isSharing ? <Radio className="w-5 h-5 animate-pulse" /> : <EyeOff className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black block truncate">
                    {isSharing ? '📍 Location Sharing: चालू है' : '📍 Location Sharing: बंद है'}
                  </span>
                  <span className="text-[11px] text-stone-500 block truncate">
                    {isSharing
                      ? `Sharing समाप्त होने का समय: ${expiryString || 'आज'}`
                      : 'आपकी location सदस्यों को नहीं दिख रही'}
                  </span>
                </div>
              </div>

              {isSharing ? (
                <button
                  onClick={handleStopSharing}
                  className="min-h-[36px] px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl active:scale-95 shadow-xs shrink-0"
                >
                  बंद करें
                </button>
              ) : (
                <button
                  onClick={() => setShowConsentModal(true)}
                  className="min-h-[36px] px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl active:scale-95 shadow-xs shrink-0"
                >
                  शुरू करें
                </button>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* NAVIGATION TAB BAR (5 Main Options)                      */}
        {/* ======================================================== */}
        {group && (
          <div className="grid grid-cols-5 gap-1 bg-stone-200/80 p-1 rounded-2xl text-[11px] font-black">
            <button
              onClick={() => setActiveTab('MEMBERS')}
              className={`py-2 px-1 rounded-xl transition-all ${
                activeTab === 'MEMBERS' ? 'bg-white text-[#075985] shadow-xs' : 'text-stone-600'
              }`}
            >
              👥 सदस्य ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('SHARING')}
              className={`py-2 px-1 rounded-xl transition-all ${
                activeTab === 'SHARING' ? 'bg-white text-[#075985] shadow-xs' : 'text-stone-600'
              }`}
            >
              📍 Sharing
            </button>
            <button
              onClick={() => setActiveTab('MAP')}
              className={`py-2 px-1 rounded-xl transition-all ${
                activeTab === 'MAP' ? 'bg-white text-[#075985] shadow-xs' : 'text-stone-600'
              }`}
            >
              🗺️ Map
            </button>
            <button
              onClick={() => setActiveTab('LOST_FLOW')}
              className={`py-2 px-1 rounded-xl transition-all ${
                activeTab === 'LOST_FLOW' ? 'bg-white text-rose-800 shadow-xs' : 'text-stone-600'
              }`}
            >
              🔎 लापता?
            </button>
            <button
              onClick={() => setActiveTab('ALERTS')}
              className={`py-2 px-1 rounded-xl transition-all ${
                activeTab === 'ALERTS' ? 'bg-white text-amber-900 shadow-xs' : 'text-stone-600'
              }`}
            >
              🔔 अलर्ट्स
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: MEMBERS LIST                                      */}
        {/* ======================================================== */}
        {group && activeTab === 'MEMBERS' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase tracking-wider text-stone-500">
                परिवार के सदस्य ({members.length})
              </span>
              <button
                onClick={() => setShowJoinModal(true)}
                className="text-xs font-bold text-[#075985] hover:text-[#063B5C] flex items-center gap-1"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ सदस्य जोड़ें</span>
              </button>
            </div>

            {members.map((mem) => {
              const isMe = mem.userId === FamilyService.getCurrentUserId();
              const freshness = getLocationFreshness(mem.lastLocationUpdatedAt);

              return (
                <div
                  key={mem.id}
                  className="bg-white rounded-3xl p-4 border border-stone-200/90 shadow-xs space-y-2.5 animate-fade-in"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-stone-900">
                          {mem.name} {isMe && '(आप)'}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF7E5] text-[#075985] border border-[#075985]/20">
                          {mem.role === 'OWNER' ? 'समूह संचालक' : 'सदस्य'}
                        </span>
                      </div>
                      <span className="text-xs text-stone-500">
                        शामिल हुए: {mem.joinedAt}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${freshness.color}`}
                    >
                      {freshness.label}
                    </span>
                  </div>

                  {/* Sharing status info */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          mem.locationSharingEnabled ? 'bg-emerald-500 animate-ping' : 'bg-stone-300'
                        }`}
                      />
                      <span className="font-bold text-stone-700">
                        Location Sharing: {mem.locationSharingEnabled ? 'ON' : 'OFF'}
                      </span>
                    </div>

                    {mem.lastLocationUpdatedAt && (
                      <span className="text-stone-500 font-mono text-[11px]">
                        अपडेट: {mem.lastLocationUpdatedAt}
                      </span>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                    {mem.locationSharingEnabled && mem.lastLatitude ? (
                      <button
                        onClick={() => handleNavigateToMember(mem)}
                        className="min-h-[38px] px-3 bg-[#FFF7E5] hover:bg-amber-100/70 text-[#075985] font-black text-xs rounded-xl flex items-center gap-1.5 border border-[#075985]/20 active:scale-95"
                      >
                        <Navigation className="w-3.5 h-3.5 text-[#075985]" />
                        <span>इस सदस्य तक रास्ता</span>
                      </button>
                    ) : (
                      <span className="text-xs text-stone-400 italic">
                        {isMe ? 'आपकी sharing बंद है' : 'स्थान साझा बंद है'}
                      </span>
                    )}

                    {!isMe && group.ownerId === FamilyService.getCurrentUserId() && (
                      <button
                        onClick={() => setMemberToRemove(mem)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 p-2"
                        title="सदस्य हटाएं"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Leave Group Button */}
            <div className="pt-2 text-center">
              <button
                onClick={() => setShowLeaveModal(true)}
                className="text-xs font-bold text-stone-500 hover:text-rose-700 flex items-center justify-center gap-1.5 mx-auto py-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>परिवार समूह से बाहर निकलें</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: SHARING SETTINGS & EXPIRATION                     */}
        {/* ======================================================== */}
        {group && activeTab === 'SHARING' && (
          <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF7E5] text-[#075985] flex items-center justify-center text-xl shrink-0 border border-[#075985]/15">
                📍
              </div>
              <div>
                <h4 className="text-base font-black text-stone-900">मेरी Location Sharing</h4>
                <p className="text-xs text-stone-500">
                  अस्थायी सुरक्षा साझाकरण (Permanent नहीं है)
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
              <span className="font-black block">🔒 गोपनीयता नियम:</span>
              <p className="leading-relaxed">
                “आपकी location केवल इस family group के approved members को दिखाई जाएगी। इसे किसी भी समय बंद किया जा सकता है।”
              </p>
            </div>

            {/* Duration selector */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-stone-600 block">
                स्थान साझा करने की अवधि चुनें:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '15 मिनट', val: 15 },
                  { label: '1 घंटा', val: 60 },
                  { label: '4 घंटे', val: 240 },
                  { label: 'आज तक (Midnight)', val: 720 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setSelectedDuration(item.val)}
                    className={`min-h-[46px] p-2.5 rounded-xl border text-xs font-black text-center transition-all ${
                      selectedDuration === item.val
                        ? 'bg-[#075985] text-white border-[#075985] shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Turn ON / OFF Buttons */}
            <div className="pt-2 space-y-2">
              {isSharing ? (
                <button
                  onClick={handleStopSharing}
                  className="w-full min-h-[50px] bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <EyeOff className="w-4 h-4" />
                  <span>🛑 Location Sharing बंद करें</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowConsentModal(true)}
                  className="w-full min-h-[50px] bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <RadioTower className="w-4 h-4" />
                  <span>Location Sharing शुरू करें</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: FAMILY MAP                                        */}
        {/* ======================================================== */}
        {group && activeTab === 'MAP' && (
          <div className="space-y-3 animate-fade-in">
            <div className="bg-white rounded-3xl p-4 border border-stone-200 shadow-xs space-y-1">
              <h4 className="text-base font-black text-stone-900 flex items-center gap-2">
                <span>🗺️ परिवार का Map</span>
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                केवल वही सदस्य प्रदर्शित हैं जिन्होंने स्थान साझाकरण चालू किया है। किसी की भी सटीक लोकेशन सार्वजनिक नहीं की जाती।
              </p>
            </div>

            <div className="h-[380px] rounded-3xl overflow-hidden shadow-md border border-stone-300">
              <DeoMap heightClass="h-full" showRouteLine={false} />
            </div>

            {/* List of active locations */}
            <div className="bg-white rounded-3xl p-4 border border-stone-200 shadow-xs space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-stone-500 block">
                नक्शे पर सक्रिय परिजन:
              </span>
              {members.filter((m) => m.locationSharingEnabled && m.lastLatitude).length === 0 ? (
                <p className="text-xs text-stone-500 italic py-2">
                  वर्तमान में किसी भी परिजन की live location सक्रिय नहीं है।
                </p>
              ) : (
                members
                  .filter((m) => m.locationSharingEnabled && m.lastLatitude)
                  .map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF7E5]/70 border border-[#075985]/20 text-xs"
                    >
                      <div>
                        <span className="font-black text-stone-900 block">{m.name}</span>
                        <span className="text-stone-500 text-[11px]">
                          अंतिम अपडेट: {m.lastLocationUpdatedAt || 'अभी'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleNavigateToMember(m)}
                        className="px-3 py-1.5 bg-[#075985] hover:bg-[#063B5C] text-white font-bold rounded-lg shadow-xs active:scale-95"
                      >
                        रास्ता देखें
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: LOST FAMILY MEMBER FLOW (Requirement 16)         */}
        {/* ======================================================== */}
        {group && activeTab === 'LOST_FLOW' && (
          <div className="bg-white rounded-3xl p-5 border-2 border-rose-300 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center gap-2.5 border-b border-rose-100 pb-3">
              <span className="text-2xl">🔎</span>
              <div>
                <h4 className="text-base font-black text-rose-950">
                  परिवार का सदस्य नहीं मिल रहा?
                </h4>
                <p className="text-xs text-rose-700">
                  “जिस सदस्य को ढूँढना है उसे चुनें।”
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-stone-600 block">
                लापता सदस्य का चयन करें:
              </label>
              <select
                onChange={(e) => {
                  const m = members.find((x) => x.id === e.target.value);
                  setSelectedLostMember(m || null);
                }}
                className="w-full min-h-[46px] px-3.5 rounded-2xl border border-stone-300 text-stone-900 font-bold text-sm bg-stone-50"
              >
                <option value="">-- सदस्य चुनें --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.userId === FamilyService.getCurrentUserId() ? '(आप)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedLostMember ? (
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <span className="text-sm font-black text-stone-900">
                    {selectedLostMember.name}
                  </span>
                  <span className="text-xs text-stone-500">
                    अंतिम अपडेट: {selectedLostMember.lastLocationUpdatedAt || 'उपलब्ध नहीं'}
                  </span>
                </div>

                {selectedLostMember.lastLatitude ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950">
                      <span className="font-black block">⚠️ महत्वपूर्ण सूचना:</span>
                      <p className="leading-relaxed">
                        “यह व्यक्ति चल रहा हो सकता है। Navigation शुरू करने से पहले location update देखें।”
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => navigate('map')}
                        className="min-h-[46px] bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <span>🗺️ Map पर देखें</span>
                      </button>

                      <button
                        onClick={() => handleNavigateToMember(selectedLostMember)}
                        className="min-h-[46px] bg-[#075985] hover:bg-[#063B5C] text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Compass className="w-4 h-4" />
                        <span>📍 वहाँ जाने का रास्ता</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-stone-100 rounded-xl text-xs text-stone-600 text-center space-y-1">
                    <p className="font-bold">इस सदस्य की हाल की shared location उपलब्ध नहीं है।</p>
                    <p className="text-[11px] text-stone-500">
                      कृपया खोया-पाया सहायता केंद्र या आपातकालीन हेल्प डेस्क पर संपर्क करें।
                    </p>
                    <button
                      onClick={() => navigate('lost-found')}
                      className="mt-2 px-3 py-1.5 bg-rose-700 text-white font-bold text-xs rounded-lg"
                    >
                      खोया-पाया केंद्र में रिपोर्ट करें
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: ALERTS & EMERGENCY FAMILY ALERT                   */}
        {/* ======================================================== */}
        {group && activeTab === 'ALERTS' && (
          <div className="space-y-3 animate-fade-in">
            {/* Top Red SOS Family Alert Button */}
            <button
              onClick={() => setShowEmergencyAlertModal(true)}
              className="w-full min-h-[58px] p-3.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl shadow-md flex items-center justify-between active:scale-98 transition-all border border-red-500"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-2xl animate-pulse">🚨</span>
                <div className="text-left">
                  <span className="text-sm font-black block">
                    🚨 परिवार को Alert भेजें
                  </span>
                  <span className="text-xs text-red-100">
                    “मुझे सहायता चाहिए” संदेश सभी सदस्यों तक तुरंत पहुँचाएँ
                  </span>
                </div>
              </div>
              <span className="text-xs font-black bg-white/20 px-2.5 py-1 rounded-xl">
                अलर्ट भेजें
              </span>
            </button>

            {/* Alerts History List */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-stone-500 px-1 block">
                अलर्ट इतिहास ({alerts.length})
              </span>

              {alerts.length === 0 ? (
                <div className="bg-white rounded-3xl p-6 text-center text-xs text-stone-500 border border-stone-200">
                  वर्तमान में कोई अलर्ट नहीं है।
                </div>
              ) : (
                alerts.map((alt) => (
                  <div
                    key={alt.id}
                    className={`bg-white rounded-2xl p-3 border shadow-xs space-y-1 ${
                      alt.type === 'EMERGENCY'
                        ? 'border-red-400 bg-red-50/50'
                        : 'border-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-stone-900">
                        {alt.senderName}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {alt.createdAt}
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 font-medium">{alt.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL 1: CREATE FAMILY GROUP                             */}
      {/* ======================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateGroup}
            className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in"
          >
            <div className="space-y-1">
              <h4 className="text-base font-black text-stone-900">
                नया परिवार समूह बनाएं
              </h4>
              <p className="text-xs text-stone-500">
                समूह का एक नाम रखें। यह समूह अस्थायी व सुरक्षित रहेगा।
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">
                Family Group Name (वैकल्पिक):
              </label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="उदा. हमारा Chhath परिवार"
                className="w-full min-h-[46px] px-3.5 rounded-2xl border border-stone-300 text-sm font-bold bg-stone-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="min-h-[46px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                className="min-h-[46px] bg-[#075985] hover:bg-[#063B5C] active:scale-95 text-white font-black text-xs rounded-xl shadow-md"
              >
                समूह बनाएं
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: JOIN FAMILY GROUP                               */}
      {/* ======================================================== */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleJoinGroup}
            className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in"
          >
            <div className="space-y-1">
              <h4 className="text-base font-black text-stone-900">
                क्या आप इस family group में शामिल होना चाहते हैं?
              </h4>
              <p className="text-xs text-stone-500">
                परिवार कोड और अपना नाम दर्ज करके समूह में जुड़ें।
              </p>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-xs font-bold text-stone-700">Family Code:</label>
                <input
                  type="text"
                  required
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="उदा. DEO-4291"
                  className="w-full min-h-[46px] px-3.5 rounded-2xl border border-stone-300 text-sm font-black font-mono tracking-wider bg-stone-50 uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700">आपका नाम:</label>
                <input
                  type="text"
                  required
                  value={joinNameInput}
                  onChange={(e) => setJoinNameInput(e.target.value)}
                  placeholder="उदा. रीना देवी / अमित कुमार"
                  className="w-full min-h-[46px] px-3.5 rounded-2xl border border-stone-300 text-sm font-bold bg-stone-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowJoinModal(false)}
                className="min-h-[46px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                className="min-h-[46px] bg-[#075985] hover:bg-[#063B5C] active:scale-95 text-white font-black text-xs rounded-xl shadow-md"
              >
                जुड़ें
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: EXPLICIT CONSENT BEFORE SHARING (Req 4)         */}
      {/* ======================================================== */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in text-center">
            <div className="w-12 h-12 bg-[#FFF7E5] text-[#075985] border border-[#075985]/20 rounded-full flex items-center justify-center mx-auto text-xl font-black">
              🔒
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-black text-stone-900">
                स्थान साझाकरण सहमति
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                “आपकी location केवल इस family group के approved members को दिखाई जाएगी।”
              </p>
              <p className="text-[11px] text-[#075985] font-bold bg-[#FFF7E5] border border-[#075985]/20 p-2 rounded-xl">
                अवधि: {selectedDuration === 15 ? '15 मिनट' : selectedDuration === 60 ? '1 घंटा' : selectedDuration === 240 ? '4 घंटे' : 'आज तक'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowConsentModal(false)}
                className="min-h-[46px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl"
              >
                अभी नहीं
              </button>
              <button
                onClick={handleStartSharing}
                className="min-h-[46px] bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-black text-xs rounded-xl shadow-md"
              >
                Location Sharing शुरू करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: REMOVE MEMBER CONFIRMATION                      */}
      {/* ======================================================== */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto text-xl">
              ⚠️
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-black text-stone-900">
                क्या आप इस सदस्य को family group से हटाना चाहते हैं?
              </h4>
              <p className="text-xs font-bold text-stone-600">
                {memberToRemove.name}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setMemberToRemove(null)}
                className="min-h-[46px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl"
              >
                रद्द करें
              </button>
              <button
                onClick={handleConfirmRemoveMember}
                className="min-h-[46px] bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md"
              >
                हटाएँ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: LEAVE FAMILY CONFIRMATION                       */}
      {/* ======================================================== */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto text-xl">
              🚪
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-black text-stone-900">
                क्या आप इस family group से बाहर निकलना चाहते हैं?
              </h4>
              <p className="text-xs text-stone-500">
                बाहर निकलने पर आपकी लोकेशन साझाकरण तुरंत समाप्त हो जाएगी।
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="min-h-[46px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl"
              >
                रद्द करें
              </button>
              <button
                onClick={handleConfirmLeave}
                className="min-h-[46px] bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md"
              >
                हाँ, बाहर निकलें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: EMERGENCY ALERT CONFIRMATION (Req 17)           */}
      {/* ======================================================== */}
      {showEmergencyAlertModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-2.5 border-b border-stone-100 pb-2">
              <span className="text-2xl">🚨</span>
              <h4 className="text-base font-black text-rose-800">
                क्या आप अपने family members को सहायता alert भेजना चाहते हैं?
              </h4>
            </div>

            <p className="text-xs text-stone-600">
              संदेश: <strong>“मुझे सहायता चाहिए।”</strong>
            </p>

            <label className="flex items-center gap-2 text-xs font-bold text-stone-800 bg-stone-50 p-2.5 rounded-xl border">
              <input
                type="checkbox"
                checked={attachLocationToAlert}
                onChange={(e) => setAttachLocationToAlert(e.target.checked)}
                className="accent-[#075985] rounded"
              />
              <span>वर्तमान GPS लोकेशन भी संदेश के साथ भेजें</span>
            </label>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowEmergencyAlertModal(false)}
                className="min-h-[46px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl"
              >
                रद्द करें
              </button>
              <button
                onClick={handleSendEmergencyAlert}
                className="min-h-[46px] bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md"
              >
                Alert भेजें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
