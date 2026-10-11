/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdminService } from '../services/AdminService';
import { DeoChhathSevaLogo } from '../components/DeoChhathSevaLogo';
import {
  Lock,
  Mail,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AdminLoginScreen: React.FC = () => {
  const { navigate } = useApp();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage('कृपया उपयोगकर्ता नाम/ईमेल और पासवर्ड दर्ज करें।');
      return;
    }

    setIsLoading(true);
    try {
      await AdminService.login(username, password);
      navigate('admin-dashboard');
    } catch (err: any) {
      setErrorMessage(err?.message || 'लॉगिन असफल। कृपया क्रेडेंशियल जांचें।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#041E2F] via-[#073B5A] to-[#0B5E8E] text-stone-100 flex flex-col justify-between font-['Mukta',sans-serif] p-4 sm:p-6">
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl border border-white/10 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>पब्लिक ऐप पर वापस जाएं</span>
        </button>

        <span className="text-[11px] font-black tracking-wider text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-400/40">
          SECURITY LEVEL 4
        </span>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl text-stone-900 border-2 border-[#FFD54F] space-y-5">
          {/* Brand & Organization Title */}
          <div className="text-center space-y-1.5">
            <DeoChhathSevaLogo size={68} className="mx-auto drop-shadow-md" />
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              DEO CHHATH SEVA
            </h1>
            <p className="text-xs font-black uppercase tracking-wider text-[#0B5E8E]">
              Admin Portal • व्यवस्थापक पोर्टल
            </p>
            <p className="text-[11px] text-stone-500 font-bold">
              NEXTGEN DEVBHOOMI FOUNDATION — “रास्ता भी • सहायता भी • सेवा भी”
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-300 rounded-2xl p-3 text-xs text-rose-800 font-bold flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-stone-700 block">
                Email / Username (ईमेल या यूज़रनेम)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="अधिकृत ईमेल / यूज़रनेम"
                  className="w-full bg-stone-50 border border-[#0B5E8E]/30 rounded-xl py-2.5 pl-10 pr-3 text-xs font-bold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#FF8C42] focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-stone-700 block">
                Password (पासवर्ड)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-stone-50 border border-[#0B5E8E]/30 rounded-xl py-2.5 pl-10 pr-10 text-xs font-bold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#FF8C42] focus:bg-white transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[52px] border-2 border-[#FFD54F] bg-gradient-to-r from-[#0B5E8E] to-[#063B5C] hover:from-[#084B72] hover:to-[#042E46] text-white font-black text-sm rounded-xl shadow-lg shadow-[#0B5E8E]/25 flex items-center justify-center gap-2 active:scale-[0.99] transition-all disabled:opacity-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#FF8C42]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>प्रमाणीकरण हो रहा है…</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>प्रवेश करें (Login)</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-stone-200/80 text-center">
            <p className="text-xs leading-relaxed text-stone-600">
              यह क्षेत्र अधिकृत व्यवस्थापक खातों के लिए है। लॉगिन विवरण संस्था के अधिकृत प्रशासक से प्राप्त करें।
            </p>
          </div>
        </div>
      </div>

      {/* Footer attribution */}
      <footer className="text-center text-xs text-stone-400 select-none py-2">
        <p className="font-bold">NEXTGEN DEVBHOOMI FOUNDATION • अधिकृत प्रशासक पोर्टल</p>
        <p className="text-[11px] text-stone-500">देव सूर्य मंदिर एवं सूर्य कुंड मेला परिसर, औरंगाबाद (बिहार)</p>
      </footer>
    </div>
  );
};
