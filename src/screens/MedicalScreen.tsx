import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { DataFreshnessNotice } from '../components/DataFreshnessNotice';
import { DeoMap } from '../components/DeoMap';
import { FacilityService } from '../services/FacilityService';
import { LocationService } from '../services/LocationService';
import { Facility, LocationItem } from '../types';
import {
  HeartPulse,
  PhoneCall,
  Navigation,
  Compass,
  MapPin,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  List,
  Map as MapIcon,
  WifiOff,
} from 'lucide-react';

export const MedicalScreen: React.FC = () => {
  const {
    deviceLocation,
    requestDeviceLocation,
    setSelectedMapItem,
    isOnline,
    navigate,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'LIST' | 'MAP'>('LIST');
  const [filterType, setFilterType] = useState<'ALL' | 'HOSPITAL' | 'FIRST_AID' | 'AMBULANCE_POINT'>('ALL');
  const [sortByNearest, setSortByNearest] = useState<boolean>(false);
  const [gpsErrorNotice, setGpsErrorNotice] = useState<string | null>(null);

  const medicalList = useMemo(() => {
    let list = FacilityService.getFacilitiesByCategory('MEDICAL');

    if (filterType !== 'ALL') {
      list = list.filter((f) => f.medicalSubType === filterType);
    }

    if (deviceLocation) {
      const withDistance = list.map((f) => {
        const distKm = LocationService.calculateDistanceKm(
          { latitude: deviceLocation.latitude, longitude: deviceLocation.longitude },
          { latitude: f.latitude, longitude: f.longitude }
        );
        const meters = Math.round(distKm * 1000);
        const display =
          meters < 1000 ? `${meters} मीटर` : `${(meters / 1000).toFixed(1)} किमी`;
        return {
          ...f,
          distanceMeters: meters,
          distanceDisplay: display,
        };
      });

      if (sortByNearest) {
        withDistance.sort((a, b) => a.distanceMeters - b.distanceMeters);
      }
      return withDistance;
    }

    return list.map((f) => ({ ...f, distanceMeters: 0, distanceDisplay: 'GPS उपलब्ध नहीं' }));
  }, [filterType, sortByNearest, deviceLocation]);

  const handleNearestClick = async () => {
    if (!deviceLocation) {
      const success = await requestDeviceLocation();
      if (!success) {
        setGpsErrorNotice('आपकी location उपलब्ध नहीं है।');
        setTimeout(() => setGpsErrorNotice(null), 4000);
        return;
      }
    }
    setSortByNearest(true);
    setActiveTab('LIST');
  };

  const handleNavigateToMedical = (facility: Facility) => {
    const distText = deviceLocation
      ? LocationService.formatDistanceHindi(
          { latitude: deviceLocation.latitude, longitude: deviceLocation.longitude },
          { latitude: facility.latitude, longitude: facility.longitude }
        )
      : 'दूरी उपलब्ध';

    const walkText = deviceLocation
      ? LocationService.formatWalkingTimeHindi(
          { latitude: deviceLocation.latitude, longitude: deviceLocation.longitude },
          { latitude: facility.latitude, longitude: facility.longitude }
        )
      : 'पैदल मार्ग';

    const locationItem: LocationItem = {
      id: facility.id,
      name: facility.name,
      nameEn: facility.nameEn || facility.name,
      category: 'medical',
      distance: distText,
      walkingTime: walkText,
      description: facility.description,
      landmark: facility.address,
      latitude: facility.latitude,
      longitude: facility.longitude,
      status: facility.verified ? 'सक्रिय' : undefined,
      isDemo: !facility.verified,
      x: 50,
      y: 50,
      isWheelchairAccessible: facility.accessibility,
    };

    setSelectedMapItem(locationItem);
    navigate('navigation-preview');
  };

  const getSubtypeLabel = (subType?: string) => {
    switch (subType) {
      case 'HOSPITAL':
        return 'सरकारी अस्पताल';
      case 'FIRST_AID':
        return 'प्राथमिक उपचार';
      case 'AMBULANCE_POINT':
        return 'एम्बुलेंस स्टेशन';
      case 'MEDICAL_CAMP':
        return 'चिकित्सा शिविर';
      default:
        return 'चिकित्सा सुविधा';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--chhath-cream)] pb-20 flex flex-col font-['Noto_Sans_Devanagari','Inter',sans-serif]">
      <TopBar title="चिकित्सा व प्राथमिक उपचार" showBack />
      <DataFreshnessNotice />

      <main className="flex-1 max-w-3xl sm:max-w-4xl mx-auto w-full p-4 space-y-4">
        {/* Urgent Emergency Call Banner (108 Ambulance) */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-3xl p-4 sm:p-5 shadow-lg flex items-center justify-between gap-3 border-2 border-red-500">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <HeartPulse className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div className="min-w-0">
              <span className="text-base font-black block leading-tight">
                आपातकालीन एम्बुलेंस
              </span>
              <p className="text-xs text-rose-100 truncate">
                सड़क या घाट पर त्वरित चिकित्सा सहायता
              </p>
            </div>
          </div>
          <a
            href="tel:108"
            className="shrink-0 min-h-[46px] px-4 bg-white text-rose-700 hover:bg-rose-50 font-black text-sm rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <PhoneCall className="w-4 h-4 fill-rose-600 text-rose-600" />
            <span>108 कॉल</span>
          </a>
        </div>

        {/* Advisory for fasting devotees */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-950 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>स्वास्थ्य सलाह:</strong> चक्कर, डिहाइड्रेशन या कमजोरी होने पर सुरक्षित स्थान पर जाएँ और जरूरत पर 108 पर कॉल करें। सूचीबद्ध प्राथमिक उपचार केंद्रों की उपलब्धता की पुष्टि नहीं है।
          </p>
        </div>

        {/* Nearest Facility Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleNearestClick}
            className={`flex-1 min-h-[44px] px-4 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-95 border ${
              sortByNearest
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-50 shadow-xs'
            }`}
          >
            <Compass className={`w-4 h-4 ${sortByNearest ? 'text-white' : 'text-rose-600'}`} />
            <span>📍 सबसे नजदीक चिकित्सा शिविर</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-stone-200/80 p-0.5 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('LIST')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                activeTab === 'LIST'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>सूची</span>
            </button>
            <button
              onClick={() => setActiveTab('MAP')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                activeTab === 'MAP'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>नक्शा</span>
            </button>
          </div>
        </div>

        {/* GPS Error Alert */}
        {gpsErrorNotice && (
          <div className="bg-rose-50 border border-rose-300 text-rose-900 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xs animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{gpsErrorNotice}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* LIST VIEW                                                */}
        {/* ======================================================== */}
        {activeTab === 'LIST' && (
          <div className="space-y-3">
            {/* Filter Sub-Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                  filterType === 'ALL'
                    ? 'bg-[#075985] text-white shadow-xs'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                सभी ({medicalList.length})
              </button>
              <button
                onClick={() => setFilterType('HOSPITAL')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                  filterType === 'HOSPITAL'
                    ? 'bg-[#075985] text-white shadow-xs'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                अस्पताल (CHC)
              </button>
              <button
                onClick={() => setFilterType('FIRST_AID')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                  filterType === 'FIRST_AID'
                    ? 'bg-[#075985] text-white shadow-xs'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                फर्स्ट एड कैंप
              </button>
              <button
                onClick={() => setFilterType('AMBULANCE_POINT')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                  filterType === 'AMBULANCE_POINT'
                    ? 'bg-[#075985] text-white shadow-xs'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                एम्बुलेंस प्वाइंट
              </button>
            </div>

            {/* Medical Cards */}
            <div className="space-y-3">
              {medicalList.map((med) => (
                <div
                  key={med.id}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-xs hover:border-rose-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-sm flex items-center justify-center shrink-0">
                          🚑
                        </span>
                        <h3 className="text-base font-black text-stone-900 leading-snug truncate">
                          {med.name}
                        </h3>
                      </div>
                      <p className="text-xs text-stone-500 font-semibold flex items-center gap-1 pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>{med.address}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-block ${
                        med.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {med.verified ? 'अधिकृत' : 'सूची सत्यापित नहीं'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {med.description}
                  </p>

                  {/* Distance & Details Strip */}
                  <div className="bg-stone-50 rounded-2xl p-2.5 border border-stone-200 flex items-center justify-between text-xs text-stone-700">
                    <div>
                      <span className="text-[10px] text-stone-400 block font-bold uppercase">GPS दूरी</span>
                      <span className="font-black text-stone-900">
                        {med.distanceDisplay}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-400 block font-bold uppercase">श्रेणी</span>
                      <span className="font-bold text-rose-700">
                        {getSubtypeLabel(med.medicalSubType)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block font-bold uppercase">सेवा समय</span>
                      <span className="font-bold text-amber-800">समय की पुष्टि नहीं</span>
                    </div>
                  </div>

                  {/* Action Buttons: 📍 रास्ता दिखाएँ & 📞 कॉल करें (Strictly per rules) */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100">
                    {/* 📍 रास्ता दिखाएँ */}
                    <button
                      onClick={() => handleNavigateToMedical(med)}
                      className="min-h-[46px] bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all"
                    >
                      <Navigation className="w-4 h-4 fill-white" />
                      <span>📍 रास्ता दिखाएँ</span>
                    </button>

                    {/* 📞 कॉल करें (Only if verified number exists, else “फोन नंबर उपलब्ध नहीं है।”) */}
                    {med.verified && med.phone ? (
                      <a
                        href={`tel:${med.phone}`}
                        className="min-h-[46px] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all"
                      >
                        <PhoneCall className="w-4 h-4 fill-white" />
                        <span>📞 {med.phone}</span>
                      </a>
                    ) : (
                      <div className="min-h-[46px] bg-stone-100 text-stone-500 font-bold text-xs rounded-xl flex items-center justify-center px-2 text-center border border-stone-200">
                        <span>फोन नंबर उपलब्ध नहीं है।</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MAP VIEW                                                 */}
        {/* ======================================================== */}
        {activeTab === 'MAP' && (
          <div className="space-y-3 animate-fade-in">
            <div className="h-[420px] rounded-3xl overflow-hidden shadow-md border border-stone-300">
              <DeoMap heightClass="h-full" showRouteLine={false} />
            </div>
            <p className="text-[11px] text-stone-500 text-center">
              नक्शे पर किसी भी 🚑 चिकित्सा मार्कर पर टैप करके तुरंत रास्ता देखें।
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
