// ==========================================
// UYGULAMA DURUMU (STATE)
// ==========================================
let currentModuleId = "1.1";
let selectedWordIds = new Set();
let starredWordIds = new Set(JSON.parse(localStorage.getItem('ws_starred') || '[]'));

// Flashcard Oturum Durumu
let cardQueue = [];
let currentCardIndex = 0;

// Match Oturum Durumu
let matchTiles = [];
let firstSelectedTile = null;
let matchedPairsCount = 0;
let totalPairsInRound = 0;

// Quiz Oturum Durumu
let quizQuestions = [];
let currentQuizIndex = 0;
let quizScore = 0;

// ==========================================
// DOM ELEMENTLERİ
// ==========================================
const views = {
  selectView: document.getElementById('selectView'),
  cardView: document.getElementById('cardView'),
  matchView: document.getElementById('matchView'),
  quizView: document.getElementById('quizView')
};

const navTabs = document.querySelectorAll('.nav-tab');
const moduleListEl = document.getElementById('moduleList');
const wordsCheckListEl = document.getElementById('wordsCheckList');
const currentModuleTitleEl = document.getElementById('currentModuleTitle');
const selectedWordsCountEl = document.getElementById('selectedWordsCount');
const startSelectedCountEl = document.getElementById('startSelectedCount');
const totalStarredCountEl = document.getElementById('totalStarredCount');
const searchWordInput = document.getElementById('searchWordInput');
const filterStarredOnlyBtn = document.getElementById('filterStarredOnlyBtn');

// Başlatma Butonları
const startCardsBtn = document.getElementById('startCardsBtn');
const startMatchBtn = document.getElementById('startMatchBtn');
const startQuizBtn = document.getElementById('startQuizBtn');
const navCardBtn = document.getElementById('navCardBtn');
const navMatchBtn = document.getElementById('navMatchBtn');
const navQuizBtn = document.getElementById('navQuizBtn');

// Flashcard Elementleri
const cardInner = document.getElementById('cardInner');
const card3dWrap = document.getElementById('card3dWrap');
const frontTerm = document.getElementById('frontTerm');
const frontType = document.getElementById('frontType');
const frontGrammar = document.getElementById('frontGrammar');
const backMeaning = document.getElementById('backMeaning');
const backRegister = document.getElementById('backRegister');
const backExDe = document.getElementById('backExDe');
const backExTr = document.getElementById('backExTr');
const backTipBox = document.getElementById('backTipBox');
const backTip = document.getElementById('backTip');
const cardProgressBar = document.getElementById('cardProgressBar');
const cardCounter = document.getElementById('cardCounter');
const cardStarBtn = document.getElementById('cardStarBtn');
const btnCardFlip = document.getElementById('btnCardFlip');
const btnCardAgain = document.getElementById('btnCardAgain');
const btnCardKnown = document.getElementById('btnCardKnown');

// Match Elementleri
const matchGrid = document.getElementById('matchGrid');
const matchPairsLeft = document.getElementById('matchPairsLeft');
const matchFinishModal = document.getElementById('matchFinishModal');
const btnResetMatch = document.getElementById('btnResetMatch');
const btnRestartMatch = document.getElementById('btnRestartMatch');

// Quiz Elementleri
const quizWordType = document.getElementById('quizWordType');
const quizQuestionWord = document.getElementById('quizQuestionWord');
const quizQuestionContext = document.getElementById('quizQuestionContext');
const quizOptionsGrid = document.getElementById('quizOptionsGrid');
const quizProgressBar = document.getElementById('quizProgressBar');
const quizCounter = document.getElementById('quizCounter');
const quizScoreEl = document.getElementById('quizScore');
const quizFeedbackBar = document.getElementById('quizFeedbackBar');
const feedbackIcon = document.getElementById('feedbackIcon');
const feedbackTitle = document.getElementById('feedbackTitle');
const feedbackExample = document.getElementById('feedbackExample');
const btnNextQuiz = document.getElementById('btnNextQuiz');

// ==========================================
// BAŞLANGIÇ & MODÜL YÜKLEME
// ==========================================
function initApp() {
  updateStarredBadge();
  renderModuleSidebar();
  renderWordList();
  setupEventListeners();
}

function updateStarredBadge() {
  totalStarredCountEl.textContent = starredWordIds.size;
  localStorage.setItem('ws_starred', JSON.stringify([...starredWordIds]));
}

function renderModuleSidebar() {
  moduleListEl.innerHTML = '';
  modulesData.forEach(mod => {
    const btn = document.createElement('button');
    btn.className = `module-btn ${mod.id === currentModuleId ? 'active' : ''}`;
    btn.dataset.moduleId = mod.id;
    btn.innerHTML = `
      <span>${mod.title}</span>
      <span class="module-count">${mod.words.length}</span>
    `;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.module-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentModuleId = mod.id;
      renderWordList();
    });
    moduleListEl.appendChild(btn);
  });
}

function getCurrentModuleWords() {
  const currentMod = modulesData.find(m => m.id === currentModuleId);
  return currentMod ? currentMod.words : [];
}

function renderWordList(filterStarred = false, searchTerm = '') {
  const words = getCurrentModuleWords();
  const currentMod = modulesData.find(m => m.id === currentModuleId);
  currentModuleTitleEl.textContent = currentMod ? currentMod.title : '';

  wordsCheckListEl.innerHTML = '';

  const filtered = words.filter(w => {
    const matchesSearch = w.de.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          w.tr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStar = filterStarred ? starredWordIds.has(w.id) : true;
    return matchesSearch && matchesStar;
  });

  if (filtered.length === 0) {
    wordsCheckListEl.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--text-dim)">Kelime bulunamadı.</div>`;
    return;
  }

  filtered.forEach(word => {
    const isSelected = selectedWordIds.has(word.id);
    const isStarred = starredWordIds.has(word.id);

    const row = document.createElement('div');
    row.className = `word-row ${isSelected ? 'selected' : ''}`;
    row.innerHTML = `
      <div class="word-row-left">
        <div class="custom-check"></div>
        <div>
          <span class="word-text-de">${word.de}</span>
          <span class="word-text-grammar">${word.prep || word.type}</span>
        </div>
      </div>
      <div class="word-row-right">
        <span class="word-text-tr">${word.tr}</span>
        <button class="star-icon-btn ${isStarred ? 'active' : ''}" data-word-id="${word.id}">⭐</button>
      </div>
    `;

    // Satıra tıklayınca seç/kaldır
    row.addEventListener('click', (e) => {
      if (e.target.classList.contains('star-icon-btn')) return;
      toggleSelectWord(word.id);
    });

    // Yıldız butonuna basınca
    const starBtn = row.querySelector('.star-icon-btn');
    starBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleStarWord(word.id);
      starBtn.classList.toggle('active');
    });

    wordsCheckListEl.appendChild(row);
  });

  updateSelectionUI();
}

function toggleSelectWord(id) {
  if (selectedWordIds.has(id)) {
    selectedWordIds.delete(id);
  } else {
    selectedWordIds.add(id);
  }
  renderWordList(filterStarredOnlyBtn.classList.contains('active'), searchWordInput.value);
}

function toggleStarWord(id) {
  if (starredWordIds.has(id)) {
    starredWordIds.delete(id);
  } else {
    starredWordIds.add(id);
  }
  updateStarredBadge();
}

function updateSelectionUI() {
  const count = selectedWordIds.size;
  selectedWordsCountEl.textContent = count;
  startSelectedCountEl.textContent = count;

  const hasSelection = count > 0;
  startCardsBtn.disabled = !hasSelection;
  startMatchBtn.disabled = count < 2; // Eşleştirme için en az 2 kelime
  startQuizBtn.disabled = count < 4;  // Test için en az 4 kelime (4 şık)

  navCardBtn.disabled = !hasSelection;
  navMatchBtn.disabled = count < 2;
  navQuizBtn.disabled = count < 4;
}

// ==========================================
// EKRAN GEÇİŞLERİ (VIEW SWITCHING)
// ==========================================
function switchView(targetViewId) {
  Object.values(views).forEach(view => view.classList.remove('active'));
  views[targetViewId].classList.add('active');

  navTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === targetViewId);
  });
}

// ==========================================
// 1. FLASHCARD MODU MANTIĞI
// ==========================================
function startFlashcardSession() {
  const allWords = getAllWordsFlat();
  cardQueue = allWords.filter(w => selectedWordIds.has(w.id));
  currentCardIndex = 0;
  switchView('cardView');
  loadFlashcard();
}

function loadFlashcard() {
  if (cardQueue.length === 0) {
    switchView('selectView');
    return;
  }

  cardInner.classList.remove('flipped');
  const word = cardQueue[currentCardIndex];

  frontTerm.textContent = word.de;
  frontType.textContent = word.type;
  frontGrammar.textContent = word.prep || '';

  backRegister.textContent = word.register || 'Wissenschaftssprache';
  backMeaning.textContent = word.tr;
  backExDe.textContent = word.ex_de || '';
  backExTr.textContent = word.ex_tr || '';

  if (word.tip) {
    backTipBox.style.display = 'block';
    backTip.textContent = word.tip;
  } else {
    backTipBox.style.display = 'none';
  }

  cardCounter.textContent = `${currentCardIndex + 1} / ${cardQueue.length}`;
  cardProgressBar.style.width = `${((currentCardIndex + 1) / cardQueue.length) * 100}%`;

  cardStarBtn.classList.toggle('active', starredWordIds.has(word.id));
}

function flipCard() {
  cardInner.classList.toggle('flipped');
}

function nextCardKnown() {
  cardQueue.splice(currentCardIndex, 1);
  if (currentCardIndex >= cardQueue.length) {
    currentCardIndex = 0;
  }
  if (cardQueue.length === 0) {
    alert("🎉 Harika! Seçtiğin tüm kartları öğrendin!");
    switchView('selectView');
  } else {
    loadFlashcard();
  }
}

function nextCardAgain() {
  // Mevcut kelimeyi sona taşı
  const word = cardQueue.splice(currentCardIndex, 1)[0];
  cardQueue.push(word);
  if (currentCardIndex >= cardQueue.length) {
    currentCardIndex = 0;
  }
  loadFlashcard();
}

// ==========================================
// 2. DUOLINGO EŞLEŞTİRME MODU MANTIĞI
// ==========================================
function startMatchSession() {
  const allWords = getAllWordsFlat();
  const selected = allWords.filter(w => selectedWordIds.has(w.id));
  
  matchTiles = [];
  selected.forEach(w => {
    matchTiles.push({ id: w.id, text: w.de, type: 'de' });
    matchTiles.push({ id: w.id, text: w.tr, type: 'tr' });
  });

  // Karıştır
  matchTiles.sort(() => Math.random() - 0.5);

  firstSelectedTile = null;
  matchedPairsCount = 0;
  totalPairsInRound = selected.length;
  matchFinishModal.style.display = 'none';
  matchPairsLeft.textContent = `${totalPairsInRound} Çift Kaldı`;

  renderMatchGrid();
  switchView('matchView');
}

function renderMatchGrid() {
  matchGrid.innerHTML = '';
  matchTiles.forEach((tile, index) => {
    const btn = document.createElement('div');
    btn.className = 'match-tile';
    btn.textContent = tile.text;
    btn.dataset.id = tile.id;
    btn.dataset.type = tile.type;
    btn.dataset.index = index;

    btn.addEventListener('click', () => handleTileClick(btn, tile));
    matchGrid.appendChild(btn);
  });
}

function handleTileClick(tileEl, tileData) {
  if (tileEl.classList.contains('correct') || tileEl.classList.contains('selected')) return;

  if (!firstSelectedTile) {
    // İlk seçim
    firstSelectedTile = { el: tileEl, data: tileData };
    tileEl.classList.add('selected');
  } else {
    // İkinci seçim
    const first = firstSelectedTile;
    tileEl.classList.add('selected');

    if (first.data.id === tileData.data.id && first.data.type !== tileData.data.type) {
      // Doğru Eşleşme
      setTimeout(() => {
        first.el.classList.remove('selected');
        tileEl.classList.remove('selected');
        first.el.classList.add('correct');
        tileEl.classList.add('correct');

        matchedPairsCount++;
        const left = totalPairsInRound - matchedPairsCount;
        matchPairsLeft.textContent = `${left} Çift Kaldı`;

        if (left === 0) {
          matchFinishModal.style.display = 'flex';
        }
      }, 200);
    } else {
      // Yanlış Eşleşme
      setTimeout(() => {
        first.el.classList.add('wrong');
        tileEl.classList.add('wrong');
        setTimeout(() => {
          first.el.classList.remove('selected', 'wrong');
          tileEl.classList.remove('selected', 'wrong');
        }, 400);
      }, 200);
    }
    firstSelectedTile = null;
  }
}

// ==========================================
// 3. TEST / QUIZ MODU MANTIĞI
// ==========================================
function startQuizSession() {
  const allWords = getAllWordsFlat();
  const selected = allWords.filter(w => selectedWordIds.has(w.id));
  
  quizQuestions = selected.map(word => {
    // 3 rastgele yanlış seçenek seç
    const otherWords = allWords.filter(w => w.id !== word.id);
    otherWords.sort(() => Math.random() - 0.5);
    const options = [word.tr, otherWords[0].tr, otherWords[1].tr, otherWords[2].tr];
    options.sort(() => Math.random() - 0.5);

    return {
      word: word,
      options: options,
      correctAnswer: word.tr
    };
  });

  currentQuizIndex = 0;
  quizScore = 0;
  quizScoreEl.textContent = '0';
  switchView('quizView');
  loadQuizQuestion();
}

function loadQuizQuestion() {
  quizFeedbackBar.style.display = 'none';
  const q = quizQuestions[currentQuizIndex];

  quizWordType.textContent = q.word.type;
  quizQuestionWord.textContent = q.word.de;
  quizQuestionContext.textContent = q.word.prep || '';

  quizCounter.textContent = `${currentQuizIndex + 1} / ${quizQuestions.length}`;
  quizProgressBar.style.width = `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%`;

  quizOptionsGrid.innerHTML = '';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => handleQuizAnswer(btn, opt, q));
    quizOptionsGrid.appendChild(btn);
  });
}

function handleQuizAnswer(btnEl, selectedOption, question) {
  const allOptionBtns = quizOptionsGrid.querySelectorAll('.option-btn');
  allOptionBtns.forEach(b => b.disabled = true);

  const isCorrect = selectedOption === question.correctAnswer;

  if (isCorrect) {
    btnEl.classList.add('correct');
    quizScore += 10;
    quizScoreEl.textContent = quizScore;
    feedbackIcon.textContent = '✅';
    feedbackTitle.textContent = 'Harika! Doğru Cevap';
  } else {
    btnEl.classList.add('wrong');
    allOptionBtns.forEach(b => {
      if (b.textContent === question.correctAnswer) b.classList.add('correct');
    });
    feedbackIcon.textContent = '❌';
    feedbackTitle.textContent = `Yanlış! Doğrusu: ${question.correctAnswer}`;
    // Yanlış bilineni oturumun sonuna ekle
    quizQuestions.push(question);
    toggleStarWord(question.word.id); // Otomatik yıldızla
  }

  feedbackExample.textContent = `${question.word.ex_de} → ${question.word.ex_tr}`;
  quizFeedbackBar.style.display = 'flex';
}

// ==========================================
// YARDIMCI VE GLOBAL FONKSİYONLAR
// ==========================================
function getAllWordsFlat() {
  let all = [];
  modulesData.forEach(m => {
    all = all.concat(m.words);
  });
  return all;
}

function setupEventListeners() {
  // Nav Butonları
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const viewId = tab.dataset.view;
      if (viewId === 'cardView') startFlashcardSession();
      else if (viewId === 'matchView') startMatchSession();
      else if (viewId === 'quizView') startQuizSession();
      else switchView(viewId);
    });
  });

  // Geri Butonları
  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.back));
  });

  // Seçim Araçları
  searchWordInput.addEventListener('input', (e) => {
    renderWordList(filterStarredOnlyBtn.classList.contains('active'), e.target.value);
  });

  filterStarredOnlyBtn.addEventListener('click', () => {
    filterStarredOnlyBtn.classList.toggle('active');
    renderWordList(filterStarredOnlyBtn.classList.contains('active'), searchWordInput.value);
  });

  document.getElementById('selectAllBtn').addEventListener('click', () => {
    getCurrentModuleWords().forEach(w => selectedWordIds.add(w.id));
    renderWordList();
  });

  document.getElementById('clearSelectionBtn').addEventListener('click', () => {
    selectedWordIds.clear();
    renderWordList();
  });

  document.getElementById('selectQuick5Btn').addEventListener('click', () => {
    const words = getCurrentModuleWords();
    const shuffled = [...words].sort(() => Math.random() - 0.5).slice(0, 5);
    shuffled.forEach(w => selectedWordIds.add(w.id));
    renderWordList();
  });

  document.getElementById('selectQuick10Btn').addEventListener('click', () => {
    const words = getCurrentModuleWords();
    const shuffled = [...words].sort(() => Math.random() - 0.5).slice(0, 10);
    shuffled.forEach(w => selectedWordIds.add(w.id));
    renderWordList();
  });

  // Başlat Butonları
  startCardsBtn.addEventListener('click', startFlashcardSession);
  startMatchBtn.addEventListener('click', startMatchSession);
  startQuizBtn.addEventListener('click', startQuizSession);

  // Kart Butonları & Klavye
  card3dWrap.addEventListener('click', flipCard);
  btnCardFlip.addEventListener('click', flipCard);
  btnCardKnown.addEventListener('click', nextCardKnown);
  btnCardAgain.addEventListener('click', nextCardAgain);
  cardStarBtn.addEventListener('click', () => {
    const word = cardQueue[currentCardIndex];
    toggleStarWord(word.id);
    cardStarBtn.classList.toggle('active');
  });

  // Eşleştirme Butonları
  btnResetMatch.addEventListener('click', startMatchSession);
  btnRestartMatch.addEventListener('click', startMatchSession);

  // Quiz Butonları
  btnNextQuiz.addEventListener('click', () => {
    currentQuizIndex++;
    if (currentQuizIndex < quizQuestions.length) {
      loadQuizQuestion();
    } else {
      alert(`Quiz Tamamlandı! Toplam Puanın: ${quizScore}`);
      switchView('selectView');
    }
  });

  // Klavye Kısayolları
  document.addEventListener('keydown', (e) => {
    if (views.cardView.classList.contains('active')) {
      if (e.code === 'Space') { e.preventDefault(); flipCard(); }
      else if (e.key === '1') { nextCardAgain(); }
      else if (e.key === '2') { nextCardKnown(); }
    }
  });
}

// Uygulamayı Başlat
document.addEventListener('DOMContentLoaded', initApp);
