// Türkiye il merkezleri koordinatları [lat, lng]
export const CITY_COORDS: Record<string, [number, number]> = {
  "Adana": [37.0, 35.3213],
  "Adıyaman": [37.7644, 38.2763],
  "Afyonkarahisar": [38.7569, 30.5435],
  "Ağrı": [39.7191, 43.0506],
  "Amasya": [40.6499, 35.8351],
  "Ankara": [39.9334, 32.8597],
  "Antalya": [36.8969, 30.7133],
  "Artvin": [41.1828, 41.8194],
  "Aydın": [37.8560, 27.8416],
  "Balıkesir": [39.6484, 27.8826],
  "Bilecik": [40.1426, 29.9793],
  "Bingöl": [38.8855, 40.4966],
  "Bitlis": [38.3938, 42.1232],
  "Bolu": [40.7316, 31.6076],
  "Burdur": [37.7203, 30.2908],
  "Bursa": [40.1826, 29.0669],
  "Çanakkale": [40.1553, 26.4142],
  "Çankırı": [40.6013, 33.6134],
  "Çorum": [40.5506, 34.9556],
  "Denizli": [37.7765, 29.0864],
  "Diyarbakır": [37.9143, 40.2306],
  "Edirne": [41.6772, 26.5557],
  "Elazığ": [38.6810, 39.2264],
  "Erzincan": [39.7503, 39.4907],
  "Erzurum": [39.9055, 41.2658],
  "Eskişehir": [39.7667, 30.5256],
  "Gaziantep": [37.0662, 37.3833],
  "Giresun": [40.9158, 38.3881],
  "Gümüşhane": [40.4386, 39.5092],
  "Hakkari": [37.5774, 43.7378],
  "Hatay": [36.2028, 36.1606],
  "Isparta": [37.7626, 30.5537],
  "Mersin": [36.8121, 34.6415],
  "İstanbul": [41.0082, 28.9784],
  "İzmir": [38.4192, 27.1287],
  "Kars": [40.6013, 43.0975],
  "Kastamonu": [41.3766, 33.7765],
  "Kayseri": [38.7212, 35.4847],
  "Kırklareli": [41.7325, 27.2264],
  "Kırşehir": [39.1455, 34.1609],
  "Kocaeli": [40.8533, 29.8815],
  "Konya": [37.8746, 32.4932],
  "Kütahya": [39.4163, 29.9857],
  "Malatya": [38.3552, 38.3095],
  "Manisa": [38.6191, 27.4289],
  "Kahramanmaraş": [37.5756, 36.9371],
  "Mardin": [37.3129, 40.7430],
  "Muğla": [37.2153, 28.3636],
  "Muş": [38.7432, 41.5064],
  "Nevşehir": [38.6247, 34.7142],
  "Niğde": [37.9698, 34.6766],
  "Ordu": [40.9862, 37.8797],
  "Rize": [41.0253, 40.5176],
  "Sakarya": [40.7568, 30.3782],
  "Samsun": [41.2867, 36.33],
  "Siirt": [37.9274, 41.9420],
  "Sinop": [42.0231, 35.1531],
  "Sivas": [39.7505, 37.0150],
  "Tekirdağ": [40.9781, 27.5117],
  "Tokat": [40.3164, 36.5500],
  "Trabzon": [41.0015, 39.7178],
  "Tunceli": [39.1061, 39.5483],
  "Şanlıurfa": [37.1674, 38.7955],
  "Uşak": [38.6742, 29.4058],
  "Van": [38.5012, 43.3730],
  "Yozgat": [39.8211, 34.8095],
  "Zonguldak": [41.2514, 31.8393],
  "Aksaray": [38.3687, 34.0360],
  "Bayburt": [40.2552, 40.2249],
  "Karaman": [37.1759, 33.2287],
  "Kırıkkale": [39.8417, 33.5062],
  "Batman": [37.8812, 41.1351],
  "Şırnak": [37.4187, 42.4918],
  "Bartın": [41.6376, 32.3371],
  "Ardahan": [41.1105, 42.7022],
  "Iğdır": [39.9200, 44.0436],
  "Yalova": [40.6549, 29.2769],
  "Karabük": [41.2062, 32.6204],
  "Kilis": [36.7184, 37.1212],
  "Osmaniye": [37.0748, 36.2464],
  "Düzce": [40.8438, 31.1565],
};

// Haversine distance (km) between two GPS coordinates
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// GPS koordinatından en yakın ili bul (150km tolerance)
export function findNearestCity(lat: number, lng: number): string | null {
  let nearest: string | null = null;
  let minDist = Infinity;

  for (const [city, [cLat, cLng]] of Object.entries(CITY_COORDS)) {
    const dist = haversine(lat, lng, cLat, cLng);
    if (dist < minDist) {
      minDist = dist;
      nearest = city;
    }
  }

  // 150km'den uzaksa Türkiye dışı olabilir
  return minDist <= 150 ? nearest : null;
}
