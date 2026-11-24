import type { ActionCategory, BudgetTier, UserProfile } from "./types";

export interface CatalogueAction {
  id: string;
  category: ActionCategory;
  title: string;
  titleHi: string;
  defaultHeadline: string;
  defaultHeadlineHi: string;
  defaultHowToDoIt: string;
  defaultHowToDoItHi: string;
  defaultWhyItWorks: string;
  defaultWhyItWorksHi: string;
  effort: "2 min" | "10 min" | "Daily habit" | "One-time setup";
  costTier: BudgetTier;
  costLabel: string;
  costLabelHi: string;
  /** Which profile signals raise priority for rule-based selection */
  priorityBoost: (profile: UserProfile, cpcbAqi: number) => number;
}

export const ACTION_CATALOGUE: CatalogueAction[] = [
  // 1. LOW-EMISSION ROUTINES
  {
    id: "cleanest_hour_errands",
    category: "routines",
    title: "Shift errands & walks to the cleanest window",
    titleHi: "बाहरी काम और टहलना सबसे साफ समय पर करें",
    defaultHeadline: "Time outdoor trips for the midday dispersion dip",
    defaultHeadlineHi: "दोपहर के साफ समय में बाहर निकलें",
    defaultHowToDoIt:
      "Batch grocery runs, pharmacy stops, and short walks into today's highlighted cleanest afternoon window instead of early morning or late evening.",
    defaultHowToDoItHi:
      "सुबह-शाम के बजाय आज के सबसे साफ दोपहर के समय में बाज़ार और टहलने के काम निपटाएँ।",
    defaultWhyItWorks:
      "Sunlight warms the ground and lifts winter temperature inversions, diluting trapped PM2.5 near street level.",
    defaultWhyItWorksHi:
      "दोपहर की धूप से ज़मीन गर्म होती है और कोहरे-धुएँ की परत ऊपर उठकर हवा हल्की हो जाती है।",
    effort: "Daily habit",
    costTier: "free",
    costLabel: "Free",
    costLabelHi: "निःशुल्क",
    priorityBoost: (_p, aqi) => (aqi >= 100 ? 30 : 15),
  },
  {
    id: "n95_commute_seal",
    category: "routines",
    title: "Wear a snug N95 / FFP2 mask outdoors",
    titleHi: "बाहर निकलते समय फिट N95 / FFP2 मास्क पहनें",
    defaultHeadline: "Block fine PM2.5 particles with a sealed N95 mask",
    defaultHeadlineHi: "महीन PM2.5 कणों को रोकने के लिए N95 मास्क पहनें",
    defaultHowToDoIt:
      "Pinch the nose bridge so air does not leak around your cheeks. Replace the mask once straps loosen or breathing feels harder (avoid cloth or loose surgical masks).",
    defaultHowToDoItHi:
      "नाक की क्लिप ठीक से दबाएँ ताकि किनारे से हवा न घुसे। कपड़े या ढीले सर्जिकल मास्क के बजाय N95/FFP2 पहनें।",
    defaultWhyItWorks:
      "Electrostatic melt-blown fibres in N95/FFP2 respirators trap 95%+ of 0.3–2.5 µm soot particles that pass straight through woven cloth.",
    defaultWhyItWorksHi:
      "N95 की इलेक्ट्रोस्टैटिक परत 95% से अधिक महीन कालिख के कण रोकती है जो कपड़े के मास्क से पार हो जाते हैं।",
    effort: "2 min",
    costTier: "low",
    costLabel: "₹60–120/mask",
    costLabelHi: "₹60–120/मास्क",
    priorityBoost: (p, aqi) =>
      (aqi >= 180 ? 40 : 10) +
      (p.household.asthmaOrRespiratory || p.household.elderly > 0 ? 20 : 0) +
      (p.lifestyle.commute === "walk" ||
      p.lifestyle.commute === "cycle" ||
      p.lifestyle.commute === "two_wheeler"
        ? 25
        : 0),
  },
  {
    id: "avoid_morning_inversion",
    category: "routines",
    title: "Swap early-morning exercise indoors",
    titleHi: "सुबह की कसरत घर के अंदर करें",
    defaultHeadline: "Skip 6–8 AM outdoor workouts during winter smog",
    defaultHeadlineHi: "सर्दियों की धुंध में सुबह 6–8 बजे बाहर कसरत न करें",
    defaultHowToDoIt:
      "Do stretching, Surya Namaskar, or stationary cycling indoors before 10 AM. Deep breathing outdoors during smog pulls particles deeper into lungs.",
    defaultHowToDoItHi:
      "सुबह 10 बजे से पहले योग या हल्का व्यायाम घर के अंदर ही करें। भारी सांस लेने से धुएँ के कण फेफड़ों में गहराई तक जाते हैं।",
    defaultWhyItWorks:
      "Vigorous breathing increases minute ventilation 4–6× right when cool nocturnal air traps exhaust at breathing height.",
    defaultWhyItWorksHi:
      "कसरत के दौरान सांस लेने की गति 4–6 गुना बढ़ जाती है, और सुबह ठंडी हवा धुएँ को ज़मीन के पास रोकती है।",
    effort: "Daily habit",
    costTier: "free",
    costLabel: "Free",
    costLabelHi: "निःशुल्क",
    priorityBoost: (p, aqi) =>
      (aqi >= 150 ? 25 : 5) + (p.household.children > 0 || p.household.elderly > 0 ? 15 : 0),
  },
  {
    id: "kitchen_exhaust_lid",
    category: "routines",
    title: "Cover pots & run kitchen exhaust while cooking",
    titleHi: "खाना बनाते समय बर्तन ढकें और एग्ज़ॉस्ट चलाएँ",
    defaultHeadline: "Cut indoor cooking PM2.5 & NO2 spikes at the stove",
    defaultHeadlineHi: "चूल्हे पर बनने वाले धुएँ और NO2 को तुरंत कम करें",
    defaultHowToDoIt:
      "Turn on the chimney or exhaust fan 2 minutes before lighting the burner, keep lids on simmering pots, and crack a kitchen window briefly if no chimney is installed.",
    defaultHowToDoItHi:
      "चूल्हा जलाने से 2 मिनट पहले एग्ज़ॉस्ट/चिमनी चलाएँ और उबलते बर्तनों पर ढक्कन रखें।",
    defaultWhyItWorks:
      "High-heat tadka and gas combustion spike indoor PM2.5 above 250 µg/m³ in minutes unless vented at the source.",
    defaultWhyItWorksHi:
      "तेज़ आँच और तड़का कुछ ही मिनटों में घर के अंदर PM2.5 को 250 µg/m³ से पार पहुँचा सकता है।",
    effort: "2 min",
    costTier: "free",
    costLabel: "Free",
    costLabelHi: "निःशुल्क",
    priorityBoost: (p) => (p.lifestyle.cookingFuel === "lpg" || p.lifestyle.cookingFuel === "biomass" ? 28 : 10),
  },
  {
    id: "saline_hydrate_return",
    category: "routines",
    title: "Wash face, rinse eyes & hydrate after traffic",
    titleHi: "बाहर से आकर चेहरा धोएँ और पानी पिएँ",
    defaultHeadline: "Clear settled road dust and soothe airways after commuting",
    defaultHeadlineHi: "सफर के बाद जमी धूल साफ करें और गले को आराम दें",
    defaultHowToDoIt:
      "Rinse face and nostrils gently with clean water or isotonic saline spray after returning home, and drink warm water to keep airway mucus thin.",
    defaultHowToDoItHi:
      "घर लौटकर साफ पानी से चेहरा धोएँ, नाक साफ करें और गुनगुना पानी पिएँ।",
    defaultWhyItWorks:
      "Washing removes coarse PM10 irritants from skin and nasal passages, reducing overnight throat irritation.",
    defaultWhyItWorksHi:
      "इससे त्वचा और नाक में जमे धूल के बड़े कण हटते हैं और रात में गले की खराश कम होती है।",
    effort: "2 min",
    costTier: "free",
    costLabel: "Free",
    costLabelHi: "निःशुल्क",
    priorityBoost: (p) =>
      p.lifestyle.commute === "two_wheeler" || p.lifestyle.commute === "walk" ? 20 : 8,
  },

  // 2. INDOOR AIR HACKS (Free & low-cost first!)
  {
    id: "seal_window_drafts",
    category: "indoor",
    title: "Seal door & window gaps with damp towels or foam tape",
    titleHi: "दरवाज़ों और खिड़कियों की दरारें गीले तौलिये या टेप से बंद करें",
    defaultHeadline: "Cut outdoor smog leaking into bedrooms by ~33%",
    defaultHeadlineHi: "कमरे में घुसने वाले बाहरी धुएँ को लगभग 33% तक रोकें",
    defaultHowToDoIt:
      "Roll a damp towel along the bottom gap of the main door and press inexpensive EPDM foam weatherstrip tape along rattling window frames in the sleeping room.",
    defaultHowToDoItHi:
      "मुख्य दरवाज़े के नीचे गीला तौलिया लगाएँ और बेडरूम की ढीली खिड़कियों पर सस्ती फ़ोम सील टेप चिपकाएँ।",
    defaultWhyItWorks:
      "Closing 2–4 mm perimeter gaps slows pressure-driven infiltration of outdoor PM2.5 by roughly a third without spending on machines.",
    defaultWhyItWorksHi:
      "2–4 मिमी की दरारें बंद करने से बाहर की प्रदूषित हवा कमरे में कम गति से प्रवेश करती है।",
    effort: "10 min",
    costTier: "free",
    costLabel: "Free / ₹150 tape",
    costLabelHi: "निःशुल्क / ₹150 टेप",
    priorityBoost: (p, aqi) => (p.lifestyle.leakyWindows ? 38 : 12) + (aqi >= 200 ? 20 : 0),
  },
  {
    id: "wet_mop_no_sweep",
    category: "indoor",
    title: "Wet-mop floors instead of dry sweeping",
    titleHi: "सूखी झाड़ू के बजाय गीला पोंछा लगाएँ",
    defaultHeadline: "Stop settled dust from kicking back into breathing air",
    defaultHeadlineHi: "ज़मीन पर बैठी धूल को दोबारा हवा में उड़ने से रोकें",
    defaultHowToDoIt:
      "Use a damp microfiber mop or wet cloth (pocha) on floors and window sills, especially before children play or before bedtime.",
    defaultHowToDoItHi:
      "फ़र्श और खिड़कियों पर सूखी झाड़ू की जगह गीले कपड़े या मॉप से पोंछा लगाएँ।",
    defaultWhyItWorks:
      "Dry brooms fling settled PM10 and fine particles back to waist height for hours; moisture binds dust straight into the cloth.",
    defaultWhyItWorksHi:
      "सूखी झाड़ू धूल को घंटों हवा में उड़ाती है, जबकि नमी कणों को कपड़े में बाँध लेती है।",
    effort: "10 min",
    costTier: "free",
    costLabel: "Free",
    costLabelHi: "निःशुल्क",
    priorityBoost: (p) => (p.household.children > 0 ? 28 : 16),
  },
  {
    id: "cleanest_hour_ventilation",
    category: "indoor",
    title: "Ventilate for 20 min only at the cleanest afternoon hour",
    titleHi: "सिर्फ दोपहर के सबसे साफ समय में 20 मिनट खिड़कियाँ खोलें",
    defaultHeadline: "Flush stale indoor CO2 without letting peak smog inside",
    defaultHeadlineHi: "तेज़ धुएँ से बचते हुए घर की घुटन और CO2 बाहर निकालें",
    defaultHowToDoIt:
      "Keep windows shut during morning and night peaks. Open opposite windows for 15–20 minutes during today's cleanest afternoon window, then close them again.",
    defaultHowToDoItHi:
      "सुबह-रात खिड़कियाँ बंद रखें। दोपहर के सबसे साफ समय में 15–20 मिनट आमने-सामने की खिड़कियाँ खोलकर फिर बंद कर दें।",
    defaultWhyItWorks:
      "Sealed rooms build up CO2 and cooking fumes; timed cross-ventilation exchanges air when outdoor PM2.5 is at its daily low.",
    defaultWhyItWorksHi:
      "बंद कमरों में CO2 बढ़ती है; दोपहर के साफ समय में हवा बदलने से बाहर का कम से कम धुआँ अंदर आता है।",
    effort: "2 min",
    costTier: "free",
    costLabel: "Free",
    costLabelHi: "निःशुल्क",
    priorityBoost: (_p, aqi) => (aqi >= 120 ? 25 : 15),
  },
  {
    id: "diy_box_fan_filter",
    category: "indoor",
    title: "Build a DIY Box-Fan + MERV-13 / HEPA filter cube",
    titleHi: "बॉक्स-फ़ैन और MERV-13/HEPA फ़िल्टर से किफ़ायती प्यूरीफायर बनाएँ",
    defaultHeadline: "Purify a bedroom at 1/4th the cost of a commercial machine",
    defaultHeadlineHi: "कम कीमत में कमरे की हवा साफ करने का असरदार जुगाड़",
    defaultHowToDoIt:
      "Tape a MERV-13 furnace filter or replacement HEPA cartridge tightly onto the intake side of a standard table/box fan (arrows pointing toward fan) and run on medium-high in one closed room.",
    defaultHowToDoItHi:
      "साधारण टेबल/बॉक्स फ़ैन के पीछे MERV-13 या HEPA फ़िल्टर टेप से सील करें (तीर पंखे की ओर) और बंद कमरे में चलाएँ।",
    defaultWhyItWorks:
      "Independent lab tests show a single fan + MERV-13 filter delivers ~220–260 m³/h CADR, cutting bedroom PM2.5 by more than half in ~40 minutes.",
    defaultWhyItWorksHi:
      "लैब परीक्षणों में फ़ैन + MERV-13 फ़िल्टर ~40 मिनट में बंद कमरे का PM2.5 आधे से ज़्यादा घटा देता है।",
    effort: "One-time setup",
    costTier: "low",
    costLabel: "₹1,200–1,800",
    costLabelHi: "₹1,200–1,800",
    priorityBoost: (p, aqi) => (!p.lifestyle.hasPurifier && aqi >= 150 ? 45 : 5),
  },
  {
    id: "hepa_purifier_high",
    category: "indoor",
    title: "Keep bedroom doors shut & run HEPA purifier on High for 45 min",
    titleHi: "बेडरूम का दरवाज़ा बंद रखकर HEPA प्यूरीफायर तेज़ चलाएँ",
    defaultHeadline: "Create one clean-air sanctuary room for sleeping",
    defaultHeadlineHi: "सोने के लिए एक साफ हवा वाला कमरा तैयार करें",
    defaultHowToDoIt:
      "Close bedroom doors so the purifier only treats 1 room instead of the whole house. Run on High 45 minutes before bedtime, then switch to Quiet/Sleep mode overnight.",
    defaultHowToDoItHi:
      "पूरे घर के बजाय एक बेडरूम का दरवाज़ा बंद कर सोने से 45 मिनट पहले High मोड पर चलाएँ, फिर रात में Sleep मोड रखें।",
    defaultWhyItWorks:
      "Air purifiers work by air changes per hour (ACH): shrinking room volume doubles cleaning speed and prevents outdoor leaks from overwhelming the filter.",
    defaultWhyItWorksHi:
      "कमरे का आयतन सीमित रखने से प्यूरीफायर की रफ़्तार दोगुनी हो जाती है और साफ हवा बनी रहती है।",
    effort: "2 min",
    costTier: "free",
    costLabel: "Uses existing unit",
    costLabelHi: "मौजूदा मशीन से",
    priorityBoost: (p, aqi) => (p.lifestyle.hasPurifier ? 45 : -20) + (aqi >= 200 ? 15 : 0),
  },
  {
    id: "no_incense_agarbatti",
    category: "indoor",
    title: "Pause incense, agarbatti, dhoop & mosquito coils indoors",
    titleHi: "अंदर अगरबत्ती, धूप और मच्छर कॉइल जलाना रोकें",
    defaultHeadline: "Eliminate the #1 hidden indoor PM2.5 source",
    defaultHeadlineHi: "घर के अंदर के सबसे बड़े छिपे धुएँ के स्रोत को बंद करें",
    defaultHowToDoIt:
      "On Poor+ air days, switch to electric liquid vaporizers or essential-oil diffusers without combustion, and use unlit flowers instead of burning incense indoors.",
    defaultHowToDoItHi:
      "खराब हवा वाले दिनों में बिना धुएँ वाले इलेक्ट्रिक मॉस्किटो वेपोराइज़र और ताज़े फूलों का उपयोग करें।",
    defaultWhyItWorks:
      "One burning agarbatti stick or mosquito coil in a closed room can release as much PM2.5 as heavy traffic outside.",
    defaultWhyItWorksHi:
      "बंद कमरे में एक अगरबत्ती या मच्छर कॉइल बाहर के भारी ट्रैफ़िक जितना PM2.5 फैला सकती है।",
    effort: "Daily habit",
    costTier: "free",
    costLabel: "Free",
    costLabelHi: "निःशुल्क",
    priorityBoost: (p, aqi) =>
      (aqi >= 150 ? 22 : 10) + (p.household.asthmaOrRespiratory ? 18 : 0),
  },

  // 3. SUSTAINABLE SWAPS
  {
    id: "metro_over_car",
    category: "swaps",
    title: "Take the Metro or electric bus instead of driving",
    titleHi: "कार/स्कूटर की जगह मेट्रो या इलेक्ट्रिक बस चुनें",
    defaultHeadline: "Cut tailpipe emissions and lower your roadside exposure",
    defaultHeadlineHi: "सड़क का प्रदूषण घटाएँ और अपनी सांस को सुरक्षित रखें",
    defaultHowToDoIt:
      "Replace solo car or two-wheeler trips on dense corridors with Metro or AC electric bus, wearing an N95 mask on the last-mile walk.",
    defaultHowToDoItHi:
      "भीड़-भाड़ वाले रास्तों पर कार/टू-व्हीलर के बजाय मेट्रो या इलेक्ट्रिक बस लें और पैदल हिस्से में N95 पहनें।",
    defaultWhyItWorks:
      "Public transit cuts per-passenger CO2 by ~85% and moves you out of congested exhaust plumes on two-wheelers.",
    defaultWhyItWorksHi:
      "मेट्रो या बस प्रति यात्री CO2 करीब 85% घटाती है और आप सीधे एग्ज़ॉस्ट धुएँ से बचते हैं।",
    effort: "Daily habit",
    costTier: "low",
    costLabel: "Saves fuel ₹",
    costLabelHi: "ईंधन की बचत",
    priorityBoost: (p) =>
      p.lifestyle.commute === "car" || p.lifestyle.commute === "two_wheeler" ? 42 : 8,
  },
  {
    id: "induction_over_gas_biomass",
    category: "swaps",
    title: "Use induction or electric kettle for boiling & tea",
    titleHi: "चाय और उबालने के लिए इंडक्शन या इलेक्ट्रिक केतली का उपयोग करें",
    defaultHeadline: "Replace open-flame combustion for everyday boiling",
    defaultHeadlineHi: "रोज़मर्रा के उबालने वाले काम बिना लौ और धुएँ के करें",
    defaultHowToDoIt:
      "Shift tea, milk, dal pressure-cooking, or water boiling from LPG/biomass stoves to an electric kettle or single-burner induction plate.",
    defaultHowToDoItHi:
      "चाय, दूध, पानी उबालने और कुकर के लिए गैस या चूल्हे की जगह इलेक्ट्रिक केतली या इंडक्शन अपनाएँ।",
    defaultWhyItWorks:
      "Induction heats the pan directly with zero indoor NO2, CO, or soot particles—especially protective in poorly ventilated kitchens.",
    defaultWhyItWorksHi:
      "इंडक्शन बिना किसी लौ के काम करता है, जिससे रसोई में NO2 और धुआँ बिल्कुल नहीं बनता।",
    effort: "Daily habit",
    costTier: "low",
    costLabel: "Low / ₹1,800 plate",
    costLabelHi: "कम खर्च / ₹1,800",
    priorityBoost: (p) =>
      p.lifestyle.cookingFuel === "biomass"
        ? 48
        : p.lifestyle.cookingFuel === "lpg"
        ? 24
        : -10,
  },
  {
    id: "carpool_school_office",
    category: "swaps",
    title: "Coordinate a 2-family school or office carpool",
    titleHi: "पड़ोसियों के साथ स्कूल या ऑफिस कारपूल शुरू करें",
    defaultHeadline: "Halve morning gate-side idling & commute emissions",
    defaultHeadlineHi: "सुबह स्कूल गेट के पास धुआँ और ईंधन खर्च आधा करें",
    defaultHowToDoIt:
      "Pair with one neighbouring family on the same school or metro feeder route to alternate drop-offs 3–5 days a week.",
    defaultHowToDoItHi:
      "एक ही स्कूल या मेट्रो रूट वाले पड़ोसी परिवार के साथ बारी-बारी पिक-ड्रॉप तय करें।",
    defaultWhyItWorks:
      "School drop-off zones create intense localized PM2.5 and NO2 pockets; halving cars immediately improves air right where kids breathe.",
    defaultWhyItWorksHi:
      "स्कूल गेट के बाहर गाड़ियों की भीड़ बच्चों की ऊँचाई पर धुआँ बढ़ाती है; कारपूल इसे तुरंत कम करता है।",
    effort: "10 min",
    costTier: "free",
    costLabel: "Saves 50% fuel",
    costLabelHi: "50% ईंधन बचत",
    priorityBoost: (p) =>
      p.household.children > 0 || p.lifestyle.commute === "car" ? 32 : 12,
  },
  {
    id: "anti_idling_no_burn",
    category: "swaps",
    title: "Switch off engine at 30+ sec signals & never burn dry leaves",
    titleHi: "30 सेकंड से अधिक लाल बत्ती पर इंजन बंद करें और सूखे पत्ते न जलाएँ",
    defaultHeadline: "Stop neighborhood smog hotspots before they start",
    defaultHeadlineHi: "मोहल्ले में स्थानीय धुएँ के हॉटस्पॉट रोकें",
    defaultHowToDoIt:
      "Turn off ignition at traffic signals longer than 30 seconds and ask your RWA/gardener to compost fallen winter leaves instead of burning morning piles.",
    defaultHowToDoItHi:
      "30 सेकंड से लंबी बत्ती पर इंजन बंद रखें और RWA या माली से सूखे पत्ते जलाने के बजाय खाद बनाने को कहें।",
    defaultWhyItWorks:
      "A single smoldering leaf pile releases dense carcinogenic PAHs and PM2.5 equivalent to dozens of idling vehicles.",
    defaultWhyItWorksHi:
      "सूखे पत्तों का एक सुलगता ढेर दर्जनों खड़ी गाड़ियों के बराबर जहरीला धुआँ छोड़ता है।",
    effort: "Daily habit",
    costTier: "free",
    costLabel: "Free",
    costLabelHi: "निःशुल्क",
    priorityBoost: () => 18,
  },
];

export const CATALOGUE_BY_ID: Record<string, CatalogueAction> = Object.fromEntries(
  ACTION_CATALOGUE.map((item) => [item.id, item])
);
