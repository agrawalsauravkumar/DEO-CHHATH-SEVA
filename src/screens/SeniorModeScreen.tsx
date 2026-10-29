/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { AccessibilityService } from '../services/AccessibilityService';
import { VoiceService } from '../services/VoiceService';
import { DEO_LOCATIONS } from '../data/deoData';
import {
  AccessibilityPreferences,
  FontSizePreference,
  VoiceSpeedPreference,
} from '../types';
import {
  Compass,
  HeartPulse,
  PhoneCall,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Settings,
  X,
  Check,
  ArrowRight,
  ShieldAlert,
  Droplet,
  Users,
} from 'lucide-react';

export const SeniorModeScreen: React.FC = () => {
  const { navigate, startNavigation, deviceLocation, isOnline } = useApp();

  // Accessibility Preferences
  const [prefs, setPrefs] = useState<AccessibilityPreferences>(() =>
    AccessibilityService.getPreferences()
  );

  // Settings modal
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  // Voice Recognition State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognizedCommand, setRecognizedCommand] = useState<string | null>(null);
  const [commandFeedback, setCommandFeedback] = useState<{
    screen?: string;
    message: string;
    recognized: boolean;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = AccessibilityService.subscribe((newPrefs) => {
      setPrefs(newPrefs);
      VoiceService.setSpeed(newPrefs.voiceSpeed);
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSpeak = (text: string) => {
    if (prefs.voiceAssistance) {
      VoiceService.speak(text, true);
      showToast(text);
    }
  };

  // Start speech recognition
  const handleStartVoice = () => {
    if (!VoiceService.isVoiceRecognitionSupported()) {
      showToast('Voice command आपके device पर उपलब्ध नहीं है।');
      return;
    }

    setIsListening(true);
    setRecognizedCommand(null);
    setCommandFeedback(null);
    handleSpeak('बोलिए, आप क्या खोजना चाहते हैं?');

    VoiceService.startListening(
      (transcript) => {
        setIsListening(false);
        setRecognizedCommand(transcript);
        const feedback = VoiceService.processCommand(transcript);
        setCommandFeedback(feedback);
        if (prefs.voiceAssistance) {
          VoiceService.speak(`आपने कहा: ${transcript}`);
        }
      },
      (err) => {
        setIsListening(false);
        showToast(err);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleExecuteVoiceCommand = () => {
    if (commandFeedback?.screen) {
      const target = commandFeedback.screen as any;
      setRecognizedCommand(null);
      setCommandFeedback(null);
      navigate(target);
    }
  };

  const handleExitSeniorMode = () => {
    AccessibilityService.setSeniorMode(false);
    setShowExitConfirm(false);
    navigate('home');
  };

  return (
    <div
      className={`min-h-screen pb-24 flex flex-col font-['Mukta',sans-serif] select-none ${
        prefs.highContrast
          ? 'bg-black text-yellow-300'
          : 'bg-amber-50/70 text-stone-950'
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-amber-300 text-sm font-black px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 max-w-sm w-11/12 text-center animate-fade-in border-2 border-amber-400">
          <Volume2 className="w-5 h-5 shrink-0" />
          <span className="flex-1">{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* HIGH CONTRAST SENIOR HEADER                              */}
      {/* ======================================================== */}
      <header
        className={`px-4 py-3.5 border-b-4 ${
          prefs.highContrast
            ? 'bg-stone-950 border-yellow-400 text-yellow-300'
            : 'bg-stone-900 border-amber-500 text-white'
        } shadow-md`}
      >
        <div className="max-w-3xl sm:max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-amber-400">
              👴 वरिष्ठ नागरिक मोड
            </h1>
            <p className="text-xs text-stone-300 font-bold">
              बड़े अक्षर • सरल विकल्प • आवाज़ सहायता
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-xl border border-stone-600 active:scale-95"
              title="सेटिंग्स"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowExitConfirm(true)}
              className="min-h-[42px] px-3 bg-stone-800 hover:bg-stone-700 text-rose-300 font-black border border-stone-600 rounded-xl text-xs active:scale-95"
            >
              मोड बंद करें
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN CONTAINER (7 Main Actions + Voice Search Button)     */}
      {/* ======================================================== */}
      <main className="flex-1 max-w-3xl sm:max-w-4xl mx-auto w-full p-3.5 sm:p-6 space-y-4">
        {/* VOICE SEARCH MIC BAR (Requirement 9) */}
        <div
          className={`p-4 rounded-3xl border-2 shadow-sm flex items-center justify-between gap-3 ${
            prefs.highContrast
              ? 'bg-stone-950 border-yellow-400'
              : 'bg-white border-amber-300'
          }`}
        >
          <div className="min-w-0">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 block">
              🔊 आवाज़ से खोजें
            </span>
            <p className="text-sm font-bold text-stone-800">
              {isListening ? 'बोलिए... हम सुन रहे हैं...' : 'माइक दबाकर बोलें'}
            </p>
          </div>

          <button
            onClick={handleStartVoice}
            className={`min-h-[54px] px-5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-md active:scale-95 transition-all ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            <Mic className="w-5 h-5" />
            <span>{isListening ? 'बोलिए...' : '🎤 बोलकर खोजें'}</span>
          </button>
        </div>

        {/* RECOGNIZED VOICE COMMAND DIALOG */}
        {recognizedCommand && commandFeedback && (
          <div className="bg-white rounded-3xl p-4 border-2 border-purple-400 shadow-md space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="text-xs font-black text-purple-900 uppercase">
                आपने कहा:
              </span>
              <button
                onClick={() => {
                  setRecognizedCommand(null);
                  setCommandFeedback(null);
                }}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-lg font-black text-stone-900 font-mono">
              “{recognizedCommand}”
            </p>

            <p className="text-xs text-stone-600 font-bold">{commandFeedback.message}</p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  setRecognizedCommand(null);
                  setCommandFeedback(null);
                }}
                className="min-h-[46px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-black text-xs rounded-xl"
              >
                रद्द करें
              </button>
              {commandFeedback.recognized && commandFeedback.screen && (
                <button
                  onClick={handleExecuteVoiceCommand}
                  className="min-h-[46px] bg-purple-800 hover:bg-purple-900 text-white font-black text-xs rounded-xl shadow-md"
                >
                  खोजें
                </button>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 7 LARGE SENIOR BUTTONS (Requirement 2 & 3)               */}
        {/* ======================================================== */}
        <div className="space-y-3">
          {/* 1. 🧭 मुझे रास्ता दिखाएँ */}
          <button
            onClick={() => {
              handleSpeak('रास्ता और गंतव्य खोज स्क्रीन खोली जा रही है।');
              navigate('search');
            }}
            className="w-full min-h-[82px] p-4 bg-gradient-to-r from-[#041E2F] via-[#075985] to-[#041E2F] active:scale-98 text-white rounded-3xl shadow-md border-2 border-amber-400 flex items-center justify-between text-left transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black text-3xl shrink-0 shadow-xs">
                🧭
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black block leading-tight text-white">
                  मुझे रास्ता दिखाएँ
                </span>
                <span className="text-xs text-amber-200 font-bold">
                  देव सूर्य मंदिर, सूर्य कुंड व घाट का सीधा मार्ग
                </span>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-amber-300 shrink-0" />
          </button>

          {/* 2. 🚑 मुझे मेडिकल सहायता चाहिए */}
          <button
            onClick={() => {
              handleSpeak('प्राथमिक चिकित्सा एवं मेडिकल सहायता केंद्र खोले जा रहे हैं।');
              navigate('medical');
            }}
            className="w-full min-h-[82px] p-4 bg-rose-700 hover:bg-rose-800 active:scale-98 text-white rounded-3xl shadow-md border-2 border-rose-800 flex items-center justify-between text-left transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-white text-rose-700 flex items-center justify-center font-black text-3xl shrink-0 shadow-xs">
                🚑
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black block leading-tight text-white">
                  मुझे मेडिकल सहायता चाहिए
                </span>
                <span className="text-xs text-rose-100 font-bold">
                  नजदीकी डॉक्टर, एम्बुलेंस एवं प्राथमिक उपचार
                </span>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-white shrink-0" />
          </button>

          {/* 3. 🆘 मुझे सहायता चाहिए */}
          <button
            onClick={() => {
              handleSpeak('सहायता केंद्र और हेल्प डेस्क स्क्रीन खोली जा रही है।');
              navigate('help');
            }}
            className="w-full min-h-[82px] p-4 bg-red-800 hover:bg-red-900 active:scale-98 text-white rounded-3xl shadow-md border-2 border-red-900 flex items-center justify-between text-left transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-white text-red-800 flex items-center justify-center font-black text-3xl shrink-0 shadow-xs">
                🆘
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black block leading-tight text-white">
                  मुझे सहायता चाहिए
                </span>
                <span className="text-xs text-red-100 font-bold">
                  हेल्प डेस्क, पुलिस सहायता एवं स्वयंसेवक
                </span>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-white shrink-0" />
          </button>

          {/* 4. 👨‍👩‍👧 मेरे परिवार को देखें */}
          <button
            onClick={() => {
              handleSpeak('मेरा परिवार सुरक्षा समूह खोला जा रहा है।');
              navigate('family');
            }}
            className="w-full min-h-[82px] p-4 bg-purple-800 hover:bg-purple-900 active:scale-98 text-white rounded-3xl shadow-md border-2 border-purple-900 flex items-center justify-between text-left transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-white text-purple-900 flex items-center justify-center font-black text-3xl shrink-0 shadow-xs">
                👨👩👧
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black block leading-tight text-white">
                  मेरे परिवार को देखें
                </span>
                <span className="text-xs text-purple-100 font-bold">
                  परिजनों की लोकेशन व बिछड़ने पर सहायता
                </span>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-white shrink-0" />
          </button>

          {/* 5. 🚻 पास का Toilet */}
          <button
            onClick={() => {
              handleSpeak('नजदीकी बायो-शौचालय की सूची खोली जा रही है।');
              navigate('toilet');
            }}
            className="w-full min-h-[82px] p-4 bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white rounded-3xl shadow-md border-2 border-emerald-900 flex items-center justify-between text-left transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-white text-emerald-900 flex items-center justify-center font-black text-3xl shrink-0 shadow-xs">
                🚻
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black block leading-tight text-white">
                  पास का Toilet
                </span>
                <span className="text-xs text-emerald-100 font-bold">
                  स्वच्छ महिला व पुरुष बायो-शौचालय
                </span>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-white shrink-0" />
          </button>

          {/* 6. 💧 पास का पानी */}
          <button
            onClick={() => {
              handleSpeak('शीतल पेयजल अमृत सेवा काउंटर दिखाए जा रहे हैं।');
              navigate('water');
            }}
            className="w-full min-h-[82px] p-4 bg-sky-800 hover:bg-sky-900 active:scale-98 text-white rounded-3xl shadow-md border-2 border-sky-900 flex items-center justify-between text-left transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-white text-sky-900 flex items-center justify-center font-black text-3xl shrink-0 shadow-xs">
                💧
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black block leading-tight text-white">
                  पास का पानी
                </span>
                <span className="text-xs text-sky-100 font-bold">
                  शीतल शुद्ध पेयजल अमृत सेवा काउंटर
                </span>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-white shrink-0" />
          </button>

          {/* 7. 🛺 पास का Shuttle */}
          <button
            onClick={() => {
              handleSpeak('मुफ्त ई-रिक्शा शटल सेवा की जानकारी खोली जा रही है।');
              navigate('shuttle');
            }}
            className="w-full min-h-[82px] p-4 bg-amber-700 hover:bg-amber-800 active:scale-98 text-white rounded-3xl shadow-md border-2 border-amber-800 flex items-center justify-between text-left transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-white text-amber-900 flex items-center justify-center font-black text-3xl shrink-0 shadow-xs">
                🛺
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black block leading-tight text-white">
                  पास का Shuttle
                </span>
                <span className="text-xs text-amber-100 font-bold">
                  वरिष्ठ नागरिकों हेतु मुफ्त ई-रिक्शा वाहन
                </span>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-white shrink-0" />
          </button>

          {/* 8. 📢 महत्वपूर्ण सूचना (Step 16 Announcement Access) */}
          <button
            onClick={() => {
              handleSpeak('मेला नियंत्रण कक्ष की महत्वपूर्ण सूचनाएँ और मार्ग अलर्ट खोले जा रहे हैं।');
              navigate('announcements');
            }}
            className="w-full min-h-[82px] p-4 bg-stone-900 hover:bg-stone-800 active:scale-98 text-white rounded-3xl shadow-md border-2 border-amber-400 flex items-center justify-between text-left transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black text-3xl shrink-0 shadow-xs">
                📢
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black block leading-tight text-amber-300">
                  महत्वपूर्ण सूचनाएँ
                </span>
                <span className="text-xs text-stone-200 font-bold">
                  आधिकारिक बुलेटिन, मार्ग बदलाव व सुरक्षा निर्देश
                </span>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-amber-400 shrink-0" />
          </button>
        </div>
      </main>

      {/* ======================================================== */}
      {/* SETTINGS MODAL: ACCESSIBILITY & FONT SIZE (Req 5, 18, 19) */}
      {/* ======================================================== */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h4 className="text-base font-black text-stone-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-700" />
                <span>पहुंच एवं सुविधा सेटिंग्स</span>
              </h4>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Font size picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-stone-600 block">
                अक्षरों का आकार (Font Size):
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs font-black">
                {[
                  { label: 'A छोटा', val: 'SMALL' as FontSizePreference },
                  { label: 'A सामान्य', val: 'NORMAL' as FontSizePreference },
                  { label: 'A बड़ा', val: 'LARGE' as FontSizePreference },
                  { label: 'A बहुत बड़ा', val: 'EXTRA_LARGE' as FontSizePreference },
                ].map((s) => (
                  <button
                    key={s.val}
                    onClick={() => AccessibilityService.setFontSize(s.val)}
                    className={`py-2 px-1 rounded-xl border text-center transition-all ${
                      prefs.fontSize === s.val
                        ? 'bg-amber-600 text-white border-amber-600 font-black'
                        : 'bg-stone-50 text-stone-700 border-stone-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Assistance Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border">
              <div>
                <span className="text-xs font-black block">🔊 आवाज़ सहायता</span>
                <span className="text-[11px] text-stone-500">महत्वपूर्ण सूचनाएं बोलकर सुनाएँ</span>
              </div>
              <input
                type="checkbox"
                checked={prefs.voiceAssistance}
                onChange={(e) => AccessibilityService.setVoiceAssistance(e.target.checked)}
                className="w-5 h-5 text-amber-600 rounded"
              />
            </div>

            {/* Voice Speed */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-stone-600 block">
                बोलने की गति (Voice Speed):
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-black">
                {[
                  { label: 'धीमी', val: 'SLOW' as VoiceSpeedPreference },
                  { label: 'सामान्य', val: 'NORMAL' as VoiceSpeedPreference },
                  { label: 'तेज़', val: 'FAST' as VoiceSpeedPreference },
                ].map((sp) => (
                  <button
                    key={sp.val}
                    onClick={() => AccessibilityService.setVoiceSpeed(sp.val)}
                    className={`py-2 rounded-xl border text-center ${
                      prefs.voiceSpeed === sp.val
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-stone-50 text-stone-700 border-stone-300'
                    }`}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border">
              <div>
                <span className="text-xs font-black block">उच्च कंट्रास्ट (High Contrast)</span>
                <span className="text-[11px] text-stone-500">काले व पीले रंग में स्पष्ट दृश्य</span>
              </div>
              <input
                type="checkbox"
                checked={prefs.highContrast}
                onChange={(e) => AccessibilityService.setHighContrast(e.target.checked)}
                className="w-5 h-5 text-amber-600 rounded"
              />
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full min-h-[46px] bg-stone-900 hover:bg-stone-800 text-white font-black text-xs rounded-xl shadow-md"
            >
              सेव करें
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EXIT CONFIRMATION MODAL (Requirement 4)                  */}
      {/* ======================================================== */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in text-center text-stone-900">
            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto text-xl">
              👴
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-black text-stone-900">
                क्या आप Senior Mode बंद करना चाहते हैं?
              </h4>
              <p className="text-xs text-stone-500">
                सामान्य डिस्प्ले और विस्तृत मेनू पर वापस जाएँ।
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="min-h-[46px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl"
              >
                नहीं
              </button>
              <button
                onClick={handleExitSeniorMode}
                className="min-h-[46px] bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md"
              >
                हाँ, बंद करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
