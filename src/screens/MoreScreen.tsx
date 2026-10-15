import React from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import {
  Compass,
  Car,
  BookmarkCheck,
  Bus,
  HeartPulse,
  LifeBuoy,
  PhoneCall,
  Sparkles,
  Droplet,
  Users,
  Megaphone,
  Heart,
  Accessibility,
  Bell,
  DownloadCloud,
  Globe,
  MapPin,
  Info,
  Settings,
  ArrowRight,
} from 'lucide-react';
import { ScreenId } from '../types';

export const MoreScreen: React.FC = () => {
  const { navigate, seniorMode, currentUser, isAuthenticated } = useApp();

  const menuSections: {
    category: string;
    items: {
      id: ScreenId;
      label: string;
      desc: string;
      icon: string;
      badge?: string;
    }[];
  }[] = [
    {
      category: 'खाता एवं सुरक्षा (Account & Security)',
      items: [
        {
          id: isAuthenticated ? 'profile' : 'login',
          label: isAuthenticated ? `मेरी प्रोफ़ाइल (${currentUser?.fullName?.split(' ')[0]})` : 'लॉगिन / प्रवेश (Login with OTP)',
          desc: isAuthenticated ? `भूमिका: ${currentUser?.role} • खाता विवरण व सेटिंग्स` : 'मोबाइल नंबर व OTP द्वारा सुरक्षित लॉगिन',
          icon: '👤',
          badge: isAuthenticated ? currentUser?.role : 'OTP',
        },
      ],
    },
    {
      category: 'मार्ग व परिवहन (Navigation & Transit)',
      items: [
        {
          id: 'map',
          label: 'देव सेवा नक्शा',
          desc: 'अधिकृत स्रोत से सत्यापित स्थान उपलब्ध होने पर देखें',
          icon: '🧭',
        },
        {
          id: 'search',
          label: 'गंतव्य खोजें',
          desc: 'सत्यापित स्थलों को नाम या श्रेणी से खोजें',
          icon: '🔍',
        },
        {
          id: 'parking',
          label: 'पार्किंग स्थल',
          desc: 'उपलब्ध सत्यापित पार्किंग जानकारी देखें',
          icon: '🅿️',
        },
        {
          id: 'save-parking',
          label: 'मेरी पार्किंग',
          desc: 'सहेजी जगह देखें या सत्यापित पार्किंग चुनें',
          icon: '🚗',
        },
        {
          id: 'shuttle',
          label: 'निःशुल्क शटल व ई-रिक्शा',
          desc: 'सत्यापित सेवा जानकारी उपलब्ध होने पर देखें',
          icon: '🛺',
        },
        {
          id: 'offline-map',
          label: 'ऑफलाइन मैप स्थिति',
          desc: 'ऑफलाइन टाइल और रूटिंग उपलब्ध नहीं; सहेजे स्थल दिख सकते हैं',
          icon: '📥',
        },
      ],
    },
    {
      category: 'जनसुविधाएं एवं सहायता (Amenities & Help)',
      items: [
        {
          id: 'water',
          label: 'पेयजल केंद्र',
          desc: 'उपलब्ध सत्यापित पेयजल जानकारी देखें',
          icon: '💧',
        },
        {
          id: 'toilet',
          label: 'शौचालय सुविधाएं',
          desc: 'उपलब्ध सत्यापित शौचालय जानकारी देखें',
          icon: '🚻',
        },
        {
          id: 'medical',
          label: 'चिकित्सा व प्राथमिक उपचार',
          desc: 'आपात नंबर देखें; सुविधा स्थल केवल सत्यापित होने पर दिखेंगे',
          icon: '🚑',
        },
        {
          id: 'help',
          label: 'सहायता केंद्र',
          desc: 'सहायता विकल्प और उपलब्ध सत्यापित केंद्र देखें',
          icon: '🆘',
        },
        {
          id: 'emergency',
          label: 'आपातकालीन SOS व सायरन',
          desc: '112, 108, तेज सुरक्षा सायरन व आपात नंबर',
          icon: '🚨',
          badge: 'SOS',
        },
      ],
    },
    {
      category: 'श्रद्धालु व परिवार सुरक्षा (Safety & Community)',
      items: [
        {
          id: 'family',
          label: '👨👩👧 मेरा परिवार',
          desc: 'परिवार लोकेशन सेवा इस बिल्ड में उपलब्ध नहीं है',
          icon: '👨👩👧',
        },
        {
          id: 'lost-found',
          label: '🔎 Lost & Found (खोया-पाया)',
          desc: 'लापता व्यक्ति व सामान की सुरक्षित रिपोर्टिंग एवं सहायता',
          icon: '🔎',
        },
        {
          id: 'senior-mode',
          label: '👴 Senior Citizen Mode',
          desc: 'बड़े अक्षर, सरल 7 विकल्प और आवाज़ सहायता',
          icon: '👴',
        },
        {
          id: 'volunteer',
          label: '🙋 स्वयंसेवक (Volunteer Hub)',
          desc: 'स्वयंसेवक के रूप में जुड़ें व Volunteer Mode',
          icon: '🙋',
        },
        {
          id: 'volunteer-register',
          label: '✍️ स्वयंसेवक के रूप में जुड़ें',
          desc: 'नया स्वयंसेवक पंजीकरण फॉर्म भरें',
          icon: '📝',
        },
        {
          id: 'volunteer-mode',
          label: '⚡ Volunteer Mode (डैशबोर्ड)',
          desc: 'सत्यापित स्वयंसेवक लॉगिन और सर्वर सेवा आवश्यक',
          icon: '🟢',
        },
        {
          id: 'volunteer-request',
          label: 'सहायता का अनुरोध (Request Help)',
          desc: 'सहायता अनुरोध भेजें; उपलब्धता की पुष्टि अलग से आवश्यक है',
          icon: '🤝',
        },
        {
          id: 'announcements',
          label: '📢 महत्वपूर्ण सूचना',
          desc: 'अधिकृत और सक्रिय घोषणाएँ उपलब्ध होने पर देखें',
          icon: '📢',
          badge: 'OFFICIAL',
        },
      ],
    },
    {
      category: 'ऐप व संस्था (About & Settings)',
      items: [
        {
          id: 'about',
          label: 'हमारे बारे में',
          desc: 'NEXTGEN DEVBHOOMI FOUNDATION सेवा संकल्प',
          icon: 'ℹ️',
        },
        {
          id: 'settings',
          label: 'ऐप सेटिंग्स',
          desc: 'अक्षर का आकार, भाषा, ऑफलाइन स्टोरेज',
          icon: '⚙️',
        },
        {
          id: 'language',
          label: 'भाषा चयन (Language)',
          desc: 'हिन्दी, भोजपुरी, मगही, English',
          icon: '🌐',
        },
        {
          id: 'location-permission',
          label: 'लोकेशन अनुमति',
          desc: 'जीपीएस लोकेशन सेटिंग्स व जानकारी',
          icon: '📍',
        },
        {
          id: 'admin-login',
          label: '🔐 Admin Portal (व्यवस्थापक पोर्टल)',
          desc: 'फाउंडेशन व नियंत्रण कक्ष अधिकृत लॉगिन एवं डैशबोर्ड',
          icon: '🔐',
          badge: 'STAFF',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 pb-20 flex flex-col">
      <TopBar title="सभी सेवाएँ एवं मेनू" showBack />

      <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-5">
        {menuSections.map((sec, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
              {sec.category}
            </h3>

            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-100 shadow-xs">
              {sec.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-amber-50/50 active:bg-amber-100/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl w-8 text-center shrink-0">{item.icon}</span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-stone-900 leading-tight ${
                            seniorMode ? 'text-base' : 'text-sm'
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] bg-red-600 text-white font-extrabold px-1.5 py-0.2 rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 line-clamp-1">{item.desc}</p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center pt-2 pb-4 text-xs text-stone-500 space-y-1">
          <p className="font-semibold text-stone-700">
            एक सेवा पहल — NEXTGEN DEVBHOOMI FOUNDATION
          </p>
          <p className="text-[11px] text-stone-500">“रास्ता भी • सहायता भी • सेवा भी”</p>
        </div>
      </main>
    </div>
  );
};
