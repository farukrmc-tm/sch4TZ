const STORAGE_KEY = 'kelime-kutusu-full-v2';

// Ana Uygulama Durumu
let state = loadState();
let selectedCards = []; // O an seçili olan kelimeler

// Flashcard Durumu
let studyQueue = [];
let studyIndex = 0;
let isFlipped = false;

// Match Durumu
let matchTiles = [];
let firstTile = null;
let matchedCount = 0;
let totalPairs = 0;

// Quiz Durumu
let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;
let quizLocked = false;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Veri okuma hatası:', e);
  }
  return { 
    decks: PDF_DATA_DECKS, 
    activeDeckId: 'deck-1-1', 
    starred: [] // [{ term, def, type, example }]
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getActiveDeck() {
  if (state.activeDeckId === 'starred') {
    return { id: 'starred', name: '⭐ Yıldızlı Kelimeler', cards: state.starred };
  }
  return state.decks.find(d => d.id === state.activeDeckId) || state.decks[0];
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Sesli Telaffuz (Web Speech API)
function speakGerman(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const clean = text.replace(/\(.*?\)/g, '').replace(/[\*\/]/g, '').trim();
  const ut = new SpeechSynthesisUtterance(clean);
  ut.lang = 'de-DE';
  ut.rate = 0.88;
  window.speechSynthesis.speak(ut);
}

// ==========================================
// DOM REFERANSLARI
// ==========================================
const sidebar = document.getElementById('sidebar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const deckList = document.getElementById('deckList');
const deckCountBadge = document.getElementById('deckCountBadge');
const starredCountBadge = document.getElementById('starredCountBadge');
const filterStarredBtn = document.getElementById('filterStarredBtn');

const emptyState = document.getElementById('emptyState');
const deckView = document.getElementById('deckView');
const deckBadge = document.getElementById('deckBadge');
const deckTitle = document.getElementById('deckTitle');

const modeButtons = document.querySelectorAll('.mode-btn');
const panels = {
  cards: document.getElementById('panel-cards'),
  study: document.getElementById('panel-study'),
  match: document.getElementById('panel-match'),
  quiz:  document.getElementById('panel-quiz'),
};

const cardTable = document.getElementById('cardTable');
const cardSearchInput = document.getElementById('cardSearchInput');
const selectedCountDisplay = document.getElementById('selectedCountDisplay');
const btnSelectAll = document.getElementById('btnSelectAll');
const btnClearSelection = document.getElementById('btnClearSelection');
const btnSelect5 = document.getElementById('btnSelect5');
const btnSelect10 = document.getElementById('btnSelect10');

// Flashcard
const flashcardInner = document.getElementById('flashcardInner');
const flashFront = document.getElementById('flashFront');
const flashBack = document.getElementById('flashBack');
const flashGrammarFront = document.getElementById('flashGrammarFront');
const flashExample = document.getElementById('flashExample');
const studyProgressText = document.getElementById('studyProgressText');
const studyStarBtn = document.getElementById('studyStarBtn');
const btnCardRepeat = document.getElementById('btnCardRepeat');
const btnCardKnown = document.getElementById('btnCardKnown');
const ttsFrontBtn = document.getElementById('ttsFrontBtn');
const ttsExampleBtn = document.getElementById('ttsExampleBtn');

// Match
const matchGrid = document.getElementById('matchGrid');
const matchPairsRemaining = document.getElementById('matchPairsRemaining');
const matchCompleteBox = document.getElementById('matchCompleteBox');
const btnRestartMatch = document.getElementById('btnRestartMatch');
const btnMatchAgain = document.getElementById('btnMatchAgain');

// Quiz
const quizBox = document.getElementById('quizBox');
const quizResultBox = document.getElementById('quizResultBox');
const quizQuestion = document.getElementById('quizQuestion');
const quizOptions = document.getElementById('quizOptions');
const quizProgressText = document.getElementById('quizProgressText');
const quizScoreText = document.getElementById('quizScoreText');
const retryQuizBtn = document.getElementById('retryQuizBtn');
const quizTtsBtn = document.getElementById('quizTtsBtn');

// ==========================================
// SEÇİM VE LİSTELEME
// ==========================================
function renderDeckList() {
  deckList.innerHTML = '';
  deckCountBadge.textContent = state.decks.length;
  starredCountBadge.textContent = state.starred.length;

  state.decks.forEach(deck => {
    const li = document.createElement('li');
    const isActive = deck.id === state.activeDeckId;

    li.className = `flex items-center justify-between rounded-xl px-3 py-2.5 transition-all cursor-pointer ${
      isActive 
        ? 'bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30' 
        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
    }`;

    li.innerHTML = `
      <div class="flex items-center gap-2.5 min-w-0 flex-1">
        <i class="fa-solid fa-folder${isActive ? '-open text-amber-400' : ''} text-sm"></i>
        <span class="truncate text-sm">${escapeHtml(deck.name)}</span>
      </div>
      <span class="text-xs font-mono px-2 py-0.5 rounded-full ${isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-900 text-slate-500'}">${deck.cards.length}</span>
    `;

    li.addEventListener('click', () => {
      state.activeDeckId = deck.id;
      saveState();
      resetSelection();
      setMode('cards');
      renderAll();
      if (window.innerWidth < 768) sidebar.classList.add('-translate-x-full');
    });

    deckList.appendChild(li);
  });
}

function resetSelection() {
  const deck = getActiveDeck();
  selectedCards = deck ? [...deck.cards] : [];
  updateSelectionUI();
}

function updateSelectionUI() {
  selectedCountDisplay.textContent = `${selectedCards.length} Seçildi`;
}

function isCardStarred(term) {
  return state.starred.some(c => c.term === term);
}

function toggleStarCard(card) {
  const idx = state.starred.findIndex(c => c.term === card.term);
  if (idx > -1) {
    state.starred.splice(idx, 1);
  } else {
    state.starred.push(card);
  }
  saveState();
  renderDeckList();
  renderCardTable();
}

function renderCardTable() {
  const deck = getActiveDeck();
  cardTable.innerHTML = '';

  if (!deck || deck.cards.length === 0) {
    cardTable.innerHTML = `<li class="p-8 text-center text-slate-500 italic text-sm">Bu modülde kelime bulunamadı.</li>`;
    return;
  }

  const query = cardSearchInput.value.toLowerCase().trim();
  const filtered = deck.cards.filter(c => 
    c.term.toLowerCase().includes(query) || 
    c.def.toLowerCase().includes(query)
  );

  filtered.forEach((card, i) => {
    const isSelected = selectedCards.some(c => c.term === card.term);
    const isStarred = isCardStarred(card.term);

    const li = document.createElement('li');
    li.className = `p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors cursor-pointer ${
      isSelected ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-slate-900/60'
    }`;

    li.innerHTML = `
      <div class="flex items-start gap-3 min-w-0 flex-1">
        <input type="checkbox" ${isSelected ? 'checked' : ''} class="card-check mt-1.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0">
        <div class="space-y-1 min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-bold text-slate-100 text-base">${escapeHtml(card.term)}</span>
            ${card.type ? `<span class="text-xs font-mono bg-slate-800 text-amber-400 px-2 py-0.5 rounded">${escapeHtml(card.type)}</span>` : ''}
            <button class="tts-btn text-slate-500 hover:text-amber-400 text-xs p-1" title="Telaffuz">
              <i class="fa-solid fa-volume-high"></i>
            </button>
          </div>
          <p class="text-sm text-slate-400">${escapeHtml(card.def)}</p>
          ${card.example ? `<p class="text-xs text-slate-500 italic font-sans border-l-2 border-slate-700 pl-2 mt-1">${escapeHtml(card.example)}</p>` : ''}
        </div>
      </div>
      <button class="star-btn self-end md:self-auto p-2 text-sm transition-colors ${isStarred ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'}">
        <i class="fa-solid fa-star"></i>
      </button>
    `;

    // Satıra veya checkbox'a tıklama
    li.addEventListener('click', (e) => {
      if (e.target.closest('.star-btn') || e.target.closest('.tts-btn')) return;
      toggleSelectCard(card);
    });

    li.querySelector('.tts-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      speakGerman(card.term);
    });

    li.querySelector('.star-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleStarCard(card);
    });

    cardTable.appendChild(li);
  });
}

function toggleSelectCard(card) {
  const idx = selectedCards.findIndex(c => c.term === card.term);
  if (idx > -1) {
    selectedCards.splice(idx, 1);
  } else {
    selectedCards.push(card);
  }
  updateSelectionUI();
  renderCardTable();
}

// Seçim Butonları
btnSelectAll.addEventListener('click', () => {
  const deck = getActiveDeck();
  selectedCards = [...deck.cards];
  updateSelectionUI();
  renderCardTable();
});

btnClearSelection.addEventListener('click', () => {
  selectedCards = [];
  updateSelectionUI();
  renderCardTable();
});

btnSelect5.addEventListener('click', () => {
  const deck = getActiveDeck();
  selectedCards = shuffle(deck.cards).slice(0, 5);
  updateSelectionUI();
  renderCardTable();
});

btnSelect10.addEventListener('click', () => {
  const deck = getActiveDeck();
  selectedCards = shuffle(deck.cards).slice(0, 10);
  updateSelectionUI();
  renderCardTable();
});

cardSearchInput.addEventListener('input', renderCardTable);

filterStarredBtn.addEventListener('click', () => {
  if (state.starred.length === 0) {
    showToast('Henüz yıldızlı kelimeniz yok.', 'error');
    return;
  }
  state.activeDeckId = 'starred';
  resetSelection();
  setMode('cards');
  renderAll();
});

// ==========================================
// MOD DEĞİŞİMİ
// ==========================================
modeButtons.forEach(btn => {
  btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

function setMode(mode) {
  if (mode !== 'cards' && selectedCards.length === 0) {
    showToast('Lütfen önce en az 1 kelime seçin.', 'error');
    return;
  }

  modeButtons.forEach(b => {
    const active = b.dataset.mode === mode;
    b.className = `mode-btn px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
      active ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10' : 'text-slate-400 hover:text-white'
    }`;
  });

  Object.entries(panels).forEach(([key, el]) => {
    el.classList.toggle('hidden', key !== mode);
  });

  if (mode === 'study') startStudy();
  if (mode === 'match') startMatch();
  if (mode === 'quiz') startQuiz();
}

// ==========================================
// 1. FLASHCARD (KART ÇEVİRME & ÖĞRENDİM)
// ==========================================
function startStudy() {
  studyQueue = [...selectedCards];
  studyIndex = 0;
  isFlipped = false;
  renderStudyCard();
}

function renderStudyCard() {
  isFlipped = false;
  flashcardInner.classList.remove('rotate-y-180');

  if (studyQueue.length === 0) {
    showToast('🎉 Tebrikler! Seçili tüm kartları öğrendin!');
    setMode('cards');
    return;
  }

  const card = studyQueue[studyIndex];
  flashFront.textContent = card.term;
  flashBack.textContent = card.def;
  flashGrammarFront.textContent = card.type || 'TestDaF';
  flashExample.textContent = card.example || '—';
  studyProgressText.textContent = `${studyIndex + 1} / ${studyQueue.length}`;

  const isStarred = isCardStarred(card.term);
  studyStarBtn.className = `text-base transition-colors ${isStarred ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'}`;
}

flashcardInner.parentElement.addEventListener('click', (e) => {
  if (e.target.closest('#ttsFrontBtn') || e.target.closest('#ttsExampleBtn')) return;
  isFlipped = !isFlipped;
  flashcardInner.classList.toggle('rotate-y-180', isFlipped);
});

ttsFrontBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (studyQueue[studyIndex]) speakGerman(studyQueue[studyIndex].term);
});

ttsExampleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (studyQueue[studyIndex] && studyQueue[studyIndex].example) {
    speakGerman(studyQueue[studyIndex].example);
  }
});

studyStarBtn.addEventListener('click', () => {
  if (studyQueue[studyIndex]) {
    toggleStarCard(studyQueue[studyIndex]);
    renderStudyCard();
  }
});

btnCardKnown.addEventListener('click', () => {
  studyQueue.splice(studyIndex, 1);
  if (studyIndex >= studyQueue.length) studyIndex = 0;
  renderStudyCard();
});

btnCardRepeat.addEventListener('click', () => {
  const card = studyQueue.splice(studyIndex, 1)[0];
  studyQueue.push(card);
  if (studyIndex >= studyQueue.length) studyIndex = 0;
  renderStudyCard();
});

// Klavye Kısayolları
document.addEventListener('keydown', (e) => {
  const activeMode = document.querySelector('.mode-btn.bg-amber-500')?.dataset.mode;
  if (activeMode !== 'study') return;
  if (e.target.tagName === 'INPUT') return;

  if (e.code === 'Space') {
    e.preventDefault();
    isFlipped = !isFlipped;
    flashcardInner.classList.toggle('rotate-y-180', isFlipped);
  } else if (e.key === '1') {
    btnCardRepeat.click();
  } else if (e.key === '2') {
    btnCardKnown.click();
  }
});

// ==========================================
// 2. DUOLINGO EŞLEŞTİRME MODU
// ==========================================
function startMatch() {
  if (selectedCards.length < 2) {
    showToast('Eşleştirme için en az 2 kelime seçmelisiniz.', 'error');
    setMode('cards');
    return;
  }

  matchCompleteBox.classList.add('hidden');
  matchGrid.classList.remove('hidden');

  const pool = selectedCards.slice(0, 12); // Tek seferde en fazla 12 çift
  totalPairs = pool.length;
  matchedCount = 0;
  firstTile = null;
  matchPairsRemaining.textContent = `${totalPairs} Çift Kaldı`;

  matchTiles = [];
  pool.forEach(c => {
    matchTiles.push({ term: c.term, matchKey: c.term, text: c.term, lang: 'de' });
    matchTiles.push({ term: c.term, matchKey: c.term, text: c.def, lang: 'tr' });
  });

  matchTiles = shuffle(matchTiles);
  renderMatchGrid();
}

function renderMatchGrid() {
  matchGrid.innerHTML = '';
  matchTiles.forEach(tile => {
    const btn = document.createElement('button');
    btn.className = 'match-tile bg-slate-950 hover:bg-slate-800 border-2 border-slate-800 p-4 rounded-2xl text-center text-sm md:text-base font-bold text-slate-200 min-h-[90px] flex items-center justify-center transition-all';
    btn.textContent = tile.text;

    btn.addEventListener('click', () => handleTileClick(btn, tile));
    matchGrid.appendChild(btn);
  });
}

function handleTileClick(btn, tile) {
  if (btn.classList.contains('pointer-events-none') || btn.classList.contains('border-amber-500')) return;

  if (!firstTile) {
    firstTile = { btn, tile };
    btn.classList.remove('border-slate-800');
    btn.classList.add('border-amber-500', 'bg-amber-500/10', 'text-amber-300');
  } else {
    const prev = firstTile;
    btn.classList.remove('border-slate-800');
    btn.classList.add('border-amber-500', 'bg-amber-500/10', 'text-amber-300');

    if (prev.tile.matchKey === tile.matchKey && prev.tile.lang !== tile.lang) {
      // Doğru
      setTimeout(() => {
        prev.btn.className = 'match-tile bg-emerald-500/20 border-2 border-emerald-500 p-4 rounded-2xl text-center text-emerald-400 font-bold opacity-0 transition-opacity duration-300 pointer-events-none min-h-[90px] flex items-center justify-center';
        btn.className = 'match-tile bg-emerald-500/20 border-2 border-emerald-500 p-4 rounded-2xl text-center text-emerald-400 font-bold opacity-0 transition-opacity duration-300 pointer-events-none min-h-[90px] flex items-center justify-center';
        
        matchedCount++;
        const rem = totalPairs - matchedCount;
        matchPairsRemaining.textContent = `${rem} Çift Kaldı`;

        if (rem === 0) {
          matchGrid.classList.add('hidden');
          matchCompleteBox.classList.remove('hidden');
        }
      }, 200);
    } else {
      // Yanlış
      setTimeout(() => {
        prev.btn.classList.add('shake', 'border-rose-500', 'bg-rose-500/20', 'text-rose-300');
        btn.classList.add('shake', 'border-rose-500', 'bg-rose-500/20', 'text-rose-300');
        setTimeout(() => {
          prev.btn.className = 'match-tile bg-slate-950 hover:bg-slate-800 border-2 border-slate-800 p-4 rounded-2xl text-center text-sm md:text-base font-bold text-slate-200 min-h-[90px] flex items-center justify-center transition-all';
          btn.className = 'match-tile bg-slate-950 hover:bg-slate-800 border-2 border-slate-800 p-4 rounded-2xl text-center text-sm md:text-base font-bold text-slate-200 min-h-[90px] flex items-center justify-center transition-all';
        }, 400);
      }, 200);
    }
    firstTile = null;
  }
}

btnRestartMatch.addEventListener('click', startMatch);
btnMatchAgain.addEventListener('click', startMatch);

// ==========================================
// 3. TEST / QUIZ MODU
// ==========================================
function startQuiz() {
  if (selectedCards.length < 2) {
    showToast('Test için en az 2 kelime seçmelisiniz.', 'error');
    setMode('cards');
    return;
  }

  quizBox.classList.remove('hidden');
  quizResultBox.classList.add('hidden');

  quizQuestions = shuffle([...selectedCards]);
  quizIndex = 0;
  quizScore = 0;
  renderQuizQuestion();
}

function renderQuizQuestion() {
  quizLocked = false;
  if (quizIndex >= quizQuestions.length) {
    quizBox.classList.add('hidden');
    quizResultBox.classList.remove('hidden');
    quizScoreText.textContent = `${quizScore} / ${quizQuestions.length} Doğru`;
    return;
  }

  const current = quizQuestions[quizIndex];
  quizQuestion.textContent = current.term;
  quizProgressText.textContent = `Soru ${quizIndex + 1} / ${quizQuestions.length}`;

  const deck = getActiveDeck();
  const others = deck.cards.filter(c => c.term !== current.term);
  const wrongPicks = shuffle(others).slice(0, 3).map(c => c.def);
  const options = shuffle([current.def, ...wrongPicks]);

  quizOptions.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt-btn w-full bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-4 text-left font-medium text-slate-200 text-sm md:text-base transition-all flex items-center justify-between group';
    btn.innerHTML = `
      <span>${escapeHtml(opt)}</span>
      <i class="fa-regular fa-circle text-slate-600 group-hover:text-amber-400 transition-colors"></i>
    `;
    btn.addEventListener('click', () => handleQuizAnswer(btn, opt === current.def, current));
    quizOptions.appendChild(btn);
  });
}

quizTtsBtn.addEventListener('click', () => {
  if (quizQuestions[quizIndex]) speakGerman(quizQuestions[quizIndex].term);
});

function handleQuizAnswer(btn, isCorrect, currentCard) {
  if (quizLocked) return;
  quizLocked = true;

  const allBtns = quizOptions.querySelectorAll('.quiz-opt-btn');
  allBtns.forEach(b => b.classList.add('pointer-events-none'));

  if (isCorrect) {
    btn.className = 'quiz-opt-btn w-full bg-emerald-500/20 border-2 border-emerald-500 rounded-2xl p-4 text-left font-bold text-emerald-300 text-sm md:text-base flex items-center justify-between';
    btn.querySelector('i').className = 'fa-solid fa-circle-check text-emerald-400 text-lg';
    quizScore++;
  } else {
    btn.className = 'quiz-opt-btn w-full bg-rose-500/20 border-2 border-rose-500 rounded-2xl p-4 text-left font-bold text-rose-300 text-sm md:text-base flex items-center justify-between';
    btn.querySelector('i').className = 'fa-solid fa-circle-xmark text-rose-400 text-lg';

    // Doğru şıkkı yak ve kelimeyi sona at
    allBtns.forEach(b => {
      if (b.textContent.trim().includes(currentCard.def.trim())) {
        b.className = 'quiz-opt-btn w-full bg-emerald-500/10 border border-emerald-500/50 rounded-2xl p-4 text-left font-semibold text-emerald-400 text-sm md:text-base flex items-center justify-between';
      }
    });

    quizQuestions.push(currentCard); // Sınırsız test döngüsü
    toggleStarCard(currentCard);     // Yanlış bilinene otomatik yıldız
  }

  setTimeout(() => {
    quizIndex++;
    renderQuizQuestion();
  }, 1000);
}

retryQuizBtn.addEventListener('click', startQuiz);

// ==========================================
// VERİ DIŞA / İÇE AKTAR & YARDIMCILAR
// ==========================================
exportDataBtn.addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const dl = document.createElement('a');
  dl.setAttribute("href", dataStr);
  dl.setAttribute("download", `kelime-kutusu-yedek-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(dl);
  dl.click();
  dl.remove();
  showToast('Yedek başarıyla indirildi.');
});

importFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      if (parsed && Array.isArray(parsed.decks)) {
        state = parsed;
        saveState();
        resetSelection();
        renderAll();
        showToast('Veriler içe aktarıldı!');
      }
    } catch (err) {
      showToast('Dosya okuma hatası.', 'error');
    }
  };
  reader.readAsText(file);
});

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');

  toastMsg.textContent = msg;
  toastIcon.className = type === 'error' ? 'fa-solid fa-circle-exclamation text-red-400 text-lg' : 'fa-solid fa-circle-check text-amber-400 text-lg';
  toast.classList.remove('translate-y-20', 'opacity-0');
  setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 2500);
}

mobileMenuBtn.addEventListener('click', () => sidebar.classList.toggle('-translate-x-full'));

function renderAll() {
  renderDeckList();
  const deck = getActiveDeck();

  if (!deck) {
    emptyState.classList.remove('hidden');
    deckView.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  deckView.classList.remove('hidden');
  deckBadge.textContent = `${deck.cards.length} KELİME`;
  deckTitle.textContent = deck.name;
  renderCardTable();
}

// Başlat
resetSelection();
renderAll();
