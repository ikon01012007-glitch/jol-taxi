const CITY_PLACES = [
  { id: 'baiterek', label: 'Байтерек', subtitle: 'Монумент, центр', lat: 51.1284, lng: 71.4305 },
  { id: 'khan-shatyr', label: 'Khan Shatyr', subtitle: 'ТРЦ и центр притяжения', lat: 51.1325, lng: 71.4038 },
  { id: 'airport', label: 'Аэропорт Астаны', subtitle: 'NQZ, международный аэропорт', lat: 51.0226, lng: 71.4674 },
  { id: 'expo', label: 'EXPO', subtitle: 'Бизнес и выставки', lat: 51.0908, lng: 71.4181 },
  { id: 'mega', label: 'MEGA Silk Way', subtitle: 'Торговый центр', lat: 51.0916, lng: 71.4042 },
  { id: 'arena', label: 'Астана Арена', subtitle: 'Стадион', lat: 51.1085, lng: 71.4023 },
  { id: 'nu', label: 'Nazarbayev University', subtitle: 'Университет', lat: 51.0901, lng: 71.3985 },
  { id: 'park', label: 'Центральный парк', subtitle: 'Набережная и прогулки', lat: 51.1557, lng: 71.4236 },
];

const INTERCITY_PLACES = [
  { id: 'karaganda', label: 'Караганда', subtitle: 'Междугородний маршрут', lat: 49.8047, lng: 73.1094 },
  { id: 'kokshetau', label: 'Кокшетау', subtitle: 'Северное направление', lat: 53.2871, lng: 69.4043 },
  { id: 'burabay', label: 'Бурабай', subtitle: 'Курорт и отдых', lat: 53.083, lng: 70.3136 },
];

const SERVICE_TYPES = [
  {
    id: 'city',
    title: 'Такси',
    description: 'Поездка по Астане за минуты',
    hint: 'Городская поездка по Астане',
    pickupLabel: 'Откуда',
    destinationLabel: 'Куда',
    pickupPlaceholder: 'Выберите точку на карте или из списка',
    destinationPlaceholder: 'Например, Khan Shatyr',
    bookLabel: 'Заказать поездку',
    vehicleHint: 'AI рекомендует цену, вы выбираете класс',
    placesHeading: 'Популярные точки Астаны',
    placesHint: 'Нажмите или ищите выше',
    welcomeEyebrow: 'Пассажир',
  },
  {
    id: 'intercity',
    title: 'Межгород',
    description: 'Дальние поездки между городами',
    hint: 'Междугороднее такси и трансферы',
    pickupLabel: 'Где забрать',
    destinationLabel: 'Куда едем',
    pickupPlaceholder: 'Старт, например Астана',
    destinationPlaceholder: 'Например, Караганда',
    bookLabel: 'Заказать межгород',
    vehicleHint: 'Подбор под дальность маршрута и комфорт',
    placesHeading: 'Популярные междугородние маршруты',
    placesHint: 'Выберите город или точку на карте',
    welcomeEyebrow: 'Трансфер',
  },
  {
    id: 'delivery',
    title: 'Доставка',
    description: 'Курьер, документы и посылки',
    hint: 'Экспресс-доставка по городу',
    pickupLabel: 'Откуда забрать',
    destinationLabel: 'Куда доставить',
    pickupPlaceholder: 'Адрес отправителя',
    destinationPlaceholder: 'Адрес получателя',
    bookLabel: 'Оформить доставку',
    vehicleHint: 'Выберите формат курьера или грузового авто',
    placesHeading: 'Частые точки для доставки',
    placesHint: 'Нажмите или ищите выше',
    welcomeEyebrow: 'Доставка',
  },
];

const VEHICLES_BY_SERVICE = {
  city: [
    { id: 'jol_x', title: 'Jol X', description: 'Оптимальный повседневный класс', multiplier: 1 },
    { id: 'comfort', title: 'Comfort', description: 'Больше места и тишины', multiplier: 1.18 },
    { id: 'business', title: 'Business', description: 'Премиум-салон и приоритетная подача', multiplier: 1.42 },
  ],
  intercity: [
    { id: 'intercity_economy', title: 'Economy', description: 'Бюджетный межгород', multiplier: 1.1 },
    { id: 'intercity_comfort', title: 'Comfort+', description: 'Дальняя поездка с комфортом', multiplier: 1.28 },
    { id: 'intercity_van', title: 'Minivan', description: 'Для семьи и багажа', multiplier: 1.48 },
  ],
  delivery: [
    { id: 'courier', title: 'Courier', description: 'Документы и небольшие пакеты', multiplier: 0.92 },
    { id: 'express', title: 'Express', description: 'Срочная подача и доставка', multiplier: 1.08 },
    { id: 'cargo', title: 'Cargo', description: 'Крупные коробки и габарит', multiplier: 1.32 },
  ],
};

const state = {
  authMode: 'login',
  role: 'passenger',
  user: null,
  serviceType: 'city',
  activeField: 'pickup',
  selectedVehicle: VEHICLES_BY_SERVICE.city[0],
  pickup: null,
  destination: null,
  map: null,
  pickupMarker: null,
  destinationMarker: null,
  routeLine: null,
  quote: null,
  supportLoaded: false,
  mobileSheetExpanded: true,
};

const els = {
  appShell: document.getElementById('appShell'),
  bottomSheet: document.getElementById('bottomSheet'),
  authForm: document.getElementById('authForm'),
  authToggleBtn: document.getElementById('authToggleBtn'),
  authHeading: document.getElementById('authHeading'),
  authSubmit: document.getElementById('authSubmit'),
  authStatus: document.getElementById('authStatus'),
  authName: document.getElementById('authName'),
  authIdentifier: document.getElementById('authIdentifier'),
  authEmail: document.getElementById('authEmail'),
  authPassword: document.getElementById('authPassword'),
  authConfirm: document.getElementById('authConfirm'),
  nameField: document.getElementById('nameField'),
  emailField: document.getElementById('emailField'),
  confirmField: document.getElementById('confirmField'),
  roleSwitch: document.getElementById('roleSwitch'),
  driverFields: document.getElementById('driverFields'),
  carModel: document.getElementById('carModel'),
  carNumber: document.getElementById('carNumber'),
  serviceHint: document.getElementById('serviceHint'),
  serviceGrid: document.getElementById('serviceGrid'),
  pickupLabelText: document.getElementById('pickupLabelText'),
  destinationLabelText: document.getElementById('destinationLabelText'),
  pickupInput: document.getElementById('pickupInput'),
  destinationInput: document.getElementById('destinationInput'),
  useMyLocationBtn: document.getElementById('useMyLocationBtn'),
  swapLocationsBtn: document.getElementById('swapLocationsBtn'),
  clearRouteBtn: document.getElementById('clearRouteBtn'),
  placesHeading: document.getElementById('placesHeading'),
  placesHint: document.getElementById('placesHint'),
  placesList: document.getElementById('placesList'),
  vehicleHint: document.getElementById('vehicleHint'),
  vehicleGrid: document.getElementById('vehicleGrid'),
  quoteBtn: document.getElementById('quoteBtn'),
  mobileSheetToggle: document.getElementById('mobileSheetToggle'),
  quotePrice: document.getElementById('quotePrice'),
  metricsGrid: document.getElementById('metricsGrid'),
  aiReasoning: document.getElementById('aiReasoning'),
  bookRideBtn: document.getElementById('bookRideBtn'),
  loadHistoryBtn: document.getElementById('loadHistoryBtn'),
  historyList: document.getElementById('historyList'),
  welcomeEyebrow: document.getElementById('welcomeEyebrow'),
  welcomeTitle: document.getElementById('welcomeTitle'),
  sessionBadge: document.getElementById('sessionBadge'),
  logoutBtn: document.getElementById('logoutBtn'),
  chatDrawer: document.getElementById('chatDrawer'),
  openSupportBtn: document.getElementById('openSupportBtn'),
  closeSupportBtn: document.getElementById('closeSupportBtn'),
  chatLog: document.getElementById('chatLog'),
  chatForm: document.getElementById('chatForm'),
  chatInput: document.getElementById('chatInput'),
  toast: document.getElementById('toast'),
};

init();

async function init() {
  bindEvents();
  renderServices();
  renderPlaces(getPlacesForCurrentService());
  renderVehicles();
  syncAuthMode();
  restoreSession();
  applyServiceUi();
  initMap();
  syncMobileSheet();
  await safeInitDb();
  await loadHistory();
}

function bindEvents() {
  els.authToggleBtn.addEventListener('click', toggleAuthMode);
  els.authForm.addEventListener('submit', handleAuthSubmit);

  document.querySelectorAll('.role-option').forEach((button) => {
    button.addEventListener('click', () => {
      state.role = button.dataset.role;
      document.querySelectorAll('.role-option').forEach((item) => item.classList.toggle('active', item === button));
      els.driverFields.classList.toggle('visible', state.role === 'driver');
    });
  });

  els.pickupInput.addEventListener('focus', () => {
    state.activeField = 'pickup';
    expandMobileSheet();
  });
  els.destinationInput.addEventListener('focus', () => {
    state.activeField = 'destination';
    expandMobileSheet();
  });

  els.pickupInput.addEventListener('input', handlePlaceSearch);
  els.destinationInput.addEventListener('input', handlePlaceSearch);
  els.useMyLocationBtn.addEventListener('click', useMyLocation);
  els.swapLocationsBtn.addEventListener('click', swapLocations);
  els.clearRouteBtn.addEventListener('click', clearRoute);
  els.quoteBtn.addEventListener('click', requestQuote);
  els.mobileSheetToggle.addEventListener('click', toggleMobileSheet);
  els.bookRideBtn.addEventListener('click', bookRide);
  els.loadHistoryBtn.addEventListener('click', loadHistory);
  els.logoutBtn.addEventListener('click', logout);
  els.openSupportBtn.addEventListener('click', openSupport);
  els.closeSupportBtn.addEventListener('click', closeSupport);
  els.chatForm.addEventListener('submit', sendSupportMessage);

  els.chatDrawer.addEventListener('click', (event) => {
    if (event.target === els.chatDrawer) {
      closeSupport();
    }
  });

  window.addEventListener('resize', syncMobileSheet);
}

function initMap() {
  state.map = L.map('map', { zoomControl: false }).setView([51.1282, 71.4304], 12.7);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(state.map);

  state.map.on('click', (event) => {
    const target = state.activeField === 'destination' ? 'destination' : 'pickup';
    const point = {
      label: getMapPointLabel(target),
      subtitle: 'Выбрано вручную',
      lat: Number(event.latlng.lat.toFixed(6)),
      lng: Number(event.latlng.lng.toFixed(6)),
    };

    if (target === 'pickup') {
      setPickup(point);
    } else {
      setDestination(point);
    }
  });
}

function renderServices() {
  els.serviceGrid.innerHTML = '';
  SERVICE_TYPES.forEach((service) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `service-card${service.id === state.serviceType ? ' active' : ''}`;
    button.innerHTML = `<strong>${service.title}</strong><p>${service.description}</p>`;
    button.addEventListener('click', () => selectService(service.id));
    els.serviceGrid.append(button);
  });
}

function renderPlaces(places) {
  els.placesList.innerHTML = '';
  places.forEach((place) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'place-chip';
    button.innerHTML = `<strong>${place.label}</strong><span>${place.subtitle}</span>`;
    button.addEventListener('click', () => {
      if (state.activeField === 'destination') {
        setDestination(place);
      } else {
        setPickup(place);
      }
    });
    els.placesList.append(button);
  });
}

function renderVehicles() {
  els.vehicleGrid.innerHTML = '';
  getVehiclesForCurrentService().forEach((vehicle) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `vehicle-card${vehicle.id === state.selectedVehicle.id ? ' active' : ''}`;
    button.innerHTML = `<strong>${vehicle.title}</strong><p>${vehicle.description}</p><span>×${vehicle.multiplier.toFixed(2)}</span>`;
    button.addEventListener('click', () => {
      state.selectedVehicle = vehicle;
      renderVehicles();
      updateQuoteView();
      expandMobileSheet();
    });
    els.vehicleGrid.append(button);
  });
}

function selectService(serviceType) {
  if (state.serviceType === serviceType) {
    return;
  }

  state.serviceType = serviceType;
  state.selectedVehicle = getVehiclesForCurrentService()[0];
  state.quote = null;
  renderServices();
  renderVehicles();
  renderPlaces(getPlacesForCurrentService());
  applyServiceUi();
  updateQuoteView();
  expandMobileSheet();
}

function applyServiceUi() {
  const service = getCurrentService();
  els.serviceHint.textContent = service.hint;
  els.pickupLabelText.textContent = service.pickupLabel;
  els.destinationLabelText.textContent = service.destinationLabel;
  els.pickupInput.placeholder = service.pickupPlaceholder;
  els.destinationInput.placeholder = service.destinationPlaceholder;
  els.bookRideBtn.textContent = service.bookLabel;
  els.vehicleHint.textContent = service.vehicleHint;
  els.placesHeading.textContent = service.placesHeading;
  els.placesHint.textContent = service.placesHint;
  els.welcomeEyebrow.textContent = service.welcomeEyebrow;
}

function syncAuthMode() {
  const isRegister = state.authMode === 'register';
  els.authHeading.textContent = isRegister ? 'Регистрация' : 'Вход';
  els.authToggleBtn.textContent = isRegister ? 'У меня уже есть аккаунт' : 'Регистрация';
  els.authSubmit.textContent = isRegister ? 'Создать аккаунт' : 'Продолжить';
  els.authStatus.textContent = isRegister
    ? 'Создайте аккаунт, чтобы сохранять поездки и историю.'
    : 'Войдите, чтобы заказывать и сохранять поездки.';
  els.nameField.classList.toggle('visible', isRegister);
  els.emailField.classList.toggle('visible', isRegister);
  els.confirmField.classList.toggle('visible', isRegister);
  els.roleSwitch.classList.toggle('visible', isRegister);
  els.driverFields.classList.toggle('visible', isRegister && state.role === 'driver');
}

function toggleAuthMode() {
  state.authMode = state.authMode === 'login' ? 'register' : 'login';
  syncAuthMode();
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  try {
    setAuthLoading(true);

    if (state.authMode === 'register') {
      if (els.authPassword.value !== els.authConfirm.value) {
        throw new Error('Пароли не совпадают.');
      }

      const response = await apiFetch('/.netlify/functions/register', {
        method: 'POST',
        body: {
          name: els.authName.value.trim(),
          email: els.authEmail.value.trim(),
          phone: els.authIdentifier.value.trim(),
          password: els.authPassword.value,
          role: state.role,
          car_model: els.carModel.value.trim(),
          car_number: els.carNumber.value.trim(),
        },
      });

      state.user = response.user;
      persistSession();
      syncSessionUi();
      showToast('Аккаунт создан. Теперь можно оформлять заказы.');
      els.authStatus.textContent = response.message;
    } else {
      const response = await apiFetch('/.netlify/functions/login', {
        method: 'POST',
        body: {
          identifier: els.authIdentifier.value.trim(),
          password: els.authPassword.value,
        },
      });

      state.user = response.user;
      persistSession();
      syncSessionUi();
      showToast('Вы вошли в аккаунт.');
    }

    els.authForm.reset();
    state.authMode = 'login';
    syncAuthMode();
    await loadHistory();
  } catch (error) {
    showToast(error.message);
  } finally {
    setAuthLoading(false);
  }
}

function setAuthLoading(isLoading) {
  els.authSubmit.disabled = isLoading;
  els.authSubmit.textContent = isLoading ? 'Подождите...' : state.authMode === 'register' ? 'Создать аккаунт' : 'Продолжить';
}

function restoreSession() {
  const raw = localStorage.getItem('jol-user');
  if (!raw) {
    syncSessionUi();
    return;
  }

  try {
    state.user = JSON.parse(raw);
  } catch {
    state.user = null;
  }

  syncSessionUi();
}

function persistSession() {
  if (state.user) {
    localStorage.setItem('jol-user', JSON.stringify(state.user));
  } else {
    localStorage.removeItem('jol-user');
  }
}

function syncSessionUi() {
  const isLoggedIn = Boolean(state.user);
  els.appShell.classList.toggle('logged-in', isLoggedIn);

  if (state.user) {
    els.welcomeTitle.textContent = `Здравствуйте, ${state.user.name}`;
    els.sessionBadge.textContent = state.user.role === 'driver' ? 'Водитель' : 'В сети';
    els.logoutBtn.hidden = false;
  } else {
    els.welcomeTitle.textContent = 'Добро пожаловать в Jol';
    els.sessionBadge.textContent = 'Гость';
    els.logoutBtn.hidden = true;
  }
}

function toggleMobileSheet() {
  state.mobileSheetExpanded = !state.mobileSheetExpanded;
  syncMobileSheet();
}

function syncMobileSheet() {
  els.bottomSheet.classList.toggle('collapsed', !state.mobileSheetExpanded);
  els.mobileSheetToggle.textContent = state.mobileSheetExpanded ? 'Развернуть меню' : 'Свернуть меню';
}

function expandMobileSheet() {
  state.mobileSheetExpanded = true;
  syncMobileSheet();
}

async function safeInitDb() {
  try {
    await apiFetch('/.netlify/functions/init-db', { method: 'POST' });
  } catch (error) {
    console.error(error);
    showToast('Не удалось проверить базу данных. Продолжаю в режиме интерфейса.');
  }
}

function handlePlaceSearch(event) {
  const term = event.target.value.trim().toLowerCase();
  state.activeField = event.target === els.destinationInput ? 'destination' : 'pickup';
  const source = getPlacesForCurrentService();
  const filtered = term
    ? source.filter((place) => `${place.label} ${place.subtitle}`.toLowerCase().includes(term))
    : source;
  renderPlaces(filtered);
}

async function useMyLocation() {
  if (!navigator.geolocation) {
    showToast('Браузер не поддерживает геолокацию.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const point = {
        label: state.serviceType === 'delivery' ? 'Адрес отправителя' : 'Моя геопозиция',
        subtitle: 'Определена автоматически',
        lat: Number(position.coords.latitude.toFixed(6)),
        lng: Number(position.coords.longitude.toFixed(6)),
      };
      setPickup(point);
      state.map.setView([point.lat, point.lng], 14);
      showToast('Точка отправления обновлена.');
    },
    () => showToast('Не удалось получить геопозицию.'),
    { enableHighAccuracy: true, timeout: 10000 },
  );
}

function setPickup(place) {
  state.pickup = { ...place };
  els.pickupInput.value = place.label;
  updateMarker('pickup', place, true);
  expandMobileSheet();
}

function setDestination(place) {
  state.destination = { ...place };
  els.destinationInput.value = place.label;
  updateMarker('destination', place, false);
  expandMobileSheet();
}

function updateMarker(type, place, fitBounds = false) {
  const icon = L.divIcon({
    className: `map-pin ${type}`,
    html: `<span>${type === 'pickup' ? 'A' : 'B'}</span>`,
    iconSize: [30, 30],
  });

  const key = type === 'pickup' ? 'pickupMarker' : 'destinationMarker';
  if (state[key]) {
    state[key].remove();
  }

  state[key] = L.marker([place.lat, place.lng], { icon }).addTo(state.map);
  state[key].bindPopup(`${type === 'pickup' ? getCurrentService().pickupLabel : getCurrentService().destinationLabel}: ${place.label}`);

  drawRoute();

  if (fitBounds && !state.destination) {
    state.map.setView([place.lat, place.lng], 14);
  }
}

function drawRoute() {
  if (state.routeLine) {
    state.routeLine.remove();
    state.routeLine = null;
  }

  if (!state.pickup || !state.destination) {
    return;
  }

  state.routeLine = L.polyline(
    [
      [state.pickup.lat, state.pickup.lng],
      [state.destination.lat, state.destination.lng],
    ],
    { color: '#111111', weight: 4, dashArray: '8 10' },
  ).addTo(state.map);

  const bounds = L.latLngBounds(
    [state.pickup.lat, state.pickup.lng],
    [state.destination.lat, state.destination.lng],
  );
  state.map.fitBounds(bounds.pad(0.2));
}

function swapLocations() {
  const temp = state.pickup;
  state.pickup = state.destination;
  state.destination = temp;

  els.pickupInput.value = state.pickup?.label || '';
  els.destinationInput.value = state.destination?.label || '';

  if (state.pickup) {
    updateMarker('pickup', state.pickup);
  }
  if (state.destination) {
    updateMarker('destination', state.destination);
  }
}

function clearRoute() {
  state.pickup = null;
  state.destination = null;
  state.quote = null;
  els.pickupInput.value = '';
  els.destinationInput.value = '';

  if (state.pickupMarker) state.pickupMarker.remove();
  if (state.destinationMarker) state.destinationMarker.remove();
  if (state.routeLine) state.routeLine.remove();

  state.pickupMarker = null;
  state.destinationMarker = null;
  state.routeLine = null;
  updateQuoteView();
}

async function requestQuote() {
  if (!state.pickup || !state.destination) {
    showToast('Сначала выберите точки отправления и назначения.');
    return;
  }

  try {
    expandMobileSheet();
    els.quoteBtn.disabled = true;
    els.quoteBtn.textContent = 'Считаю...';
    const response = await apiFetch('/.netlify/functions/quote', {
      method: 'POST',
      body: {
        serviceType: state.serviceType,
        pickup: state.pickup,
        destination: state.destination,
      },
    });

    state.quote = response;
    updateQuoteView();
    showToast('AI подготовил цену заказа.');
  } catch (error) {
    showToast(error.message);
  } finally {
    els.quoteBtn.disabled = false;
    els.quoteBtn.textContent = 'Рассчитать';
  }
}

function updateQuoteView() {
  if (!state.quote) {
    els.quotePrice.textContent = 'Цена появится после расчёта';
    els.aiReasoning.textContent = 'AI объяснение и рекомендации появятся после расчёта маршрута.';
    renderMetrics([
      ['Расстояние', '0 км'],
      ['Время', '0 мин'],
      ['Спрос', 'Ожидание'],
      ['Погода', 'Ожидание'],
    ]);
    return;
  }

  const adjusted = Math.round(state.quote.fare.recommendedPrice * state.selectedVehicle.multiplier);
  els.quotePrice.textContent = `${formatKzt(adjusted)} • ${state.selectedVehicle.title}`;
  els.aiReasoning.textContent = state.quote.aiReasoning;

  renderMetrics([
    ['Формат', humanizeServiceType(state.quote.fare.serviceType || state.serviceType)],
    ['Расстояние', `${state.quote.fare.distanceKm} км`],
    ['Время', `${state.quote.fare.durationMin} мин`],
    ['Погода', state.quote.fare.weatherLabel],
  ]);
}

function renderMetrics(entries) {
  els.metricsGrid.innerHTML = '';
  entries.forEach(([label, value]) => {
    const metric = document.createElement('div');
    metric.className = 'metric';
    metric.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    els.metricsGrid.append(metric);
  });
}

async function bookRide() {
  if (!state.user) {
    showToast('Сначала зарегистрируйтесь или войдите.');
    return;
  }

  if (!state.quote) {
    showToast('Сначала рассчитайте заказ.');
    return;
  }

  try {
    expandMobileSheet();
    const adjustedPrice = Math.round(state.quote.fare.recommendedPrice * state.selectedVehicle.multiplier);
    const fare = {
      ...state.quote.fare,
      recommendedPrice: adjustedPrice,
    };

    const response = await apiFetch('/.netlify/functions/rides', {
      method: 'POST',
      body: {
        userId: state.user.id,
        serviceType: state.serviceType,
        vehicleType: state.selectedVehicle.id,
        pickup: state.pickup,
        destination: state.destination,
        fare,
        aiReasoning: state.quote.aiReasoning,
      },
    });

    showToast(response.message);
    await loadHistory();
  } catch (error) {
    showToast(error.message);
  }
}

async function loadHistory() {
  if (!state.user) {
    els.historyList.innerHTML = '<p class="empty-state">История появится после входа в аккаунт.</p>';
    return;
  }

  try {
    const response = await apiFetch(`/.netlify/functions/rides?userId=${state.user.id}`);
    renderHistory(response.rides || []);
  } catch (error) {
    els.historyList.innerHTML = `<p class="empty-state">${error.message}</p>`;
  }
}

function renderHistory(rides) {
  if (!rides.length) {
    els.historyList.innerHTML = '<p class="empty-state">Пока заказов нет. Оформите первый после расчёта цены.</p>';
    return;
  }

  els.historyList.innerHTML = '';
  rides.forEach((ride) => {
    const item = document.createElement('article');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="history-top">
        <div class="history-route">${ride.pickup_label} → ${ride.destination_label}</div>
        <strong>${formatKzt(ride.recommended_price)}</strong>
      </div>
      <div class="history-meta">${humanizeServiceType(ride.service_type)} • ${ride.vehicle_type} • ${ride.route_distance_km} км • ${ride.route_duration_min} мин • ${formatDate(ride.created_at)}</div>
    `;
    els.historyList.append(item);
  });
}

async function openSupport() {
  els.chatDrawer.classList.add('visible');
  if (state.supportLoaded || !state.user) {
    return;
  }

  try {
    const response = await apiFetch(`/.netlify/functions/chat?userId=${state.user.id}`);
    renderChat(response.messages || []);
    state.supportLoaded = true;
  } catch (error) {
    showToast(error.message);
  }
}

function closeSupport() {
  els.chatDrawer.classList.remove('visible');
}

function logout() {
  state.user = null;
  state.supportLoaded = false;
  persistSession();
  syncSessionUi();
  renderHistory([]);
  closeSupport();
  showToast('Вы вышли из аккаунта.');
}

function renderChat(messages) {
  els.chatLog.innerHTML = '';
  if (!messages.length) {
    appendChatMessage('assistant', 'Я на связи. Спросите про цену поездки, доставку, маршрут по Астане или статус заказа.');
    return;
  }

  messages.forEach((message) => appendChatMessage(message.role, message.text));
}

async function sendSupportMessage(event) {
  event.preventDefault();

  if (!state.user) {
    showToast('Поддержка доступна после входа.');
    return;
  }

  const text = els.chatInput.value.trim();
  if (!text) {
    return;
  }

  appendChatMessage('user', text);
  els.chatInput.value = '';

  try {
    const response = await apiFetch('/.netlify/functions/chat', {
      method: 'POST',
      body: {
        userId: state.user.id,
        userName: state.user.name,
        text,
      },
    });

    appendChatMessage('assistant', response.reply.text);
  } catch (error) {
    appendChatMessage('assistant', `Сейчас не удалось ответить автоматически: ${error.message}`);
  }
}

function appendChatMessage(role, text) {
  const item = document.createElement('div');
  item.className = `chat-message ${role === 'user' ? 'user' : 'assistant'}`;
  item.innerHTML = `<p>${escapeHtml(text)}</p>`;
  els.chatLog.append(item);
  els.chatLog.scrollTop = els.chatLog.scrollHeight;
}

function getCurrentService() {
  return SERVICE_TYPES.find((service) => service.id === state.serviceType) || SERVICE_TYPES[0];
}

function getPlacesForCurrentService() {
  return state.serviceType === 'intercity' ? [...CITY_PLACES, ...INTERCITY_PLACES] : CITY_PLACES;
}

function getVehiclesForCurrentService() {
  return VEHICLES_BY_SERVICE[state.serviceType] || VEHICLES_BY_SERVICE.city;
}

function getMapPointLabel(target) {
  if (state.serviceType === 'delivery') {
    return target === 'pickup' ? 'Точка забора на карте' : 'Точка доставки на карте';
  }
  if (state.serviceType === 'intercity') {
    return target === 'pickup' ? 'Точка старта на карте' : 'Точка прибытия на карте';
  }
  return target === 'pickup' ? 'Точка отправления на карте' : 'Точка назначения на карте';
}

function humanizeServiceType(serviceType) {
  const service = SERVICE_TYPES.find((item) => item.id === serviceType);
  return service ? service.title : 'Такси';
}

function isMobileViewport() {
  return window.matchMedia('(max-width: 760px)').matches;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('visible');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    els.toast.classList.remove('visible');
  }, 2800);
}

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Произошла ошибка запроса.');
  }
  return data;
}

function formatKzt(value) {
  return `${new Intl.NumberFormat('ru-RU').format(value)} ₸`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
