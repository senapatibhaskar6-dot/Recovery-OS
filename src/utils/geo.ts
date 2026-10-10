/**
 * Geo-verification & Haversine distance calculator
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Calculates the great-circle distance between two points on the earth surface in meters
 */
export function calculateDistanceMeters(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (coord1.lat * Math.PI) / 180;
  const φ2 = (coord2.lat * Math.PI) / 180;
  const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const Δλ = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

export function evaluateGeoVerification(
  currentCoord: Coordinates,
  targetCoord: Coordinates
): {
  status: 'Verified On-Site' | 'Proximity Warning' | 'Remote / Out-of-Range';
  distanceMeters: number;
  message: string;
} {
  const distance = calculateDistanceMeters(currentCoord, targetCoord);

  if (distance <= 250) {
    return {
      status: 'Verified On-Site',
      distanceMeters: distance,
      message: `Verified: Field officer is within ${distance}m of customer registered address. GPS lock confirmed.`,
    };
  } else if (distance <= 800) {
    return {
      status: 'Proximity Warning',
      distanceMeters: distance,
      message: `Proximity Alert: Officer is ${distance}m from destination. Acceptable only if building access restricted.`,
    };
  } else {
    return {
      status: 'Remote / Out-of-Range',
      distanceMeters: distance,
      message: `Out of range: Officer device is ${formatDistance(distance)} away from customer registered location. Flagged for supervisor review.`,
    };
  }
}
