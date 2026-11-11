/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import {
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sparkles,
  Share2,
  Check,
  Sun,
  Copy,
  ChevronRight,
  Flame,
} from 'lucide-react';

const ADITYA_HRIDAYA_VERSES = [
  {
    verse: 1,
    sanskrit: 'ततो युद्धपरिश्रान्तं समरे चिन्तया स्थितम्।\nरावणं चाग्रतो दृष्ट्वा युद्धाय समुपस्थितम्॥',
    hindi: 'उधर श्रीरामचंद्रजी युद्ध से थककर रणभूमि में चिंतामग्न खड़े थे। सामने रावण को युद्ध के लिए तैयार खड़ा देखकर—',
  },
  {
    verse: 2,
    sanskrit: 'दैवतैश्च समागम्य द्रष्टुमभ्यागतो रणम्।\nउपागम्याब्रवीद्राममगस्त्यो भगवान् ऋषिः॥',
    hindi: 'युद्ध देखने के लिए देवताओं के साथ आए हुए भगवान अगस्त्य मुनि ने श्रीराम के पास जाकर यह पावन वचन कहा—',
  },
  {
    verse: 3,
    sanskrit: 'राम राम महाबाहो शृणु गुह्यं सनातनम्।\nयेन सर्वानरीन् वत्स समरे विजयिष्यसि॥',
    hindi: 'हे रघुनंदन! हे महाबाहो! यह परम गोपनीय सनातन रहस्य सुनो, जिसके प्रभाव से युद्ध में समस्त शत्रुओं पर विजय प्राप्त होगी।',
  },
  {
    verse: 4,
    sanskrit: 'आदित्यहृदयं पुण्यं सर्वशत्रुविनाशनम्।\nजयावहं जपेन्नित्यमक्षय्यं परमं शिवम्॥',
    hindi: 'इस परम पवित्र स्तोत्र का नाम "आदित्य हृदय" है। यह सब शत्रुओं का नाश करने वाला, नित्य विजय दिलाने वाला और परम कल्याणकारी है।',
  },
  {
    verse: 5,
    sanskrit: 'सर्वमङ्गलमाङ्गल्यं सर्वपापप्रणाशनम्।\nचिन्ताशोकप्रशमनमायुर्वर्धनमुत्तमम्॥',
    hindi: 'यह संपूर्ण मंगलों का भी मंगल, समस्त पापों का नाशक, चिंता और शोक को शांत करने वाला तथा आयु की वृद्धि करने वाला सर्वोत्तम स्तोत्र है।',
  },
  {
    verse: 6,
    sanskrit: 'रश्मिमन्तं समुद्यन्तं देवासुरनमस्कृतम्।\nपूजयस्व विवस्वन्तं भास्करं भुवनेश्वरम्॥',
    hindi: 'किरणों से सुशोभित, नित्य उदित होने वाले, देवता और असुर दोनों द्वारा वंदित, प्रकाशक भगवान भुवन भास्कर की आराधना करो।',
  },
  {
    verse: 7,
    sanskrit: 'सर्वदेवात्मको ह्येष तेजस्वी रश्मिभावनः।\nएष देवासुरगणांल्लोकान् पाति गभस्तिभिः॥',
    hindi: 'ये सूर्यदेव ही संपूर्ण देवताओं के आत्मा, परम तेजस्वी और अपनी किरणों से संपूर्ण संसार का पालन-पोषण करने वाले हैं।',
  },
  {
    verse: 8,
    sanskrit: 'एष ब्रह्मा च विष्णुश्च शिवः स्कन्दः प्रजापतिः।\nमहेन्द्रो धनदः कालो यमः सोमो ह्यपां पतिः॥',
    hindi: 'यही ब्रह्मा, विष्णु, शिव, स्कंद, प्रजापति, इंद्र, कुबेर, काल, यम, चंद्रमा और वरुण हैं।',
  },
  {
    verse: 9,
    sanskrit: 'नमोऽस्तु रामाय सलक्ष्मणाय देव्यै च तस्यै जनकात्मजायै।\nनमोऽस्तु रुद्रेन्द्रयमानिलेभ्यो नमोऽस्तु चन्द्रार्कमरुद्गणेभ्यः॥',
    hindi: 'लक्ष्मण सहित श्रीराम, भगवती जानकी, रुद्र, इंद्र, यम, वायु, चंद्र और मरुद्गणों को नमन।',
  },
  {
    verse: 10,
    sanskrit: 'जयस्व जयभद्राय हरये हर्यश्वाय च।\nनमो नमः सहस्रांशो आदित्याय नमो नमः॥',
    hindi: 'हे कल्याणकारी, हरित अश्वों वाले सूर्यदेव! आपकी जय हो। हे सहस्र किरणों वाले भगवान भास्कर! आपको बारंबार नमस्कार है।',
  },
];

const SURYA_CHALISA = [
  '॥ दोहा ॥',
  'कनक बदन कुण्डल मकर, मुक्ता माला अङ्ग। पद्मासन पद्माभरण, देव पूजि सब संग॥',
  '॥ चौपाई ॥',
  'जय सविता जय जयति दिवाकर। सहस्र किरण जय जयति सुधाकर॥',
  'सप्त अश्व रथ सोहे भारी। छवि अनूप त्रिभुवन उजियारी॥',
  'देव दनुज सब शीश नवावैं। ऋषि-मुनि चरण कमल चित लावैं॥',
  'अर्घ्य देइ जेहि ध्यावै प्रानी। सो पावै सुख सम्पत्ति ज्ञानी॥',
  'कुष्ठ रोग अरु शोक नसावै। जो जन नित्य चालीसा गावै॥',
  'देव धाम औरंगाबाद पावन। जहाँ विराजे रवि मनभावन॥',
  'छठ महापर्व में महिमा भारी। दर्शन करि तरि जाहिं नर-नारी॥',
  '॥ दोहा ॥',
  'भक्ति भाव सों जो पढ़े, सूर्य चालीसा नित्य। सुख सम्पति आरु आरोग्यता, देहिं देव आदित्य॥',
];

const SURYA_NAMASKAR_MANTRAS = [
  { step: 1, mantra: 'ॐ मित्राय नमः', meaning: 'सबके प्रति स्नेहभाव रखने वाले को नमन', posture: 'प्रणामासन (Pranamasana)' },
  { step: 2, mantra: 'ॐ रवये नमः', meaning: 'प्रकाश का प्रसार करने वाले को नमन', posture: 'हस्त उत्थानासन (Hastautthanasana)' },
  { step: 3, mantra: 'ॐ सूर्याय नमः', meaning: 'सक्रियता व प्रेरणा प्रदान करने वाले को नमन', posture: 'पादहस्तासन (Padahastasana)' },
  { step: 4, mantra: 'ॐ भानवे नमः', meaning: 'ज्ञान व तेज प्रकाशित करने वाले को नमन', posture: 'अश्व संचालासना (Ashwa Sanchalanasana)' },
  { step: 5, mantra: 'ॐ खगाय नमः', meaning: 'आकाश में विचरण करने वाले को नमन', posture: 'पर्वतासन (Parvatasana)' },
  { step: 6, mantra: 'ॐ पूष्णे नमः', meaning: 'समस्त जगत का पोषण करने वाले को नमन', posture: 'अष्टांग नमस्कार (Ashtanga Namaskara)' },
  { step: 7, mantra: 'ॐ हिरण्यगर्भाय नमः', meaning: 'स्वर्ण के समान आभा धारण करने वाले को नमन', posture: 'भुजंगासन (Bhujangasana)' },
  { step: 8, mantra: 'ॐ मरीचये नमः', meaning: 'अनंत किरणों के स्वामी को नमन', posture: 'पर्वतासन (Parvatasana)' },
  { step: 9, mantra: 'ॐ आदित्याय नमः', meaning: 'माता अदिति के परम तेजस्वी पुत्र को नमन', posture: 'अश्व संचालासना (Ashwa Sanchalanasana)' },
  { step: 10, mantra: 'ॐ सवित्रे नमः', meaning: 'जीवन की उत्पत्ति करने वाले को नमन', posture: 'पादहस्तासन (Padahastasana)' },
  { step: 11, mantra: 'ॐ अर्काय नमः', meaning: 'संसार में सर्वाधिक पूजनीय को नमन', posture: 'हस्त उत्थानासन (Hastautthanasana)' },
  { step: 12, mantra: 'ॐ भास्कराय नमः', meaning: 'संपूर्ण सृष्टि को आलोकित करने वाले को नमन', posture: 'प्रणामासन (Pranamasana)' },
];

export const SuryaStotraScreen: React.FC = () => {
  const { navigate } = useApp();
  const [activeTab, setActiveTab] = useState<'STOTRA' | 'CHALISA' | 'NAMASKAR' | 'ARGHYA_MANTRA'>('STOTRA');
  const [isPlayingOm, setIsPlayingOm] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);

  // Play peaceful meditative 136.1Hz (Cosmic Om Frequency)
  const toggleOmDrone = () => {
    if (isPlayingOm) {
      if (droneOscRef.current && droneGainRef.current && audioCtxRef.current) {
        droneGainRef.current.gain.linearRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.5);
        setTimeout(() => {
          droneOscRef.current?.stop();
          droneOscRef.current?.disconnect();
          droneOscRef.current = null;
        }, 500);
      }
      setIsPlayingOm(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(136.1, ctx.currentTime); // 136.1 Hz Sacred Earth Om frequency

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        droneOscRef.current = osc;
        droneGainRef.current = gain;
        setIsPlayingOm(true);
      } catch (e) {
        console.warn('Audio unavailable:', e);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (droneOscRef.current) {
        try {
          droneOscRef.current.stop();
          droneOscRef.current.disconnect();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  return (
    <div className="min-h-screen bg-[#FFF8E1] text-stone-900 pb-28 flex flex-col font-['Noto_Sans_Devanagari','Inter',sans-serif]">
      <TopBar title="आदित्य हृदय स्तोत्र व मंत्र" showBack />

      <main className="flex-1 max-w-3xl sm:max-w-4xl mx-auto w-full p-3 sm:p-6 space-y-4">
        {/* Divine Header Banner */}
        <div className="bg-gradient-to-br from-[#0B5E8E] via-[#07476F] to-[#04283F] text-white rounded-3xl p-5 shadow-lg border-2 border-amber-400 relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 border border-amber-300 text-amber-300 px-2.5 py-0.5 rounded-full inline-block">
                वाल्मीकि रामायण • युद्ध काण्ड
              </span>
              <h2 className="text-xl font-black text-white leading-tight">
                संपूर्ण आदित्य हृदय स्तोत्रम् व सूर्य मंत्र
              </h2>
              <p className="text-xs text-amber-100">
                भगवान भास्कर के प्रत्यक्ष आशीर्वाद, आरोग्य व शत्रु विजय हेतु
              </p>
            </div>

            <button
              onClick={toggleOmDrone}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center shrink-0 border transition-all active:scale-95 shadow-md ${
                isPlayingOm
                  ? 'bg-amber-400 text-black border-white animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 text-amber-300 border-amber-400/40'
              }`}
            >
              {isPlayingOm ? <Volume2 className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span className="text-[9px] font-black mt-1">
                {isPlayingOm ? 'ॐ नाद चालू' : 'ॐ नाद'}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-4 gap-1.5 bg-[#0B5E8E]/10 p-1.5 rounded-2xl text-xs font-black border border-[#0B5E8E]/20">
          <button
            onClick={() => setActiveTab('STOTRA')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeTab === 'STOTRA'
                ? 'bg-[#0B5E8E] text-white shadow-md'
                : 'text-[#0B5E8E] hover:bg-white/50'
            }`}
          >
            📜 स्तोत्रम्
          </button>
          <button
            onClick={() => setActiveTab('CHALISA')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeTab === 'CHALISA'
                ? 'bg-[#0B5E8E] text-white shadow-md'
                : 'text-[#0B5E8E] hover:bg-white/50'
            }`}
          >
            ☀️ चालीसा
          </button>
          <button
            onClick={() => setActiveTab('NAMASKAR')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeTab === 'NAMASKAR'
                ? 'bg-[#0B5E8E] text-white shadow-md'
                : 'text-[#0B5E8E] hover:bg-white/50'
            }`}
          >
            🧘 १२ मंत्र
          </button>
          <button
            onClick={() => setActiveTab('ARGHYA_MANTRA')}
            className={`py-2 px-1 rounded-xl transition-all ${
              activeTab === 'ARGHYA_MANTRA'
                ? 'bg-[#0B5E8E] text-white shadow-md'
                : 'text-[#0B5E8E] hover:bg-white/50'
            }`}
          >
            🌊 अर्घ्य विधान
          </button>
        </div>

        {/* TAB 1: ADITYA HRIDAYA STOTRAM */}
        {activeTab === 'STOTRA' && (
          <div className="space-y-3">
            <div className="bg-amber-100/70 border border-amber-300 p-3 rounded-2xl text-xs text-amber-950 font-medium">
              💡 <strong>महत्व:</strong> युद्ध में रावण पर विजय प्राप्त करने हेतु महर्षि अगस्त्य ने भगवान श्रीराम को इस स्तोत्र का उपदेश दिया था। यह स्तोत्र प्रतिदिन पढ़ने से मनोवांछित फल, आरोग्य और विजय की प्राप्ति होती है।
            </div>

            {ADITYA_HRIDAYA_VERSES.map((v, idx) => (
              <div
                key={v.verse}
                className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-300/80 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="text-[11px] font-black bg-amber-400/20 text-[#0B5E8E] px-2.5 py-0.5 rounded-full">
                    श्लोक {v.verse}
                  </span>
                  <button
                    onClick={() => handleCopy(`${v.sanskrit}\n\nअर्थ: ${v.hindi}`, idx)}
                    className="text-xs text-stone-500 hover:text-[#0B5E8E] flex items-center gap-1 font-bold"
                  >
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === idx ? 'कॉपी हुआ' : 'श्लोक कॉपी'}</span>
                  </button>
                </div>

                <p className="text-base sm:text-lg font-bold text-[#07476F] whitespace-pre-line leading-relaxed font-serif">
                  {v.sanskrit}
                </p>

                <p className="text-xs sm:text-sm text-stone-700 bg-[#FFF8E1] p-3 rounded-2xl border border-amber-200 leading-relaxed font-medium">
                  <strong>सरल अर्थ:</strong> {v.hindi}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: SURYA CHALISA */}
        {activeTab === 'CHALISA' && (
          <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-xs space-y-4">
            <div className="border-b border-amber-200 pb-2 text-center">
              <h3 className="text-lg font-black text-[#0B5E8E]">॥ श्री सूर्य देव चालीसा ॥</h3>
              <p className="text-xs text-stone-500 font-medium">
                आरोग्य, यश एवं समस्त कष्ट निवारण हेतु नित्य पाठ
              </p>
            </div>

            <div className="space-y-2.5 text-sm sm:text-base font-semibold text-stone-800 leading-loose text-center">
              {SURYA_CHALISA.map((line, i) => (
                <p
                  key={i}
                  className={
                    line.startsWith('॥')
                      ? 'font-black text-[#0B5E8E] text-base pt-2'
                      : 'hover:text-[#F47B20] transition-colors'
                  }
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: 12 SURYA NAMASKAR MANTRAS */}
        {activeTab === 'NAMASKAR' && (
          <div className="space-y-3">
            <div className="bg-sky-50 border border-sky-300 p-3 rounded-2xl text-xs text-sky-950 font-medium">
              ☀️ <strong>द्वादश आदित्य साधना:</strong> भगवान सूर्य के 12 नाम शारीरिक स्वास्थ्य, नेत्र ज्योति और मानसिक शांति प्रदान करते हैं।
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SURYA_NAMASKAR_MANTRAS.map((item) => (
                <div
                  key={item.step}
                  className="bg-white p-3.5 rounded-2xl border border-amber-300 shadow-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#0B5E8E] bg-[#FFF8E1] px-2 py-0.5 rounded-lg border border-amber-200">
                      चरण {item.step}
                    </span>
                    <span className="text-[11px] font-bold text-stone-600">
                      {item.posture}
                    </span>
                  </div>
                  <p className="text-base font-black text-stone-900 font-serif">
                    {item.mantra}
                  </p>
                  <p className="text-xs text-stone-600 font-medium">
                    {item.meaning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SACRED ARGHYA VIDHI */}
        {activeTab === 'ARGHYA_MANTRA' && (
          <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-xs space-y-4">
            <div className="border-b border-stone-200 pb-2">
              <h3 className="text-base font-black text-[#0B5E8E]">
                छठ महापर्व पावन अर्घ्य मंत्र व विधि
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                सूर्य कुंड व छठ घाटों पर अर्घ्य देते समय का वैदिक नियम
              </p>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-2">
              <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full">
                महा-अर्घ्य मन्त्र
              </span>
              <p className="text-base font-black text-stone-900 font-serif leading-relaxed">
                ॐ एहि सूर्य सहस्त्रांशो तेजोराशे जगत्पते।<br />
                अनुकम्पय मां भक्त्या गृहाणार्घ्यं दिवाकर॥
              </p>
              <p className="text-xs text-stone-700 leading-normal border-t border-amber-200 pt-1.5">
                <strong>भावार्थ:</strong> हे भुवन भास्कर! आप संपूर्ण ब्रह्मांड के जीवनदाता हैं। मुझ पर अपनी कृपा दृष्टि रखते हुए मेरे इस भक्तिपूर्ण अर्घ्य को स्वीकार करें।
              </p>
            </div>

            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-300 space-y-1.5">
              <span className="text-[10px] font-black uppercase text-sky-900 bg-sky-200 px-2 py-0.5 rounded-full">
                सूर्य बीज मन्त्र (तांत्रिक जप)
              </span>
              <p className="text-base font-black text-[#075985] font-serif">
                ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः॥
              </p>
              <p className="text-xs text-stone-600">
                इस मंत्र का 108 बार जप करने से सभी प्रकार के ग्रह दोष व कुष्ठ रोग शांत होते हैं।
              </p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-2">
              <span className="text-[10px] font-black uppercase text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded-full">
                अर्घ्य समर्पण की सही विधि
              </span>
              <ul className="text-xs text-stone-800 space-y-1.5 list-disc pl-4 font-medium">
                <li>तांबे के पात्र या बांस के सूप में गंगाजल, कच्चा गाय का दूध, रोली, अक्षत, ऋतुफल व लाल पुष्प रखें।</li>
                <li>कमर तक पावन जल (सूर्य कुंड अथवा पवित्र नदी) में खड़े होकर दोनों हाथों को सिर से ऊपर उठाएं।</li>
                <li>धार के मध्य से सूर्यदेव की किरणों का दर्शन करते हुए धीरे-धीरे अर्घ्य अर्पित करें।</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
