/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, X, RotateCcw, Sparkles, ShoppingBag, ShieldCheck, Info } from 'lucide-react';

interface ChecklistItem {
  id: string;
  nameHi: string;
  category: 'SOOP_DAURA' | 'PRASAD' | 'PUJA_MATERIAL' | 'VRATI_ITEMS';
  description: string;
  isCrucial?: boolean;
}

const PUJA_ITEMS: ChecklistItem[] = [
  // 1. दउरा व सूप सामग्री
  { id: 'item-1', nameHi: 'बांस का बड़ा दउरा (दौरा)', category: 'SOOP_DAURA', description: 'प्रसाद व फल घाट ले जाने हेतु बांस का टोकरी/दउरा', isCrucial: true },
  { id: 'item-2', nameHi: 'पीले रंग का सूप (बांस अथवा पीतल)', category: 'SOOP_DAURA', description: 'अर्घ्य अर्पण हेतु आवश्यक पवित्र सूप', isCrucial: true },
  { id: 'item-3', nameHi: 'मिट्टी के दीये (कच्चा दीया व ढकना)', category: 'SOOP_DAURA', description: 'सूप में घी के दीये प्रज्वलित करने हेतु', isCrucial: true },
  { id: 'item-4', nameHi: 'कोसी (कुश का भरा हुआ मिट्टी का हाथी/घड़ा)', category: 'SOOP_DAURA', description: 'मनौती वाली कोसी भरने हेतु' },

  // 2. प्रसाद व फल
  { id: 'item-5', nameHi: 'पारंपरिक ठेकुआ (शुद्ध घी व गुड़/शक्कर)', category: 'PRASAD', description: 'छठ का मुख्य महाप्रसाद', isCrucial: true },
  { id: 'item-6', nameHi: 'कसार (चावल के आटे व गुड़ का लड्डू)', category: 'PRASAD', description: 'पवित्र सांध्य व उषा अर्घ्य का प्रसाद' },
  { id: 'item-7', nameHi: 'ईख / गन्ना (पत्ते सहित 5 अथवा 7)', category: 'PRASAD', description: 'सूर्य कुंड घाट पर मंडप बनाने हेतु', isCrucial: true },
  { id: 'item-8', nameHi: 'डाभ नींबू (बड़ा गोल नींबू)', category: 'PRASAD', description: 'सूप में अर्पित करने वाला पावन फल', isCrucial: true },
  { id: 'item-9', nameHi: 'कच्ची हल्दी व अदरक का पौधा (पत्ते सहित)', category: 'PRASAD', description: 'समृद्धि व आरोग्य का प्रतीक', isCrucial: true },
  { id: 'item-10', nameHi: 'ऋतु फल (केला का घौद, सेब, संतरा, सुथनी, सिंघाड़ा)', category: 'PRASAD', description: 'सूप में रखने हेतु मौसमी फल' },
  { id: 'item-11', nameHi: 'बोदी / सुथनी / शरीफा', category: 'PRASAD', description: 'पारंपरिक कंद-मूल फल' },

  // 3. पूजा अनुष्ठान सामग्री
  { id: 'item-12', nameHi: 'पीला सिन्दूर (छठ माई का सिन्दूर)', category: 'PUJA_MATERIAL', description: 'सूप व दउरा पर टीका लगाने हेतु', isCrucial: true },
  { id: 'item-13', nameHi: 'गंगाजल व गाय का कच्चा दूध', category: 'PUJA_MATERIAL', description: 'उषा व सांध्य अर्घ्य में धारा गिराने हेतु', isCrucial: true },
  { id: 'item-14', nameHi: 'शुद्ध घी व रूई की बत्तियां', category: 'PUJA_MATERIAL', description: 'दीपक जलाने हेतु' },
  { id: 'item-15', nameHi: 'अक्षत, रोली, चंदन व सुपारी', category: 'PUJA_MATERIAL', description: 'सूर्य देव व षष्ठी माता का पूजन' },
  { id: 'item-16', nameHi: 'धूप, अगरबत्ती, कपूर व माचिस', category: 'PUJA_MATERIAL', description: 'घाट पर आरती व अग्नि प्रज्वलन' },
  { id: 'item-17', nameHi: 'लाल व पीला वस्त्र (दउरा ढकने हेतु)', category: 'PUJA_MATERIAL', description: 'प्रसाद को शुद्ध व सुरक्षित रखने हेतु वस्त्र' },

  // 4. व्रती सुविधा एवं वस्त्र
  { id: 'item-18', nameHi: 'व्रती के लिए बिना सिला नया पीला/लाल वस्त्र', category: 'VRATI_ITEMS', description: 'अर्घ्य स्नान हेतु सूती साड़ी या धोती', isCrucial: true },
  { id: 'item-19', nameHi: 'सूती गमछा व चेंजिंग टॉवल', category: 'VRATI_ITEMS', description: 'घाट से स्नान के बाद तुरंत बदलने हेतु' },
  { id: 'item-20', nameHi: 'पारण सामग्री (अदरक, कच्चा दूध, गुड़, पानी)', category: 'VRATI_ITEMS', description: 'अंतिम अर्घ्य के बाद व्रत खोलने हेतु', isCrucial: true },
];

const STORAGE_KEY = 'deo_chhath_puja_checklist_v1';

export const ChhathPujaChecklist: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [activeTab, setActiveTab] = useState<ChecklistItem['category'] | 'ALL'>('ALL');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedIds));
    } catch {
      // storage error
    }
  }, [checkedIds]);

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    setCheckedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleReset = () => {
    if (window.confirm('क्या आप चेकलिस्ट को रीसेट करना चाहते हैं?')) {
      setCheckedIds({});
    }
  };

  const completedCount = Object.values(checkedIds).filter(Boolean).length;
  const totalCount = PUJA_ITEMS.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const displayedItems =
    activeTab === 'ALL'
      ? PUJA_ITEMS
      : PUJA_ITEMS.filter((item) => item.category === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-['Mukta',sans-serif] animate-fade-in">
      <div className="w-full max-w-lg max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-amber-400">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#075985] via-[#073B5A] to-[#041E2F] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300 text-amber-300 flex items-center justify-center text-xl shrink-0">
              🧺
            </div>
            <div>
              <h3 className="text-base font-black text-white leading-tight">
                छठ पूजा सामग्री व दउरा चेकलिस्ट
              </h3>
              <p className="text-xs text-amber-200">
                देव सूर्य मंदिर व घाट जाने से पूर्व पूरी तैयारी जाँचें
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar Strip */}
        <div className="bg-amber-50 px-4 py-2.5 border-b border-amber-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-stone-800">
              तैयारी: {completedCount} / {totalCount} सामग्री पूर्ण ({progressPercent}%)
            </span>
            <div className="w-48 h-2 bg-amber-200 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleReset}
            title="रीसेट करें"
            className="text-[11px] font-bold text-stone-600 hover:text-red-700 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-stone-200"
          >
            <RotateCcw className="w-3 h-3" />
            <span>रीसेट</span>
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex gap-1.5 p-2.5 bg-stone-100 overflow-x-auto text-xs font-black border-b border-stone-200 shrink-0">
          {[
            { id: 'ALL', label: 'सभी (All)' },
            { id: 'SOOP_DAURA', label: 'सूप व दउरा' },
            { id: 'PRASAD', label: 'ठेकुआ व फल' },
            { id: 'PUJA_MATERIAL', label: 'पूजन सामग्री' },
            { id: 'VRATI_ITEMS', label: 'व्रती वस्त्र व पारण' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#075985] text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Checklist Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-stone-100">
          {displayedItems.map((item) => {
            const isChecked = !!checkedIds[item.id];
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`pt-2.5 first:pt-0 flex items-start gap-3 p-2.5 rounded-2xl cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-emerald-50/70 border border-emerald-200'
                    : 'hover:bg-amber-50/60'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 text-stone-400 shrink-0"
                  aria-label={isChecked ? 'पूर्ण' : 'अपूर्ण'}
                >
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Square className="w-5 h-5 text-stone-400" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-black leading-tight ${
                        isChecked ? 'line-through text-stone-500' : 'text-stone-900'
                      }`}
                    >
                      {item.nameHi}
                    </span>
                    {item.isCrucial && (
                      <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded-md">
                        अनिवार्य
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <span className="text-xs text-stone-500 font-medium">
            💡 टिप: घाट जाने से पूर्व दउरा में कपड़ा अवश्य बांधें।
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#075985] hover:bg-[#06486c] text-white text-xs font-black rounded-xl shadow-xs"
          >
            पूर्ण हुआ
          </button>
        </div>
      </div>
    </div>
  );
};

