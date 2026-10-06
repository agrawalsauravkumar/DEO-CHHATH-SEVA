import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { VolunteerService } from '../services/VolunteerService';
import { Volunteer, UserRole } from '../types';
import {
  HeartHandshake,
  UserCheck,
  Clock,
  ShieldCheck,
  MapPin,
  ArrowRight,
  ShieldAlert,
  Languages,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Lock,
} from 'lucide-react';

export const VolunteerScreen: React.FC = () => {
  const { navigate } = useApp();
  const [profile, setProfile] = useState<Volunteer | undefined>(() =>
    VolunteerService.getVolunteerProfile()
  );
  const [currentRole, setCurrentRole] = useState<UserRole>(() =>
    VolunteerService.getCurrentUserRole()
  );
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  useEffect(() => {
    setProfile(VolunteerService.getVolunteerProfile());
    setCurrentRole(VolunteerService.getCurrentUserRole());
  }, []);

  const isVerified = profile?.verificationStatus === 'VERIFIED';
  const isPending = profile?.verificationStatus === 'PENDING';

  // Admin Quick Test Verification (Prepares architecture for Admin Dashboard integration)
  const handleAdminVerifyToggle = () => {
    if (!profile) return;
    const nextStatus = profile.verificationStatus === 'VERIFIED' ? 'PENDING' : 'VERIFIED';
    VolunteerService.adminVerifyVolunteer(profile.id, nextStatus);
    const updated = VolunteerService.getVolunteerProfile(profile.id);
    setProfile(updated);
    setAdminNotice(
      nextStatus === 'VERIFIED'
        ? '✅ Admin Action: स्वयंसेवक को अधिकृत (VERIFIED) कर दिया गया है।'
        : '⏳ Admin Action: स्वयंसेवक की स्थिति PENDING कर दी गई है।'
    );
    setTimeout(() => setAdminNotice(null), 4000);
  };

  const handleSwitchToDemoVolunteer = () => {
    VolunteerService.setActiveVolunteerId('vol-rahul-01');
    VolunteerService.setCurrentUserRole('VOLUNTEER');
    setProfile(VolunteerService.getVolunteerProfile('vol-rahul-01'));
    setCurrentRole('VOLUNTEER');
    setAdminNotice('राहुल कुमार (Verified Volunteer) प्रोफाइल लोड किया गया।');
    setTimeout(() => setAdminNotice(null), 3000);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 flex flex-col font-['Mukta',sans-serif]">
      <TopBar title="NextGen सेवा दल (स्वयंसेवक)" showBack />

      <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-4">
        {/* Admin Toast */}
        {adminNotice && (
          <div className="bg-amber-50 border border-amber-300 text-amber-950 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{adminNotice}</span>
          </div>
        )}

        {/* Hero Header */}
        <div className="bg-gradient-to-br from-[#0F2642] via-[#16365C] to-[#0A1A2E] text-white rounded-3xl p-5 border-2 border-amber-500/40 shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold text-2xl shrink-0">
              🙋
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                NextGen Devbhoomi Seva
              </span>
              <h2 className="text-lg font-black text-white leading-tight">
                स्वयंसेवक सेवा पोर्टल
              </h2>
            </div>
          </div>
          <p className="text-xs text-amber-100/90 leading-relaxed">
            छठ महापर्व में आने वाले लाखों श्रद्धालुओं, बुजुर्गों एवं व्रतियों की सेवा हेतु समर्पित युवा स्वयंसेवक दल।
          </p>
        </div>

        {/* ======================================================== */}
        {/* TWO PRIMARY ACTIONS (Specified in Requirement 1)        */}
        {/* ======================================================== */}
        <div className="space-y-3">
          {/* Action 1: [स्वयंसेवक के रूप में जुड़ें] */}
          <button
            onClick={() => navigate('volunteer-register')}
            className="w-full min-h-[68px] p-4 bg-white border border-stone-200 hover:border-amber-400 rounded-3xl shadow-xs text-left flex items-center justify-between active:scale-98 transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0 text-2xl group-hover:scale-105 transition-transform">
                ✍️
              </div>
              <div>
                <span className="text-base font-black text-stone-900 block leading-tight">
                  स्वयंसेवक के रूप में जुड़ें
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  नया पंजीकरण फॉर्म भरें व सेवा का संकल्प लें
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Action 2: [Volunteer Mode] */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (isVerified) {
                  navigate('volunteer-mode');
                } else if (isPending) {
                  alert('आपका volunteer registration अभी verification के लिए लंबित है। Admin verification के बाद Volunteer Mode सक्रिय होगा।');
                } else {
                  alert('Volunteer Mode का उपयोग करने के लिए पहले पंजीकरण करें।');
                }
              }}
              className={`w-full min-h-[68px] p-4 rounded-3xl shadow-sm text-left flex items-center justify-between transition-all ${
                isVerified
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md active:scale-98 cursor-pointer'
                  : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl ${
                    isVerified ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-400'
                  }`}
                >
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-base font-black block leading-tight ${
                        isVerified ? 'text-white' : 'text-stone-700'
                      }`}
                    >
                      Volunteer Mode (डैशबोर्ड)
                    </span>
                    {!isVerified && <Lock className="w-3.5 h-3.5 text-stone-400" />}
                  </div>
                  <span
                    className={`text-xs font-medium block mt-0.5 ${
                      isVerified ? 'text-emerald-100' : 'text-stone-500'
                    }`}
                  >
                    {isVerified
                      ? 'सहायता अनुरोध स्वीकारें व मार्गदर्शन करें'
                      : isPending
                      ? 'Admin Verification लंबित है'
                      : 'केवल अधिकृत स्वयंसेवकों हेतु उपलब्ध'}
                  </span>
                </div>
              </div>

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isVerified ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-400'
                }`}
              >
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CURRENT VOLUNTEER PROFILE (If Registered)                */}
        {/* ======================================================== */}
        {profile && (
          <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3.5 animate-fade-in">
            <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-stone-400 block">ID: {profile.id}</span>
                <h3 className="text-lg font-black text-stone-900 leading-tight">
                  {profile.name}
                </h3>
                <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>सेवा क्षेत्र: <strong>{profile.serviceArea}</strong></span>
                </p>
              </div>

              {/* Status Badge per Requirement 4 */}
              <div>
                {isVerified ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>✅ VERIFIED VOLUNTEER</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>⏳ VERIFICATION PENDING</span>
                  </span>
                )}
              </div>
            </div>

            {/* Pending Notice if not verified */}
            {isPending && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-xs text-amber-950 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>“आपका volunteer registration verification के लिए भेज दिया गया है।”</strong>
                  <br />
                  जिला नियंत्रण कक्ष अथवा NextGen सेवा दल एडमिन द्वारा सत्यापन के पश्चात आपको सेवा कार्य सौंपे जाएंगे।
                </p>
              </div>
            )}

            {/* Profile Attributes */}
            <div className="space-y-2 text-xs text-stone-700">
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-1.5">
                <div>
                  <span className="text-stone-400 font-bold block text-[10px] uppercase">चयनित सेवाएँ:</span>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {profile.services.map((srv, i) => (
                      <span
                        key={i}
                        className="bg-white border border-stone-200 px-2 py-0.5 rounded-lg text-stone-800 font-bold text-[11px]"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                  <span className="text-stone-500 font-medium">भाषा:</span>
                  <span className="font-bold text-stone-900">{profile.languages.join(', ')}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-medium">उपलब्धता समय:</span>
                  <span className="font-bold text-stone-900">{profile.availabilityTime || '24 घंटे'}</span>
                </div>
              </div>
            </div>

            {/* Direct Entry to Volunteer Mode if verified */}
            {isVerified && (
              <button
                onClick={() => navigate('volunteer-mode')}
                className="w-full min-h-[46px] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <span>Volunteer Mode में प्रवेश करें</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* ADMIN TESTING & DEMO TOOLBAR                             */}
        {/* ======================================================== */}
        <div className="bg-stone-200/70 border border-stone-300 rounded-3xl p-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-black text-stone-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              <span>Admin Verification & Demo Tool (Testing)</span>
            </span>
          </div>

          <p className="text-[11px] text-stone-600">
            सिस्टम परीक्षण हेतु आप स्वयंसेवक को सत्यापित (Verify/Unverify) कर सकते हैं अथवा पहले से अधिकृत स्वयंसेवक राहुल कुमार की प्रोफाइल लोड कर सकते हैं:
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {profile && (
              <button
                onClick={handleAdminVerifyToggle}
                className="min-h-[38px] px-3 py-1.5 bg-[#0F2642] hover:bg-[#16365C] text-white font-bold rounded-xl text-[11px] shadow-xs"
              >
                {isVerified ? 'Admin: Unverify करें' : 'Admin: Verify करें (Test)'}
              </button>
            )}
            <button
              onClick={handleSwitchToDemoVolunteer}
              className="min-h-[38px] px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-[11px] shadow-xs"
            >
              Demo Verified Volunteer
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
