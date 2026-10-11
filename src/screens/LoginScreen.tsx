/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { DeoChhathSevaLogo } from '../components/DeoChhathSevaLogo';
import { AuthService } from '../services/AuthService';
import { OtpChallenge } from '../types';
import {
  Smartphone,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  Shield,
  WifiOff,
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { navigate, setCurrentUser, seniorMode, isOnline } = useApp();

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

  const handleOfflineAccess = () => {
    const result = AuthService.getOfflineAccessStatus();
    if (!result.available) {
      const messages = {
        NO_SESSION: 'ऑफ़लाइन OTP उपलब्ध नहीं है। पहले इंटरनेट से OTP सत्यापित करें, या बिना खाते के ऐप खोलें।',
        EXPIRED: 'आपका लॉगिन सत्र समाप्त हो गया है। फिर से OTP सत्यापित करने के लिए इंटरनेट से जुड़ें।',
        PRIVILEGED: 'सुरक्षा के लिए प्रशासक/विशेषाधिकार वाले खाते ऑफलाइन लॉगिन नहीं कर सकते। इंटरनेट से जुड़ें।',
        INVALID_SESSION: 'पहले का लॉगिन सत्र मान्य नहीं है। कृपया इंटरनेट से OTP सत्यापित करें।',
      };
      setErrorMessage(messages[result.reason]);
      setSuccessMessage(null);
      return;
    }

    setCurrentUser(result.user);
    setErrorMessage(null);
    setSuccessMessage('पहले से सत्यापित खाते का 24 घंटे वाला सत्र जारी है; नया OTP जारी नहीं किया गया।');
    window.setTimeout(() => navigate('profile'), 500);
  };

  return (
    <div className="min-h-screen bg-[#FFF8E1] pb-20 flex flex-col font-['Mukta',sans-serif]">
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
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0B5E8E] via-[#073B5A] to-[#041E2F] text-white rounded-3xl p-5 border-2 border-[#FFD54F]/70 shadow-xl space-y-2 text-center">
          <div aria-hidden="true" className="absolute -top-12 -right-10 h-36 w-36 rounded-full border border-[#FFD54F]/25 bg-[radial-gradient(circle,#FFD54F55,transparent_68%)]" />
          <DeoChhathSevaLogo size={68} className="mx-auto drop-shadow-lg" />
          <h2 className="text-xl font-black tracking-tight text-white">DEO CHHATH SEVA</h2>
          <p className="text-xs font-black text-[#FFD54F]">
            NEXTGEN DEVBHOOMI FOUNDATION — “रास्ता भी • सहायता भी • सेवा भी”
          </p>
          <p className="text-[12px] text-[#FFF8E1] pt-1">
            छठ महापर्व में सुरक्षित सेवा, स्वयंसेवक पहचान एवं परिवार समन्वय हेतु लॉगिन करें।
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
          <div className="bg-white border-2 border-[#0B5E8E]/20 rounded-3xl p-5 shadow-lg shadow-[#0B5E8E]/10 space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0B5E8E] text-[#FFD54F]">
                <Smartphone className="h-5 w-5" />
              </span>
              <div className="space-y-1">
                <label className={`block font-black text-[#063B5C] ${seniorMode ? 'text-lg' : 'text-base'}`}>
                  मोबाइल नंबर से लॉगिन करें
                </label>
                <p className="text-xs text-stone-600">
                  OTP पाने के लिए अपना 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें।
                </p>
              </div>
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
                  aria-label="10 अंकों का मोबाइल नंबर"
                  className={`w-full pl-13 pr-4 py-3.5 rounded-2xl border-2 border-[#0B5E8E]/30 focus:border-[#0B5E8E] focus:ring-4 focus:ring-[#FFD54F]/40 outline-none font-bold text-stone-900 tracking-wider ${
                    seniorMode ? 'text-2xl min-h-[56px]' : 'text-xl'
                  }`}
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || mobileNumber.length !== 10}
                className={`w-full border-2 border-[#FFD54F] bg-gradient-to-r from-[#0B5E8E] to-[#063B5C] hover:from-[#084B72] hover:to-[#042E46] active:scale-[0.99] disabled:opacity-50 text-white font-black rounded-2xl shadow-lg shadow-[#0B5E8E]/25 transition-all flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#FF8C42] ${
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

            <p className="flex items-center justify-center gap-2 border-t border-stone-100 pt-3 text-center text-xs font-semibold text-stone-600">
              <Shield className="h-4 w-4 shrink-0 text-[#2E7D32]" />
              सत्यापन कोड केवल आपके मोबाइल नंबर पर भेजा जाएगा।
            </p>
          </div>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 'OTP' && (
          <div className="bg-white border-2 border-[#0B5E8E]/20 rounded-3xl p-5 shadow-lg shadow-[#0B5E8E]/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className={`block font-black text-[#063B5C] ${seniorMode ? 'text-lg' : 'text-base'}`}>
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
                className={`w-full py-3.5 px-4 rounded-2xl border-2 border-[#0B5E8E]/30 focus:border-[#0B5E8E] focus:ring-4 focus:ring-[#FFD54F]/40 outline-none font-bold text-center text-stone-900 tracking-widest font-mono ${
                  seniorMode ? 'text-3xl min-h-[56px]' : 'text-2xl'
                }`}
                autoFocus
                required
              />

              <button
                type="submit"
                disabled={isLoading || otpValue.trim().length !== 6}
                className={`w-full border-2 border-[#FFD54F] bg-[#2E7D32] hover:bg-[#256629] active:scale-[0.99] disabled:opacity-50 text-white font-black rounded-2xl shadow-lg shadow-[#2E7D32]/20 transition-all flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#FF8C42] ${
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

        {!isOnline && (
          <section className="rounded-2xl border-2 border-[#FF8C42]/50 bg-gradient-to-br from-[#FFF8E1] to-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF8C42]/15 text-[#8D4A1F]">
                <WifiOff className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-black text-[#063B5C]">पहले सत्यापित खाते से ऑफलाइन प्रवेश</h2>
                <p className="mt-1 text-xs leading-relaxed text-stone-700">
                  यह नया OTP नहीं है। केवल पिछले ऑनलाइन OTP से सत्यापित, सक्रिय सामान्य-यूज़र सत्र (अधिकतम 24 घंटे) जारी हो सकता है। प्रशासक खाते स्वीकार नहीं होंगे।
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOfflineAccess}
              className="mt-3 min-h-[48px] w-full rounded-xl border-2 border-[#FFD54F] bg-[#0B5E8E] px-4 font-black text-white shadow-sm transition-colors hover:bg-[#063B5C] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#FF8C42]"
            >
              पहले से सत्यापित खाते से आगे बढ़ें
            </button>
            <p className="mt-2 text-center text-[11px] text-stone-600">
              नया OTP भेजना/जाँचना और ऑनलाइन सेवाएँ चलाने के लिए इंटरनेट आवश्यक है।
            </p>
          </section>
        )}

        {/* Security & Privacy Commitment */}
        <div className="bg-[#0B5E8E]/[0.06] rounded-2xl p-4 border border-[#0B5E8E]/15 text-xs text-stone-700 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#063B5C]">
            <Lock className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>आपकी गोपनीयता और सुरक्षा</span>
          </div>
          <p className="text-[11px] leading-relaxed text-stone-600">
            आपका मोबाइल नंबर केवल छठ महापर्व में आवश्यक सहायता व सुरक्षा हेतु सुरक्षित रखा जाता है। कोई भी निजी डेटा व्यावसायिक उद्देश्यों के लिए साझा नहीं किया जाता।
          </p>
        </div>
      </main>
    </div>
  );
};
