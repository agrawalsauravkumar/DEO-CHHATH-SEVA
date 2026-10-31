import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { DeoMap } from '../components/DeoMap';
import { LocationService } from '../services/LocationService';
import { RouteService } from '../services/RouteService';
import { LocationItem } from '../types';
import {
  Car,
  Navigation,
  Trash2,
  Edit3,
  MapPin,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  Compass,
} from 'lucide-react';

export const MyParkingScreen: React.FC = () => {
  const {
    savedParking,
    clearSavedParking,
    updateSavedParkingNote,
    deviceLocation,
    setSelectedMapItem,
    navigate,
    goBack,
  } = useApp();

  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
  const [noteInput, setNoteInput] = useState<string>(savedParking?.note || savedParking?.notes || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Live distance from user GPS to parked vehicle
  const distanceToCarText = useMemo(() => {
    if (!savedParking || !deviceLocation) {
      return 'GPS उपलब्ध होने पर दूरी दिखाई जाएगी';
    }
    return LocationService.formatDistanceHindi(
      { latitude: deviceLocation.latitude, longitude: deviceLocation.longitude },
      { latitude: savedParking.latitude, longitude: savedParking.longitude }
    );
  }, [savedParking, deviceLocation]);

  const walkingTimeToCarText = useMemo(() => {
    if (!savedParking || !deviceLocation) {
      return '—';
    }
    return LocationService.formatWalkingTimeHindi(
      { latitude: deviceLocation.latitude, longitude: deviceLocation.longitude },
      { latitude: savedParking.latitude, longitude: savedParking.longitude }
    );
  }, [savedParking, deviceLocation]);

  // Navigate back to car handler
  const handleNavigateToCar = () => {
    if (!savedParking) return;

    const carDestination: LocationItem = {
      id: savedParking.parkingId,
      name: `मेरी गाड़ी (${savedParking.parkingName})`,
      nameEn: `My Car (${savedParking.parkingName})`,
      category: 'parking',
      distance: distanceToCarText,
      walkingTime: walkingTimeToCarText,
      description: savedParking.note ? `नोट: ${savedParking.note}` : 'सहेजी गई गाड़ी का स्थान',
      landmark: savedParking.parkingName,
      latitude: savedParking.latitude,
      longitude: savedParking.longitude,
      status: 'सक्रिय',
      isDemo: false,
      x: 50,
      y: 50,
    };

    setSelectedMapItem(carDestination);
    navigate('navigation-preview');
  };

  const handleSaveNote = async () => {
    try {
      await updateSavedParkingNote(noteInput.trim());
      setIsEditingNote(false);
      setFeedbackNotice('नोट सफलतापूर्वक सुरक्षित किया गया।');
      setTimeout(() => setFeedbackNotice(null), 3000);
    } catch (error) {
      setFeedbackNotice(error instanceof Error ? error.message : 'पार्किंग नोट सुरक्षित नहीं हुआ।');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await clearSavedParking();
      setShowDeleteConfirm(false);
      navigate('parking');
    } catch (error) {
      setFeedbackNotice(error instanceof Error ? error.message : 'पार्किंग हटाई नहीं जा सकी।');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--chhath-cream)] pb-20 flex flex-col font-['Noto_Sans_Devanagari','Inter',sans-serif]">
      <TopBar title="🚗 मेरी गाड़ी" showBack />

      <main className="flex-1 max-w-3xl sm:max-w-4xl mx-auto w-full p-4 space-y-4">
        {feedbackNotice && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackNotice}</span>
          </div>
        )}

        {/* If no parking saved */}
        {!savedParking ? (
          <div className="bg-white border-2 border-dashed border-stone-300 rounded-3xl p-8 text-center space-y-4 shadow-xs my-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
              <Car className="w-8 h-8 text-amber-700" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-stone-900">
                अभी कोई पार्किंग सहेजी नहीं गई है
              </h3>
              <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
                जब आप अपनी गाड़ी पार्क करें, तो पार्किंग सूची में “📍 यहाँ पार्क किया” बटन दबाएँ।
              </p>
            </div>
            <button
              onClick={() => navigate('parking')}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-sm rounded-2xl shadow-md transition-all"
            >
              🅿️ पार्किंग सूची देखें
            </button>
          </div>
        ) : (
          /* Stored Parking Card */
          <div className="space-y-4">
            <div className="bg-white border-2 border-indigo-200 rounded-3xl p-5 shadow-sm space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xl shrink-0 shadow-inner">
                    🚗
                  </div>
                  <div>
                    <span className="text-[11px] font-black text-indigo-700 uppercase tracking-wider block">
                      सहेजी गई पार्किंग
                    </span>
                    <h2 className="text-lg font-black text-stone-900 leading-tight">
                      {savedParking.parkingName}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-stone-400 hover:text-rose-600 active:scale-90 transition-colors"
                  title="पार्किंग हटाएँ"
                  aria-label="पार्किंग हटाएँ"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Status Note: “आपकी गाड़ी यहाँ पार्क है।” */}
              <div className="bg-indigo-50/80 border border-indigo-150 rounded-2xl p-3 flex items-center justify-between gap-2 text-xs text-indigo-950 font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-base">📍</span>
                  <span>“आपकी गाड़ी यहाँ पार्क है।”</span>
                </div>
                {savedParking.savedAt && (
                  <span className="text-[11px] text-indigo-800 font-mono">
                    {savedParking.savedAt}
                  </span>
                )}
              </div>

              {/* Live Distance from user */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-stone-50 rounded-2xl p-2.5 border border-stone-200">
                  <span className="text-[11px] text-stone-500 font-semibold block">वर्तमान दूरी</span>
                  <span className="text-sm font-black text-stone-900">
                    {distanceToCarText}
                  </span>
                </div>
                <div className="bg-stone-50 rounded-2xl p-2.5 border border-stone-200">
                  <span className="text-[11px] text-stone-500 font-semibold block">पैदल समय</span>
                  <span className="text-sm font-black text-amber-700">
                    {walkingTimeToCarText}
                  </span>
                </div>
              </div>

              {/* Optional User Note */}
              <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-600 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-stone-500" />
                    <span>पहचान नोट:</span>
                  </span>
                  <button
                    onClick={() => {
                      setNoteInput(savedParking.note || savedParking.notes || '');
                      setIsEditingNote(true);
                    }}
                    className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>✏️ नोट बदलें</span>
                  </button>
                </div>
                <p className="text-xs text-stone-800 font-medium bg-white p-2.5 rounded-xl border border-stone-200">
                  {savedParking.note || savedParking.notes || 'कोई विशेष नोट नहीं जोड़ा गया। (जैसे: “Gate के पास”, “पीपल के पेड़ के सामने”)'}
                </p>
              </div>

              {/* Action Buttons: 🧭 गाड़ी तक रास्ता, ✏️ नोट बदलें, 🗑️ Parking हटाएँ */}
              <div className="space-y-2 pt-1">
                {/* 🧭 गाड़ी तक रास्ता */}
                <button
                  onClick={handleNavigateToCar}
                  className="w-full min-h-[50px] bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-black text-base rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Navigation className="w-5 h-5 fill-white" />
                  <span>🧭 गाड़ी तक रास्ता (Navigate Back)</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setNoteInput(savedParking.note || savedParking.notes || '');
                      setIsEditingNote(true);
                    }}
                    className="min-h-[44px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-stone-600" />
                    <span>✏️ नोट बदलें</span>
                  </button>

                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="min-h-[44px] bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs rounded-xl border border-rose-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-rose-700" />
                    <span>🗑️ Parking हटाएँ</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Map Preview */}
            <div className="bg-white rounded-3xl p-3 border border-stone-200 shadow-sm space-y-2">
              <span className="text-xs font-black text-stone-800 block px-1">
                नक्शे पर गाड़ी का स्थान:
              </span>
              <div className="h-64 rounded-2xl overflow-hidden border border-stone-200">
                <DeoMap heightClass="h-full" showRouteLine={false} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Note Modal */}
      {isEditingNote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h4 className="text-base font-black text-stone-900">
                पहचान नोट जोड़ें / बदलें
              </h4>
              <button onClick={() => setIsEditingNote(false)} className="p-1 text-stone-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-stone-700 block">
                गाड़ी के पास का कोई लैंडमार्क या खंभा संख्या लिखें:
              </label>
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="उदा. Gate 2 के पास, पीपल के पेड़ के सामने, Blue board"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-bold text-stone-900"
                maxLength={60}
              />
              <p className="text-[11px] text-stone-500">
                यह नोट आपकी डिवाइस में ही सुरक्षित रहेगा।
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setIsEditingNote(false)}
                className="min-h-[44px] bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
              >
                रद्द करें
              </button>
              <button
                onClick={handleSaveNote}
                className="min-h-[44px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                सुरक्षित करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black text-stone-900">
                क्या आप सहेजी गई पार्किंग हटाना चाहते हैं?
              </h4>
              <p className="text-xs text-stone-600">
                हटाने के बाद आपको गाड़ी की लोकेशन फिर से सेव करनी होगी।
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="min-h-[44px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl"
              >
                रद्द करें
              </button>
              <button
                onClick={handleConfirmDelete}
                className="min-h-[44px] bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs"
              >
                हाँ, हटाएँ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
