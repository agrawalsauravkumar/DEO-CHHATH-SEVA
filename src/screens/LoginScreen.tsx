/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { AuthService } from '../services/AuthService';
import { OtpChallenge } from '../types';
import {
  Smartphone,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowLeft,
  HeartHandshake,
  Shield,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { navigate, setCurrentUser, seniorMode } = useApp();

  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [otpValue, setOtpValue] = useState<string>('');
  const [challenge, setChallenge] = useState<OtpChallenge | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanNum = mobileNumber.replace(/\D/g, '');
    if (cleanNum.length !== 10) {
      setErrorMessage('कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }

    setIsLoading(true);
    try {
      const res = await AuthService.requestOtp(cleanNum);
      if (res.success && res.challenge) {
        setChallenge(res.challenge);
        setStep('OTP');
        setOtpValue('');
        const wait = Math.max(0, Math.ceil((res.challenge.canResendAt - Date.now()) / 1000));
        setResendCooldown(wait);
        setSuccessMessage('OTP सफलतापूर्वक भेज दिया गया है।');
      } else {
        setErrorMessage(res.error || 'OTP भेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
      }
    } catch {
      setErrorMessage('सर्वर से संपर्क करने में समस्या हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (otpValue.trim().length !== 6) {
      setErrorMessage('कृपया 6 अंकों का OTP दर्ज करें।');
      return;
    }

    setIsLoading(true);
    try {
      const cleanNum = mobileNumber.replace(/\D/g, '');
      const res = await AuthService.verifyOtp(cleanNum, otpValue);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setSuccessMessage('सफलतापूर्वक लॉगिन हो गया!');
        setTimeout(() => {
          navigate('profile');
        }, 800);
      } else {
        setErrorMessage(res.error || 'OTP सत्यापन असफल।');
      }
    } catch {
      setErrorMessage('सत्यापन के दौरान त्रुटि हुई।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    await handleSendOtp();
  };

  // Quick fill demo user numbers for convenience
  const handleQuickDemoFill = (number: string) => {
    setMobileNumber(number);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 flex flex-col font-['Mukta',sans-serif]">
      <TopBar
        title={step === 'PHONE' ? 'लॉगिन / प्रवेश' : 'OTP सत्यापन'}
        showBack
        onBack={() => {
          if (step === 'OTP') {
            setStep('PHONE');
            setErrorMessage(null);
          } else {
            navigate('home');
          }
        }}
      />

      <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-4">
        {/* Brand & Organization Title Card */}
        <div className="bg-gradient-to-br from-[#0F2642] via-[#16365C] to-[#0A1A2E] text-white rounded-3xl p-5 border-2 border-amber-500/40 shadow-xl space-y-2 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold text-3xl mx-auto shadow-inner">
            {step === 'PHONE' ? '📱' : '🔑'}
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">DEO CHHATH SEVA</h2>
          <p className="text-xs font-black text-amber-300">
            NEXTGEN DEV BHOOMI FOUNDATION — “रास्ता भी • सहायता भी • सेवा भी”
          </p>
          <p className="text-[12px] text-stone-300 pt-1">
            छठ महापर्व में सुरक्षित सेवा, स्वयंसेवक पहचान एवं परिवार समन्वय हेतु लॉगिन करें।
          </p>
        </div>

        {/* Development Mode Notice Banner */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-3 text-xs text-blue-950 space-y-1 shadow-xs">
          <div className="flex items-center gap-1.5 font-black text-blue-900">
            <Shield className="w-4 h-4 text-blue-700" />
            <span>DEVELOPMENT MODE (प्रशिक्षण / विकास मोड)</span>
          </div>
          <p className="text-[11px] leading-relaxed text-blue-800">
            SMS Gateway सक्रिय नहीं होने पर सुरक्षित परीक्षण हेतु OTP स्क्रीन पर ही प्रदर्शित होगा। वास्तविक उत्पादन परिवेश में यह अधिकृत SMS गेटवे से प्रेषित होता है।
          </p>
        </div>

        {/* Error / Success Toast Messages */}
        {errorMessage && (
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-3.5 text-xs font-bold text-rose-900 flex items-start gap-2 shadow-xs animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 text-xs font-bold text-emerald-900 flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STEP 1: PHONE NUMBER INPUT */}
        {step === 'PHONE' && (
          <div className="bg-white border-2 border-stone-200 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="space-y-1">
              <label className={`block font-black text-stone-900 ${seniorMode ? 'text-lg' : 'text-base'}`}>
                मोबाइल नंबर दर्ज करें
              </label>
              <p className="text-xs text-stone-500">
                10 अंकों का मान्य भारतीय मोबाइल नंबर दर्ज करें।
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500 font-bold text-sm">
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="98XXXXXXXX"
                  className={`w-full pl-13 pr-4 py-3.5 rounded-2xl border-2 border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none font-bold text-stone-900 tracking-wider ${
                    seniorMode ? 'text-2xl min-h-[56px]' : 'text-xl'
                  }`}
                  autoFocus
                  required
                />
              </div>

              {/* Large High-Contrast Send OTP Button */}
              <button
                type="submit"
                disabled={isLoading || mobileNumber.length !== 10}
                className={`w-full bg-amber-500 hover:bg-amber-600 active:scale-98 disabled:opacity-50 text-stone-950 font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 ${
                  seniorMode ? 'min-h-[56px] text-lg' : 'min-h-[48px] text-base'
                }`}
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>OTP भेजें</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Accounts Selection */}
            <div className="pt-2 border-t border-stone-100 space-y-2">
              <span className="text-[11px] font-black uppercase text-stone-400 tracking-wider block">
                त्वरित डेमो नंबर (Quick Test Numbers):
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('9835123456')}
                  className="p-2 bg-stone-100 hover:bg-amber-100 hover:border-amber-300 border border-stone-200 rounded-xl text-left transition-colors"
                >
                  <span className="block text-[10px] text-stone-500 font-bold">सामान्य श्रद्धालु</span>
                  <span className="block text-xs font-black text-stone-800">9835123456</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('9876543210')}
                  className="p-2 bg-stone-100 hover:bg-emerald-100 hover:border-emerald-300 border border-stone-200 rounded-xl text-left transition-colors"
                >
                  <span className="block text-[10px] text-emerald-700 font-bold">स्वयंसेवक</span>
                  <span className="block text-xs font-black text-stone-800">9876543210</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('9988776655')}
                  className="p-2 bg-stone-100 hover:bg-blue-100 hover:border-blue-300 border border-stone-200 rounded-xl text-left transition-colors"
                >
                  <span className="block text-[10px] text-blue-700 font-bold">समन्वयक</span>
                  <span className="block text-xs font-black text-stone-800">9988776655</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 'OTP' && (
          <div className="bg-white border-2 border-stone-200 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className={`block font-black text-stone-900 ${seniorMode ? 'text-lg' : 'text-base'}`}>
                  OTP दर्ज करें
                </label>
                <p className="text-xs text-stone-500">
                  {challenge?.maskedMobile || mobileNumber} पर 6 अंकों का कोड भेजा गया है।
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep('PHONE')}
                className="text-xs text-amber-800 font-bold underline hover:text-amber-900"
              >
                नंबर बदलें
              </button>
            </div>

            {/* Development Mode OTP Display Card */}
            {challenge?.isDevelopmentMode && challenge.devOtpHint && (
              <div className="bg-amber-50 border-2 border-dashed border-amber-400 rounded-2xl p-3 text-center space-y-1">
                <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider block">
                  DEVELOPMENT MODE OTP
                </span>
                <span className="text-2xl font-black text-stone-900 tracking-widest font-mono select-all">
                  {challenge.devOtpHint}
                </span>
                <p className="text-[10px] text-amber-700">
                  (यह कोड केवल विकास/परीक्षण मोड में दिख रहा है)
                </p>
                <button
                  type="button"
                  onClick={() => setOtpValue(challenge.devOtpHint!)}
                  className="text-xs font-black text-amber-900 bg-amber-200 hover:bg-amber-300 px-3 py-1 rounded-xl mt-1 inline-block"
                >
                  स्वचालित दर्ज करें (Auto Fill)
                </button>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                className={`w-full py-3.5 px-4 rounded-2xl border-2 border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none font-bold text-center text-stone-900 tracking-widest font-mono ${
                  seniorMode ? 'text-3xl min-h-[56px]' : 'text-2xl'
                }`}
                autoFocus
                required
              />

              <button
                type="submit"
                disabled={isLoading || otpValue.trim().length !== 6}
                className={`w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 text-white font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 ${
                  seniorMode ? 'min-h-[56px] text-lg' : 'min-h-[48px] text-base'
                }`}
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>OTP सत्यापित करें (लॉगिन करें)</span>
                  </>
                )}
              </button>
            </form>

            {/* Resend OTP Section */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-semibold">OTP प्राप्त नहीं हुआ?</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isLoading}
                className={`font-black ${
                  resendCooldown > 0
                    ? 'text-stone-400 cursor-not-allowed'
                    : 'text-amber-800 hover:text-amber-900 underline'
                }`}
              >
                {resendCooldown > 0 ? `दोबारा OTP भेजें (${resendCooldown}s)` : 'दोबारा OTP भेजें'}
              </button>
            </div>
          </div>
        )}

        {/* Security & Privacy Commitment */}
        <div className="bg-stone-100 rounded-2xl p-4 border border-stone-200 text-xs text-stone-600 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-stone-800">
            <Lock className="w-3.5 h-3.5 text-stone-600" />
            <span>गोपनीयता व सुरक्षा गारंटी (Privacy Assured)</span>
          </div>
          <p className="text-[11px] leading-relaxed text-stone-600">
            आपका मोबाइल नंबर केवल छठ महापर्व में आवश्यक सहायता व सुरक्षा हेतु सुरक्षित रखा जाता है। कोई भी निजी डेटा व्यावसायिक उद्देश्यों के लिए साझा नहीं किया जाता।
          </p>
        </div>
      </main>
    </div>
  );
};
