export interface Coordinates {
  latitude: number;
  longitude: number;
}

export const LocationService = {
  // Haversine formula to compute exact straight-line distance in kilometers
  calculateDistanceKm: (
    coord1: Coordinates,
    coord2: Coordinates
  ): number => {
    const R = 6371; // Earth's mean radius in km
    const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const dLng = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1.latitude * Math.PI) / 180) *
        Math.cos((coord2.latitude * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // Format distance into clean, readable Hindi text
  formatDistanceHindi: (
    coord1: Coordinates | null,
    coord2: Coordinates | null
  ): string => {
    if (!coord1 || !coord2) {
      return 'GPS उपलब्ध होने पर दूरी दिखाई जाएगी।';
    }

    const distKm = LocationService.calculateDistanceKm(coord1, coord2);

    if (distKm < 1) {
      const meters = Math.round(distKm * 1000);
      return `लगभग ${meters} मीटर (अनुमानित सीधी दूरी)`;
    }

    return `लगभग ${distKm.toFixed(1)} किमी (अनुमानित सीधी दूरी)`;
  },

  // Calculate estimated walking time (~4.5 km/h walking speed)
  formatWalkingTimeHindi: (
    coord1: Coordinates | null,
    coord2: Coordinates | null
  ): string => {
    if (!coord1 || !coord2) {
      return '— मिनट';
    }

    const distKm = LocationService.calculateDistanceKm(coord1, coord2);
    const minutes = Math.max(1, Math.round((distKm / 4.5) * 60));

    if (minutes > 60) {
      const hrs = Math.floor(minutes / 60);
      const remainingMins = minutes % 60;
      return `लगभग ${hrs} घंटा ${remainingMins} मिनट पैदल`;
    }

    return `लगभग ${minutes} मिनट पैदल`;
  },
};
