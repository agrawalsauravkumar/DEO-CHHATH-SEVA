import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, ShieldCheck, UsersRound } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { BrandFooter } from '../components/ChhathThemeComponents';
import { TeamMember, TeamService } from '../services/TeamService';
import { useApp } from '../context/AppContext';

type TeamState = 'loading' | 'ready' | 'empty' | 'error';

export const TeamScreen: React.FC = () => {
  const { navigate } = useApp();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [containsDemo, setContainsDemo] = useState(false);
  const [state, setState] = useState<TeamState>('loading');
  const [error, setError] = useState('');

  const loadMembers = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const result = await TeamService.getPublicMembers();
      setMembers(result.members);
      setContainsDemo(Boolean(result.containsDemo));
      setState(result.members.length ? 'ready' : 'empty');
    } catch (loadError) {
      setState('error');
      setError(loadError instanceof Error ? loadError.message : 'टीम विवरण लोड नहीं हो सका।');
    }
  }, []);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  return (
    <div className="min-h-[100dvh] bg-[var(--chhath-cream)] pb-24 font-['Noto_Sans_Devanagari','Inter',sans-serif]">
      <TopBar title="हमारी टीम" showBack />
      <main className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6">
        <section className="overflow-hidden rounded-3xl border border-[#FFB52E]/60 bg-gradient-to-br from-[#075985] via-[#075985] to-[#063B5C] p-5 text-white shadow-lg sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#FFB52E] text-[#063B5C]">
              <UsersRound className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-bold tracking-wide text-[#FFF7E5]/80">NEXTGEN DEVBHOOMI FOUNDATION</p>
              <h1 className="text-2xl font-black sm:text-3xl">हमारी टीम</h1>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#FFF7E5]">
            टीम के सार्वजनिक सदस्य विवरण संस्था की स्वीकृति के बाद यहाँ दिखाए जाते हैं।
          </p>
        </section>

        {containsDemo && (
          <p className="mt-4 rounded-2xl border border-[#A61B29]/25 bg-[#A61B29]/5 px-4 py-3 text-sm font-bold leading-relaxed text-[#7F1D1D]" role="note">
            प्रदर्शन हेतु नमूना प्रोफ़ाइल दिखाई जा रही हैं। ये वास्तविक संस्था सदस्यों की पुष्टि नहीं हैं।
          </p>
        )}

        {state === 'loading' && (
          <p className="mt-8 text-center text-sm font-bold text-[#075985]" role="status">
            टीम विवरण लोड हो रहे हैं…
          </p>
        )}

        {state === 'error' && (
          <section className="mt-8 rounded-2xl border border-[#A61B29]/30 bg-white p-5 text-center" role="alert">
            <p className="font-bold text-[#7F1D1D]">टीम विवरण उपलब्ध नहीं हो सके।</p>
            <p className="mt-1 text-sm text-stone-700">{error}</p>
            <button
              type="button"
              onClick={() => void loadMembers()}
              className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#075985] px-4 font-bold text-white"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              पुनः प्रयास करें
            </button>
          </section>
        )}

        {state === 'empty' && (
          <p className="mt-8 rounded-2xl border border-[#075985]/15 bg-white p-5 text-center text-sm font-semibold text-stone-700">
            अभी कोई स्वीकृत टीम परिचय प्रकाशित नहीं है।
          </p>
        )}

        {state === 'ready' && (
          <ul className="mt-5 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {members.map((member) => (
              <li key={member.id} className="overflow-hidden rounded-2xl border border-[#075985]/10 bg-white shadow-sm">
                <img
                  src={TeamService.getPhotoUrl(member)}
                  alt={`${member.fullName} का प्रोफ़ाइल चित्र`}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover"
                  onError={(event) => {
                    if (!event.currentTarget.src.endsWith('/team-placeholder.svg')) {
                      event.currentTarget.src = '/team-placeholder.svg';
                    }
                  }}
                />
                <div className="border-t-2 border-[#FFB52E] px-3 py-3">
                  <h2 className="break-words text-base font-black leading-snug text-[#063B5C]">{member.fullName}</h2>
                  <p className="mt-1 break-words text-sm font-semibold text-[#075985]">{member.designation}</p>
                  {member.biography && (
                    <p className="mt-2 break-words text-xs leading-relaxed text-stone-600 border-t border-stone-100 pt-1.5">{member.biography}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <section className="mt-8 rounded-2xl border border-[#075985]/20 bg-gradient-to-r from-amber-50/80 via-white to-sky-50/80 p-4 shadow-xs sm:p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#075985]/10 text-[#075985]">
                <ShieldCheck className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-bold text-[#063B5C]">अधिकृत संस्था व्यवस्थापक?</p>
                <p className="text-xs text-stone-600">टीम प्रोफ़ाइल संपादित करने, नई जोड़ने या प्रकाशित करने हेतु एडमिन पैनल में जाएँ।</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('admin-login')}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#075985] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#063B5C] active:scale-95 transition-all"
            >
              <span>एडमिन पैनल खोलें</span>
            </button>
          </div>
        </section>

        <BrandFooter className="mt-8 pb-2" />
      </main>
    </div>
  );
};
