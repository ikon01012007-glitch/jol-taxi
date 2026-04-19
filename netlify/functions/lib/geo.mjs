const ASTANA_COORDS = {
  lat: 51.1282,
  lng: 71.4304,
};

export async function getRouteMetrics(pickup, destination) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}?overview=false&alternatives=false&steps=false`;
    const response = await fetch(url, { headers: { accept: 'application/json' } });
    if (!response.ok) {
      throw new Error(`OSRM responded with ${response.status}`);
    }

    const data = await response.json();
    const route = data.routes?.[0];
    if (!route) {
      throw new Error('Route not found');
    }

    return {
      distanceKm: Number((route.distance / 1000).toFixed(2)),
      durationMin: Math.max(4, Math.round(route.duration / 60)),
      source: 'osrm',
    };
  } catch {
    const distanceKm = haversineDistanceKm(pickup, destination);
    return {
      distanceKm,
      durationMin: Math.max(5, Math.round((distanceKm / 28) * 60)),
      source: 'fallback',
    };
  }
}

export async function getAstanaWeather() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${ASTANA_COORDS.lat}&longitude=${ASTANA_COORDS.lng}&current=temperature_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code`;
    const response = await fetch(url, { headers: { accept: 'application/json' } });
    if (!response.ok) {
      throw new Error(`Weather responded with ${response.status}`);
    }

    const data = await response.json();
    return data.current || null;
  } catch {
    return null;
  }
}

const SERVICE_PROFILES = {
  city: { label: 'Такси', baseFare: 690, distanceRate: 145, durationRate: 18, multiplier: 1, minimum: 900 },
  intercity: { label: 'Межгород', baseFare: 2200, distanceRate: 185, durationRate: 16, multiplier: 1.18, minimum: 3500 },
  delivery: { label: 'Доставка', baseFare: 850, distanceRate: 120, durationRate: 12, multiplier: 0.96, minimum: 1200 },
};

export function buildFareModel({ distanceKm, durationMin, weather, serviceType = 'city' }) {
  const now = new Date();
  const demandMultiplier = getDemandMultiplier(now);
  const trafficMultiplier = getTrafficMultiplier(now);
  const weatherMultiplier = getWeatherMultiplier(weather);
  const service = SERVICE_PROFILES[serviceType] || SERVICE_PROFILES.city;

  const baseFare = service.baseFare;
  const distanceFare = distanceKm * service.distanceRate;
  const durationFare = durationMin * service.durationRate;
  const rawPrice =
    (baseFare + distanceFare + durationFare) *
    demandMultiplier *
    trafficMultiplier *
    weatherMultiplier *
    service.multiplier;
  const recommendedPrice = roundPrice(rawPrice, service.minimum);

  return {
    serviceType,
    serviceLabel: service.label,
    baseFare,
    distanceKm: Number(distanceKm.toFixed(2)),
    durationMin,
    demandMultiplier,
    trafficMultiplier,
    weatherMultiplier,
    recommendedPrice,
    weatherLabel: describeWeather(weather),
    trafficLabel: describeTraffic(trafficMultiplier),
    demandLabel: describeDemand(demandMultiplier),
  };
}

export function haversineDistanceKm(a, b) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const value = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  const distance = 2 * earthRadiusKm * Math.asin(Math.sqrt(value));
  return Number(distance.toFixed(2));
}

function getDemandMultiplier(date) {
  const hour = date.getHours();
  const day = date.getDay();
  const isWeekend = day === 0 || day === 6;

  if ((hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20)) {
    return 1.28;
  }

  if (isWeekend && hour >= 21) {
    return 1.22;
  }

  if (hour >= 0 && hour <= 5) {
    return 1.16;
  }

  return 1.05;
}

function getTrafficMultiplier(date) {
  const hour = date.getHours();
  if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
    return 1.18;
  }
  if (hour >= 12 && hour <= 14) {
    return 1.1;
  }
  return 1;
}

function getWeatherMultiplier(weather) {
  if (!weather) {
    return 1.03;
  }

  const precipitation = Number(weather.precipitation || 0);
  const wind = Number(weather.wind_speed_10m || 0);
  const code = Number(weather.weather_code || 0);

  let multiplier = 1;
  if (precipitation >= 1) {
    multiplier += 0.08;
  }
  if (wind >= 12) {
    multiplier += 0.05;
  }
  if ([61, 63, 65, 71, 73, 75, 95, 96, 99].includes(code)) {
    multiplier += 0.07;
  }

  return Number(multiplier.toFixed(2));
}

function describeTraffic(multiplier) {
  if (multiplier >= 1.18) {
    return 'Час пик';
  }
  if (multiplier >= 1.1) {
    return 'Умеренные пробки';
  }
  return 'Дороги свободны';
}

function describeDemand(multiplier) {
  if (multiplier >= 1.28) {
    return 'Высокий спрос';
  }
  if (multiplier >= 1.16) {
    return 'Повышенный спрос';
  }
  return 'Обычный спрос';
}

function describeWeather(weather) {
  if (!weather) {
    return 'Погода недоступна';
  }

  const code = Number(weather.weather_code || 0);
  if ([61, 63, 65].includes(code)) {
    return 'Дождь';
  }
  if ([71, 73, 75].includes(code)) {
    return 'Снег';
  }
  if ([95, 96, 99].includes(code)) {
    return 'Гроза';
  }
  if ([1, 2, 3, 45, 48].includes(code)) {
    return 'Облачно';
  }
  return 'Ясно';
}

function roundPrice(value, minimum) {
  return Math.max(minimum, Math.round(value / 10) * 10);
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}
