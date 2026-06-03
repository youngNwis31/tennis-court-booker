/**
 * Generates a satellite image URL for a given lat/lng using free ESRI World Imagery tiles.
 * No API key required.
 */

function latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
  return { x, y };
}

/**
 * Returns a satellite tile URL for the given coordinates.
 * zoom 17 ≈ shows a few buildings/courts clearly
 * zoom 18 ≈ very close up, single court visible
 */
export function getSatelliteImageUrl(lat: number, lng: number, zoom: number = 17): string {
  const { x, y } = latLngToTile(lat, lng, zoom);
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`;
}

/**
 * Returns multiple satellite tiles around a location for a wider view.
 * Returns the center tile URL.
 */
export function getSatelliteImages(lat: number, lng: number): {
  closeUp: string;
  wider: string;
} {
  return {
    closeUp: getSatelliteImageUrl(lat, lng, 18),
    wider: getSatelliteImageUrl(lat, lng, 16),
  };
}
