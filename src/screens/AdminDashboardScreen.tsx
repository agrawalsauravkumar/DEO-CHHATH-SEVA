/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AdminService, ManagedUser } from '../services/AdminService';
import { SyncService } from '../services/SyncService';
import { FacilityService } from '../services/FacilityService';
import { AnnouncementService } from '../services/AnnouncementService';
import { HelpService } from '../services/HelpService';
import { LostFoundService } from '../services/LostFoundService';
import { VolunteerService } from '../services/VolunteerService';
import { DeoMap } from '../components/DeoMap';
import { DeoChhathSevaLogo } from '../components/DeoChhathSevaLogo';
import { TeamManagementPanel } from '../components/TeamManagementPanel';
import { MusicManagementPanel } from '../components/MusicManagementPanel';
import {
  AdminRole,
  AdminDashboardStats,
  TimeFilterPeriod,
  Facility,
  FacilityCategory,
  OfficialAnnouncement,
  RouteAlert,
  HelpRequest,
  LostFoundReport,
  AuditLogItem,
} from '../types';
import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  LifeBuoy,
  Search,
  Car,
  Bus,
  HeartPulse,
  Droplet,
  MapPin,
  Megaphone,
  AlertTriangle,
  Users2,
  Map as MapIcon,
  ScrollText,
  Settings,
  Bell,
  RefreshCw,
  LogOut,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  SlidersHorizontal,
  Database,
  ArrowUpRight,
  Menu,
  X,
  Clock,
  Compass,
  Lock,
  Music,
} from 'lucide-react';

type AdminTab =
  | 'dashboard'
  | 'users'
  | 'volunteers'
  | 'help'
  | 'lost-found'
  | 'parking'
  | 'shuttle'
  | 'medical'
  | 'toilets'
  | 'water'
  | 'facilities'
  | 'announcements'
  | 'route-alerts'
  | 'family'
  | 'map'
  | 'audit'
  | 'settings'
  | 'team'
  | 'notifications'
  | 'analytics'
  | 'music';

export const AdminDashboardScreen: React.FC = () => {
  const { navigate } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilterPeriod>('TODAY');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [isValidatingSession, setIsValidatingSession] = useState<boolean>(true);
  const [isAdminSessionValid, setIsAdminSessionValid] = useState<boolean>(false);

  // Modals
  const [showAddFacilityModal, setShowAddFacilityModal] = useState<boolean>(false);
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState<boolean>(false);
  const [showAddRouteAlertModal, setShowAddRouteAlertModal] = useState<boolean>(false);

  // New facility form state
  const [newFacName, setNewFacName] = useState<string>('');
  const [newFacCategory, setNewFacCategory] = useState<FacilityCategory>('PARKING');
  const [newFacAddress, setNewFacAddress] = useState<string>('');
  const [newFacPhone, setNewFacPhone] = useState<string>('');
  const [newFacLatitude, setNewFacLatitude] = useState<string>('');
  const [newFacLongitude, setNewFacLongitude] = useState<string>('');

  // New announcement form state
  const [newAnnTitle, setNewAnnTitle] = useState<string>('');
  const [newAnnDesc, setNewAnnDesc] = useState<string>('');
  const [newAnnCategory, setNewAnnCategory] = useState<any>('GENERAL');
  const [newAnnPriority, setNewAnnPriority] = useState<any>('NORMAL');
  const [newAnnExpiresAt, setNewAnnExpiresAt] = useState<string>('');

  const currentAdmin = useMemo(() => AdminService.getCurrentAdmin(), []);
  const syncOperationalData = async () => {
    const role = currentAdmin?.role;
    const syncs: Promise<unknown>[] = [
      AdminService.syncDashboardData(),
      FacilityService.syncFacilities(),
    ];
    if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'HELP_ADMIN') {
      syncs.push(HelpService.syncHelpRequests());
    }
    if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'CONTENT_ADMIN') {
      syncs.push(AnnouncementService.syncAnnouncements(true));
    }
    if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'FACILITY_ADMIN') {
      syncs.push(VolunteerService.syncAdminVolunteers());
    }
    await Promise.all(syncs);
  };
  const hasAdminAccess = Boolean(
    isAdminSessionValid &&
    currentAdmin &&
    ['SUPER_ADMIN', 'ADMIN', 'CONTENT_ADMIN', 'FACILITY_ADMIN', 'HELP_ADMIN'].includes(currentAdmin.role)
  );

  useEffect(() => {
    let isMounted = true;
    AdminService.validateCurrentSession()
      .then((isValid) => {
        if (isMounted) {
          setIsAdminSessionValid(isValid);
          setIsValidatingSession(false);
        }
      })
      .catch(() => {
        AdminService.logout();
        if (isMounted) setIsValidatingSession(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (!isAdminSessionValid) return;
    let isMounted = true;
    syncOperationalData()
      .then(() => {
        if (isMounted) setRefreshTrigger((prev) => prev + 1);
      })
      .catch((error: unknown) => {
        if (isMounted) {
          showToast(`डेटा लोड नहीं हुआ: ${error instanceof Error ? error.message : 'सर्वर त्रुटि'}`);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [isAdminSessionValid]);

  const handleLogout = () => {
    AdminService.logout();
    localStorage.removeItem('deo_chhath_saved_user_screen');
    sessionStorage.removeItem('deo_chhath_current_screen');
    navigate('admin-login');
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      await syncOperationalData();
      let message = 'प्रशासन, सुविधा, सूचना, सहायता और स्वयंसेवक डेटा सिंक हुआ।';
      if (SyncService.isConfigured()) {
        const res = await SyncService.performFullSync();
        message = `${message} ${res.message}`;
      }
      showToast(message);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      showToast('सिंक त्रुटि: ' + (error instanceof Error ? error.message : 'असफल'));
    } finally {
      setIsSyncing(false);
    }
  };

  // Stats computation
  const stats: AdminDashboardStats = useMemo(() => {
    return AdminService.getDashboardStats(timeFilter);
  }, [timeFilter, refreshTrigger]);

  const managedUsers = useMemo(() => AdminService.getUsers(), [refreshTrigger]);
  const auditLogs = useMemo(() => AdminService.getAuditLogs(), [refreshTrigger]);
  const notifications = useMemo(() => AdminService.getNotifications(), [refreshTrigger]);
  const facilities = useMemo(() => FacilityService.getAllFacilities(), [refreshTrigger]);
  const announcements = useMemo(() => AnnouncementService.getAllAnnouncements(), [refreshTrigger]);
  const routeAlerts = useMemo(() => AnnouncementService.getAllRouteAlerts(), [refreshTrigger]);
  const helpRequests = useMemo(() => HelpService.getHelpRequests(), [refreshTrigger]);
  const volunteers = useMemo(() => VolunteerService.getAllVolunteers(), [refreshTrigger]);
  const lostFoundReports = useMemo(() => LostFoundService.getAllPublicReports(), [refreshTrigger]);

  // Sidebar item list
  const sidebarItems: { id: AdminTab; label: string; icon: any; count?: number; badge?: string }[] = [
    { id: 'dashboard', label: 'डैशबोर्ड ओवरव्यू', icon: LayoutDashboard },
    { id: 'users', label: 'उपयोगकर्ता (Users)', icon: Users },
    { id: 'volunteers', label: 'स्वयंसेवक (Volunteers)', icon: HeartHandshake },
    { id: 'help', label: 'सहायता अनुरोध (Help Requests)', icon: LifeBuoy },
    { id: 'lost-found', label: 'खोया-पाया (Lost & Found)', icon: Search },
    { id: 'parking', label: 'पार्किंग प्रबंधन (Parking)', icon: Car },
    { id: 'shuttle', label: 'शटल सेवा (Shuttle)', icon: Bus },
    { id: 'medical', label: 'चिकित्सा शिविर (Medical)', icon: HeartPulse },
    { id: 'toilets', label: 'शौचालय सुविधाएं (Toilets)', icon: Users2 },
    { id: 'water', label: 'पेयजल केंद्र (Water)', icon: Droplet },
    { id: 'facilities', label: 'समग्र सुविधाएं (All Facilities)', icon: MapPin },
    { id: 'announcements', label: 'आधिकारिक सूचनाएं (Announcements)', icon: Megaphone },
    { id: 'route-alerts', label: 'मार्ग प्रतिबंध (Route Alerts)', icon: AlertTriangle },
    { id: 'family', label: 'परिवार / सुरक्षा रिपोर्ट', icon: Users },
    ...(currentAdmin && ['SUPER_ADMIN', 'ADMIN', 'CONTENT_ADMIN'].includes(currentAdmin.role)
      ? [
          { id: 'team' as const, label: 'हमारी टीम प्रबंधन', icon: Users2 },
          { id: 'music' as const, label: 'छठ संगीत प्रबंधन', icon: Music },
        ]
      : []),
    { id: 'notifications', label: 'सूचनाएँ (Notifications)', icon: Bell },
    { id: 'analytics', label: 'विश्लेषण (Analytics)', icon: LayoutDashboard },
    { id: 'map', label: 'एडमिन मैप पैनल (Admin Map)', icon: MapIcon },
    { id: 'audit', label: 'ऑडिट लॉग्स (Audit Logs)', icon: ScrollText },
    { id: 'settings', label: 'सिस्टम व PostGIS सेटिंग्स', icon: Settings },
  ];

  const handleCreateFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacName.trim()) return;
    const latitude = Number(newFacLatitude);
    const longitude = Number(newFacLongitude);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      showToast('कृपया सुविधा के सही अक्षांश और देशांतर दर्ज करें।');
      return;
    }
    try {
      await FacilityService.addFacility({
        name: newFacName.trim(),
        category: newFacCategory,
        latitude,
        longitude,
        address: newFacAddress.trim(),
        description: '',
        verified: true,
        active: true,
        phone: newFacPhone.trim() || undefined,
        source: 'ADMIN_VERIFIED',
      });
      setNewFacName('');
      setNewFacAddress('');
      setNewFacPhone('');
      setNewFacLatitude('');
      setNewFacLongitude('');
      setShowAddFacilityModal(false);
      setRefreshTrigger((prev) => prev + 1);
      showToast('नई सुविधा सर्वर पर सफलतापूर्वक जोड़ी गई।');
    } catch (error) {
      showToast(`सुविधा नहीं जोड़ी गई: ${error instanceof Error ? error.message : 'सर्वर त्रुटि'}`);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnDesc.trim()) return;
    const expiryTimestamp = new Date(newAnnExpiresAt).getTime();
    if (!Number.isFinite(expiryTimestamp) || expiryTimestamp <= Date.now()) {
      showToast('प्रकाशन से आगे की वैध समाप्ति तिथि चुनें।');
      return;
    }

    try {
      await AnnouncementService.addAnnouncement({
        title: newAnnTitle.trim(),
        shortDescription: newAnnDesc.trim(),
        category: newAnnCategory,
        priority: newAnnPriority,
        isVerifiedOfficial: true,
        publishedTime: 'अभी प्रकाशित',
        lastUpdatedTime: 'अभी',
        source: currentAdmin?.fullName || 'मेला नियंत्रण कक्ष',
        badgeText: 'VERIFIED OFFICIAL',
        isActive: true,
        expiresAt: new Date(expiryTimestamp).toISOString(),
      });
      setNewAnnTitle('');
      setNewAnnDesc('');
      setNewAnnExpiresAt('');
      setShowAddAnnouncementModal(false);
      setRefreshTrigger((prev) => prev + 1);
      showToast('आधिकारिक सूचना सर्वर पर प्रकाशित हुई।');
    } catch (error) {
      showToast(`सूचना प्रकाशित नहीं हुई: ${error instanceof Error ? error.message : 'सर्वर त्रुटि'}`);
    }
  };

  if (isValidatingSession) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FFF7E5] p-6 text-center">
        <p className="text-sm font-bold text-[#063B5C]">प्रशासनिक सत्र सत्यापित हो रहा है…</p>
      </main>
    );
  }

  if (!hasAdminAccess) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FFF7E5] p-6 text-center">
        <section className="max-w-md rounded-3xl border border-[#075985]/15 bg-white p-7 shadow-xl">
          <DeoChhathSevaLogo size={72} className="mx-auto mb-4" />
          <h1 className="text-xl font-black text-[#063B5C]">व्यवस्थापक प्रवेश आवश्यक</h1>
          <p className="mt-2 text-sm text-stone-700">
            यह व्यवस्थापक क्षेत्र केवल अधिकृत व्यवस्थापक खाते के लिए है।
          </p>
          <button
            type="button"
            onClick={() => navigate('admin-login')}
            className="mt-5 min-h-[48px] rounded-xl bg-[#075985] px-5 font-bold text-white"
          >
            व्यवस्थापक लॉगिन
          </button>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex font-['Mukta',sans-serif] text-stone-900 select-none overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-stone-900 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-amber-400 animate-fade-in">
          <span>🔔</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. ADMIN SIDEBAR (Responsive, Desktop-First, Tablet-Friendly) */}
      {/* ============================================================ */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } shrink-0 bg-[#063B5C] text-[#FFF7E5] flex flex-col justify-between border-r border-[#075985] transition-all duration-200 z-30 min-h-screen sticky top-0`}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="p-4 border-b border-white/15 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <DeoChhathSevaLogo size={36} className="shrink-0 drop-shadow-md" />
              {sidebarOpen && (
                <div className="min-w-0">
                  <h2 className="text-sm font-black text-white tracking-wide truncate">
                    DEO CHHATH SEVA
                  </h2>
                  <p className="text-[10px] text-amber-400 font-black truncate">
                    NEXTGEN DEVBHOOMI FOUNDATION
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              title={sidebarOpen ? 'साइडबार समेटें' : 'साइडबार खोलें'}
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Items List */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 no-scrollbar text-xs">
            {sidebarItems.map((item) => {
              const active = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all text-left group ${
                    active
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'text-[#FFF7E5]/90 hover:bg-white/10 hover:text-white'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-stone-950' : 'text-amber-400'}`} />
                  {sidebarOpen && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="truncate">{item.label}</span>
                      {item.badge ? (
                        <span className="text-[9px] bg-purple-900/80 text-purple-200 px-1.5 py-0.5 rounded font-black">
                          {item.badge}
                        </span>
                      ) : item.count !== undefined ? (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                            active ? 'bg-stone-950/20 text-stone-950' : 'bg-white/10 text-[#FFF7E5]/80'
                          }`}
                        >
                          {item.count}
                        </span>
                      ) : null}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Current Admin Footer Profile */}
          <div className="p-3 border-t border-stone-800/80 bg-stone-950/40 text-xs">
            {sidebarOpen ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black text-xs flex items-center justify-center shrink-0">
                    ADM
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-black text-white text-xs block truncate leading-tight">
                      {currentAdmin?.fullName || 'Super Administrator'}
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold block truncate">
                      {currentAdmin?.role || 'SUPER_ADMIN'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => navigate('home')}
                    className="flex-1 py-1.5 px-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3 text-amber-400" />
                    <span>पब्लिक ऐप</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="py-1.5 px-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                    title="लॉगआउट"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => navigate('home')}
                  className="p-2 text-stone-400 hover:text-white"
                  title="पब्लिक ऐप"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-rose-400 hover:text-rose-200"
                  title="लॉगआउट"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MAIN CONTENT AREA                                         */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="bg-gradient-to-r from-[#FFF7E5] via-white to-[#FFF7E5] border-b-2 border-[#FFB52E] px-4 sm:px-6 py-3 sticky top-0 z-20 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black text-[#063B5C] tracking-tight truncate">
                {sidebarItems.find((s) => s.id === activeTab)?.label || 'व्यवस्थापक डैशबोर्ड'}
              </h1>
              <p className="hidden sm:block truncate text-[10px] font-bold tracking-wide text-[#8D6E63]">
                NEXTGEN DEVBHOOMI FOUNDATION • DEO CHHATH SEVA
              </p>
            </div>

            {/* Time Filter Dropdown (Requirement 23) */}
            <div className="hidden sm:flex items-center gap-1 text-xs">
              <span className="text-stone-400">•</span>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="bg-stone-50 border border-stone-200 text-stone-700 text-xs font-bold rounded-lg px-2 py-1 focus:outline-hidden"
              >
                <option value="TODAY">📅 आज (Today)</option>
                <option value="LAST_7_DAYS">पिछला 7 दिन</option>
                <option value="LAST_30_DAYS">पिछला 30 दिन</option>
                <option value="FESTIVAL_PERIOD">छठ महापर्व अवधि</option>
              </select>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Sync Button (Requirement 30) */}
            <button
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 text-xs font-bold rounded-xl border border-stone-200 flex items-center gap-1.5 transition-all shadow-2xs"
              title="डेटाबेस व पब्लिक ऐप सिंक करें"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">{isSyncing ? 'सिंक हो रहा है…' : 'सिंक (Sync)'}</span>
            </button>

            {/* Notifications Bell */}
            <button
              onClick={() => setShowNotificationsDrawer(!showNotificationsDrawer)}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 relative active:scale-95 transition-colors"
              title="व्यवस्थापक सूचनाएं"
            >
              <Bell className="w-4 h-4" />
              {notifications.some((n) => !n.isRead) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {/* Quick public app shortcut */}
            <button
              onClick={() => navigate('home')}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">पब्लिक ऐप देखें</span>
            </button>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-6 space-y-5 max-w-7xl w-full mx-auto">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5">
              {/* DEMO DATA Banner per Requirement 2 & 32 */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-3.5 sm:p-4 text-xs shadow-xs flex items-start justify-between gap-3 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 font-black text-sm flex items-center justify-center shrink-0">
                    ⚠️
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-amber-950 text-sm">
                        डेवलपमेंट एवं परीक्षण मोड (DEMO DATA ACTIVE)
                      </span>
                      <span className="bg-amber-200 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300">
                        DEMO DATA
                      </span>
                    </div>
                    <p className="text-stone-700 font-medium leading-relaxed">
                      यह डैशबोर्ड स्थानीय परीक्षण डेटा दिखाता है। अधिकृत वास्तविक डेटा स्रोत उपलब्ध होने तक इन संख्याओं को संचालन या निर्णय के लिए उपयोग न करें।
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right text-[11px] text-stone-500">
                  <span>अंतिम अपडेट: <strong>{stats.lastUpdated}</strong></span>
                </div>
              </div>

              {/* Local seeded figures stay explicitly marked as demo data. */}
              <section aria-label="मुख्य सांख्यिकी — डेमो डेटा" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  { label: 'कुल उपयोगकर्ता', val: stats.totalUsers, icon: '👥' },
                  { label: 'सक्रिय स्वयंसेवक', val: stats.verifiedVolunteers, icon: '🙋' },
                  { label: 'लंबित सहायता अनुरोध', val: stats.activeHelpRequests, icon: '🆘' },
                  { label: 'खुले खोया-पाया मामले', val: stats.activeLostFound, icon: '🔎' },
                  { label: 'सुविधाएँ', val: facilities.length, icon: '📍' },
                  { label: 'घोषणाएँ', val: announcements.length, icon: '📢' },
                  { label: 'मार्ग अलर्ट', val: routeAlerts.length, icon: '🚧' },
                ].map((c, idx) => (
                  <div
                    key={idx}
                    className="space-y-2 rounded-2xl border border-[#075985]/15 bg-[#FFF7E5] p-3.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{c.icon}</span>
                      <span className="rounded-full border border-[#8D6E63]/30 bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#063B5C]">Demo Data</span>
                    </div>
                    <div className="text-2xl font-black text-[#063B5C]">{c.val}</div>
                    <div className="truncate text-xs font-bold text-stone-700">{c.label}</div>
                  </div>
                ))}
              </section>

              {/* Quick Actions & Recent Audit Log */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Quick Actions Panel */}
                <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-3">
                  <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                    <span>त्वरित व्यवस्थापक कार्य (Quick Actions)</span>
                  </h3>

                  <div className="space-y-2">
                    <button
                      onClick={() => setShowAddAnnouncementModal(true)}
                      className="w-full p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs rounded-xl border border-amber-200 flex items-center justify-between text-left transition-all active:scale-98"
                    >
                      <span className="flex items-center gap-2">
                        <span>📢</span>
                        <span>नई आधिकारिक सूचना प्रकाशित करें</span>
                      </span>
                      <Plus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setShowAddFacilityModal(true)}
                      className="w-full p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-950 font-bold text-xs rounded-xl border border-blue-200 flex items-center justify-between text-left transition-all active:scale-98"
                    >
                      <span className="flex items-center gap-2">
                        <span>📍</span>
                        <span>नई जनसुविधा जोड़ें (पार्किंग/चिकित्सा/जल)</span>
                      </span>
                      <Plus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setActiveTab('volunteers')}
                      className="w-full p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold text-xs rounded-xl border border-emerald-200 flex items-center justify-between text-left transition-all active:scale-98"
                    >
                      <span className="flex items-center gap-2">
                        <span>🙋</span>
                        <span>लंबित स्वयंसेवक आवेदन सत्यापित करें</span>
                      </span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setActiveTab('route-alerts')}
                      className="w-full p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-950 font-bold text-xs rounded-xl border border-rose-200 flex items-center justify-between text-left transition-all active:scale-98"
                    >
                      <span className="flex items-center gap-2">
                        <span>🚧</span>
                        <span>मार्ग प्रतिबंध व डायवर्जन जारी करें</span>
                      </span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Audit Logs Summary (Requirement 21) */}
                <div className="lg:col-span-2 bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                      <ScrollText className="w-4 h-4 text-indigo-600" />
                      <span>ताज़ा ऑडिट लॉग्स (Recent Audit Logs)</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('audit')}
                      className="text-xs font-bold text-indigo-700 hover:underline"
                    >
                      सभी देखें →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-stone-400 font-bold border-b border-stone-100">
                          <th className="py-2 pr-3">समय</th>
                          <th className="py-2 pr-3">यूज़र</th>
                          <th className="py-2 pr-3">कार्यवाही (Action)</th>
                          <th className="py-2 pr-3">एंटिटी</th>
                          <th className="py-2">विवरण</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                        {auditLogs.slice(0, 4).map((log) => (
                          <tr key={log.id} className="hover:bg-stone-50">
                            <td className="py-2.5 pr-3 text-stone-500 text-[11px] whitespace-nowrap">
                              {log.timestamp}
                            </td>
                            <td className="py-2.5 pr-3 font-bold text-stone-900 whitespace-nowrap">
                              {log.userName}
                            </td>
                            <td className="py-2.5 pr-3">
                              <span className="px-2 py-0.5 rounded-md bg-stone-100 font-mono text-[10px] font-bold text-stone-800">
                                {log.action}
                              </span>
                            </td>
                            <td className="py-2.5 pr-3 text-stone-600">{log.entity}</td>
                            <td className="py-2.5 text-stone-600 truncate max-w-xs">
                              {log.newValueSummary || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS MANAGEMENT (Requirement 4) */}
          {activeTab === 'users' && (
            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-stone-900">👥 उपयोगकर्ता प्रबंधन (User Directory)</h3>
                  <p className="text-xs text-stone-500 font-semibold">
                    नोट: गोपनीयता सुरक्षा नियम के अनुसार परिजनों के निजी GPS निर्देशांक एडमिन को भी सीधे नहीं दिखेंगे।
                  </p>
                </div>
                <div className="text-xs font-bold text-stone-600">कुल यूजर्स: {managedUsers.length}</div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-stone-400 font-bold border-b border-stone-100">
                      <th className="py-2.5 pr-3">User ID</th>
                      <th className="py-2.5 pr-3">नाम</th>
                      <th className="py-2.5 pr-3">फोन / संपर्क</th>
                      <th className="py-2.5 pr-3">रोल</th>
                      <th className="py-2.5 pr-3">स्थिति</th>
                      <th className="py-2.5 pr-3">पंजीकरण</th>
                      <th className="py-2">कार्यवाही</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                    {managedUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-stone-50">
                        <td className="py-3 pr-3 font-mono text-[11px] text-stone-500">{u.id}</td>
                        <td className="py-3 pr-3 font-black text-stone-900">{u.name}</td>
                        <td className="py-3 pr-3 text-stone-600">{u.phone}</td>
                        <td className="py-3 pr-3">
                          <span className="px-2 py-0.5 rounded bg-stone-100 text-[10px] font-bold">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 pr-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 pr-3 text-stone-500">{u.joinedAt}</td>
                        <td className="py-3">
                          {u.status === 'ACTIVE' ? (
                            <button
                              onClick={async () => {
                                try {
                                  await AdminService.updateUserStatus(u.id, 'SUSPENDED');
                                  setRefreshTrigger((prev) => prev + 1);
                                  showToast(`${u.name} को निलंबित किया गया।`);
                                } catch (error) {
                                  showToast(`स्थिति अपडेट असफल: ${error instanceof Error ? error.message : 'सर्वर त्रुटि'}`);
                                }
                              }}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-xs font-bold border border-rose-200"
                            >
                              निलंबित करें
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                try {
                                  await AdminService.updateUserStatus(u.id, 'ACTIVE');
                                  setRefreshTrigger((prev) => prev + 1);
                                  showToast(`${u.name} को पुनः सक्रिय किया गया।`);
                                } catch (error) {
                                  showToast(`स्थिति अपडेट असफल: ${error instanceof Error ? error.message : 'सर्वर त्रुटि'}`);
                                }
                              }}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200"
                            >
                              सक्रिय करें
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: VOLUNTEERS MANAGEMENT (Requirement 5) */}
          {activeTab === 'volunteers' && (
            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-stone-900">🙋 स्वयंसेवक प्रबंधन (Volunteer Registry)</h3>
                  <p className="text-xs text-stone-500">
                    सत्यापन, सेवा क्षेत्र आवंटन एवं ड्यूटी स्थिति नियंत्रण।
                  </p>
                </div>
                <span className="bg-emerald-100 text-emerald-900 font-black text-xs px-3 py-1 rounded-xl">
                  {volunteers.filter((volunteer) => volunteer.verificationStatus === 'VERIFIED').length} सत्यापित स्वयंसेवक
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-stone-400 font-bold border-b border-stone-100">
                      <th className="py-2.5 pr-3">बैज / ID</th>
                      <th className="py-2.5 pr-3">नाम</th>
                      <th className="py-2.5 pr-3">फोन</th>
                      <th className="py-2.5 pr-3">सेवा क्षेत्र</th>
                      <th className="py-2.5 pr-3">स्थिति</th>
                      <th className="py-2">कार्यवाही</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                    {volunteers.map((v) => (
                      <tr key={v.id} className="hover:bg-stone-50">
                        <td className="py-3 pr-3 font-mono text-[11px] text-amber-800 font-bold">{v.badge}</td>
                        <td className="py-3 pr-3 font-black text-stone-900">{v.name}</td>
                        <td className="py-3 pr-3 text-stone-600">{v.phone}</td>
                        <td className="py-3 pr-3 text-stone-700 font-semibold">{v.serviceArea}</td>
                        <td className="py-3 pr-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              v.verificationStatus === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {v.verificationStatus}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1.5">
                            {v.verificationStatus === 'PENDING' && (
                              <button
                                onClick={async () => {
                                  try {
                                    await VolunteerService.adminVerifyVolunteer(v.id, 'VERIFIED');
                                    await VolunteerService.syncAdminVolunteers();
                                    setRefreshTrigger((prev) => prev + 1);
                                    showToast(`${v.name} को सर्वर पर सत्यापित किया गया।`);
                                  } catch (error) {
                                    showToast(`सत्यापन असफल: ${error instanceof Error ? error.message : 'सर्वर त्रुटि'}`);
                                  }
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                              >
                                सत्यापित करें
                              </button>
                            )}
                            {v.verificationStatus !== 'SUSPENDED' && (
                              <button
                                onClick={async () => {
                                  try {
                                    await VolunteerService.adminVerifyVolunteer(v.id, 'SUSPENDED');
                                    await VolunteerService.syncAdminVolunteers();
                                    setRefreshTrigger((prev) => prev + 1);
                                    showToast(`${v.name} को सर्वर पर निलंबित किया गया।`);
                                  } catch (error) {
                                    showToast(`निलंबन असफल: ${error instanceof Error ? error.message : 'सर्वर त्रुटि'}`);
                                  }
                                }}
                                className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold"
                              >
                                निलंबित
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: HELP REQUESTS MANAGEMENT (Requirement 6) */}
          {activeTab === 'help' && (
            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-stone-900">🆘 सहायता अनुरोध प्रबंधन (Help Desk)</h3>
                  <p className="text-xs text-stone-500">श्रद्धालुओं द्वारा भेजे गए आपात व सामान्य सहायता अनुरोध।</p>
                </div>
                <div className="text-xs font-bold text-stone-600">कुल सक्रिय अनुरोध: {helpRequests.length}</div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-stone-400 font-bold border-b border-stone-100">
                      <th className="py-2.5 pr-3">अनुरोध ID</th>
                      <th className="py-2.5 pr-3">प्रकार</th>
                      <th className="py-2.5 pr-3">विवरण</th>
                      <th className="py-2.5 pr-3">नाम / फोन</th>
                      <th className="py-2.5 pr-3">स्थिति</th>
                      <th className="py-2">कार्यवाही</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                    {helpRequests.map((hr) => (
                      <tr key={hr.id} className="hover:bg-stone-50">
                        <td className="py-3 pr-3 font-mono text-[11px] text-stone-500">{hr.id}</td>
                        <td className="py-3 pr-3 font-black text-stone-900">{hr.type}</td>
                        <td className="py-3 pr-3 text-stone-700 max-w-xs truncate">{hr.description}</td>
                        <td className="py-3 pr-3 text-stone-600">
                          {hr.userName || 'अज्ञात'} {hr.userPhone ? `(${hr.userPhone})` : ''}
                        </td>
                        <td className="py-3 pr-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900">
                            {hr.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={async () => {
                                try {
                                  await HelpService.updateHelpRequestStatus(hr.id, 'समाधान किया गया');
                                  setRefreshTrigger((prev) => prev + 1);
                                  showToast(`अनुरोध #${hr.id} सर्वर पर समाधान चिन्हित किया गया।`);
                                } catch (error) {
                                  showToast(`समाधान अपडेट असफल: ${error instanceof Error ? error.message : 'सर्वर त्रुटि'}`);
                                }
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                            >
                              समाधान करें
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: LOST & FOUND MANAGEMENT (Requirement 7) */}
          {activeTab === 'lost-found' && (
            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-stone-900">🔎 खोया-पाया प्रबंधन (Lost & Found Registry)</h3>
                  <p className="text-xs text-stone-500">सुरक्षा, सत्यापन एवं सुपुर्दगी रिकॉर्ड्स।</p>
                </div>
                <div className="text-xs font-bold text-stone-600">कुल रिपोर्ट्स: {lostFoundReports.length}</div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-stone-400 font-bold border-b border-stone-100">
                      <th className="py-2.5 pr-3">Report ID</th>
                      <th className="py-2.5 pr-3">प्रकार (Type)</th>
                      <th className="py-2.5 pr-3">शीर्षक / विवरण</th>
                      <th className="py-2.5 pr-3">स्थान</th>
                      <th className="py-2.5 pr-3">स्थिति</th>
                      <th className="py-2">कार्यवाही</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                    {lostFoundReports.map((r: LostFoundReport) => (
                      <tr key={r.id} className="hover:bg-stone-50">
                        <td className="py-3 pr-3 font-mono text-[11px] font-black text-amber-900">{r.reportId}</td>
                        <td className="py-3 pr-3 font-bold text-stone-800">{r.type}</td>
                        <td className="py-3 pr-3 text-stone-900 max-w-xs truncate">{r.title}</td>
                        <td className="py-3 pr-3 text-stone-600">{r.location}</td>
                        <td className="py-3 pr-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-900">
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => {
                              AdminService.recordAuditLog('LOST_FOUND_RESOLVED', 'LostFound', r.reportId, r.status, 'RESOLVED');
                              showToast(`रिपोर्ट ${r.reportId} का समाधान दर्ज हुआ।`);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                          >
                            सुपुर्दगी दर्ज करें
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 11: ALL FACILITIES (Requirement 13) */}
          {(activeTab === 'facilities' ||
            activeTab === 'parking' ||
            activeTab === 'shuttle' ||
            activeTab === 'medical' ||
            activeTab === 'toilets' ||
            activeTab === 'water') && (
            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    📍 जनसुविधा प्रबंधन ({activeTab.toUpperCase()})
                  </h3>
                  <p className="text-xs text-stone-500">
                    अधिकृत और सत्यापित सुविधाएं (सॉफ्ट डिलीट व आर्काइव सपोर्ट के साथ)।
                  </p>
                </div>
                <button
                  onClick={() => setShowAddFacilityModal(true)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>नई सुविधा जोड़ें</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-stone-400 font-bold border-b border-stone-100">
                      <th className="py-2.5 pr-3">सुविधा का नाम</th>
                      <th className="py-2.5 pr-3">श्रेणी</th>
                      <th className="py-2.5 pr-3">पता / लैंडमार्क</th>
                      <th className="py-2.5 pr-3">GPS स्थिति</th>
                      <th className="py-2.5 pr-3">सत्यापन</th>
                      <th className="py-2">कार्यवाही</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                    {facilities
                      .filter((f: Facility) => {
                        if (activeTab === 'parking') return f.category === 'PARKING';
                        if (activeTab === 'shuttle') return f.category === 'SHUTTLE';
                        if (activeTab === 'medical') return f.category === 'MEDICAL';
                        if (activeTab === 'toilets') return f.category === 'TOILET';
                        if (activeTab === 'water') return f.category === 'WATER';
                        return true;
                      })
                      .map((fac: Facility) => (
                        <tr key={fac.id} className="hover:bg-stone-50">
                          <td className="py-3 pr-3 font-black text-stone-900">{fac.name}</td>
                          <td className="py-3 pr-3">
                            <span className="px-2 py-0.5 rounded bg-stone-100 font-bold text-[10px]">
                              {fac.category}
                            </span>
                          </td>
                          <td className="py-3 pr-3 text-stone-600 max-w-xs truncate">{fac.address}</td>
                          <td className="py-3 pr-3 font-mono text-[11px] text-stone-500">
                            {fac.latitude.toFixed(4)}, {fac.longitude.toFixed(4)}
                          </td>
                          <td className="py-3 pr-3">
                            {fac.verified ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> सत्यापित
                              </span>
                            ) : (
                              <span className="text-amber-700 font-bold">लंबित</span>
                            )}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={async () => {
                                  try {
                                    await FacilityService.archiveFacility(fac.id);
                                    setRefreshTrigger((prev) => prev + 1);
                                    showToast(`${fac.name} सर्वर पर आर्काइव किया गया।`);
                                  } catch (error) {
                                    showToast(`आर्काइव असफल: ${error instanceof Error ? error.message : 'सर्वर त्रुटि'}`);
                                  }
                                }}
                                className="p-1 text-stone-500 hover:text-stone-800 rounded"
                                title="आर्काइव"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 12: ANNOUNCEMENTS (Requirement 14) */}
          {activeTab === 'announcements' && (
            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-stone-900">📢 आधिकारिक सूचना प्रबंधन (Official Announcements)</h3>
                  <p className="text-xs text-stone-500">
                    ड्राफ्ट, अनुमोदन, प्रकाशन एवं वैधता अवधि नियंत्रण।
                  </p>
                </div>
                <button
                  onClick={() => setShowAddAnnouncementModal(true)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>नई सूचना जारी करें</span>
                </button>
              </div>

              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                          {ann.category}
                        </span>
                        <span className="text-xs font-bold text-stone-500">• {ann.priority}</span>
                        {ann.isVerifiedOfficial && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                            ✅ VERIFIED OFFICIAL
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-stone-900">{ann.title}</h4>
                      <p className="text-xs text-stone-600">{ann.shortDescription}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-stone-400 font-bold">{ann.publishedTime}</span>
                      <button
                        onClick={async () => {
                          try {
                            await AnnouncementService.setAnnouncementActive(ann.id, !ann.isActive);
                            setRefreshTrigger((prev) => prev + 1);
                            showToast('सूचना की स्थिति सर्वर पर अपडेट की गई।');
                          } catch (error) {
                            showToast(`सूचना अपडेट असफल: ${error instanceof Error ? error.message : 'सर्वर त्रुटि'}`);
                          }
                        }}
                        className="px-3 py-1.5 bg-stone-900 text-white font-bold text-xs rounded-xl hover:bg-stone-800"
                      >
                        {ann.isActive ? 'सक्रिय है' : 'निष्क्रिय'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 13: ROUTE ALERTS (Requirement 15) */}
          {activeTab === 'route-alerts' && (
            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-stone-900">🚧 मार्ग अलर्ट व डायवर्जन प्रबंधन (Route Alerts)</h3>
                  <p className="text-xs text-stone-500">सड़क बंद, डायवर्जन एवं वैकल्पिक मार्ग प्रबंधन।</p>
                </div>
              </div>

              <div className="space-y-3">
                {routeAlerts.map((ra) => (
                  <div
                    key={ra.id}
                    className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{ra.type === 'ROAD_CLOSURE' ? '🚧' : '↪️'}</span>
                        <h4 className="text-sm font-black text-stone-900">{ra.title}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await AnnouncementService.toggleRouteAlert(ra.id, !ra.isActive);
                            setRefreshTrigger((prev) => prev + 1);
                            showToast('मार्ग प्रतिबंध सर्वर पर अपडेट किया गया।');
                          } catch (error) {
                            showToast(`मार्ग प्रतिबंध अपडेट असफल: ${error instanceof Error ? error.message : 'सर्वर त्रुटि'}`);
                          }
                        }}
                        className={`text-[10px] font-black px-2 py-1 rounded-full ${ra.isActive
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-stone-200 text-stone-700'}`}
                      >
                        {ra.isActive ? 'सक्रिय प्रतिबंध' : 'निष्क्रिय'}
                      </button>
                    </div>
                    <div className="text-xs text-stone-700 space-y-0.5">
                      <p><strong>मार्ग:</strong> {ra.roadName} ({ra.affectedArea})</p>
                      <p><strong>कारण:</strong> {ra.reason}</p>
                      {ra.alternativeRouteAdvice && (
                        <p className="text-emerald-800 font-bold">↪️ वैकल्पिक सुझाव: {ra.alternativeRouteAdvice}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 14: FAMILY GROUPS SAFETY (Requirement 4 & 17) */}
          {activeTab === 'family' && (
            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-stone-900">👨👩👧 परिवार सुरक्षा समूह (Family Safety Groups)</h3>
                  <p className="text-xs text-stone-500 font-bold text-amber-900">
                    गोपनीयता नीति: परिवार सदस्यों के निजी GPS ट्रैकिंग डाटा को व्यवस्थापक डैशबोर्ड पर भी सार्वजनिक रूप से प्रदर्शित नहीं किया जाता।
                  </p>
                </div>
                <span className="bg-purple-100 text-purple-900 text-xs font-black px-3 py-1 rounded-xl">
                  24 सक्रिय परिवार समूह
                </span>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
                <p className="font-bold text-stone-800">
                  सक्रिय समूह संख्या: <strong>24</strong> • कुल कनेक्टेड सदस्य: <strong>89</strong>
                </p>
                <p className="text-stone-600">
                  परिवार सदस्यों का स्थान केवल उनके समूह के 6-अंकीय कोड से जुड़े अधिकृत सदस्यों को ही दिखता है।
                </p>
              </div>
            </div>
          )}

          {/* TAB 15: MAP ADMIN PANEL (Requirement 16) */}
          {activeTab === 'map' && (
            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <div>
                  <h3 className="text-base font-black text-stone-900">🗺️ एडमिन मैप पैनल (Admin Map Inspector)</h3>
                  <p className="text-xs text-stone-500">
                    सूर्य मंदिर, सूर्य कुंड, पार्किंग, शटल, मेडिकल व रूट अलर्ट का भौगोलिक दृश्य।
                  </p>
                </div>
              </div>

              <div className="h-[520px] rounded-2xl overflow-hidden border border-stone-300 shadow-sm relative">
                <DeoMap heightClass="h-full min-h-[500px]" centerOnUserByDefault={false} />
              </div>
            </div>
          )}

          {/* TAB 16: AUDIT LOGS (Requirement 21) */}
          {activeTab === 'audit' && (
            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-stone-900">📋 विस्तृत ऑडिट लॉग्स (System Audit Trail)</h3>
                  <p className="text-xs text-stone-500">सभी प्रशासनिक परिवर्तनों का समय-आधारित लॉग।</p>
                </div>
                <div className="text-xs font-bold text-stone-600">कुल रिकॉर्ड्स: {auditLogs.length}</div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-stone-400 font-bold border-b border-stone-100">
                      <th className="py-2.5 pr-3">समय</th>
                      <th className="py-2.5 pr-3">एडमिन</th>
                      <th className="py-2.5 pr-3">Action</th>
                      <th className="py-2.5 pr-3">Entity</th>
                      <th className="py-2.5 pr-3">पूर्व मान</th>
                      <th className="py-2">नया मान</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-50">
                        <td className="py-3 pr-3 text-stone-500 whitespace-nowrap">{log.timestamp}</td>
                        <td className="py-3 pr-3 font-black text-stone-900">{log.userName}</td>
                        <td className="py-3 pr-3">
                          <span className="px-2 py-0.5 rounded bg-stone-100 font-mono text-[10px] font-bold">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 pr-3 text-stone-600">{log.entity}</td>
                        <td className="py-3 pr-3 text-stone-500 max-w-xs truncate">{log.oldValueSummary || '-'}</td>
                        <td className="py-3 text-stone-900 max-w-xs truncate">{log.newValueSummary || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 17: SETTINGS & POSTGIS STATUS (Requirement 17 & 28) */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-base font-black text-stone-900">⚙️ सिस्टम एवं बैकएंड डेटाबेस कॉन्फ़िगरेशन</h3>
                <p className="text-xs text-stone-500">PostgreSQL + PostGIS आर्किटेक्चर एवं API सेटिंग्स।</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex items-center gap-2 text-stone-900 font-black text-sm">
                    <Database className="w-4 h-4 text-amber-600" />
                    <span>PostgreSQL + PostGIS डेटाबेस स्थिति</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    ब्राउज़र से production database connection और PostGIS उपलब्धता सत्यापित नहीं की जा सकती। API health endpoint से जुड़ाव की जाँच आवश्यक है।
                  </p>
                  <div className="rounded-xl border border-[#8D6E63]/30 bg-[#FFF7E5] p-2.5 text-xs font-bold text-[#063B5C]">
                    Data unavailable — production database status सत्यापित नहीं
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex items-center gap-2 text-stone-900 font-black text-sm">
                    <Lock className="w-4 h-4 text-indigo-600" />
                    <span>सुरक्षा व पर्यावरण चर (Environment Variables)</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    संवेदनशील configuration केवल server-side secret manager में रखें। Browser में secret values प्रदर्शित नहीं किए जाते।
                  </p>
                  <div className="text-[11px] font-mono bg-stone-900 text-stone-200 p-3 rounded-xl space-y-1">
                    <div>DATABASE_URL=postgresql://deo_user:***@localhost:5432/deo_chhath_db</div>
                    <div>AUTH_SECRET=deo_chhath_seva_jwt_***</div>
                    <div>PORT=3000 (DEV & PROD)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <TeamManagementPanel notify={showToast} />
          )}

          {activeTab === 'music' && (
            <MusicManagementPanel notify={showToast} />
          )}

          {(activeTab === 'analytics' || activeTab === 'notifications') && (
            <section className="rounded-3xl border border-[#075985]/15 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#FFF7E5] text-2xl">
                  {activeTab === 'analytics' ? '📊' : '🔔'}
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#063B5C]">
                    {activeTab === 'analytics' ? 'विश्लेषण' : 'व्यवस्थापक सूचनाएँ'}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-stone-700">
                    अधिकृत उत्पादन डेटा स्रोत उपलब्ध नहीं है। इस पृष्ठ पर कोई लाइव आंकड़ा या सूचना प्रदर्शित नहीं की जा रही है।
                  </p>
                  <span className="mt-3 inline-flex rounded-full border border-[#8D6E63]/30 bg-[#FFF7E5] px-3 py-1 text-xs font-black text-[#063B5C]">
                    Data unavailable
                  </span>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Notifications Drawer */}
      {showNotificationsDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex justify-end animate-fade-in">
          <div className="bg-white w-full max-w-sm h-full p-5 shadow-2xl flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-black text-stone-900">एडमिन अलर्ट्स व सूचनाएं</h3>
                </div>
                <button
                  onClick={() => setShowNotificationsDrawer(false)}
                  className="p-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5 overflow-y-auto max-h-[75vh]">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      n.priority === 'URGENT'
                        ? 'bg-rose-50 border-rose-200'
                        : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{n.title}</span>
                      <span className="text-[10px] text-stone-400">{n.timestamp}</span>
                    </div>
                    <p className="text-stone-600">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                AdminService.clearAllNotifications();
                setShowNotificationsDrawer(false);
                setRefreshTrigger((prev) => prev + 1);
                showToast('सभी सूचनाएं हटाई गईं।');
              }}
              className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl"
            >
              सभी साफ़ करें
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add Facility */}
      {showAddFacilityModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-base font-black text-stone-900">📍 नई जनसुविधा जोड़ें</h3>
              <button onClick={() => setShowAddFacilityModal(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFacility} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">सुविधा का नाम</label>
                <input
                  type="text"
                  value={newFacName}
                  onChange={(e) => setNewFacName(e.target.value)}
                  placeholder="उदा. सूर्य कुंड नया आरओ वाटर बूथ"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">श्रेणी</label>
                <select
                  value={newFacCategory}
                  onChange={(e) => setNewFacCategory(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-bold"
                >
                  <option value="PARKING">🅿️ PARKING (पार्किंग)</option>
                  <option value="SHUTTLE">🛺 SHUTTLE (शटल)</option>
                  <option value="MEDICAL">🚑 MEDICAL (चिकित्सा)</option>
                  <option value="TOILET">🚻 TOILET (शौचालय)</option>
                  <option value="WATER">💧 WATER (पेयजल)</option>
                  <option value="HELP">🆘 HELP (सहायता केंद्र)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">पता / लैंडमार्क</label>
                <input
                  type="text"
                  value={newFacAddress}
                  onChange={(e) => setNewFacAddress(e.target.value)}
                  placeholder="उदा. सूर्य कुंड घाट #3 के पास"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">सटीक GPS निर्देशांक (latitude, longitude)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    value={newFacLatitude}
                    onChange={(e) => setNewFacLatitude(e.target.value)}
                    placeholder="Latitude"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-bold"
                    required
                  />
                  <input
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    value={newFacLongitude}
                    onChange={(e) => setNewFacLongitude(e.target.value)}
                    placeholder="Longitude"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">हेल्पलाइन फोन (वैकल्पिक)</label>
                <input
                  type="text"
                  value={newFacPhone}
                  onChange={(e) => setNewFacPhone(e.target.value)}
                  placeholder="108 / 112 / अधिकृत नंबर"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl shadow-xs disabled:opacity-60"
                >
                  सत्यापित करें और जोड़ें
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddFacilityModal(false)}
                  className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  रद्द करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Announcement */}
      {showAddAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-base font-black text-stone-900">📢 नई आधिकारिक सूचना प्रकाशित करें</h3>
              <button onClick={() => setShowAddAnnouncementModal(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">शीर्षक (Title)</label>
                <input
                  type="text"
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  placeholder="उदा. सूर्य कुंड बैरिकेडिंग व सुरक्षा दिशा-निर्देश"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">संक्षिप्त विवरण (Description)</label>
                <textarea
                  value={newAnnDesc}
                  onChange={(e) => setNewAnnDesc(e.target.value)}
                  rows={3}
                  placeholder="श्रद्धालुओं हेतु आवश्यक निर्देश..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">सूचना की समाप्ति तिथि और समय</label>
                <input
                  type="datetime-local"
                  value={newAnnExpiresAt}
                  onChange={(e) => setNewAnnExpiresAt(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-bold"
                  required
                />
                <p className="mt-1 text-[11px] text-stone-500">
                  सूचना केवल इस समय तक सक्रिय रहेगी। समय आपके डिवाइस के स्थानीय समय क्षेत्र में दर्ज होगा।
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">श्रेणी</label>
                  <select
                    value={newAnnCategory}
                    onChange={(e) => setNewAnnCategory(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-bold"
                  >
                    <option value="GENERAL">📢 GENERAL (सामान्य)</option>
                    <option value="CHHATH_INFO">🙏 CHHATH INFO (अर्घ्य)</option>
                    <option value="ROUTE">🛣️ ROUTE (मार्ग)</option>
                    <option value="PARKING">🅿️ PARKING (पार्किंग)</option>
                    <option value="SAFETY">⚠️ SAFETY (सुरक्षा)</option>
                    <option value="EMERGENCY">🚨 EMERGENCY (आपात)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">प्राथमिकता</label>
                  <select
                    value={newAnnPriority}
                    onChange={(e) => setNewAnnPriority(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-bold"
                  >
                    <option value="NORMAL">सामान्य (Normal)</option>
                    <option value="IMPORTANT">महत्वपूर्ण (Important)</option>
                    <option value="URGENT">अति आवश्यक (Urgent)</option>
                    <option value="EMERGENCY">आपातकालीन (Emergency)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl shadow-xs"
                >
                  आधिकारिक रूप से प्रकाशित करें
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddAnnouncementModal(false)}
                  className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  रद्द करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
