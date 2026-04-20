// ====== CHATBOT — ENHANCED V3 ======
const chatToggle = document.getElementById('chatToggle');
const chatWindow = document.getElementById('chatWindow');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSuggestions = document.getElementById('chatSuggestions');
let conversationHistory = [];

// ====== CONVERSATION CONTEXT MEMORY ======
// Tracks recently discussed places so follow-up questions work
let lastMentionedPlaces = [];
let lastIntent = null;

function updateContext(mentionedPlaces, intents) {
  if (mentionedPlaces.length > 0) {
    lastMentionedPlaces = mentionedPlaces;
  }
  if (intents.length > 0) {
    lastIntent = intents[0];
  }
}

// ====== RESIZE DRAG ======
(function initResize() {
  const handle = document.getElementById('chatResizeHandle');
  if (!handle) return;
  let startX, startY, startW, startH;

  handle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
    startW = chatWindow.offsetWidth;
    startH = chatWindow.offsetHeight;
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
  });

  handle.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    startW = chatWindow.offsetWidth;
    startH = chatWindow.offsetHeight;
    document.addEventListener('touchmove', onDragTouch);
    document.addEventListener('touchend', stopDrag);
  });

  function onDrag(e) {
    // Since chat is RTL positioned from left, dragging right-top corner
    const dw = e.clientX - startX;
    const dh = startY - e.clientY;
    chatWindow.style.width = Math.max(320, Math.min(700, startW + dw)) + 'px';
    chatWindow.style.height = Math.max(400, Math.min(window.innerHeight * 0.85, startH + dh)) + 'px';
  }

  function onDragTouch(e) {
    const t = e.touches[0];
    const dw = t.clientX - startX;
    const dh = startY - t.clientY;
    chatWindow.style.width = Math.max(320, Math.min(700, startW + dw)) + 'px';
    chatWindow.style.height = Math.max(400, Math.min(window.innerHeight * 0.85, startH + dh)) + 'px';
  }

  function stopDrag() {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', onDragTouch);
    document.removeEventListener('touchend', stopDrag);
  }
})();

// ====== CHAT UI ======
chatToggle.addEventListener('click', () => {
  chatToggle.classList.toggle('open');
  chatWindow.classList.toggle('open');
  if (chatWindow.classList.contains('open')) chatInput.focus();
});

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); }
});

function sendChip(text) {
  chatInput.value = text;
  handleChat();
  if (chatSuggestions) chatSuggestions.style.display = 'none';
}

function addMessage(text, type) {
  const msg = document.createElement('div');
  msg.className = `chat-msg ${type}`;
  msg.innerHTML = text;
  if (type === 'bot') {
    const badge = document.createElement('div');
    badge.className = 'ai-badge';
    badge.textContent = 'مدعوم بالذكاء الاصطناعي';
    msg.appendChild(badge);
  }
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return msg;
}

function showTyping() {
  const typing = document.createElement('div');
  typing.className = 'typing-indicator';
  typing.id = 'typingIndicator';
  typing.innerHTML = '<span></span><span></span><span></span>';
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTyping() {
  const t = document.getElementById('typingIndicator');
  if (t) t.remove();
}

// ====== FUZZY MATCHING ======
function fuzzyMatch(input, target) {
  // Remove ال and normalize
  const normalize = s => s.replace(/^ال/, '').replace(/[ًٌٍَُِّْ]/g, '').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();
  const a = normalize(input);
  const b = normalize(target);
  if (b.includes(a) || a.includes(b)) return true;
  // Check if 70%+ chars match
  if (a.length < 3) return false;
  let matches = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) matches++;
  }
  return matches / Math.max(a.length, b.length) > 0.6;
}

function findPlaceByName(input) {
  const lower = input;
  // Direct match
  let found = places.filter(p => lower.includes(p.name));
  if (found.length > 0) return found;

  // Fuzzy match on place name
  const words = lower.split(/\s+/);
  found = places.filter(p => words.some(w => w.length >= 3 && fuzzyMatch(w, p.name)));
  if (found.length > 0) return found;

  // Match by region name
  found = places.filter(p => {
    const regionClean = p.region.replace('ال', '');
    return words.some(w => w.length >= 3 && fuzzyMatch(w, regionClean));
  });
  return found;
}

// ====== INTENT DETECTION V2 ======
const keywordMap = {
  sea: ['بحر', 'شاطئ', 'شواطئ', 'سباحة', 'غوص', 'مويه', 'ماء', 'بحري', 'ساحل', 'مالديف', 'جزير', 'جزر', 'مرجان', 'سنوركل', 'أملج', 'فرسان'],
  mountain: ['جبل', 'جبال', 'قمة', 'مرتفع', 'سودة', 'لوز', 'ضباب', 'هايك', 'تسلق', 'مرتفعات', 'قارة'],
  nature: ['طبيعة', 'طبيعي', 'أخضر', 'خضراء', 'غابة', 'غابات', 'وادي', 'أودية', 'شجر', 'أشجار', 'نبات', 'زهر', 'حديقة', 'منتزه', 'جاكرندا', 'رغدان', 'حنيفة'],
  heritage: ['تاريخ', 'تاريخي', 'تراث', 'آثار', 'أثري', 'قرية', 'قديم', 'يونسكو', 'نبطي', 'حضار', 'علا', 'العلا', 'عُلا', 'ذي عين'],
  desert: ['صحراء', 'صحراوي', 'رمل', 'رمال', 'مغامر', 'حافة', 'نجوم', 'تخييم', 'كشتة', 'طويق', 'حافه'],
  family: ['عائلة', 'عائلي', 'أطفال', 'عيال', 'أهل', 'عوائل', 'أسرة', 'بنات', 'اولاد'],
  cold: ['برد', 'بارد', 'ثلج', 'ثلوج', 'شتاء', 'شتوي', 'شتا'],
  hot: ['حر', 'صيف', 'صيفي', 'دافي', 'دافئ'],
  photo: ['تصوير', 'صور', 'مصور', 'كاميرا', 'انستقرام', 'لقطة', 'مناظر', 'بانورام'],
  cave: ['كهف', 'كهوف', 'مغارة', 'غار'],
  oasis: ['واحة', 'نخل', 'نخيل', 'عين', 'أحساء', 'الاحساء'],
  eco: ['بيئة', 'بيئي', 'استدامة', 'مستدام', 'حماية', 'محمية', 'حيوان', 'طيور', 'نبات', 'كربون', 'بصمة', 'أخضر'],
  budget: ['ميزانية', 'رخيص', 'اقتصاد', 'توفير', 'مجان', 'ببلاش', 'قليل'],
  romantic: ['رومانس', 'شريك', 'زوج', 'زوجة', 'شهر عسل', 'حبيب'],
};

function detectIntent(input) {
  const lower = input;
  const intents = [];

  for (const [key, words] of Object.entries(keywordMap)) {
    if (words.some(w => lower.includes(w))) intents.push(key);
  }

  if (lower.match(/رحل|خطط|جدول|برنامج|أيام|يوم|ويكند|اجازة|إجاز/)) intents.push('trip');
  if (lower.match(/أفضل|أحسن|أحلى|الفرق|مقارن|ولا\s|أو\s|بين/)) intents.push('compare');
  if (lower.match(/وقت|متى|موسم|شهر|زيار|فصل/)) intents.push('timing');
  if (lower.match(/نصيح|نصائح|تجهيز|أخذ|أحتاج|ألبس/)) intents.push('tips');
  if (lower.match(/قريب|حول|جنب|بالقرب/)) intents.push('nearby');
  if (lower.match(/كم\s|مسافة|بعيد|يبعد|كيلو|ساعة|ساعات|طريق/)) intents.push('distance');
  if (lower.match(/فندق|فنادق|سكن|مبيت|نوم|إقامة|حجز/)) intents.push('accommodation');

  const mentionedPlaces = findPlaceByName(lower);
  if (mentionedPlaces.length > 0) intents.push('specific');

  return { intents, mentionedPlaces };
}

function matchPlaces(intents) {
  return places.filter(p => {
    if (intents.includes('sea') && ['شواطئ', 'ساحلي', 'محمية بحرية'].includes(p.tag)) return true;
    if (intents.includes('mountain') && (p.desc.includes('جبل') || p.desc.includes('قمة') || p.tag === 'أعلى قمة' || p.tag === 'ثلوج' || p.tag === 'كهوف')) return true;
    if (intents.includes('nature') && ['غابات', 'وادي', 'بيئي', 'ربيعي'].includes(p.tag)) return true;
    if (intents.includes('heritage') && ['تراث', 'تراث عالمي', 'اليونسكو'].includes(p.tag)) return true;
    if (intents.includes('desert') && ['مغامرة', 'محمية ملكية'].includes(p.tag)) return true;
    if (intents.includes('cold') && (p.tag === 'ثلوج' || p.tag === 'أعلى قمة')) return true;
    if (intents.includes('cave') && p.tag === 'كهوف') return true;
    if (intents.includes('oasis') && p.name.includes('الأحساء')) return true;
    if (intents.includes('photo') && ['تراث عالمي', 'ربيعي', 'أعلى قمة', 'مغامرة'].includes(p.tag)) return true;
    if (intents.includes('eco') && ['بيئي', 'محمية ملكية', 'محمية بحرية', 'اليونسكو'].includes(p.tag)) return true;
    if (intents.includes('romantic') && ['شواطئ', 'ربيعي', 'تراث عالمي'].includes(p.tag)) return true;
    return false;
  });
}

// ====== RICH REPLY BUILDER ======
function buildPlaceCard(p) {
  return `<div class="chat-place-card" onclick="scrollToPlace('${p.name}')">
    <h5>${p.name} — ${p.region}</h5>
    <p>${p.desc}</p>
    <div class="chat-card-meta">📅 ${p.season} &nbsp;|&nbsp; 🌡 ${p.temp}</div>
  </div>`;
}

function buildDynamicChips(context) {
  const chipSets = {
    sea: ['🤿 أبغى أعرف عن الغوص', '🏝️ وش أحلى جزيرة؟', '📅 أفضل وقت للشواطئ'],
    mountain: ['❄️ وين فيه ثلوج؟', '🥾 أماكن هايكنق', '🌤️ الجو في الجبال'],
    nature: ['🌸 متى تزهر الجاكرندا؟', '🏕️ أماكن تخييم', '📸 أماكن تصوير'],
    heritage: ['🗿 معلومات عن العُلا', '🏘️ قرى تراثية', '📅 أفضل وقت للزيارة'],
    trip: ['📋 رحلة ٣ أيام جنوب', '🗺️ رحلة أسبوع متنوعة', '🌊 رحلة شواطئ'],
    eco: ['🌳 المحميات الطبيعية', '♻️ نصائح الاستدامة', '🦅 الحياة البرية'],
    default: ['🌊 شواطئ', '⛰️ جبال', '🏜️ صحراء', '🌿 طبيعة'],
  };
  const key = context || 'default';
  const chips = chipSets[key] || chipSets.default;
  return `<div class="chat-chips-inline">${chips.map(c => {
    const text = c.replace(/^[^\s]+\s/, '');
    return `<button class="chip-inline" onclick="sendChip('${text}')">${c}</button>`;
  }).join('')}</div>`;
}

function buildTripPlan(regionFilter, days) {
  let pool = places;
  if (regionFilter !== 'all') {
    pool = places.filter(p => p.regionGroup === regionFilter);
  }
  if (pool.length < 2) pool = places;

  // Pick diverse places (different tags)
  const usedTags = new Set();
  const selected = [];
  for (const p of pool) {
    if (selected.length >= days) break;
    if (!usedTags.has(p.tag)) {
      selected.push(p);
      usedTags.add(p.tag);
    }
  }
  // Fill remaining
  for (const p of pool) {
    if (selected.length >= days) break;
    if (!selected.includes(p)) selected.push(p);
  }

  let plan = `<div class="chat-trip-plan"><div class="trip-header">🗺️ مقترح رحلة — ${days} أيام</div>`;
  selected.slice(0, days).forEach((p, i) => {
    const activities = {
      'أعلى قمة': 'هايكنق وتصوير الضباب',
      'غابات': 'مشي في الغابة وبكنك',
      'ربيعي': 'تصوير الأزهار وتنزه',
      'محمية بحرية': 'سنوركل ومشاهدة الطيور',
      'وادي': 'استكشاف الوادي والسباحة',
      'تراث': 'جولة تاريخية وتصوير',
      'تراث عالمي': 'جولة آثار وتصوير ليلي',
      'شواطئ': 'سباحة وغوص وغروب',
      'ساحلي': 'مشي على الكورنيش',
      'مغامرة': 'هايكنق وتخييم',
      'بيئي': 'مشي ومراقبة الطيور',
      'اليونسكو': 'جولة في الواحة',
      'كهوف': 'استكشاف الكهوف',
      'محمية ملكية': 'سفاري ومراقبة حيوانات',
      'ثلوج': 'تصوير الثلوج وهايكنق',
    };
    plan += `<div class="trip-day">
      <span class="trip-day-num">يوم ${i + 1}</span>
      <div class="trip-day-content">
        <strong>${p.name}</strong> — ${p.region}<br>
        <span class="trip-day-desc">📌 ${activities[p.tag] || 'استكشاف وتصوير'} &nbsp; 🌡 ${p.temp}</span>
      </div>
    </div>`;
  });
  plan += '</div>';
  return plan;
}

function buildComparison(p1, p2) {
  return `<div class="chat-comparison">
    <div class="comp-header">⚖️ مقارنة</div>
    <div class="comp-row"><div class="comp-cell"><strong>${p1.name}</strong></div><div class="comp-vs">VS</div><div class="comp-cell"><strong>${p2.name}</strong></div></div>
    <div class="comp-row"><div class="comp-cell">${p1.region}</div><div class="comp-label">المنطقة</div><div class="comp-cell">${p2.region}</div></div>
    <div class="comp-row"><div class="comp-cell">${p1.season}</div><div class="comp-label">أفضل وقت</div><div class="comp-cell">${p2.season}</div></div>
    <div class="comp-row"><div class="comp-cell">${p1.temp}</div><div class="comp-label">الحرارة</div><div class="comp-cell">${p2.temp}</div></div>
    <div class="comp-row"><div class="comp-cell">${p1.tag}</div><div class="comp-label">التصنيف</div><div class="comp-cell">${p2.tag}</div></div>
  </div>`;
}

// ====== SUSTAINABILITY TIPS ======
const ecoTips = [
  '🚯 لا تترك أثر — احمل كيس نفايات معك وخلّ المكان أنظف مما لقيته.',
  '💧 استخدم قارورة ماء قابلة لإعادة الاستخدام بدل البلاستيك.',
  '🚶 امشِ بدل السيارة في المحميات — أحسن للبيئة وتستمتع أكثر.',
  '📷 صوّر بس! لا تقطف أزهار ولا تاخذ حجارة من الطبيعة.',
  '🏕️ خيّم في الأماكن المخصصة وتجنب إشعال النار إلا بالمناطق المسموحة.',
  '🐾 لا تزعج الحيوانات البرية — راقبها من بعيد واستمتع.',
];

// ====== SMART FALLBACK V3 ======
function getSmartFallback(input) {
  let { intents, mentionedPlaces } = detectIntent(input);
  const randomTip = ecoTips[Math.floor(Math.random() * ecoTips.length)];

  // === CONTEXT: If no place mentioned, use last discussed place ===
  const isFollowUp = mentionedPlaces.length === 0 && lastMentionedPlaces.length > 0;
  const hasQuestionIntent = intents.some(i => ['timing', 'tips', 'distance', 'accommodation', 'nearby'].includes(i));

  if (isFollowUp && hasQuestionIntent) {
    mentionedPlaces = lastMentionedPlaces;
    intents.push('specific');
  }

  // === INCOMPLETE QUESTION DETECTION ===
  // Short vague questions like "كم ساعة", "كم يبعد", "متى", "وش الجو"
  const isVagueQuestion = input.length < 20 && !intents.includes('specific');

  if (isVagueQuestion) {
    // Try to match from context
    if (lastMentionedPlaces.length > 0) {
      mentionedPlaces = lastMentionedPlaces;
      intents.push('specific');
      // Detect what they're asking about
      if (input.match(/ساع|بعد|بعيد|مساف|كم|كيلو|طريق/)) intents.push('distance');
      else if (input.match(/وقت|متى|زيار|موسم/)) intents.push('timing');
      else if (input.match(/جو|حرار|طقس|درج/)) intents.push('weather');
      else if (input.match(/نصيح|آخذ|ألبس|تجهيز|أحتاج/)) intents.push('tips');
      else if (input.match(/فندق|سكن|أنام|حجز/)) intents.push('accommodation');
      else if (input.match(/نشاط|أسوي|فيه/)) intents.push('activities');
    } else if (input.match(/ساع|بعد|بعيد|مساف|كم\b/)) {
      // No context — ask which place
      return `وين بالضبط تبغى تعرف المسافة؟ 🤔<br>قولي اسم المكان وأعطيك التفاصيل!<br><br>مثال: "كم ساعة العُلا من الرياض"${buildDynamicChips('default')}`;
    } else if (input.match(/وقت|متى/)) {
      return `أي وجهة تبغى تعرف أفضل وقت لزيارتها؟ 📅<br>قولي اسم المكان!${buildDynamicChips('default')}`;
    } else if (input.match(/جو|حرار|طقس/)) {
      return `أي مكان تبغى تعرف جوّه؟ 🌡<br>اذكر اسم الوجهة وأعطيك الحرارة والموسم.${buildDynamicChips('default')}`;
    }
  }

  // Update context for future follow-ups
  updateContext(mentionedPlaces, intents);

  // === Specific place ===
  if (intents.includes('specific') && mentionedPlaces.length > 0) {

    // Comparison between two places
    if (mentionedPlaces.length >= 2) {
      let reply = `يالله نقارن بينهم! 💪${buildComparison(mentionedPlaces[0], mentionedPlaces[1])}`;
      reply += `<br><small>💡 ${randomTip}</small>`;
      reply += buildDynamicChips('default');
      return reply;
    }

    const p = mentionedPlaces[0];

    // Timing question
    if (intents.includes('timing')) {
      return `أفضل وقت لزيارة <b>${p.name}</b> هو <b>${p.season}</b> 📅<br>الحرارة تكون حوالي <b>${p.temp}</b> 🌡<br><br>${p.desc}${buildPlaceCard(p)}<br><small>💡 ${randomTip}</small>${buildDynamicChips('default')}`;
    }

    // Weather question
    if (intents.includes('weather')) {
      return `الأجواء في <b>${p.name}</b> 🌤️:<br>🌡 الحرارة: <b>${p.temp}</b><br>📅 أفضل موسم: <b>${p.season}</b><br>📍 المنطقة: ${p.region}${buildPlaceCard(p)}${buildDynamicChips('default')}`;
    }

    // Activities question
    if (intents.includes('activities')) {
      const actMap = {
        'أعلى قمة': 'هايكنق، تصوير الضباب، مشي في الغابات العرعرية، تخييم',
        'غابات': 'مشي في الطبيعة، بكنك عائلي، تصوير المناظر',
        'ربيعي': 'تصوير الأزهار البنفسجية، تنزه، زيارة المقاهي المحلية',
        'محمية بحرية': 'سنوركل، مشاهدة الطيور النادرة، رحلة بحرية',
        'وادي': 'سباحة في المياه الجارية، تسلق خفيف، تصوير',
        'تراث': 'جولة تاريخية، تصوير المباني الأثرية، زيارة المزارع',
        'تراث عالمي': 'جولة في المقابر النبطية، تصوير ليلي، عروض ثقافية',
        'شواطئ': 'سباحة، غوص، سنوركل، مشاهدة الغروب',
        'ساحلي': 'مشي على الكورنيش، زيارة المتاحف، فنون تركيبية',
        'مغامرة': 'هايكنق، تصوير المنحدرات، تخييم تحت النجوم',
        'بيئي': 'مشي، مراقبة الطيور، ركوب دراجات',
        'اليونسكو': 'جولة في الواحة، زيارة الأسواق التراثية',
        'كهوف': 'استكشاف الكهوف الباردة، تصوير التكوينات الصخرية',
        'محمية ملكية': 'سفاري، مراقبة الحيوانات البرية، تصوير',
        'ثلوج': 'تصوير الثلوج، هايكنق، استمتاع بالأجواء الباردة',
      };
      const acts = actMap[p.tag] || 'استكشاف، تصوير، تنزه';
      return `الأنشطة في <b>${p.name}</b> 🎯:<br><br>${acts.split('، ').map(a => '• ' + a).join('<br>')}<br><br>📅 أفضل وقت: <b>${p.season}</b><br>🌡 الحرارة: <b>${p.temp}</b>${buildPlaceCard(p)}${buildDynamicChips('default')}`;
    }

    // Tips question
    if (intents.includes('tips')) {
      const tipsByTag = {
        'أعلى قمة': 'البس طبقات لأن الجو يتغير بسرعة، وخذ جاكيت حتى في الصيف. لا تنسى واقي شمس وماء كافي.',
        'غابات': 'البس حذاء مشي مريح وخذ طارد حشرات. الجو رطب فخذ ملابس خفيفة.',
        'شواطئ': 'خذ واقي شمس وقبعة. إذا تبغى سنوركل جهز المعدات مسبقاً.',
        'محمية بحرية': 'لا تلمس الشعاب المرجانية أبداً! استخدم واقي شمس صديق للبيئة.',
        'مغامرة': 'أخبر أحد عن موقعك، وخذ ماء كافي (٣ لتر على الأقل). البس حذاء هايكنق.',
        'تراث عالمي': 'البس حذاء مريح للمشي وخذ كاميرا. الأجواء الليلية ساحرة للتصوير.',
        'ثلوج': 'البس طبقات ثقيلة وجاكيت ضد الماء. السيارة تحتاج تشيك قبل الرحلة.',
        'ربيعي': 'خذ كاميرا! موسم الإزهار قصير فلا تفوّته. الأجواء معتدلة.',
        'وادي': 'البس حذاء ما يزلق والبس ملابس خفيفة. الماء بارد فاستعد.',
        'كهوف': 'الكهوف باردة من داخل حتى في الصيف — خذ جاكيت خفيف.',
      };
      const tips = tipsByTag[p.tag] || 'خذ ماء كافي وواقي شمس وحذاء مريح. وأهم شي: لا تترك أثر وراك!';
      return `نصائح لزيارة <b>${p.name}</b> 📝:<br><br>${tips}<br><br>📅 أفضل وقت: <b>${p.season}</b><br>🌡 الحرارة: <b>${p.temp}</b>${buildPlaceCard(p)}${buildDynamicChips('default')}`;
    }

    // Distance question
    if (intents.includes('distance')) {
      const distances = {
        'جبل السودة': '٨٥٠ كم من الرياض (ساعة بالطيارة لأبها)',
        'أشجار الجاكرندا': '٩٥٠ كم من الرياض (ساعة بالطيارة للباحة)',
        'غابات رغدان': '٩٥٠ كم من الرياض (قريبة من مدينة الباحة)',
        'جزر فرسان': '١٢٠٠ كم من الرياض (طيارة لجازان ثم فيري)',
        'وادي لجب': '١١٠٠ كم من الرياض (سيارة من جازان ساعتين)',
        'قرية ذي عين': '٩٥٠ كم من الرياض (قرب الباحة)',
        'العُلا': '١١٠٠ كم من الرياض (١.٥ ساعة بالطيارة)',
        'جزر أملج': '١٠٠٠ كم من الرياض (طيارة لينبع ثم ٣ ساعات)',
        'كورنيش جدة': '٩٥٠ كم من الرياض (ساعة بالطيارة)',
        'حافة العالم': '١٠٠ كم من الرياض (ساعة ونص بالسيارة) 🚗',
        'وادي حنيفة': 'داخل الرياض! ١٥-٣٠ دقيقة بالسيارة 🚗',
        'واحة الأحساء': '٣٥٠ كم من الرياض (٣.٥ ساعة بالسيارة)',
        'جبل القارة': '٣٥٠ كم من الرياض (قريب من الأحساء)',
        'محمية الطبيق': '١٤٠٠ كم من الرياض (طيارة لتبوك ثم سيارة)',
        'جبال اللوز': '١٤٠٠ كم من الرياض (طيارة لتبوك ثم ٢٠٠ كم)',
      };
      const dist = distances[p.name] || `في منطقة ${p.region} — ابحث في خرائط قوقل للمسافة الدقيقة`;
      return `المسافة لـ <b>${p.name}</b> 🚗:<br><b>${dist}</b><br><br>📅 أفضل وقت: <b>${p.season}</b><br>🌡 الحرارة: <b>${p.temp}</b>${buildPlaceCard(p)}${buildDynamicChips('default')}`;
    }

    // Accommodation question
    if (intents.includes('accommodation')) {
      return `بالنسبة للسكن قرب <b>${p.name}</b> 🏨:<br>أنصحك تبحث في Booking أو Airbnb عن فنادق في ${p.region}.<br>📅 احجز قبل ${p.season} بشهر على الأقل.<br><br>💡 دوّر على أماكن إقامة صديقة للبيئة!${buildPlaceCard(p)}${buildDynamicChips('default')}`;
    }

    // General place info
    return `<b>${p.name}</b> وجهة رهيبة! 🌟<br><br>${p.desc}<br><br>📅 أفضل وقت: <b>${p.season}</b><br>🌡 الحرارة: <b>${p.temp}</b><br>📍 المنطقة: <b>${p.region}</b><br>🏷️ التصنيف: <b>${p.tag}</b>${buildPlaceCard(p)}<br><small>💡 ${randomTip}</small>${buildDynamicChips('default')}`;
  }

  // === Trip planning ===
  if (intents.includes('trip')) {
    let region = 'all';
    if (intents.includes('sea') || input.includes('غرب') || input.includes('بحر')) region = 'west';
    else if (input.includes('جنوب') || intents.includes('mountain') || intents.includes('nature')) region = 'south';
    else if (input.includes('شمال') || intents.includes('cold')) region = 'north';
    else if (input.includes('شرق') || intents.includes('oasis')) region = 'east';
    else if (input.includes('وسط') || intents.includes('desert')) region = 'center';

    // Detect number of days
    let days = 3;
    const dayMatch = input.match(/(\d+)\s*(يوم|أيام|ايام)/);
    if (dayMatch) days = Math.min(parseInt(dayMatch[1]), 7);
    if (input.includes('أسبوع') || input.includes('اسبوع')) days = 7;
    if (input.includes('ويكند') || input.includes('نهاية')) days = 2;

    const plan = buildTripPlan(region, days);
    return `حياك! خليني أخطط لك رحلة حلوة 🗺️✨${plan}<br>تبغى تعدّل أو تضيف يوم؟<br><small>💡 ${randomTip}</small>${buildDynamicChips('trip')}`;
  }

  // === Family ===
  if (intents.includes('family')) {
    const familyPlaces = places.filter(p => ['غابات', 'ساحلي', 'بيئي', 'ربيعي', 'اليونسكو'].includes(p.tag)).slice(0, 3);
    return `للعوائل والعيال، هذي أنسب الوجهات 👨‍👩‍👧‍👦:<br>أماكن آمنة ومريحة والأجواء حلوة.${familyPlaces.map(buildPlaceCard).join('')}<br><small>💡 ${randomTip}</small>${buildDynamicChips('nature')}`;
  }

  // === Romantic ===
  if (intents.includes('romantic')) {
    const romanticPlaces = places.filter(p => ['شواطئ', 'ربيعي', 'تراث عالمي'].includes(p.tag)).slice(0, 3);
    return `للرحلة الرومانسية، هذي أحلى الوجهات 💕:${romanticPlaces.map(buildPlaceCard).join('')}${buildDynamicChips('sea')}`;
  }

  // === Eco / sustainability ===
  if (intents.includes('eco')) {
    const ecoPlaces = places.filter(p => ['بيئي', 'محمية ملكية', 'محمية بحرية', 'اليونسكو'].includes(p.tag)).slice(0, 3);
    return `وجهات صديقة للبيئة ومحميات طبيعية 🌿:${ecoPlaces.map(buildPlaceCard).join('')}<br><b>نصائح الاستدامة:</b><br>${ecoTips.slice(0, 3).join('<br>')}${buildDynamicChips('eco')}`;
  }

  // === Tips only ===
  if (intents.includes('tips') && !intents.includes('specific')) {
    return `نصائح مهمة للمسافر البيئي 📝:<br><br>${ecoTips.join('<br>')}<br><br>كلها نصائح بسيطة بس تفرق كثير! 🌍${buildDynamicChips('eco')}`;
  }

  // === Budget ===
  if (intents.includes('budget')) {
    const budgetPlaces = places.filter(p => ['بيئي', 'وادي', 'غابات', 'مغامرة'].includes(p.tag)).slice(0, 3);
    return `وجهات اقتصادية ما تحتاج ميزانية كبيرة 💰:<br>أغلبها مجانية أو برسوم بسيطة!${budgetPlaces.map(buildPlaceCard).join('')}${buildDynamicChips('default')}`;
  }

  // === Category match ===
  const matched = matchPlaces(intents);
  if (matched.length > 0) {
    const cards = matched.slice(0, 3).map(buildPlaceCard).join('');
    const chipCtx = intents.find(i => ['sea', 'mountain', 'nature', 'heritage', 'desert', 'eco'].includes(i)) || 'default';
    return `لقيت لك وجهات تناسب طلبك 🌿${cards}<br><small>💡 ${randomTip}</small>${buildDynamicChips(chipCtx)}`;
  }

  // === Greetings ===
  if (input.match(/^(هلا|مرحبا|السلام|هاي|أهلا|مساء|صباح|كيف|حياك|الو|يا هلا)/)) {
    return `هلا وغلا! 🧭✨<br>أنا مساعدك في وِجهات. أقدر أساعدك في:<br>• اقتراح وجهات حسب ذوقك<br>• تخطيط رحلة كاملة<br>• مقارنة بين وجهتين<br>• نصائح وتجهيزات${buildDynamicChips('default')}`;
  }

  // === Thanks ===
  if (input.match(/(شكر|مشكور|يعطيك|الله يعافي|ممتن|تسلم|ثانكيو|حلو|ممتاز)/)) {
    return 'العفو ولا يهمك! 😊<br>إذا تبغى شي ثاني لا تتردد تسأل!';
  }

  // === What can you do ===
  if (input.match(/(وش تسوي|وش تقدر|ايش فيك|كيف أستخدم|مساعد|شرح)/)) {
    return `أنا مساعد وِجهات الذكي 🧭 أقدر أسويلك:<br><br>🏖️ <b>اقتراح وجهات</b> — قولي وش تحب (بحر، جبال، صحراء...)<br>🗺️ <b>تخطيط رحلة</b> — قولي كم يوم ووين<br>⚖️ <b>مقارنة</b> — اذكر مكانين وأقارنهم لك<br>📅 <b>أفضل وقت</b> — اسألني متى أزور أي مكان<br>📝 <b>نصائح</b> — تجهيزات ونصائح بيئية<br>💰 <b>ميزانية</b> — وجهات اقتصادية${buildDynamicChips('default')}`;
  }

  // === All destinations ===
  if (input.match(/(كل الوجهات|جميع|كلها|عرض الكل|قائمة)/)) {
    const allCards = places.slice(0, 5).map(buildPlaceCard).join('');
    return `عندنا ${places.length} وجهة بيئية! هذي أبرزها:${allCards}<br>وفيه ${places.length - 5} وجهات ثانية — تصفّحها في قسم المناطق بالموقع! 👆${buildDynamicChips('default')}`;
  }

  // === Default ===
  return `ما قدرت أفهم طلبك بالضبط 🤔<br>جرّب تسألني عن:<br>• نوع وجهة (شواطئ، جبال، صحراء، تراث...)<br>• مكان محدد (العُلا، الباحة، أملج...)<br>• تخطيط رحلة (رحلة ٣ أيام جنوب)<br>• مقارنة بين مكانين<br>• نصائح للمسافر${buildDynamicChips('default')}`;
}

// ====== AI REPLY ======
const placesKnowledge = places.map(p =>
  `• ${p.name} — المنطقة: ${p.region} (${p.regionGroup}) | التصنيف: ${p.tag} | الوصف: ${p.desc} | أفضل وقت: ${p.season} | الحرارة: ${p.temp}`
).join('\n');

async function getAIReply(userMessage) {
  conversationHistory.push({ role: 'user', content: userMessage });
  const systemPrompt = `أنت "مساعد وِجهات" — مساعد سياحي ذكي متخصص في السياحة البيئية في المملكة العربية السعودية.

## قاعدة بياناتك:
${placesKnowledge}

## شخصيتك:
- ودود وحماسي مثل مرشد سياحي محلي
- تتكلم بلهجة سعودية مفهومة وخفيفة
- تستخدم إيموجي خفيف (١-٣ بالرد)

## قواعد الرد:
1. إذا سأل عن مكان في القائمة: اعطه كل التفاصيل (الوصف، أفضل وقت، الحرارة، نصائح)
2. إذا سأل عن مكان مو في القائمة: قول بصراحة ما عندي معلومات عنه واقترح أقرب بديل
3. إذا طلب تخطيط رحلة: اقترح جدول يومي مع أنشطة لكل يوم
4. إذا طلب مقارنة: قارن من حيث (الوقت، الحرارة، الأنشطة، المنطقة)
5. إذا سأل عن نصائح: ادمج نصائح الاستدامة البيئية (لا تترك أثر، قارورة قابلة لإعادة الاستخدام...)
6. إذا سأل عن السكن/الفنادق: انصحه يبحث في Booking أو Airbnb واقترح الحجز المبكر
7. إذا سأل سؤال عام ما له علاقة: وجّهه بلطف إنك متخصص بالوجهات البيئية السعودية
8. لا تخترع معلومات أبداً
9. خلّ الرد مختصر (٣-٦ أسطر) إلا إذا طلب تفصيل
10. دائماً اذكر اسم الوجهة بالضبط مثل ما هو في القائمة عشان النظام يربطه بالكارد`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: conversationHistory.slice(-12)
      })
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    const reply = data.content.filter(item => item.type === 'text').map(item => item.text).join('\n');
    conversationHistory.push({ role: 'assistant', content: reply });
    return reply;
  } catch (error) {
    console.error('AI Error:', error);
    return getSmartFallback(userMessage);
  }
}

function formatReply(text) {
  let html = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
  const mentioned = places.filter(p => text.includes(p.name));
  if (mentioned.length > 0 && mentioned.length <= 4) {
    html += mentioned.map(p => buildPlaceCard(p)).join('');
  }
  return html;
}

function scrollToPlace(name) {
  const allTab = document.querySelector('.region-tab[data-region="all"]');
  if (allTab) {
    document.querySelectorAll('.region-tab').forEach(t => t.classList.remove('active'));
    allTab.classList.add('active');
    if (typeof render === 'function') render('all');
  }
  setTimeout(() => {
    const allCards = document.querySelectorAll('.place-card');
    for (const card of allCards) {
      if (card.querySelector('h3') && card.querySelector('h3').textContent.includes(name)) {
        chatToggle.classList.remove('open');
        chatWindow.classList.remove('open');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.boxShadow = '0 0 0 3px var(--terra), 0 25px 50px rgba(138,58,31,0.3)';
        card.style.transition = 'box-shadow 0.4s ease';
        setTimeout(() => { card.style.boxShadow = ''; }, 2500);
        break;
      }
    }
  }, 200);
}

async function handleChat() {
  const input = chatInput.value.trim();
  if (!input) return;
  addMessage(input, 'user');
  chatInput.value = '';
  chatInput.disabled = true;
  if (chatSuggestions) chatSuggestions.style.display = 'none';

  // Pre-detect context for AI replies too
  const { mentionedPlaces, intents } = detectIntent(input);
  updateContext(mentionedPlaces, intents);

  showTyping();
  try {
    const reply = await getAIReply(input);
    hideTyping();
    addMessage(formatReply(reply), 'bot');
  } catch (e) {
    hideTyping();
    addMessage(formatReply(getSmartFallback(input)), 'bot');
  }
  chatInput.disabled = false;
  chatInput.focus();
}