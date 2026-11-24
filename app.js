const AQI_LEVELS = {
  good: { label: 'Good', advice: 'Outdoor air is currently in the “good” range.' },
  moderate: { label: 'Moderate', advice: 'Outdoor air is moderate; sensitive people may prefer lighter activity.' },
  sensitive: { label: 'Sensitive groups', advice: 'Sensitive groups may be affected, so build in more indoor breaks.' },
  unhealthy: { label: 'Unhealthy', advice: 'Outdoor air is unhealthy; make this a lower-exposure day.' },
  'very-unhealthy': { label: 'Very unhealthy', advice: 'Outdoor air is very unhealthy; prioritize staying indoors.' },
  hazardous: { label: 'Hazardous', advice: 'Outdoor air is hazardous; minimize time outside and follow local alerts.' }
};

const HOUSEHOLD_NOTES = {
  children: 'Children are more sensitive to air pollution, so move active play indoors when air quality is poor.',
  'older-adult': 'Older adults can be more affected by polluted air; keep strenuous outdoor errands flexible.',
  respiratory: 'A household member with a heart or lung condition may be more sensitive; follow their clinician’s existing care plan.',
  family: 'A mixed-age household benefits from planning outdoor time around the cleanest part of the day.',
  general: 'Use your local AQI trend to choose the lowest-pollution time for essential outdoor tasks.'
};

const COMMUTE_SWAPS = {
  car: 'Try public transit, a shared ride, or working from home for one or two trips this week. Fewer solo car kilometres mean less tailpipe pollution where people live and walk.',
  transit: 'Keep using transit when it works for you. Grouping errands near a transit stop can replace short car trips and lower neighborhood traffic emissions.',
  shared: 'Keep sharing rides, and coordinate errands in one trip. Each avoided solo journey means less traffic and exhaust near homes and schools.',
  active: 'Walking and cycling are great low-emission options when air quality and route safety allow. On polluted days, choose an indoor alternative or a lower-traffic route.',
  remote: 'Working or studying from home avoids a commute altogether. If you have flexibility, batch errands into one lower-emission trip.'
};

function getRoutine(aqi, commute, household) {
  const steps = [];
  if (aqi === 'good' || aqi === 'moderate') {
    steps.push('Check the hourly AQI before planning outdoor exercise; choose a lower-traffic route and take breaks if conditions worsen.');
  } else {
    steps.push('Move workouts and children’s play indoors. Keep outdoor trips brief, and reschedule strenuous activity for a cleaner-air period.');
  }
  if (commute === 'car') {
    steps.push(aqi === 'good' || aqi === 'moderate'
      ? 'For an essential drive, combine errands, avoid idling, and consider sharing one trip this week.'
      : 'If practical, replace a car trip with transit, a shared ride, or a remote day. Avoid idling near homes and school entrances.');
  } else if (commute === 'active') {
    steps.push(aqi === 'good' || aqi === 'moderate'
      ? 'Choose quieter streets for your walk or cycle and check conditions again before heading home.'
      : 'Consider transit or a shared ride today instead of exercising beside busy roads; avoid strenuous outdoor activity.');
  } else {
    steps.push(commute === 'remote'
      ? 'Keep today’s errands together in one trip, or postpone non-urgent travel while pollution is high.'
      : 'Stick with transit or shared travel for essential trips; avoid waiting beside idling traffic where possible.');
  }
  steps.push(HOUSEHOLD_NOTES[household] || HOUSEHOLD_NOTES.family);
  return steps;
}

function getHomeAdvice(aqi) {
  const advice = [
    'Close windows and doors during pollution peaks. Ventilate briefly when outdoor air improves, if weather and safety allow.',
    'Run a correctly sized HEPA air cleaner in the room where your household spends the most time, if available. Avoid ozone-generating air cleaners.'
  ];
  if (aqi === 'good' || aqi === 'moderate') {
    advice[0] = 'When outdoor air is cleaner, open windows briefly for fresh air if weather and safety allow; close them again when AQI rises.';
  }
  advice.push('Avoid adding indoor smoke: skip incense and candles, do not smoke indoors, and use an externally vented kitchen exhaust while cooking.');
  return advice;
}

function getImpact(commute, distance, days) {
  const practicalDistance = Number.isFinite(distance) ? Math.min(Math.max(distance, 0), 300) : 0;
  const practicalDays = Number.isFinite(days) ? Math.min(Math.max(days, 1), 7) : 5;
  if (commute === 'car') {
    const replacedDays = Math.min(practicalDays, 2);
    const avoidedKilometres = Math.round(practicalDistance * 2 * replacedDays);
    const emissions = avoidedKilometres * 0.25;
    return {
      value: `${emissions < 10 ? emissions.toFixed(1) : Math.round(emissions)}`,
      unit: 'kg CO₂e / week (estimate)',
      title: 'Two car-free commute days can add up.',
      description: `${avoidedKilometres} fewer solo-car kilometres each week, if you switch ${replacedDays} round trips to transit, a shared ride, or remote work. Estimate uses 0.25 kg CO₂e per car kilometre; actual savings vary by vehicle and trip.`
    };
  }
  const alternatives = {
    transit: ['Transit keeps more cars off the road.', 'Choosing transit for your usual commute helps reduce traffic and exhaust near busy streets.'],
    shared: ['Sharing a ride makes each trip go further.', 'Carpooling can reduce the number of vehicles on the road; the exact emissions benefit depends on the route and vehicle.'],
    active: ['Your commute can be a zero-tailpipe trip.', 'Walking or cycling instead of a short car journey avoids tailpipe emissions on that route, when air quality and safety allow.'],
    remote: ['A commute you skip means less traffic.', 'Working or studying from home avoids travel emissions for that day; the effect depends on the trip you would otherwise make.']
  };
  const [title, description] = alternatives[commute] || alternatives.remote;
  return { value: '1', unit: 'lower-emission choice', title, description };
}

function createList(listId, items) {
  const list = document.getElementById(listId);
  list.replaceChildren(...items.map((item) => {
    const element = document.createElement('li');
    element.textContent = item;
    return element;
  }));
}

function buildPlan(event) {
  event.preventDefault();
  const location = document.getElementById('location').value.trim();
  const aqi = document.getElementById('air-quality').value;
  const household = document.getElementById('household').value;
  const commute = document.getElementById('commute').value;
  const distance = Number(document.getElementById('distance').value);
  const days = Number(document.getElementById('days').value);
  const level = AQI_LEVELS[aqi] || AQI_LEVELS.unhealthy;
  const impact = getImpact(commute, distance, days);

  document.getElementById('plan-location').textContent = ` · ${location}`;
  document.getElementById('aqi-chip').textContent = `● ${level.label} air`;
  document.getElementById('aqi-chip').className = `aqi-chip ${aqi === 'good' ? 'good' : aqi === 'moderate' ? 'moderate' : 'high'}`;
  document.getElementById('plan-intro').textContent = `${level.advice} Here are a few manageable ideas for your household in ${location}.`;
  createList('routine-list', getRoutine(aqi, commute, household));
  createList('home-list', getHomeAdvice(aqi));
  createList('swap-list', [COMMUTE_SWAPS[commute] || COMMUTE_SWAPS.car, 'Let neighbors know when you spot a cleaner-air walking route, transit option, or shared errand.']);
  document.getElementById('impact-title').textContent = impact.title;
  document.getElementById('impact-description').textContent = impact.description;
  document.getElementById('impact-value').textContent = impact.value;
  document.getElementById('impact-unit').textContent = impact.unit;

  const plan = document.getElementById('plan');
  plan.hidden = false;
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  plan.scrollIntoView({ behavior, block: 'start' });
}

document.getElementById('planner-form').addEventListener('submit', buildPlan);
