// ====== QUIZ: وش وجهتك المثالية؟ ======

const quizQuestions = [
  {
    id: 'vibe',
    question: 'وش الجو اللي تدوّر عليه في رحلتك؟',
    hint: 'اختر الإحساس اللي تبغاه',
    options: [
      { emoji: '🏔️', text: 'هدوء وطبيعة', desc: 'جبال، غابات، هواء نقي', tags: { mountain: 3, forest: 2, desert: 0, sea: 0, heritage: 0 } },
      { emoji: '🌊', text: 'بحر وشواطئ', desc: 'مويه صافية، غوص، استرخاء', tags: { mountain: 0, forest: 0, desert: 0, sea: 3, heritage: 0 } },
      { emoji: '🏜️', text: 'مغامرة وصحراء', desc: 'تحدي، استكشاف، مناظر درامية', tags: { mountain: 1, forest: 0, desert: 3, sea: 0, heritage: 1 } },
      { emoji: '🏛️', text: 'تاريخ وثقافة', desc: 'آثار، قرى تراثية، حضارات', tags: { mountain: 0, forest: 0, desert: 1, sea: 0, heritage: 3 } },
    ]
  },
  {
    id: 'weather',
    question: 'وش تفضّل من الأجواء؟',
    hint: 'الطقس يفرق كثير في المتعة',
    options: [
      { emoji: '❄️', text: 'بارد ومنعش', desc: 'أجواء شتوية وضباب', tags: { mountain: 3, forest: 2, desert: 0, sea: 0, heritage: 0 } },
      { emoji: '🌤️', text: 'معتدل ولطيف', desc: 'لا حر ولا برد', tags: { mountain: 1, forest: 3, desert: 1, sea: 1, heritage: 2 } },
      { emoji: '☀️', text: 'حار ومشمس', desc: 'شمس ساطعة وسما صافية', tags: { mountain: 0, forest: 0, desert: 2, sea: 3, heritage: 1 } },
      { emoji: '🌧️', text: 'ما يفرق معي', desc: 'أي جو أتأقلم معه', tags: { mountain: 1, forest: 1, desert: 1, sea: 1, heritage: 1 } },
    ]
  },
  {
    id: 'companion',
    question: 'مع مين بتروح الرحلة؟',
    hint: 'الرفقة تحدد نوع الوجهة',
    options: [
      { emoji: '👨‍👩‍👧‍👦', text: 'عائلة وأطفال', desc: 'أماكن آمنة ومريحة', tags: { mountain: 1, forest: 2, desert: 0, sea: 2, heritage: 2 } },
      { emoji: '👫', text: 'مع الشريك', desc: 'رومانسية وهدوء', tags: { mountain: 2, forest: 2, desert: 1, sea: 3, heritage: 1 } },
      { emoji: '👥', text: 'مع الأصدقاء', desc: 'حماس ومغامرة', tags: { mountain: 2, forest: 1, desert: 3, sea: 2, heritage: 1 } },
      { emoji: '🚶', text: 'لحالي', desc: 'تأمل واستكشاف ذاتي', tags: { mountain: 3, forest: 2, desert: 2, sea: 1, heritage: 2 } },
    ]
  },
  {
    id: 'activity',
    question: 'وش النشاط اللي يحمّسك أكثر؟',
    hint: 'اختر اللي يخلي قلبك يدق',
    options: [
      { emoji: '🥾', text: 'مشي وهايكنق', desc: 'مسارات طبيعية ومنحدرات', tags: { mountain: 3, forest: 2, desert: 2, sea: 0, heritage: 1 } },
      { emoji: '🤿', text: 'غوص وسباحة', desc: 'عالم تحت الماء', tags: { mountain: 0, forest: 0, desert: 0, sea: 3, heritage: 0 } },
      { emoji: '📸', text: 'تصوير ومناظر', desc: 'لقطات ما تتكرر', tags: { mountain: 2, forest: 2, desert: 2, sea: 1, heritage: 3 } },
      { emoji: '🏕️', text: 'تخييم ونجوم', desc: 'ليالي تحت السما', tags: { mountain: 2, forest: 3, desert: 3, sea: 0, heritage: 0 } },
    ]
  },
  {
    id: 'duration',
    question: 'كم مدة رحلتك المتوقعة؟',
    hint: 'عشان نقترح لك مكان يناسب وقتك',
    options: [
      { emoji: '⚡', text: 'يوم واحد', desc: 'رحلة سريعة', tags: { mountain: 0, forest: 1, desert: 2, sea: 1, heritage: 1 } },
      { emoji: '🌙', text: 'يومين إلى ثلاثة', desc: 'ويكند ممتد', tags: { mountain: 2, forest: 2, desert: 2, sea: 2, heritage: 2 } },
      { emoji: '📅', text: 'أسبوع', desc: 'رحلة كاملة', tags: { mountain: 3, forest: 2, desert: 1, sea: 3, heritage: 3 } },
      { emoji: '🗓️', text: 'أكثر من أسبوع', desc: 'إجازة طويلة', tags: { mountain: 2, forest: 1, desert: 1, sea: 3, heritage: 3 } },
    ]
  },
];

// Map places to categories with match weights
const placeProfiles = [
  { name: 'جبل السودة', index: 0, scores: { mountain: 5, forest: 3, desert: 0, sea: 0, heritage: 0 }, emoji: '🏔️' },
  { name: 'أشجار الجاكرندا', index: 1, scores: { mountain: 2, forest: 4, desert: 0, sea: 0, heritage: 1 }, emoji: '🌸' },
  { name: 'غابات رغدان', index: 2, scores: { mountain: 2, forest: 5, desert: 0, sea: 0, heritage: 0 }, emoji: '🌲' },
  { name: 'جزر فرسان', index: 3, scores: { mountain: 0, forest: 0, desert: 0, sea: 5, heritage: 1 }, emoji: '🏝️' },
  { name: 'وادي لجب', index: 4, scores: { mountain: 3, forest: 2, desert: 0, sea: 0, heritage: 0 }, emoji: '🏞️' },
  { name: 'قرية ذي عين', index: 5, scores: { mountain: 1, forest: 1, desert: 0, sea: 0, heritage: 5 }, emoji: '🏘️' },
  { name: 'العُلا', index: 6, scores: { mountain: 0, forest: 0, desert: 3, sea: 0, heritage: 5 }, emoji: '🗿' },
  { name: 'جزر أملج', index: 7, scores: { mountain: 0, forest: 0, desert: 0, sea: 5, heritage: 0 }, emoji: '🏖️' },
  { name: 'كورنيش جدة', index: 8, scores: { mountain: 0, forest: 0, desert: 0, sea: 4, heritage: 1 }, emoji: '🌅' },
  { name: 'حافة العالم', index: 9, scores: { mountain: 3, forest: 0, desert: 5, sea: 0, heritage: 0 }, emoji: '🪂' },
  { name: 'وادي حنيفة', index: 10, scores: { mountain: 0, forest: 3, desert: 1, sea: 0, heritage: 1 }, emoji: '🌿' },
  { name: 'واحة الأحساء', index: 11, scores: { mountain: 0, forest: 2, desert: 1, sea: 0, heritage: 4 }, emoji: '🌴' },
  { name: 'جبل القارة', index: 12, scores: { mountain: 2, forest: 0, desert: 2, sea: 0, heritage: 3 }, emoji: '🕳️' },
  { name: 'محمية الطبيق', index: 13, scores: { mountain: 1, forest: 0, desert: 4, sea: 0, heritage: 0 }, emoji: '🐆' },
  { name: 'جبال اللوز', index: 14, scores: { mountain: 5, forest: 0, desert: 2, sea: 0, heritage: 0 }, emoji: '🏔️' },
];

// Quiz state
let currentQuestion = 0;
let answers = [];

function initQuiz() {
  currentQuestion = 0;
  answers = [];
  renderQuestion();
}

function renderQuestion() {
  const q = quizQuestions[currentQuestion];
  const total = quizQuestions.length;
  const progress = ((currentQuestion) / total) * 100;
  const container = document.getElementById('quizContent');

  container.innerHTML = `
    <div class="quiz-progress">
      <div class="quiz-progress-track">
        <div class="quiz-progress-fill" style="width: ${progress}%"></div>
      </div>
      <span class="quiz-progress-label">${currentQuestion + 1} / ${total}</span>
    </div>
    <div class="quiz-card">
      <div class="quiz-question-wrap">
        <div class="quiz-question-num">${currentQuestion + 1}</div>
        <h3 class="quiz-question-text">${q.question}</h3>
        <p class="quiz-question-hint">${q.hint}</p>
        <div class="quiz-options">
          ${q.options.map((opt, i) => `
            <div class="quiz-option ${answers[currentQuestion] === i ? 'selected' : ''}"
                 onclick="selectOption(${i})">
              <span class="opt-emoji">${opt.emoji}</span>
              <span class="opt-text">${opt.text}</span>
              <span class="opt-desc">${opt.desc}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="quiz-nav">
        ${currentQuestion > 0
          ? `<button class="quiz-btn quiz-btn-back" onclick="prevQuestion()"><span>→</span> السابق</button>`
          : '<div></div>'
        }
        <button class="quiz-btn quiz-btn-next" onclick="nextQuestion()" ${answers[currentQuestion] === undefined ? 'disabled' : ''}>
          ${currentQuestion === total - 1 ? 'اكتشف وجهتك' : 'التالي'} <span>←</span>
        </button>
      </div>
    </div>
  `;
}

function selectOption(index) {
  answers[currentQuestion] = index;
  // Visual feedback
  document.querySelectorAll('.quiz-option').forEach((el, i) => {
    el.classList.toggle('selected', i === index);
  });
  // Enable next button
  const nextBtn = document.querySelector('.quiz-btn-next');
  if (nextBtn) nextBtn.disabled = false;
}

function nextQuestion() {
  if (answers[currentQuestion] === undefined) return;

  if (currentQuestion < quizQuestions.length - 1) {
    const wrap = document.querySelector('.quiz-question-wrap');
    wrap.style.animation = 'quizSlideOut 0.3s ease forwards';
    setTimeout(() => {
      currentQuestion++;
      renderQuestion();
    }, 280);
  } else {
    showResult();
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    const wrap = document.querySelector('.quiz-question-wrap');
    wrap.style.animation = 'quizSlideOut 0.3s ease forwards';
    setTimeout(() => {
      currentQuestion--;
      renderQuestion();
    }, 280);
  }
}

function calculateScores() {
  // Tally user tags from all answers
  const userProfile = { mountain: 0, forest: 0, desert: 0, sea: 0, heritage: 0 };
  answers.forEach((ansIdx, qIdx) => {
    const tags = quizQuestions[qIdx].options[ansIdx].tags;
    for (const key in tags) {
      userProfile[key] += tags[key];
    }
  });

  // Calculate match percentage for each place using cosine similarity
  const results = placeProfiles.map(place => {
    let dotProduct = 0, magA = 0, magB = 0;
    for (const key in userProfile) {
      dotProduct += userProfile[key] * place.scores[key];
      magA += userProfile[key] ** 2;
      magB += place.scores[key] ** 2;
    }
    const similarity = (Math.sqrt(magA) * Math.sqrt(magB)) > 0
      ? dotProduct / (Math.sqrt(magA) * Math.sqrt(magB))
      : 0;
    const percentage = Math.round(similarity * 100);
    return { ...place, percentage };
  });

  // Sort by match percentage
  results.sort((a, b) => b.percentage - a.percentage);
  return results;
}

function showResult() {
  const results = calculateScores();
  const best = results[0];
  const placeData = places[best.index];
  const runners = results.slice(1, 4);
  const container = document.getElementById('quizContent');
  const circumference = 2 * Math.PI * 44; // ring radius = 44

  container.innerHTML = `
    <div class="quiz-card">
      <div class="quiz-result">
        <span class="result-emoji">${best.emoji}</span>
        <p class="result-label">وجهتك المثالية هي</p>
        <h2 class="result-name">${best.name}</h2>
        <p class="result-region">${placeData.region} — ${placeData.tag}</p>
        <div class="result-match-ring">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle class="ring-bg" cx="50" cy="50" r="44"/>
            <circle class="ring-fill" id="matchRing" cx="50" cy="50" r="44"/>
          </svg>
          <span class="result-match-text" id="matchText">0%</span>
        </div>
        <p class="result-desc">${placeData.desc}</p>
        <div class="result-details">
          <div class="result-detail">
            <div class="rd-value">📅 ${placeData.season}</div>
            <div class="rd-label">أفضل وقت</div>
          </div>
          <div class="result-detail">
            <div class="rd-value">🌡 ${placeData.temp}</div>
            <div class="rd-label">درجة الحرارة</div>
          </div>
          <div class="result-detail">
            <div class="rd-value">${placeData.tag}</div>
            <div class="rd-label">التصنيف</div>
          </div>
        </div>
        <div class="result-runners">
          <h4>وجهات تناسبك أيضاً</h4>
          <div class="runners-grid">
            ${runners.map(r => `
              <span class="runner-chip" onclick="scrollToPlace('${r.name}')">
                ${r.emoji} ${r.name}
                <span class="runner-pct">${r.percentage}%</span>
              </span>
            `).join('')}
          </div>
        </div>
        <div class="result-actions">
          <button class="result-btn result-btn-primary" onclick="scrollToPlace('${best.name}')">
            شوف التفاصيل ←
          </button>
          <button class="result-btn result-btn-secondary" onclick="initQuiz()">
            أعد الاختبار ↻
          </button>
        </div>
      </div>
    </div>
  `;

  // Animate the match ring
  setTimeout(() => {
    const ring = document.getElementById('matchRing');
    const text = document.getElementById('matchText');
    if (ring) {
      const offset = circumference - (circumference * best.percentage / 100);
      ring.style.strokeDashoffset = offset;
    }
    // Animate percentage number
    if (text) {
      let current = 0;
      const target = best.percentage;
      const step = target / 40;
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        text.textContent = Math.round(current) + '%';
      }, 25);
    }
  }, 300);
}

// Initialize quiz when it scrolls into view
const quizSection = document.getElementById('quiz');
if (quizSection) {
  let quizInited = false;
  const quizObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !quizInited) {
      initQuiz();
      quizInited = true;
      quizObserver.disconnect();
    }
  }, { threshold: 0.2 });
  quizObserver.observe(quizSection);
}
