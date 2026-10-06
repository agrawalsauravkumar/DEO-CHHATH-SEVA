import React from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, ShieldCheck, X, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onGranted?: () => void;
}

export const LocationPermissionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onGranted,
}) => {
  const {
    requestDeviceLocation,
    locationStatus,
    locationErrorMessage,
  } = useApp();

  if (!isOpen) return null;

  const handleGrant = async () => {
    const success = await requestDeviceLocation();
    if (success) {
      if (onGranted) onGranted();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-stone-200">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center shadow-xs">
            <MapPin className="w-8 h-8 text-amber-700 animate-bounce" />
          </div>

          <h3 className="text-xl font-black text-stone-900 leading-snug">
            Location अनुमति
          </h3>

          <p className="text-sm font-bold text-stone-700 leading-relaxed">
            “आपका वर्तमान स्थान दिखाने और आपको रास्ता बताने के लिए Location की आवश्यकता है।”
          </p>
        </div>

        {/* Status or error feedback */}
        {locationStatus === 'loading' && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 text-center animate-pulse">
            आपका स्थान खोजा जा रहा है…
          </div>
        )}

        {locationErrorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{locationErrorMessage}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleGrant}
            disabled={locationStatus === 'loading'}
            className="w-full min-h-[50px] bg-amber-600 hover:bg-amber-700 active:scale-98 disabled:opacity-70 text-white font-black text-base rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <MapPin className="w-5 h-5 fill-white" />
            <span>
              {locationStatus === 'loading' ? 'स्थान खोजा जा रहा है…' : 'स्थान की अनुमति दें'}
            </span>
          </button>

          <button
            onClick={onClose}
            disabled={locationStatus === 'loading'}
            className="w-full min-h-[46px] bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm rounded-2xl transition-colors"
          >
            अभी नहीं
          </button>
        </div>

        <div className="text-center text-[11px] text-stone-500 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
          <span>आपकी लोकेशन केवल आपके डिवाइस में सुरक्षित रहेगी।</span>
        </div>
      </div>
    </div>
  );
};
