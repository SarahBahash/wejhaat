// ====== CHATBOT LOGIC — ENHANCED AI-POWERED ======
const chatToggle = document.getElementById('chatToggle');
const chatWindow = document.getElementById('chatWindow');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSuggestions = document.getElementById('chatSuggestions');
let conversationHistory = [];

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
  chatSuggestions.style.display = 'none';
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

// ====== SMART KEYWORD ENGINE ======
const keywordMap = {
  sea: ['بحر', 'شاطئ', 'شواطئ', 'سباحة', 'غوص', 'مويه', 'ماء', 'بحري', 'ساحل', 'مالديف', 'جزير', 'جزر', 'مرجان', 'سنوركل'],
  mountain: ['جبل', 'جبال', 'قمة', 'مرتفع', 'سودة', 'لوز', 'ضباب', 'هايك', 'تسلق', 'مرتفعات'],
  nature: ['طبيعة', 'طبيعي', 'أخضر', 'خضراء', 'غابة', 'غابات', 'وادي', 'أودية', 'شجر', 'أشجار', 'نبات', 'زهر'],
  heritage: ['تاريخ', 'تاريخي', 'تراث', 'آثار', 'أثري', 'قرية', 'قديم', 'يونسكو', 'نبطي', 'حضار'],
  desert: ['صحراء', 'صحراوي', 'رمل', 'رمال', 'مغامر', 'حافة', 'نجوم', 'تخييم', 'كشتة'],
  family: ['عائلة', 'عائلي', 'أطفال', 'عيال', 'أهل', 'عوائل'],
  cold: ['برد', 'بارد', 'ثلج', 'ثلوج', 'شتاء', 'شتوي'],
  hot: ['حر', 'صيف', 'صيفي', 'دافي', 'دافئ'],
  photo: ['تصوير', 'صور', 'مصور', 'كاميرا', 'انستقرام', 'لقطة'],
  cave: ['كهف', 'كهوف', 'مغارة', 'غار'],
  oasis: ['واحة', 'نخل', 'نخيل', 'عين'],
};

function detectIntent(input) {
  const lower = input.toLowerCase();
  const intents = [];

  for (const [key, words] of Object.entries(keywordMap)) {
    if (words.some(w => lower.includes(w))) intents.push(key);
  }

  // Detect trip planning
  if (lower.match(/رحل|خطط|جدول|برنامج|أيام|يوم|ويكند/)) intents.push('trip');
  // Detect comparison
  if (lower.match(/أفضل|أحسن|أحلى|الفرق|مقارن|ولا\s|أو\s/)) intents.push('compare');
  // Detect time/season
  if (lower.match(/وقت|متى|موسم|شهر|زيار/)) intents.push('timing');
  // Detect specific place
  const mentionedPlaces = places.filter(p => lower.includes(p.name) || lower.includes(p.region.replace('ال', '')));
  if (mentionedPlaces.length > 0) intents.push('specific');

  return { intents, mentionedPlaces };
}

function matchPlaces(intents) {
  return places.filter(p => {
    if (intents.includes('sea') && ['شواطئ', 'ساحلي', 'محمية بحرية'].includes(p.tag)) return true;
    if (intents.includes('mountain') && (p.desc.includes('جبل') || p.desc.includes('قمة') || p.tag === 'أعلى قمة' || p.tag === 'ثلوج')) return true;
    if (intents.includes('nature') && ['غابات', 'وادي', 'بيئي', 'ربيعي'].includes(p.tag)) return true;
    if (intents.includes('heritage') && ['تراث', 'تراث عالمي', 'اليونسكو'].includes(p.tag)) return true;
    if (intents.includes('desert') && ['مغامرة', 'محمية ملكية'].includes(p.tag)) return true;
    if (intents.includes('cold') && (p.tag === 'ثلوج' || p.tag === 'أعلى قمة')) return true;
    if (intents.includes('cave') && p.tag === 'كهوف') return true;
    if (intents.includes('oasis') && (p.tag === 'اليونسكو' && p.name.includes('الأحساء'))) return true;
    if (intents.includes('photo') && ['تراث عالمي', 'ربيعي', 'أعلى قمة'].includes(p.tag)) return true;
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
    trip: ['📋 رحلة ٣ أيام جنوب', '🗺️ رحلة أسبوع متنوعة', '💰 رحلة اقتصادية'],
    default: ['🌊 شواطئ', '⛰️ جبال', '🏜️ صحراء', '🌿 طبيعة'],
  };

  const key = context || 'default';
  const chips = chipSets[key] || chipSets.default;

  return `<div class="chat-chips-inline">${chips.map(c => {
    const text = c.replace(/^[^\s]+\s/, '');
    return `<button class="chip-inline" onclick="sendChip('${text}')">${c}</button>`;
  }).join('')}</div>`;
}

function buildTripPlan(region) {
  const regionPlaces = places.filter(p => {
    if (region === 'south') return p.regionGroup === 'south';
    if (region === 'west') return p.regionGroup === 'west';
    if (region === 'north') return p.regionGroup === 'north';
    return true;
  });

  if (regionPlaces.length < 2) return null;

  const selected = regionPlaces.slice(0, 3);
  let plan = `<div class="chat-trip-plan">
    <div class="trip-header">🗺️ مقترح رحلة</div>`;

  selected.forEach((p, i) => {
    plan += `<div class="trip-day">
      <span class="trip-day-num">يوم ${i + 1}</span>
      <div class="trip-day-content">
        <strong>${p.name}</strong> — ${p.region}<br>
        <span class="trip-day-desc">${p.desc.substring(0, 80)}...</span>
      </div>
    </div>`;
  });

  plan += '</div>';
  return plan;
}

function buildComparison(place1, place2) {
  return `<div class="chat-comparison">
    <div class="comp-header">⚖️ مقارنة</div>
    <div class="comp-row">
      <div class="comp-cell"><strong>${place1.name}</strong></div>
      <div class="comp-vs">VS</div>
      <div class="comp-cell"><strong>${place2.name}</strong></div>
    </div>
    <div class="comp-row">
      <div class="comp-cell">${place1.region}</div>
      <div class="comp-label">المنطقة</div>
      <div class="comp-cell">${place2.region}</div>
    </div>
    <div class="comp-row">
      <div class="comp-cell">${place1.season}</div>
      <div class="comp-label">أفضل وقت</div>
      <div class="comp-cell">${place2.season}</div>
    </div>
    <div class="comp-row">
      <div class="comp-cell">${place1.temp}</div>
      <div class="comp-label">الحرارة</div>
      <div class="comp-cell">${place2.temp}</div>
    </div>
    <div class="comp-row">
      <div class="comp-cell">${place1.tag}</div>
      <div class="comp-label">التصنيف</div>
      <div class="comp-cell">${place2.tag}</div>
    </div>
  </div>`;
}

// ====== SMART FALLBACK ======
function getSmartFallback(input) {
  const { intents, mentionedPlaces } = detectIntent(input);

  // Specific place mentioned
  if (intents.includes('specific') && mentionedPlaces.length > 0) {
    if (intents.includes('timing')) {
      const p = mentionedPlaces[0];
      return `أفضل وقت لزيارة <b>${p.name}</b> هو <b>${p.season}</b> 📅<br>الحرارة تكون حوالي <b>${p.temp}</b> 🌡<br><br>${p.desc}${buildPlaceCard(p)}${buildDynamicChips('default')}`;
    }

    // Comparison between two places
    if (mentionedPlaces.length >= 2) {
      return `يالله نقارن بينهم! 💪${buildComparison(mentionedPlaces[0], mentionedPlaces[1])}${buildDynamicChips('default')}`;
    }

    const p = mentionedPlaces[0];
    return `${p.name} وجهة رهيبة! 🌟<br><br>${p.desc}<br><br>📅 أفضل وقت: <b>${p.season}</b><br>🌡 الحرارة: <b>${p.temp}</b><br>📍 المنطقة: <b>${p.region}</b>${buildPlaceCard(p)}${buildDynamicChips('default')}`;
  }

  // Trip planning
  if (intents.includes('trip')) {
    let region = 'all';
    if (intents.includes('sea') || input.includes('غرب')) region = 'west';
    else if (input.includes('جنوب') || intents.includes('mountain') || intents.includes('nature')) region = 'south';
    else if (input.includes('شمال') || intents.includes('cold')) region = 'north';

    const plan = buildTripPlan(region);
    if (plan) {
      return `حياك! خليني أخطط لك رحلة حلوة 🗺️✨${plan}<br>تبغى تعدّل أو تضيف يوم؟${buildDynamicChips('trip')}`;
    }
  }

  // Family trip
  if (intents.includes('family')) {
    const familyPlaces = places.filter(p =>
      ['غابات', 'ساحلي', 'بيئي', 'ربيعي'].includes(p.tag)
    ).slice(0, 3);

    const cards = familyPlaces.map(buildPlaceCard).join('');
    return `للعوائل والعيال، هذي أنسب الوجهات 👨‍👩‍👧‍👦:<br>أماكن آمنة، فيها مرافق، والأجواء حلوة للأطفال.${cards}${buildDynamicChips('nature')}`;
  }

  // Category match
  const matched = matchPlaces(intents);
  if (matched.length > 0) {
    const cards = matched.slice(0, 3).map(buildPlaceCard).join('');
    const chipContext = intents.find(i => ['sea', 'mountain', 'nature', 'heritage', 'desert'].includes(i)) || 'default';
    return `لقيت لك وجهات تناسب طلبك 🌿${cards}${buildDynamicChips(chipContext)}`;
  }

  // Greeting
  if (input.match(/^(هلا|مرحبا|السلام|هاي|أهلا|مساء|صباح|كيف)/)) {
    return `هلا وغلا! 🧭✨<br>أنا مساعدك في وِجهات، قولي وش تبغى وأساعدك!<br>تقدر تسألني عن أي وجهة، أو أخطط لك رحلة كاملة!${buildDynamicChips('default')}`;
  }

  // Thank you
  if (input.match(/(شكر|مشكور|يعطيك|الله يعافي|ممتن)/)) {
    return 'العفو! أتمنى أكون ساعدتك 😊<br>إذا تبغى شي ثاني لا تتردد!';
  }

  // Default
  return `ما قدرت أفهم طلبك بالضبط 🤔<br>جرّب تسألني عن:<br>• نوع وجهة (شواطئ، جبال، صحراء...)<br>• مكان محدد (العُلا، الباحة...)<br>• تخطيط رحلة (رحلة ٣ أيام جنوب...)${buildDynamicChips('default')}`;
}

// ====== AI REPLY ======
const placesKnowledge = places.map(p =>
  `• ${p.name} — المنطقة: ${p.region} | التصنيف: ${p.tag} | الوصف: ${p.desc} | أفضل وقت: ${p.season} | الحرارة: ${p.temp} | الإحداثيات: ${p.lat},${p.lng}`
).join('\n');

async function getAIReply(userMessage) {
  conversationHistory.push({ role: 'user', content: userMessage });
  const systemPrompt = `أنت مساعد سياحي ذكي لموقع "وِجهات" المتخصص في السياحة البيئية في المملكة العربية السعودية.

هذه هي الوجهات المتاحة في قاعدة بياناتك:
${placesKnowledge}

قواعد:
- ردّ باللهجة السعودية المفهومة والودودة
- خلّ ردودك مختصرة (٣-٥ أسطر) إلا إذا طلب تفصيل
- إذا سأل عن مكان من القائمة، اعطه تفاصيل مفيدة
- إذا سأل عن مكان مو في القائمة، قول له بصراحة واقترح بديل
- انصح بأفضل وقت للزيارة ودرجة الحرارة
- لا تخترع معلومات
- استخدم إيموجي خفيف
- إذا طلب تخطيط رحلة، اقترح جدول يومي مختصر
- إذا طلب مقارنة بين مكانين، قارن من حيث: الوقت، الحرارة، النشاط، الوصول
- إذا سأل عن نصائح، ادمج نصائح الاستدامة البيئية في ردك`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: conversationHistory.slice(-10)
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
  // First ensure "all" tab is active
  const allTab = document.querySelector('.region-tab[data-region="all"]');
  if (allTab && !allTab.classList.matches) {
    document.querySelectorAll('.region-tab').forEach(t => t.classList.remove('active'));
    allTab.classList.add('active');
    render('all');
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

  // Hide initial suggestions after first message
  if (chatSuggestions) chatSuggestions.style.display = 'none';

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