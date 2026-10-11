import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { DeoMap } from '../components/DeoMap';
import { ParkingService, DEO_PARKING_LOCATIONS } from '../services/ParkingService';
import { LocationService } from '../services/LocationService';
import { ParkingLocation, LocationItem, SavedParking } from '../types';
import {
  Car,
  Navigation,
  MapPin,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  X,
  Compass,
  Map as MapIcon,
  List,
  Sparkles,
} from 'lucide-react';

export const ParkingScreen: React.FC = () => {
  const {
    savedParking,
    saveParking,
    deviceLocation,
    requestDeviceLocation,
    setSelectedMapItem,
    isOnline,
    offlineMapDownloaded,
    navigate,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sortByNearest, setSortByNearest] = useState<boolean>(false);
  const [gpsErrorNotice, setGpsErrorNotice] = useState<string | null>(null);

  // Parking to save confirmation modal state
  const [parkingToSave, setParkingToSave] = useState<ParkingLocation | null>(null);
  const [optionalNote, setOptionalNote] = useState<string>('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Filtered and sorted parking list
  const displayParkings = useMemo(() => {
    let list: (ParkingLocation & { distanceMeters?: number; distanceDisplay?: string })[] =
      ParkingService.searchParkings(searchQuery);

    if (deviceLocation) {
      list = list.map((p) => {
        const distKm = LocationService.calculateDistanceKm(
          { latitude: deviceLocation.latitude, longitude: deviceLocation.longitude },
          { latitude: p.latitude, longitude: p.longitude }
        );
        const meters = Math.round(distKm * 1000);
        const display =
          meters < 1000 ? `${meters} मीटर` : `${(meters / 1000).toFixed(1)} किमी`;
        return {
          ...p,
          distanceMeters: meters,
          distanceDisplay: display,
        };
      });

      if (sortByNearest) {
        list.sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
      }
    }

    return list;
  }, [searchQuery, sortByNearest, deviceLocation]);

  // Handle "📍 सबसे नजदीक Parking" click
  const handleNearestParkingClick = async () => {
    if (!deviceLocation) {
      const success = await requestDeviceLocation();
      if (!success) {
        setGpsErrorNotice('आपका वर्तमान स्थान उपलब्ध नहीं है।');
        setTimeout(() => setGpsErrorNotice(null), 4000);
        return;
      }
    }
    setSortByNearest(true);
  };

  // Handle "🧭 रास्ता दिखाएँ"
  const handleNavigateToParking = (parking: ParkingLocation) => {
    const distText = deviceLocation
      ? LocationService.formatDistanceHindi(
          { latitude: deviceLocation.latitude, longitude: deviceLocation.longitude },
          { latitude: parking.latitude, longitude: parking.longitude }
        )
      : 'दूरी उपलब्ध';

    const walkText = deviceLocation
      ? LocationService.formatWalkingTimeHindi(
          { latitude: deviceLocation.latitude, longitude: deviceLocation.longitude },
          { latitude: parking.latitude, longitude: parking.longitude }
        )
      : 'पैदल मार्ग';

    const locationItem: LocationItem = {
      id: parking.id,
      name: parking.name,
      nameEn: parking.nameEn,
      category: 'parking',
      distance: distText,
      walkingTime: walkText,
      description: parking.description,
      landmark: parking.landmark,
      latitude: parking.latitude,
      longitude: parking.longitude,
      status: 'सक्रिय',
      isDemo: parking.isDemo,
      x: 50,
      y: 50,
      isWheelchairAccessible: true,
    };

    setSelectedMapItem(locationItem);
    navigate('navigation-preview');
  };

  // Handle "📍 यहाँ पार्क किया" initiated
  const handleInitiateSaveParking = (parking: ParkingLocation) => {
    setParkingToSave(parking);
    setOptionalNote('');
  };

  // Confirm Save Parking
  const handleConfirmSaveParking = async () => {
    if (!parkingToSave) return;

    const timeStr = 'आज ' + new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });

    const newSaved: SavedParking = {
      parkingId: parkingToSave.id,
      parkingName: parkingToSave.name,
      latitude: parkingToSave.latitude,
      longitude: parkingToSave.longitude,
      savedAt: timeStr,
      note: optionalNote.trim(),
    };

    try {
      await saveParking(newSaved);
    } catch (error) {
      setSaveSuccessNotice(
        error instanceof Error ? error.message : 'पार्किंग स्थान सुरक्षित नहीं हुआ।'
      );
      return;
    }
    setParkingToSave(null);
    setSaveSuccessNotice(`गाड़ी का स्थान “${parkingToSave.name}” पर सुरक्षित कर लिया गया है।`);
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 flex flex-col font-['Mukta',sans-serif]">
      <TopBar title="Parking" showBack />

      <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-4">
        {/* Saved Parking Notice Banner (if vehicle already parked) */}
        {savedParking && (
          <div className="bg-indigo-50 border-2 border-indigo-300 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-xs animate-fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl shrink-0">🚗</span>
              <div className="min-w-0">
                <span className="text-[11px] font-black text-indigo-700 uppercase tracking-wider block">
                  मेरी गाड़ी सहेजी गई है
                </span>
                <p className="text-sm font-black text-stone-900 truncate">
                  {savedParking.parkingName}
                </p>
                {savedParking.note && (
                  <p className="text-xs text-stone-600 truncate">नोट: {savedParking.note}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate('my-parking')}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs shrink-0 flex items-center gap-1 transition-all"
            >
              <span>गाड़ी देखें</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top Header: 📍 आपके पास की Parking */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-stone-900 flex items-center gap-1.5">
              <span>📍 आपके पास की Parking</span>
            </h2>

            {/* View Mode Toggle: List vs Map */}
            <div className="flex items-center bg-stone-200/80 p-0.5 rounded-xl text-xs font-bold">
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>सूची</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>नक्शा</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-stone-600">
            सूर्य मंदिर व कुंड परिसर के 500 मीटर में वाहन प्रवेश वर्जित है। अधिकृत पार्किंग में ही वाहन खड़ा करें।
          </p>
        </div>

        {/* Offline Notice (when offline) */}
        {!isOnline && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 flex items-center justify-between text-xs text-amber-900">
            <span className="font-bold flex items-center gap-1.5">
              <span>⚪</span>
              <span>ऑफलाइन जानकारी (Offline Mode)</span>
            </span>
            <span className="text-[11px] font-semibold text-stone-600">
              लाइव स्थिति उपलब्ध नहीं है
            </span>
          </div>
        )}

        {/* Success Alert */}
        {saveSuccessNotice && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessNotice}</span>
          </div>
        )}

        {/* GPS Error Alert */}
        {gpsErrorNotice && (
          <div className="bg-rose-50 border border-rose-300 text-rose-900 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xs animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{gpsErrorNotice}</span>
          </div>
        )}

        {/* Search Bar & Nearest Parking Button */}
        <div className="space-y-2">
          {/* 🔍 Parking खोजें */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Parking खोजें (नाम या क्षेत्र, उदा: हाई स्कूल, कॉलेज, P1)"
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm font-bold text-stone-900 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 📍 सबसे नजदीक Parking Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleNearestParkingClick}
              className={`flex-1 min-h-[42px] px-3.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-95 border ${
                sortByNearest
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-50 shadow-xs'
              }`}
            >
              <Compass className={`w-4 h-4 ${sortByNearest ? 'text-white' : 'text-amber-700'}`} />
              <span>📍 सबसे नजदीक Parking</span>
            </button>

            {sortByNearest && (
              <button
                onClick={() => setSortByNearest(false)}
                className="min-h-[42px] px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl border border-stone-200"
              >
                रीसेट
              </button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* PARKING MAP VIEW (When Map Tab is Selected)                   */}
        {/* ============================================================ */}
        {viewMode === 'map' && (
          <div className="space-y-3 animate-fade-in">
            <div className="h-[420px] rounded-3xl overflow-hidden shadow-md border border-stone-300">
              <DeoMap heightClass="h-full" showRouteLine={false} />
            </div>
            <p className="text-[11px] text-stone-500 text-center">
              मानचित्र पर किसी भी 🅿️ मार्कर पर टैप करके रास्ता देखें अथवा गाड़ी पार्क करें।
            </p>
          </div>
        )}

        {/* ============================================================ */}
        {/* PARKING LIST VIEW (Default)                                  */}
        {/* ============================================================ */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {displayParkings.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center space-y-2">
                <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
                <h4 className="text-base font-black text-stone-900">
                  Parking की जानकारी अभी उपलब्ध नहीं है।
                </h4>
                <p className="text-xs text-stone-500">
                  कृपया दूसरा नाम या क्षेत्र खोजें।
                </p>
              </div>
            ) : (
              displayParkings.map((p) => {
                const statusMeta = ParkingService.getStatusLabel(p.status, p.isDemo);
                const isUserParkedHere = savedParking?.parkingId === p.id;

                return (
                  <div
                    key={p.id}
                    className={`bg-white rounded-3xl p-4 sm:p-5 border shadow-xs transition-all space-y-3 ${
                      isUserParkedHere
                        ? 'border-indigo-500 ring-2 ring-indigo-200'
                        : 'border-stone-200 hover:border-amber-300'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-black text-sm flex items-center justify-center shrink-0">
                            🅿️
                          </span>
                          <h3 className="text-base sm:text-lg font-black text-stone-900 leading-snug truncate">
                            {p.name}
                          </h3>
                        </div>

                        <p className="text-xs text-stone-500 font-semibold flex items-center gap-1 pt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{p.landmark}</span>
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="text-right shrink-0 space-y-1">
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full inline-block ${statusMeta.bgClass} ${statusMeta.textClass}`}
                        >
                          {statusMeta.label}
                        </span>
                        {isUserParkedHere && (
                          <span className="block text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                            ✓ आपकी गाड़ी यहाँ है
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>

                    {/* Metric Row: Real GPS Distance, Capacity, Vehicle Types */}
                    <div className="bg-stone-50 rounded-2xl p-2.5 border border-stone-200 flex items-center justify-between text-xs text-stone-700">
                      <div>
                        <span className="text-[10px] text-stone-400 block font-bold uppercase">दूरी (GPS)</span>
                        <span className="font-black text-stone-900">
                          {p.distanceDisplay || (deviceLocation ? 'गणना हो रही है...' : 'GPS से देखें')}
                        </span>
                      </div>

                      {p.capacity && (
                        <div>
                          <span className="text-[10px] text-stone-400 block font-bold uppercase">क्षमता</span>
                          <span className="font-bold text-stone-800">{p.capacity}</span>
                        </div>
                      )}

                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 block font-bold uppercase">वाहन प्रकार</span>
                        <span className="font-bold text-stone-800">
                          {p.vehicleTypes.includes('bus') ? '🚗/🚌 सभी वाहन' : '🚗 कार व 🛵 बाइक'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons: 🧭 रास्ता दिखाएँ and 📍 यहाँ पार्क किया */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100">
                      {/* 🧭 रास्ता दिखाएँ */}
                      <button
                        onClick={() => handleNavigateToParking(p)}
                        className="min-h-[44px] bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all"
                      >
                        <Navigation className="w-4 h-4 fill-white" />
                        <span>🧭 रास्ता दिखाएँ</span>
                      </button>

                      {/* 📍 यहाँ पार्क किया */}
                      <button
                        onClick={() => handleInitiateSaveParking(p)}
                        className={`min-h-[44px] rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 border ${
                          isUserParkedHere
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                        }`}
                      >
                        <Car className="w-4 h-4" />
                        <span>📍 यहाँ पार्क किया</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* CONFIRMATION MODAL: 📍 यहाँ पार्क किया                        */}
      {/* ============================================================ */}
      {parkingToSave && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h4 className="text-base font-black text-stone-900 flex items-center gap-2">
                <span>📍</span>
                <span>गाड़ी का स्थान सेव करें</span>
              </h4>
              <button
                onClick={() => setParkingToSave(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-stone-800 text-sm font-black leading-snug">
                {savedParking
                  ? 'क्या पुरानी parking हटाकर नई parking सेव करें?'
                  : 'क्या आपने अपनी गाड़ी यहाँ पार्क की है?'}
              </p>

              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 space-y-1">
                <span className="text-[11px] font-bold text-amber-900 block uppercase">
                  चयनित पार्किंग स्थल:
                </span>
                <p className="text-sm font-black text-stone-900">
                  {parkingToSave.name}
                </p>
                <p className="text-[11px] text-stone-600">{parkingToSave.landmark}</p>
              </div>

              {/* Optional simple note input */}
              <div className="space-y-1 pt-1">
                <label className="font-bold text-stone-700 block">
                  पहचान नोट (वैकल्पिक):
                </label>
                <input
                  type="text"
                  value={optionalNote}
                  onChange={(e) => setOptionalNote(e.target.value)}
                  placeholder="उदा. Gate के पास, पीपल के पेड़ के सामने, Blue board"
                  maxLength={50}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Buttons: “हाँ, सेव करें” (or “नई Parking सेव करें”) & “रद्द करें” */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setParkingToSave(null)}
                className="min-h-[46px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl"
              >
                रद्द करें
              </button>
              <button
                onClick={handleConfirmSaveParking}
                className="min-h-[46px] bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-md active:scale-95"
              >
                {savedParking ? 'नई Parking सेव करें' : 'हाँ, सेव करें'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
