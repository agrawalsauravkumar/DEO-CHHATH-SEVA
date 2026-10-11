import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { DEO_PARKINGS } from '../data/deoData';
import {
  Car,
  Navigation,
  Trash2,
  Save,
  CheckCircle2,
  MapPin,
  Clock,
  Camera,
  FileText,
  AlertCircle,
} from 'lucide-react';

export const SaveParkingScreen: React.FC = () => {
  const { savedParking, saveParking, clearSavedParking, startNavigation, navigate } = useApp();

  const [selectedParkingId, setSelectedParkingId] = useState<string>(
    savedParking?.parkingId || DEO_PARKINGS[0].id
  );
  const [vehicleNumber, setVehicleNumber] = useState<string>(
    savedParking?.vehicleNumber || 'BR-26-AB-1234'
  );
  const [pillarOrSlot, setPillarOrSlot] = useState<string>(
    savedParking?.pillarOrSlot || 'जोन B, खंभा संख्या 14 के पास'
  );
  const [notes, setNotes] = useState<string>(
    savedParking?.notes || 'पीपल के पेड़ के ठीक सामने, सफेद बोलेरो'
  );
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parkingObj = DEO_PARKINGS.find((p) => p.id === selectedParkingId) || DEO_PARKINGS[0];
    saveParking({
      parkingId: selectedParkingId,
      parkingName: parkingObj.name,
      latitude: parkingObj.id === 'parking-2' ? 24.6568 : parkingObj.id === 'parking-3' ? 24.6618 : 24.6508,
      longitude: parkingObj.id === 'parking-2' ? 84.4285 : parkingObj.id === 'parking-3' ? 84.4242 : 84.4325,
      pillarOrSlot,
      vehicleNumber,
      notes,
      note: notes,
      savedAt: 'आज ' + new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleNavigateToVehicle = () => {
    const parkingObj = DEO_PARKINGS.find((p) => p.id === (savedParking?.parkingId || selectedParkingId)) || DEO_PARKINGS[0];
    startNavigation({
      id: parkingObj.id,
      name: 'मेरी गाड़ी (' + parkingObj.name + ')',
      nameEn: parkingObj.nameHi,
      category: 'parking',
      distance: parkingObj.distance,
      walkingTime: parkingObj.walkingTime,
      description: savedParking ? savedParking.pillarOrSlot + ' • ' + savedParking.notes : parkingObj.location,
      landmark: parkingObj.landmark,
      x: parkingObj.x,
      y: parkingObj.y,
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 flex flex-col">
      <TopBar title="मेरी गाड़ी कहाँ है" showBack />

      <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-4">
        {/* Saved Status Banner */}
        {savedParking ? (
          <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs uppercase font-bold tracking-wider text-indigo-200">
                  वर्तमान में पार्क की गई गाड़ी
                </span>
              </div>
              <span className="text-[11px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> सुरक्षित सेव
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black text-white">{savedParking.parkingName}</h3>
              <p className="text-xs text-indigo-100 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-300" />
                <span>स्थान: {savedParking.pillarOrSlot}</span>
              </p>
              {savedParking.notes && (
                <p className="text-xs text-indigo-200 mt-0.5">
                  पहचान नोट: {savedParking.notes}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-indigo-600/60 text-xs text-indigo-200">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> सेव समय: {savedParking.savedAt}
              </span>
              <span className="font-mono font-bold bg-black/30 px-2 py-0.5 rounded text-white">
                {savedParking.vehicleNumber}
              </span>
            </div>

            {/* Guide Me Back Primary Button */}
            <button
              onClick={handleNavigateToVehicle}
              className="w-full min-h-[48px] bg-white hover:bg-indigo-50 active:scale-98 text-indigo-950 font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <Navigation className="w-4 h-4 text-indigo-700 fill-indigo-700" />
              <span>मेरी गाड़ी तक का रास्ता दिखाएँ (Guide Back)</span>
            </button>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-950">
            <AlertCircle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">अभी कोई गाड़ी सेव नहीं है</h4>
              <p className="text-stone-600 mt-0.5 leading-relaxed">
                मेला में अपनी गाड़ी का स्थान नीचे फॉर्म में सेव करें ताकि दर्शन और अर्घ्य के बाद अपनी गाड़ी आसानी से मिल सके।
              </p>
            </div>
          </div>
        )}

        {/* Form to update or save vehicle spot */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h3 className="text-base font-bold text-stone-900">
              {savedParking ? 'पार्किंग जानकारी अपडेट करें' : 'नई पार्किंग सेव करें'}
            </h3>
            {savedParking && (
              <button
                onClick={clearSavedParking}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>हटाएं</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                पार्किंग स्थल चुनें *
              </label>
              <select
                value={selectedParkingId}
                onChange={(e) => setSelectedParkingId(e.target.value)}
                className="w-full min-h-[44px] px-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {DEO_PARKINGS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.distance})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  गाड़ी नंबर
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="BR-26-..."
                  className="w-full min-h-[44px] px-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  खंभा / जोन संख्या
                </label>
                <input
                  type="text"
                  value={pillarOrSlot}
                  onChange={(e) => setPillarOrSlot(e.target.value)}
                  placeholder="उदा. पोल नं. 12"
                  className="w-full min-h-[44px] px-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                पहचान चिन्ह / नोट
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="उदा. पानी टंकी के पास, लाल रंग की बाइक..."
                className="w-full min-h-[44px] px-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Quick Photo simulator */}
            <div className="p-3 bg-stone-50 border border-dashed border-stone-300 rounded-xl flex items-center justify-between text-xs text-stone-600">
              <span className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-stone-500" />
                <span>गाड़ी की पहचान फोटो (वैकल्पिक)</span>
              </span>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                कैमरा तैयार
              </span>
            </div>

            {savedSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>पार्किंग स्थान सफलतापूर्वक सुरक्षित कर लिया गया है!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full min-h-[48px] bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>पार्किंग स्थान सुरक्षित करें</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
