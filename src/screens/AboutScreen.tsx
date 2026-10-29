/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  Leaf,
  Mail,
  MapPin,
  UsersRound,
  Eye,
  Target,
} from 'lucide-react';
import { BrandFooter } from '../components/ChhathThemeComponents';
import { ChhathSunriseBackdrop } from '../components/ChhathSunriseBackdrop';
import { DeoChhathSevaLogo } from '../components/DeoChhathSevaLogo';
import { TopBar } from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { getAboutTranslations } from '../locales/about';

const focusIcons = [BookOpen, HeartPulse, HeartHandshake, GraduationCap, Leaf, UsersRound];

export const AboutScreen: React.FC = () => {
  const { language, setLanguage, navigate } = useApp();
  const copy = getAboutTranslations(language);
  const isEnglish = language === 'en';

  return (
    <div lang={language} className="min-h-screen bg-[#FFF8E1] pb-24 font-['Mukta',sans-serif]">
      <TopBar title={copy.title} showBack />

      <main className="mx-auto w-full max-w-4xl space-y-4 p-4 sm:space-y-5 sm:p-6">
        <div
          className="flex justify-end"
          role="group"
          aria-label={isEnglish ? 'About Us language' : 'परिचय की भाषा'}
        >
          <button
            type="button"
            lang="hi"
            aria-pressed={!isEnglish}
            onClick={() => setLanguage('hi')}
            className={`min-h-11 rounded-l-xl border px-4 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B5E8E] ${
              !isEnglish
                ? 'border-[#0B5E8E] bg-[#0B5E8E] text-white'
                : 'border-[#0B5E8E]/30 bg-white text-[#0B5E8E]'
            }`}
          >
            हिन्दी
          </button>
          <button
            type="button"
            lang="en"
            aria-pressed={isEnglish}
            onClick={() => setLanguage('en')}
            className={`min-h-11 rounded-r-xl border border-l-0 px-4 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B5E8E] ${
              isEnglish
                ? 'border-[#0B5E8E] bg-[#0B5E8E] text-white'
                : 'border-[#0B5E8E]/30 bg-white text-[#0B5E8E]'
            }`}
          >
            English
          </button>
        </div>

        <section
          className="relative isolate overflow-hidden rounded-3xl border border-[#FFD54F] bg-[#0B5E8E] text-white shadow-lg"
          aria-labelledby="foundation-name"
        >
          <ChhathSunriseBackdrop height={116} label={copy.heroImageAlt} />
          <div className="relative -mt-7 space-y-3 px-5 pb-6 text-center sm:px-8">
            <div className="mx-auto inline-flex rounded-full border-4 border-[#FFD54F] bg-[#FFF8E1] p-1 shadow-lg">
              <DeoChhathSevaLogo
                size={92}
                alt={copy.logoAlt}
                className="rounded-full sm:h-28 sm:w-28"
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-widest text-[#FFD54F]">
                {copy.appName}
              </p>
              <h1 id="foundation-name" className="break-words text-xl font-black sm:text-2xl">
                {copy.organization}
              </h1>
              <p className="text-xs font-bold text-[#FFF8E1]">{copy.serviceInitiative}</p>
              <p className="text-sm font-semibold leading-relaxed text-[#FFF8E1] sm:text-base">
                {copy.tagline}
              </p>
              <p className="inline-flex items-center gap-1.5 pt-1 text-xs font-bold text-[#FFD54F] sm:text-sm">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                {copy.location}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-2.5 rounded-3xl border-2 border-[#FFD54F]/80 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 text-base font-black text-[#8D6E63]">
            <HeartHandshake className="h-5 w-5 text-[#FF8C42]" aria-hidden="true" />
            {copy.appPurposeTitle}
          </h2>
          <blockquote className="border-l-4 border-[#FF8C42] pl-3 text-base font-semibold leading-7 text-stone-800">
            “{copy.appPurpose}”
          </blockquote>
          <p className="text-right text-xs font-black text-stone-600">
            {copy.appPurposeAttribution}
          </p>
          <p className="rounded-2xl bg-[#FFF8E1] px-3 py-2 text-sm font-black text-[#0B5E8E]">
            {copy.serviceTagline}
          </p>
        </section>

        <section className="space-y-3 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-black text-stone-800">{copy.servicesTitle}</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {copy.services.map((service, index) => (
              <div
                key={service}
                className="flex min-h-12 items-center gap-2 rounded-xl border border-stone-200 bg-[#FFF8E1]/50 p-3 text-sm font-bold leading-5 text-stone-800"
              >
                <span className="text-lg" aria-hidden="true">
                  {['🧭', '🅿️', '🛺', '🚑', '🚻', '💧', '🆘', '👨‍👩‍👧', '🔎', '🙋'][index]}
                </span>
                <span>{service}</span>
              </div>
            ))}
          </div>
          <p className="text-sm leading-6 text-stone-600">{copy.serviceDataNotice}</p>
        </section>

        <section className="rounded-3xl border border-[#FF8C42]/50 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-black text-[#0B5E8E]">
            <BookOpen className="h-5 w-5 text-[#FF8C42]" aria-hidden="true" />
            {copy.descriptionTitle}
          </h2>
          <p className="text-base leading-7 text-stone-800">{copy.description}</p>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <section className="rounded-3xl border border-[#0B5E8E]/20 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-black text-[#0B5E8E]">
              <Target className="h-5 w-5 text-[#FF8C42]" aria-hidden="true" />
              {copy.missionTitle}
            </h2>
            <p className="text-base leading-7 text-stone-800">{copy.mission}</p>
          </section>

          <section className="rounded-3xl border border-[#2E7D32]/25 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-black text-[#2E7D32]">
              <Eye className="h-5 w-5 text-[#FF8C42]" aria-hidden="true" />
              {copy.visionTitle}
            </h2>
            <p className="text-base leading-7 text-stone-800">{copy.vision}</p>
          </section>
        </div>

        <section className="space-y-3">
          <h2 className="px-1 text-base font-black text-stone-700">{copy.pillarsTitle}</h2>
          {copy.pillars.map((pillar, index) => (
            <article
              key={pillar.title}
              className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${
                  index === 0
                    ? 'bg-[#FFF8E1] text-[#8D6E63]'
                    : index === 1
                      ? 'bg-red-50 text-[#E53935]'
                      : 'bg-green-50 text-[#2E7D32]'
                }`}
                aria-hidden="true"
              >
                {['🧭', '🆘', '💧'][index]}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-stone-900">{pillar.title}</h3>
                <p className="text-sm leading-6 text-stone-600">{pillar.description}</p>
              </div>
            </article>
          ))}
        </section>

        <section
          className="rounded-3xl border border-[#FFD54F] bg-white p-5 shadow-sm sm:p-6"
          aria-labelledby="focus-areas-heading"
        >
          <h2 id="focus-areas-heading" className="mb-3 text-lg font-black text-[#0B5E8E]">
            {copy.focusTitle}
          </h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {copy.focusAreas.map((area, index) => {
              const Icon = focusIcons[index];
              return (
                <li
                  key={area}
                  className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#0B5E8E]/10 bg-[#FFF8E1]/70 p-3 text-sm font-semibold leading-6 text-stone-800"
                >
                  <Icon
                    className="h-5 w-5 shrink-0 text-[#2E7D32]"
                    aria-hidden="true"
                  />
                  <span>{area}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          className="space-y-3 rounded-3xl border border-[#FFD54F]/70 bg-gradient-to-br from-white via-[#FFF8E1]/40 to-white p-5 shadow-sm sm:p-6"
          aria-labelledby="team-highlight-heading"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0B5E8E]/10 text-[#0B5E8E]">
                <UsersRound className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 id="team-highlight-heading" className="text-base font-black text-[#0B5E8E]">
                  {isEnglish ? 'Our Dedicated Team' : 'हमारी समर्पित टीम'}
                </h2>
                <p className="text-xs text-stone-600">
                  {isEnglish ? 'Foundation leadership, coordinators, and seva team.' : 'संस्था के संयोजक, संचालक एवं सेवा कार्यकर्ता।'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('team')}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#0B5E8E] px-3.5 py-1.5 text-xs font-black text-white transition-colors hover:bg-[#084569]"
            >
              <span>{isEnglish ? 'View All' : 'सभी देखें'}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </section>

        <section
          className="space-y-3 rounded-3xl border border-[#0B5E8E]/15 bg-white p-5 shadow-sm sm:p-6"
          aria-label={copy.joinSection}
        >
          <h2 className="text-lg font-black text-[#0B5E8E]">{copy.joinSection}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate('team')}
              className="min-h-12 rounded-2xl border border-[#0B5E8E]/25 bg-white px-4 font-black text-[#0B5E8E] transition-colors hover:bg-[#FFF8E1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B5E8E]"
            >
              {copy.team}
            </button>
            <button
              type="button"
              onClick={() => navigate('volunteer')}
              className="min-h-12 rounded-2xl bg-[#2E7D32] px-4 font-black text-white transition-colors hover:bg-[#256629] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B5E8E]"
            >
              {copy.volunteer}
            </button>
          </div>
          <a
            href="mailto:nextgendevbhoomi@gmail.com"
            aria-label={`${copy.emailLabel}: nextgendevbhoomi@gmail.com`}
            className="inline-flex min-h-11 max-w-full items-center gap-2 break-all font-bold text-[#0B5E8E] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B5E8E]"
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
            nextgendevbhoomi@gmail.com
          </a>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <a
              href="https://nextgendevbhoomi.org/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${copy.website}. ${copy.openLink}`}
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#0B5E8E]/20 px-3 text-center font-bold text-[#0B5E8E] hover:bg-[#FFF8E1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B5E8E]"
            >
              <span>{copy.website}</span>
              <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </a>
            <a
              href="https://www.linkedin.com/company/nextgen-devbhoomi-foundation/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${copy.linkedinLabel}. ${copy.openLink}`}
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#0B5E8E]/20 px-3 text-center font-bold text-[#0B5E8E] hover:bg-[#FFF8E1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B5E8E]"
            >
              <span>{copy.linkedinLabel}</span>
              <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </a>
          </div>
        </section>

        <BrandFooter language={language} />

        <p className="px-1 text-center text-xs leading-5 text-stone-600">
          {copy.verificationNote}
        </p>
      </main>
      <footer className="sticky bottom-16 z-20 border-t border-stone-200 bg-white/95 p-3 backdrop-blur sm:p-4">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0B5E8E] px-4 text-sm font-black text-white shadow-sm transition-colors hover:bg-[#084569] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF8C42]"
          >
            <span>{copy.home}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </footer>
    </div>
  );
};
