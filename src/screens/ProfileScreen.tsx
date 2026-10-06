/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { AuthService } from '../services/AuthService';
import { AppUserRole, LanguageCode } from '../types';
import {
  User,
  Shield,
  Phone,
  Mail,
  Calendar,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Award,
  Globe,
  HeartHandshake,
  ShieldCheck,
  Settings,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    logoutUser,
    navigate,
    userRole,
    switchUserRole,
    language,
    setLanguage,
  } = useApp();

  const [editMode, setEditMode] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>(currentUser?.fullName || '');
  const [email, setEmail] = useState<string>(currentUser?.email || '');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-stone-50 pb-20 flex flex-col font-['Mukta',sans-serif]">
        <TopBar title="उपयोगकर्ता प्रोफ़ाइल" showBack />
        <main className="flex-1 max-w-lg mx-auto w-full p-4 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center text-2xl">
            👤
          </div>
          <h2 className="text-lg font-black text-stone-900">आप वर्तमान में लॉगिन नहीं हैं</h2>
          <p className="text-xs text-stone-500 max-w-xs">
            अपनी प्रोफ़ाइल देखने, स्वयंसेवक कार्यों का प्रबंधन करने अथवा परिवार सुरक्षा हेतु कृपया लॉगिन करें।
          </p>
          <button
            onClick={() => navigate('login')}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-2xl shadow-sm text-sm"
          >
            मोबाइल नंबर से लॉगिन करें
          </button>
        </main>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = AuthService.updateUserProfile({
      fullName: fullName.trim() || currentUser.fullName,
      email: email.trim(),
    });
    if (updated) {
      setCurrentUser(updated);
      setEditMode(false);
      setSuccessToast('प्रोफ़ाइल सफलतापूर्वक अपडेट कर दी गई है।');
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('home');
  };

  const getRoleBadge = (role: AppUserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return { label: 'मुख्य व्यवस्थापक (Admin)', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'VOLUNTEER':
        return { label: 'अधिकृत स्वयंसेवक (Volunteer)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'CONTENT_ADMIN':
        return { label: 'कंटेंट व्यवस्थापक', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'VOLUNTEER_ADMIN':
        return { label: 'स्वयंसेवक प्रमुख', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      default:
        return { label: 'सामान्य श्रद्धालु (User)', color: 'bg-stone-100 text-stone-700 border-stone-300' };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);

  return (
    <div className="min-h-screen bg-stone-50 pb-20 flex flex-col font-['Mukta',sans-serif]">
      <TopBar title="मेरी प्रोफ़ाइल (User Profile)" showBack />

      <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-4">
        {/* Toast */}
        {successToast && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 text-xs font-bold text-emerald-900 flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* User Card Header */}
        <div className="bg-gradient-to-br from-[#0F2642] via-[#16365C] to-[#0A1A2E] text-white rounded-3xl p-5 border-2 border-amber-500/40 shadow-xl space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 text-stone-950 font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
              {currentUser.fullName ? currentUser.fullName.charAt(0) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white truncate">{currentUser.fullName}</h2>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${roleInfo.color}`}>
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-amber-200 font-bold flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5" />
                <span>+91 {currentUser.mobileNumber}</span>
              </p>
              <p className="text-[11px] text-stone-300 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-stone-400" />
                <span>पंजीकृत: {new Date(currentUser.createdAt).toLocaleDateString('hi-IN')}</span>
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-stone-300">
              <span>स्थिति:</span>
              <span className="font-black text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                <span>{currentUser.status} (सक्रिय)</span>
              </span>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className="text-amber-300 hover:text-amber-200 font-bold underline"
            >
              {editMode ? 'रद्द करें' : 'संपादित करें (Edit)'}
            </button>
          </div>
        </div>

        {/* Edit Profile Form */}
        {editMode ? (
          <div className="bg-white border-2 border-stone-200 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="font-black text-stone-900 text-sm">विवरण संपादित करें</h3>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">पूरा नाम (Full Name)</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">ईमेल (वैकल्पिक)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-900"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs"
                >
                  परिवर्तन सहेजें
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs"
                >
                  रद्द करें
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {/* Quick Role Switcher for Testing (Step 18 Requirement 4) */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-700" />
            <div>
              <h4 className="text-xs font-black text-amber-950 uppercase tracking-wide">
                भूमिका परीक्षण चयनकर्ता (Role Switcher - Dev Mode)
              </h4>
              <p className="text-[11px] text-amber-800">
                ऐप के विभिन्न अनुमतियों (USER, VOLUNTEER, ADMIN) का परीक्षण करने हेतु भूमिका बदलें:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => switchUserRole('USER')}
              className={`p-2 rounded-xl text-xs font-black border transition-all ${
                currentUser.role === 'USER'
                  ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-sm'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              सामान्य श्रद्धालु (USER)
            </button>
            <button
              onClick={() => switchUserRole('VOLUNTEER')}
              className={`p-2 rounded-xl text-xs font-black border transition-all ${
                currentUser.role === 'VOLUNTEER'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              स्वयंसेवक (VOLUNTEER)
            </button>
            <button
              onClick={() => switchUserRole('SUPER_ADMIN')}
              className={`p-2 rounded-xl text-xs font-black border transition-all ${
                currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN'
                  ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              व्यवस्थापक (ADMIN)
            </button>
          </div>
        </div>

        {/* Role Quick Links */}
        <div className="bg-white border-2 border-stone-200 rounded-3xl p-4 shadow-xs space-y-2">
          <h4 className="text-xs font-black text-stone-500 uppercase tracking-wider">
            त्वरित पहुंच (Role Actions)
          </h4>

          {currentUser.role === 'VOLUNTEER' && (
            <button
              onClick={() => navigate('volunteer-mode')}
              className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 rounded-2xl text-left border border-emerald-200"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🙋</span>
                <div>
                  <span className="block text-xs font-black text-emerald-950">स्वयंसेवक मोड (Volunteer Mode)</span>
                  <span className="block text-[11px] text-emerald-800">असाइन की गई सहायता अनुरोध व ड्यूटी देखें</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-700" />
            </button>
          )}

          {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
            <button
              onClick={() => navigate('admin-dashboard')}
              className="w-full flex items-center justify-between p-3 bg-rose-50 hover:bg-rose-100 rounded-2xl text-left border border-rose-200"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">📊</span>
                <div>
                  <span className="block text-xs font-black text-rose-950">एडमिन डैशबोर्ड (Admin Portal)</span>
                  <span className="block text-[11px] text-rose-800">मेला नियंत्रण कक्ष व संपूर्ण प्रबंधन</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-700" />
            </button>
          )}

          <button
            onClick={() => navigate('family')}
            className="w-full flex items-center justify-between p-3 bg-stone-50 hover:bg-stone-100 rounded-2xl text-left border border-stone-200"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">👨‍👩‍👧</span>
              <div>
                <span className="block text-xs font-black text-stone-900">परिवार सुरक्षा व मिलन बिंदु</span>
                <span className="block text-[11px] text-stone-500">परिवार के सदस्यों के साथ सुरक्षित समन्वय</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-500" />
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-3.5 bg-stone-100 hover:bg-rose-50 border-2 border-stone-300 hover:border-rose-300 text-stone-700 hover:text-rose-700 font-black rounded-2xl flex items-center justify-center gap-2 text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>खाते से लॉगआउट करें (Logout)</span>
        </button>
      </main>
    </div>
  );
};
