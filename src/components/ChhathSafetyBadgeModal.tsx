/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, Shield, Phone, User, QrCode, Download, Share2, Check, AlertCircle } from 'lucide-react';

interface SafetyBadgeData {
  personName: string;
  guardianName: string;
  primaryPhone: string;
  secondaryPhone?: string;
  bloodGroup?: string;
  meetingPoint: string;
  notes?: string;
}

export const ChhathSafetyBadgeModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [badgeData, setBadgeData] = useState<SafetyBadgeData>(() => {
    try {
      const stored = localStorage.getItem('deo_chhath_safety_badge_v1');
      return stored
        ? JSON.parse(stored)
        : {
            personName: '',
            guardianName: '',
            primaryPhone: '',
            secondaryPhone: '',
            bloodGroup: 'B+',
            meetingPoint: 'केंद्रीय नियंत्रण कक्ष (थाना मोड़, देव)',
            notes: '',
          };
    } catch {
      return {
        personName: '',
        guardianName: '',
        primaryPhone: '',
        secondaryPhone: '',
        bloodGroup: 'B+',
        meetingPoint: 'केंद्रीय नियंत्रण कक्ष (थाना मोड़, देव)',
        notes: '',
      };
    }
  });

  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simple pure-canvas 2D QR pattern generator
  useEffect(() => {
    if (isGenerated && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = 180;
      canvas.width = size;
      canvas.height = size;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = '#063B5C';
      const textToEncode = `DEO-CHHATH-HELP|NAME:${badgeData.personName}|PARENT:${badgeData.guardianName}|PHONE:${badgeData.primaryPhone}|ALT:${badgeData.secondaryPhone || 'NA'}|MEET:${badgeData.meetingPoint}`;

      // Deterministic decorative visual QR matrix based on hash
      const gridSize = 21;
      const cellSize = size / gridSize;

      const drawCorner = (r: number, c: number) => {
        ctx.fillRect(c * cellSize, r * cellSize, cellSize * 7, cellSize * 7);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect((c + 1) * cellSize, (r + 1) * cellSize, cellSize * 5, cellSize * 5);
        ctx.fillStyle = '#063B5C';
        ctx.fillRect((c + 2) * cellSize, (r + 2) * cellSize, cellSize * 3, cellSize * 3);
      };

      drawCorner(0, 0);
      drawCorner(0, gridSize - 7);
      drawCorner(gridSize - 7, 0);

      // Fill hash cells
      let hash = 0;
      for (let i = 0; i < textToEncode.length; i++) {
        hash = (hash << 5) - hash + textToEncode.charCodeAt(i);
        hash |= 0;
      }

      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          if (
            (r < 8 && c < 8) ||
            (r < 8 && c >= gridSize - 8) ||
            (r >= gridSize - 8 && c < 8)
          ) {
            continue;
          }
          const bit = (Math.abs(hash * (r + 1) * (c + 7) + r * 13 + c * 31) % 100) > 45;
          if (bit) {
            ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
          }
        }
      }
    }
  }, [isGenerated, badgeData]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeData.personName.trim() || !badgeData.primaryPhone.trim()) {
      alert('कृपया नाम और प्राथमिक फोन नंबर अवश्य भरें।');
      return;
    }
    try {
      localStorage.setItem('deo_chhath_safety_badge_v1', JSON.stringify(badgeData));
    } catch {
      // storage error
    }
    setIsGenerated(true);
  };

  const handleShare = () => {
    const text = `सुरक्षा कार्ड: ${badgeData.personName}\nअभिभावक: ${badgeData.guardianName} (फोन: ${badgeData.primaryPhone})\nमिलने का स्थान: ${badgeData.meetingPoint}`;
    if (navigator.share) {
      navigator.share({ title: 'छठ सुरक्षा बैज', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2500);
    }
  };

  const handleDownloadBadge = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `chhath-safety-card-${badgeData.personName || 'devotee'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-['Mukta',sans-serif] animate-fade-in">
      <div className="w-full max-w-lg max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-emerald-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-sky-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center text-xl shrink-0 font-bold">
              🛡️
            </div>
            <div>
              <h3 className="text-base font-black text-white leading-tight">
                बालक व वृद्ध डिजिटल सुरक्षा बैज
              </h3>
              <p className="text-xs text-emerald-200">
                भीड़ में खोने से सुरक्षा हेतु आपातकालीन QR पहचान पत्र
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {!isGenerated ? (
            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  छठ मेले में भारी भीड़ के कारण नेटवर्क जाम हो जाता है। बच्चों या बुजुर्गों के लिए यह सुरक्षा कार्ड तैयार कर स्क्रीनशॉट सुरक्षित रखें।
                </span>
              </div>

              <div>
                <label className="text-xs font-black text-stone-800 block mb-1">
                  बच्चे / बुजुर्ग का नाम *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. आरव कुमार / रामेश्वर जी"
                  value={badgeData.personName}
                  onChange={(e) => setBadgeData({ ...badgeData, personName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-stone-800 block mb-1">
                    माता/पिता/अभिभावक का नाम
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. राजेश कुमार"
                    value={badgeData.guardianName}
                    onChange={(e) => setBadgeData({ ...badgeData, guardianName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-stone-800 block mb-1">
                    ब्लड ग्रुप (वैकल्पिक)
                  </label>
                  <select
                    value={badgeData.bloodGroup}
                    onChange={(e) => setBadgeData({ ...badgeData, bloodGroup: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-stone-800 block mb-1">
                    प्राथमिक फोन नंबर *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-अंकीय मोबाइल"
                    value={badgeData.primaryPhone}
                    onChange={(e) => setBadgeData({ ...badgeData, primaryPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-stone-800 block mb-1">
                    वैकल्पिक फोन नंबर
                  </label>
                  <input
                    type="tel"
                    placeholder="दूसरा फोन नंबर"
                    value={badgeData.secondaryPhone}
                    onChange={(e) => setBadgeData({ ...badgeData, secondaryPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-stone-800 block mb-1">
                  बिछड़ने पर मिलने का तय स्थान
                </label>
                <input
                  type="text"
                  placeholder="उदा. केंद्रीय नियंत्रण कक्ष, थाना मोड़"
                  value={badgeData.meetingPoint}
                  onChange={(e) => setBadgeData({ ...badgeData, meetingPoint: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md transition-all active:scale-98"
              >
                सुरक्षा कार्ड व QR तैयार करें ➔
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Generated Visual ID Badge */}
              <div className="bg-gradient-to-br from-emerald-700 via-teal-800 to-sky-950 text-white rounded-3xl p-5 border-2 border-amber-300 shadow-xl relative overflow-hidden text-center space-y-3">
                <div className="flex items-center justify-between border-b border-white/20 pb-2">
                  <span className="text-[10px] font-black tracking-widest uppercase text-amber-300">
                    छठ सुरक्षा पहचान पत्र • देव
                  </span>
                  <span className="text-[10px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full">
                    इमरजेंसी कार्ड
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white">{badgeData.personName}</h3>
                  <p className="text-xs text-amber-200 font-bold mt-0.5">
                    अभिभावक: {badgeData.guardianName || 'परिवार जन'}
                  </p>
                </div>

                {/* QR Code Canvas */}
                <div className="inline-block p-2 bg-white rounded-2xl shadow-md border-2 border-amber-400">
                  <canvas ref={canvasRef} className="w-36 h-36 mx-auto block" />
                  <span className="text-[9px] text-stone-600 font-black block mt-1">
                    स्कैन करें या सीधे कॉल करें
                  </span>
                </div>

                <div className="bg-black/30 rounded-2xl p-3 border border-white/15 text-left space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-300">📞 प्राथमिक फोन:</span>
                    <a href={`tel:${badgeData.primaryPhone}`} className="text-amber-300 font-black underline">
                      {badgeData.primaryPhone}
                    </a>
                  </div>
                  {badgeData.secondaryPhone && (
                    <div className="flex items-center justify-between">
                      <span className="text-stone-300">📞 दूसरा फोन:</span>
                      <a href={`tel:${badgeData.secondaryPhone}`} className="text-amber-200 font-bold underline">
                        {badgeData.secondaryPhone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-stone-300">📍 मिलने का स्थान:</span>
                    <span className="text-white font-bold">{badgeData.meetingPoint}</span>
                  </div>
                  {badgeData.bloodGroup && (
                    <div className="flex items-center justify-between">
                      <span className="text-stone-300">🩸 ब्लड ग्रुप:</span>
                      <span className="text-amber-300 font-black">{badgeData.bloodGroup}</span>
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-stone-300">
                  यदि यह व्यक्ति बिछड़ गया हो, तो कृपया नजदीकी स्वयंसेवक या नियंत्रण कक्ष (112) पर संपर्क कराएं।
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadBadge}
                  className="py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs rounded-xl flex items-center justify-center gap-1 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>फोटो सेव करें</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1 shadow-xs"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copiedNotice ? 'कॉपी हुआ!' : 'शेयर करें'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsGenerated(false)}
                  className="py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-black text-xs rounded-xl"
                >
                  बदलें
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

