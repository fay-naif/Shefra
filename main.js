/* =========================================================
   الشيفرة الأخيرة | THE LAST CODE
   منطق اللعبة كاملاً — جافاسكربت عادية + GSAP
   ---------------------------------------------------------
   ✏️ كل النصوص والإجابات موجودة في كائن CONFIG بالأسفل،
      عدّليها من هناك بدون ما تلمسين باقي الكود.
   ========================================================= */

/* =========================================================
   ١) الإعدادات — CONFIG
   ========================================================= */
const CONFIG = {
  totalMinutes: 45,        // مدة اللعبة بالدقائق
  wrongPenalty: 1,         // دقائق تُخصم عند الإجابة الخاطئة
  hintPenalty: 2,          // دقائق تُخصم عند طلب تلميح
  trapPenalty: 3,          // دقائق تُخصم عند اختيار الباب الخاطئ في غرفة القرار
  dangerMinutes: 5,        // تحت هذا الوقت يصير العداد أحمر نابض
  vaultAttempts: 3,        // عدد محاولات إدخال الشيفرة في الخزنة

  // رسالة البداية (تُكتب حرفاً حرفاً)
  introLines: [
    'تم اكتشاف محاولة وصول غير معروفة إلى النظام...',
    'تبقّت 45 دقيقة قبل إغلاق جميع الملفات نهائيًا.',
    'أمامك فرصة واحدة لاستعادة الشيفرة الأخيرة.'
  ],

  // الغرف الخمس — كل غرفة تعطي رقماً واحداً من الشيفرة النهائية
  rooms: [
    {
      type: 'caesar',
      title: 'غرفة', accent: 'الدخول',
      story: 'بوابة النظام مقفلة بكلمة مشفّرة بشيفرة قيصر. أدِر العجلة حتى تظهر الكلمة الحقيقية.',
      cipher: 'VHYHQ',            // النص المشفّر
      shift: 3,                   // الإزاحة الصحيحة  → SEVEN
      clue: 'مفتاح الإزاحة = <b>عدد أضلاع المثلث</b>',
      digit: 7,
      reveal: 'SEVEN = 7',
      hint: 'المثلث له 3 أضلاع… أدِر العجلة حتى تصير الإزاحة 3 ثم اضغط تأكيد.'
    },
    {
      type: 'binary',
      title: 'غرفة', accent: 'الملفات',
      story: 'ملف مشفّر بالنظام الثنائي. حوّل الرقم إلى النظام العشري لتستعيد الجزء الثاني.',
      bits: '00001001',           // الرقم بالثنائي
      answer: 9,                  // قيمته بالعشري
      digit: 9,
      hint: 'اضغط على كل خانة فيها 1 وشوف وزنها: 8 + 1 = ؟'
    },
    {
      type: 'sequence',
      title: 'غرفة', accent: 'الشبكة',
      story: 'عُقد الشبكة تنقل الإشارة بنمط ثابت. اكتشف النمط واختر العقدة المفقودة.',
      sequence: [81, 27, 9, 3],   // العُقد الظاهرة
      options: [0, 1, 2, 6, 12, 33],
      answer: 1,                  // كل عقدة = السابقة ÷ 3
      digit: 1,
      hint: 'كل عقدة هي ثلث العقدة اللي قبلها: 81 ÷ 3 = 27 …'
    },
    {
      type: 'memory',
      title: 'غرفة', accent: 'الذاكرة',
      story: 'ذاكرة النظام تومض بتسلسل سري. راقب جيداً، ثم أعد التسلسل بنفس الترتيب.',
      symbols: ['ع', 'ق', 'ل', 'ن', 'و', 'ر'],
      sequence: [2, 0, 4, 1, 5],  // ترتيب الألواح (من 0 إلى 5)
      digit: 4,
      hint: 'التسلسل خمس ومضات: ل ← ع ← و ← ق ← ر'
    },
    {
      type: 'decision',
      title: 'غرفة', accent: 'القرار',
      story: 'وصلت إلى قلب النظام. أمامك بابان… واحد فقط يقودك إلى الشيفرة.',
      choices: [
        { icon: '⚡', title: 'مخرج الطوارئ', text: 'اقطع الكهرباء عن الحماية واهرب بسرعة.', correct: false, cls: '' ,
          result: 'كان فخّاً! أعاد النظام تشغيل نفسه وخسرت 3 دقائق.' },
        { icon: '🗝️', title: 'غرفة الصمت', text: 'ادخل بهدوء واقرأ آخر رسالة تركها المبرمج.', correct: true, cls: 'amber',
          result: 'قرار حكيم. وجدت رسالة المبرمج الأخيرة…' }
      ],
      riddle: 'أنا رقمٌ فردي، إن ضربتني في نفسي صرتُ خمسةً وعشرين، وإن جمعتني مع نفسي صرتُ عشرة. فمن أنا؟',
      answer: 5,
      digit: 5,
      hint: 'الباب الصحيح هو «غرفة الصمت». والرقم اللي في نفسه = 25 هو 5.'
    }
  ],

  // نصوص النهايات
  winTitle: 'تم استعادة الشيفرة',
  winText: 'أنقذت النظام في اللحظة الأخيرة. الملفات آمنة… هذه المرة.',
  loseTitle: 'تم إغلاق النظام',
  loseTextTime: 'انتهى الوقت. أُغلقت جميع الملفات نهائيًا.',
  loseTextCode: 'الشيفرة خاطئة. فعّل النظام بروتوكول الإغلاق الكامل.'
};

// الشيفرة النهائية = أرقام الغرف بالترتيب (7 9 1 4 5)
const FINAL_CODE = CONFIG.rooms.map(r => String(r.digit)).join('');

/* =========================================================
   ٢) حالة اللعبة
   ========================================================= */
const state = {
  phase: 'intro',     // intro | room | fragment | vault | end
  room: 0,            // رقم الغرفة الحالية
  solved: [],         // الغرف المحلولة
  endAt: 0,           // وقت انتهاء العداد (ميلي ثانية)
  timerId: null,
  over: false,
  attemptsLeft: CONFIG.vaultAttempts,
  hintsUsed: 0,
  mistakes: 0
};

const $ = (s, el = document) => el.querySelector(s);
const stage = $('#stage');

/* =========================================================
   ٣) الصوت — يُولَّد بالكود عبر WebAudio (بدون ملفات)
   ========================================================= */
const Sound = {
  ctx: null, master: null, muted: false, drone: null,
  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.8;
    this.master.connect(this.ctx.destination);
  },
  // همهمة منخفضة مستمرة (جو التشويق)
  startDrone() {
    if (!this.ctx || this.drone) return;
    const c = this.ctx, g = c.createGain(), f = c.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 180;
    g.gain.value = 0; g.gain.linearRampToValueAtTime(0.16, c.currentTime + 3);
    [55, 55.6, 82.4].forEach(fr => {
      const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.connect(f); o.start();
    });
    const lfo = c.createOscillator(), lg = c.createGain();
    lfo.frequency.value = 0.12; lg.gain.value = 60; lfo.connect(lg); lg.connect(f.frequency); lfo.start();
    f.connect(g); g.connect(this.master); this.drone = g;
  },
  tone(freq, dur = 0.08, type = 'square', vol = 0.06, slideTo = null) {
    if (!this.ctx) return;
    const c = this.ctx, o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  },
  type()  { this.tone(900 + Math.random() * 500, 0.03, 'square', 0.025); },
  click() { this.tone(520, 0.06, 'triangle', 0.08); },
  // إنذار عند الخطأ
  alarm() { [0, 0.28].forEach(d => setTimeout(() => this.tone(880, 0.26, 'sawtooth', 0.09, 330), d * 1000)); },
  // نغمة نجاح
  success() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.tone(f, 0.35, 'triangle', 0.09), i * 90)); },
  pad(i)  { this.tone([262, 330, 392, 440, 523, 587][i % 6], 0.3, 'sine', 0.12); },
  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.8, this.ctx.currentTime, 0.05);
  }
};

/* =========================================================
   ٤) الخلفية: جزيئات + حبيبات الفيلم + شاشات غرفة التحكم
   ========================================================= */
function initBackground() {
  // --- حبيبات الفيلم (Noise) تُرسم مرة وحدة ---
  const n = document.createElement('canvas'); n.width = n.height = 180;
  const nx = n.getContext('2d'), img = nx.createImageData(180, 180);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  nx.putImageData(img, 0, 0);
  $('.fx-grain').style.backgroundImage = `url(${n.toDataURL()})`;

  // --- نصوص برمجية خافتة على الشاشات المنحنية ---
  const hex = () => Math.random().toString(16).slice(2, 10).toUpperCase();
  document.querySelectorAll('.mon pre').forEach(pre => {
    let s = '';
    for (let i = 0; i < 60; i++) s += `0x${hex()}  ${['ACCESS', 'DENIED', 'LOCK', 'TRACE', 'SYS'][i % 5]}  ${hex()}\n`;
    pre.textContent = s;
    gsap.to(pre, { y: -600, duration: 40, ease: 'none', repeat: -1 });
  });

  // --- جزيئات غبار حمراء وذهبية ---
  const cv = $('#bg'), cx = cv.getContext('2d');
  let W, H, parts = [];
  const resize = () => {
    W = cv.width = innerWidth * devicePixelRatio; H = cv.height = innerHeight * devicePixelRatio;
    parts = Array.from({ length: Math.min(110, Math.floor(innerWidth / 12)) }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.8 + .4) * devicePixelRatio,
      vy: -(Math.random() * .35 + .08) * devicePixelRatio, vx: (Math.random() - .5) * .2,
      a: Math.random() * .6 + .2, gold: Math.random() < .3
    }));
  };
  resize(); addEventListener('resize', resize);
  (function loop() {
    cx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.y += p.vy; p.x += p.vx;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      cx.fillStyle = p.gold ? `rgba(255,190,90,${p.a})` : `rgba(255,40,60,${p.a})`;
      cx.shadowBlur = 12; cx.shadowColor = p.gold ? '#ffb547' : '#ff1f3d';
      cx.fill();
    }
    requestAnimationFrame(loop);
  })();
}

/* =========================================================
   ٥) أدوات مساعدة: انتقال، رسائل، وميض، عقوبة
   ========================================================= */
function show(html, onReady) {
  // انتقال سينمائي مع خلل بصري بين المشاهد
  const old = stage.firstElementChild;
  const swap = () => {
    stage.innerHTML = html;
    const el = stage.firstElementChild;
    el.classList.add('glitch');
    setTimeout(() => el.classList.remove('glitch'), 500);
    gsap.from(el.children, { y: 30, opacity: 0, duration: .7, stagger: .09, ease: 'power3.out' });
    onReady && onReady(el);
  };
  if (old) gsap.to(old, { opacity: 0, y: -20, filter: 'blur(6px)', duration: .3, onComplete: swap });
  else swap();
}

let toastT;
function toast(msg, bad = false, ms = 3200) {
  const t = $('#toast'); t.textContent = msg; t.classList.toggle('bad', bad);
  gsap.killTweensOf(t);
  gsap.to(t, { opacity: 1, y: 0, duration: .35 });
  clearTimeout(toastT);
  toastT = setTimeout(() => gsap.to(t, { opacity: 0, y: 40, duration: .35 }), ms);
}

function flashRed() {
  gsap.fromTo('.fx-flash', { opacity: 1 }, { opacity: 0, duration: .8, ease: 'power2.out' });
}

// خصم وقت (خطأ / تلميح)
function penalty(min) {
  state.endAt -= min * 60000;
  const tm = $('#timer');
  gsap.fromTo(tm, { scale: 1.25, color: '#ff3b4f' }, { scale: 1, color: '', duration: .6, clearProps: 'color,scale' });
  updateTimer();
}

// إجابة خاطئة
function wrong(el, msg) {
  state.mistakes++;
  Sound.alarm(); flashRed();
  if (el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
  penalty(CONFIG.wrongPenalty);
  toast(msg || `إجابة خاطئة… خسرت ${CONFIG.wrongPenalty} دقيقة`, true);
}

/* =========================================================
   ٦) العداد التنازلي
   ========================================================= */
function startTimer() {
  state.endAt = Date.now() + CONFIG.totalMinutes * 60000;
  clearInterval(state.timerId);
  state.timerId = setInterval(updateTimer, 250);
  updateTimer();
}
function remainingMs() { return Math.max(0, state.endAt - Date.now()); }
function fmt(ms) {
  const s = Math.ceil(ms / 1000), m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
function updateTimer() {
  if (state.over) return;
  const ms = remainingMs();
  const tm = $('#timer');
  tm.textContent = fmt(ms);
  tm.classList.toggle('danger', ms < CONFIG.dangerMinutes * 60000);
  if (ms <= 0) endGame(false, CONFIG.loseTextTime);
}

/* =========================================================
   ٧) أيقونات الأقفال (التقدم)
   ========================================================= */
const lockSVG = (open, gold, red = false) => `
<svg viewBox="0 0 30 34">
  <path d="M8 15 V10 a7 7 0 0 1 14 0 ${open ? 'V6' : 'V15'}" fill="none" stroke="${gold ? '#f3c56b' : red ? '#ff2a45' : '#7a2a32'}" stroke-width="3" stroke-linecap="round"
    ${open ? 'transform="translate(0,-4)"' : ''}/>
  <rect x="3" y="15" width="24" height="18" rx="4" fill="${gold ? 'url(#lg)' : red ? '#5a0010' : '#2a0a0e'}" stroke="${gold ? '#ffe2a3' : red ? '#ff4a5e' : '#7a2a32'}" stroke-width="1.5"/>
  <circle cx="15" cy="23" r="2.6" fill="${gold ? '#5a3000' : red ? '#ff4a5e' : '#7a2a32'}"/>
  <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9b0"/><stop offset="1" stop-color="#c47e22"/></linearGradient></defs>
</svg>`;

function renderLocks() {
  $('#locks').innerHTML = CONFIG.rooms.map((r, i) => {
    const done = state.solved.includes(i);
    return `<div class="lock" title="الغرفة ${i + 1}">${lockSVG(done, done)}${done ? `<span class="dg">${r.digit}</span>` : ''}</div>`;
  }).join('');
}

/* =========================================================
   ٨) المقدمة
   ========================================================= */
function intro() {
  state.phase = 'intro';
  show(`
    <section class="screen intro">
      <div class="intro-lock">${lockSVG(false, false, true)}</div>
      <div class="sys">// SYSTEM ALERT · UNKNOWN ACCESS DETECTED</div>
      <div class="typed" id="typed"></div>
      <div class="title-big">الشيفرة الأخيرة</div>
      <div class="title-en">THE LAST CODE</div>
      <button class="btn" id="startBtn">ابدأ</button>
    </section>`, el => {
    const box = $('#typed', el);
    typeLines(box, CONFIG.introLines, () => {
      gsap.to('.title-big', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
      gsap.to('.title-en', { opacity: 1, duration: 1, delay: .3 });
      gsap.fromTo('#startBtn', { opacity: 0, scale: .8 }, { opacity: 1, scale: 1, duration: .6, delay: .6, ease: 'back.out(2)' });
    });
    $('#startBtn', el).onclick = startGame;
  });
}

// كتابة النص حرفاً حرفاً (آلة كاتبة)
function typeLines(box, lines, done) {
  let li = 0, ci = 0;
  const lineEls = lines.map(() => { const d = document.createElement('div'); box.appendChild(d); return d; });
  const cursor = document.createElement('span'); cursor.className = 'cursor';
  const step = () => {
    if (li >= lines.length) { done && done(); return; }
    const line = lines[li];
    ci++;
    lineEls[li].textContent = line.slice(0, ci);
    lineEls[li].appendChild(cursor);
    if (line[ci - 1] !== ' ') Sound.type();
    if (ci >= line.length) {
      // تلوين الكلمات المهمة بعد اكتمال السطر
      lineEls[li].innerHTML = line
        .replace('45 دقيقة', '<span class="hot">45 دقيقة</span>')
        .replace('الشيفرة الأخيرة', '<span class="gold">الشيفرة الأخيرة</span>');
      li++; ci = 0;
      setTimeout(step, 420);
    } else setTimeout(step, 34);
  };
  step();
}

// النقر على المقدمة يشغّل الصوت (المتصفح يحتاج تفاعل)
function startGame() {
  Sound.init(); Sound.startDrone(); Sound.success();
  Object.assign(state, { room: 0, solved: [], over: false, attemptsLeft: CONFIG.vaultAttempts, hintsUsed: 0, mistakes: 0 });
  document.body.classList.remove('win-mode', 'lose-mode');
  $('#hud').classList.remove('hidden');
  gsap.from('#hud', { y: -80, opacity: 0, duration: .8, ease: 'power3.out' });
  renderLocks();
  startTimer();
  enterRoom(0);
}

/* =========================================================
   ٩) الغرف
   ========================================================= */
function roomHead(r, i) {
  return `<div class="room-head">
      <div class="room-tag">ROOM 0${i + 1} / 05</div>
      <h1 class="room-title">${r.title} <span class="accent">${r.accent}</span></h1>
      <p class="room-story">${r.story}</p>
    </div>`;
}

function setSceneNumber(txt) {
  const n = $('.scene-num');
  gsap.to(n, { opacity: 0, duration: .2, onComplete: () => { n.textContent = txt; gsap.to(n, { opacity: 1, duration: .8 }); } });
}

function enterRoom(i) {
  state.phase = 'room'; state.room = i;
  $('#hintBtn').classList.remove('hidden');
  setSceneNumber('0' + (i + 1));
  const r = CONFIG.rooms[i];
  ROOMS[r.type](r, i);
}

// عند حل الغرفة
function solveRoom(i) {
  if (state.solved.includes(i)) return;
  state.solved.push(i);
  Sound.success();
  renderLocks();
  gsap.fromTo('#locks .lock:nth-child(' + (i + 1) + ')', { scale: 1.8 }, { scale: 1, duration: .7, ease: 'back.out(3)' });
  state.phase = 'fragment';
  const r = CONFIG.rooms[i];
  const last = i === CONFIG.rooms.length - 1;
  show(`
    <section class="screen fragment">
      <div class="frag-lock">${lockSVG(true, true)}</div>
      <div class="frag-title">تم فك القفل ${i + 1} من 5</div>
      <div class="frag-sub">الجزء المستعاد من الشيفرة</div>
      <div class="frag-digit">${r.digit}</div>
      <button class="btn gold" id="nextBtn">${last ? 'إلى الخزنة' : 'الغرفة التالية'}</button>
    </section>`, el => {
    gsap.fromTo('.frag-digit', { scale: 2.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1, ease: 'expo.out', delay: .2 });
    gsap.fromTo('.frag-lock svg', { rotate: -25, scale: .4 }, { rotate: 0, scale: 1, duration: 1, ease: 'elastic.out(1,.5)' });
    $('#nextBtn', el).onclick = () => { Sound.click(); last ? vault() : enterRoom(i + 1); };
  });
}

const ROOMS = {
  /* ---------- الغرفة 1: عجلة قيصر ---------- */
  caesar(r, i) {
    const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let shift = 0;
    const decode = (s, k) => s.replace(/[A-Z]/g, ch => A[(A.indexOf(ch) - k + 26) % 26]);
    // رسم العجلة: الحلقة الخارجية ثابتة (النص الأصلي) والداخلية تدور (المشفّر)
    const ring = (rad, size, color, cls) => A.split('').map((ch, k) => {
      const ang = k * 360 / 26;
      return `<text x="0" y="${-rad}" transform="rotate(${ang})" text-anchor="middle" dominant-baseline="middle"
        font-family="Mono,monospace" font-weight="700" font-size="${size}" fill="${color}" class="${cls}">${ch}</text>`;
    }).join('');
    show(`
      <section class="screen">
        ${roomHead(r, i)}
        <div class="console caesar">
          <div>
            <div class="wheel-wrap">
              <svg viewBox="-170 -170 340 340">
                <circle r="160" fill="rgba(20,4,6,.9)" stroke="rgba(255,181,71,.55)" stroke-width="2"/>
                <circle r="122" fill="rgba(60,6,12,.9)" stroke="rgba(255,50,70,.6)" stroke-width="2"/>
                <circle r="86" fill="rgba(15,3,5,.95)" stroke="rgba(255,50,70,.35)"/>
                <g>${ring(141, 19, '#ffd58a', '')}</g>
                <g id="inner">${ring(104, 17, '#ff4a5e', '')}</g>
                <path d="M0 -168 L-9 -184 L9 -184 Z" fill="#ffb547"/>
                <text y="-6" text-anchor="middle" font-family="Mono,monospace" font-size="13" fill="#a98d8a">PLAIN ↔ CIPHER</text>
                <text y="22" text-anchor="middle" font-family="Mono,monospace" font-weight="700" font-size="30" fill="#ffe2a3" id="wheelShift">+0</text>
              </svg>
            </div>
            <div class="wheel-ctrl">
              <button class="round" id="rotR" aria-label="تدوير">⟳</button>
              <div class="shift-val" id="shiftVal">0</div>
              <button class="round" id="rotL" aria-label="تدوير عكسي">⟲</button>
            </div>
          </div>
          <div class="cipher-box">
            <div class="label">النص المشفّر</div>
            <div class="big-code">${r.cipher}</div>
            <div class="label" style="margin-top:22px">بعد فك التشفير</div>
            <div class="big-code plain" id="plain">${decode(r.cipher, 0)}</div>
            <div class="clue">${r.clue}</div>
            <div class="answer-row"><button class="btn" id="checkBtn">تأكيد الإزاحة</button></div>
          </div>
        </div>
      </section>`, el => {
      const upd = () => {
        $('#shiftVal').textContent = shift;
        $('#wheelShift').textContent = '+' + shift;
        $('#plain').textContent = decode(r.cipher, shift);
        // الحرف المشفّر X يقابل الحرف الأصلي (X - shift)، فندوّر الحلقة الداخلية عكس عقارب الساعة
        gsap.to('#inner', { rotation: -shift * 360 / 26, svgOrigin: '0 0', duration: .45, ease: 'power3.out' });
        Sound.click();
      };
      $('#rotR').onclick = () => { shift = (shift + 1) % 26; upd(); };
      $('#rotL').onclick = () => { shift = (shift + 25) % 26; upd(); };
      $('#checkBtn').onclick = () => {
        if (shift === r.shift) {
          toast(r.reveal); solveRoom(i);
        } else wrong($('.console'), 'الكلمة ما زالت مشفّرة… خسرت دقيقة');
      };
    });
  },

  /* ---------- الغرفة 2: التحويل من الثنائي ---------- */
  binary(r, i) {
    const w = [128, 64, 32, 16, 8, 4, 2, 1];
    show(`
      <section class="screen">
        ${roomHead(r, i)}
        <div class="console">
          <div class="label mono" style="direction:ltr">ENCRYPTED_FILE.bin</div>
          <div class="bits">${r.bits.split('').map((b, k) =>
            `<div class="bit ${b === '1' ? 'one' : 'zero'}" data-w="${w[k]}"><div class="v">${b}</div><div class="w">${w[k]}</div></div>`).join('')}
          </div>
          <div class="sum">اضغط على الخانات لتجمع أوزانها: <b id="sum">0</b></div>
          <div class="answer-row">
            <input class="answer-input" id="ans" inputmode="numeric" maxlength="3" placeholder="؟" />
            <button class="btn" id="checkBtn">فك الملف</button>
          </div>
        </div>
      </section>`, el => {
      el.querySelectorAll('.bit').forEach(b => b.onclick = () => {
        b.classList.toggle('on'); Sound.click();
        const s = [...el.querySelectorAll('.bit.on')].reduce((a, x) => a + (+x.dataset.w), 0);
        $('#sum').textContent = s;
      });
      const check = () => {
        const v = toLatinDigits($('#ans').value.trim());
        if (v !== '' && +v === r.answer) solveRoom(i);
        else { wrong($('.console')); $('#ans').select(); }
      };
      $('#checkBtn').onclick = check;
      $('#ans').onkeydown = e => { if (e.key === 'Enter') check(); };
    });
  },

  /* ---------- الغرفة 3: نمط الشبكة ---------- */
  sequence(r, i) {
    const all = [...r.sequence, '?'];
    show(`
      <section class="screen">
        ${roomHead(r, i)}
        <div class="console">
          <div class="net" id="net"><svg id="netSvg"></svg></div>
          <div class="label" style="margin-top:6px">اختر العقدة المفقودة</div>
          <div class="options">${r.options.map(o => `<button class="opt" data-v="${o}">${o}</button>`).join('')}</div>
        </div>
      </section>`, el => {
      const net = $('#net'), svg = $('#netSvg');
      // توزيع العقد بشكل متعرج من اليسار لليمين (اتجاه الإشارة)
      const place = () => {
        const W = net.clientWidth, H = net.clientHeight, n = all.length;
        net.querySelectorAll('.node').forEach(x => x.remove());
        let lines = '';
        const pts = all.map((v, k) => [W * (0.1 + 0.8 * k / (n - 1)), H * (k % 2 ? 0.7 : 0.3)]);
        pts.forEach((p, k) => {
          if (k) lines += `<line x1="${pts[k - 1][0]}" y1="${pts[k - 1][1]}" x2="${p[0]}" y2="${p[1]}" stroke="url(#ng)" stroke-width="3" stroke-dasharray="8 8" class="ln"/>`;
          const d = document.createElement('div');
          d.className = 'node' + (all[k] === '?' ? ' q' : ''); d.textContent = all[k];
          d.style.left = p[0] + 'px'; d.style.top = p[1] + 'px';
          net.appendChild(d);
        });
        svg.innerHTML = `<defs><linearGradient id="ng"><stop offset="0" stop-color="#ff2a45"/><stop offset="1" stop-color="#ffb547"/></linearGradient></defs>${lines}`;
      };
      place();
      addEventListener('resize', place);
      gsap.to('.ln', { strokeDashoffset: -64, duration: 2, repeat: -1, ease: 'none' });
      gsap.from('.node', { scale: 0, duration: .6, stagger: .12, ease: 'back.out(2)', delay: .3 });
      el.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        if (+b.dataset.v === r.answer) {
          removeEventListener('resize', place);
          const q = $('.node.q'); q.textContent = r.answer; q.classList.remove('q');
          setTimeout(() => solveRoom(i), 500);
        } else wrong(b);
      });
    });
  },

  /* ---------- الغرفة 4: الذاكرة (سايمون) ---------- */
  memory(r, i) {
    let input = [], playing = false, token = 0;
    show(`
      <section class="screen">
        ${roomHead(r, i)}
        <div class="console">
          <div class="pads locked" id="pads">${r.symbols.map((s, k) => `<button class="pad" data-k="${k}">${s}</button>`).join('')}</div>
          <div class="dots">${r.sequence.map(() => '<span class="dot"></span>').join('')}</div>
          <div class="mem-status" id="memStatus">جاهز؟</div>
          <div class="answer-row"><button class="btn" id="playBtn">شاهد التسلسل</button></div>
        </div>
      </section>`, el => {
      const pads = $('#pads'), status = $('#memStatus');
      const dots = () => el.querySelectorAll('.dot').forEach((d, k) => d.classList.toggle('on', k < input.length));
      const flash = (k, ms = 420) => new Promise(res => {
        const p = pads.children[k]; p.classList.add('lit'); Sound.pad(k);
        setTimeout(() => { p.classList.remove('lit'); setTimeout(res, 180); }, ms);
      });
      // تشغيل التسلسل
      const play = async () => {
        if (playing) return;
        const my = ++token;
        playing = true; input = []; dots();
        pads.classList.add('locked'); $('#playBtn').disabled = true;
        status.textContent = 'راقب جيداً…';
        await new Promise(r2 => setTimeout(r2, 500));
        for (const k of r.sequence) { if (my !== token || !document.body.contains(pads)) return; await flash(k); }
        playing = false; pads.classList.remove('locked'); $('#playBtn').disabled = false;
        status.textContent = 'دورك الآن: أعد التسلسل';
      };
      $('#playBtn').onclick = () => { Sound.click(); play(); };
      pads.querySelectorAll('.pad').forEach(p => p.onclick = () => {
        if (playing) return;
        const k = +p.dataset.k;
        flash(k, 220);
        if (k === r.sequence[input.length]) {
          input.push(k); dots();
          if (input.length === r.sequence.length) { pads.classList.add('locked'); status.textContent = 'تم مطابقة الذاكرة ✓'; setTimeout(() => solveRoom(i), 600); }
        } else {
          input = []; dots();
          wrong($('.console'), 'تسلسل خاطئ… خسرت دقيقة. شاهد مرة ثانية');
          pads.classList.add('locked');
          setTimeout(play, 1200);
        }
      });
    });
  },

  /* ---------- الغرفة 5: القرار + اللغز الأخير ---------- */
  decision(r, i) {
    show(`
      <section class="screen">
        ${roomHead(r, i)}
        <div class="console" id="decBox">
          <div class="doors">${r.choices.map((c, k) => `
            <button class="door ${c.cls}" data-k="${k}">
              <div class="ic">${c.icon}</div><h3>${c.title}</h3><p>${c.text}</p>
            </button>`).join('')}
          </div>
        </div>
      </section>`, el => {
      el.querySelectorAll('.door').forEach(d => d.onclick = () => {
        const c = r.choices[+d.dataset.k];
        if (!c.correct) {
          // الخيار الخاطئ يكلّف وقتاً ويبقى اللاعب في نفس الغرفة
          d.classList.add('used');
          Sound.alarm(); flashRed(); penalty(CONFIG.trapPenalty); state.mistakes++;
          toast(c.result, true, 3800);
          return;
        }
        Sound.click();
        toast(c.result);
        const box = $('#decBox');
        gsap.to(box, { opacity: 0, y: 20, duration: .3, onComplete: () => {
          box.innerHTML = `
            <div class="label">رسالة المبرمج الأخيرة</div>
            <p class="riddle">«${r.riddle}»</p>
            <div class="answer-row">
              <input class="answer-input" id="ans" inputmode="numeric" maxlength="2" placeholder="؟" />
              <button class="btn" id="checkBtn">أجب</button>
            </div>`;
          gsap.to(box, { opacity: 1, y: 0, duration: .5 });
          const check = () => {
            const v = toLatinDigits($('#ans').value.trim());
            if (v !== '' && +v === r.answer) solveRoom(i);
            else { wrong(box); $('#ans').select(); }
          };
          $('#checkBtn').onclick = check;
          $('#ans').onkeydown = e => { if (e.key === 'Enter') check(); };
          $('#ans').focus();
        }});
      });
    });
  }
};

// تحويل الأرقام العربية (٠١٢٣…) إلى أرقام لاتينية حتى تُقبل الإجابة بأي لوحة مفاتيح
function toLatinDigits(s) {
  return s.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
}

/* =========================================================
   ١٠) الخزنة النهائية
   ========================================================= */
function vaultSVG() {
  // باب خزنة دائري بمقبض يدور
  let bolts = '';
  for (let k = 0; k < 12; k++) bolts += `<rect x="-7" y="-196" width="14" height="26" rx="4" fill="#3a1a10" stroke="#c48a3a" transform="rotate(${k * 30})"/>`;
  let ticks = '';
  for (let k = 0; k < 60; k++) ticks += `<line x1="0" y1="-118" x2="0" y2="${k % 5 ? -110 : -102}" stroke="${k % 5 ? '#7a3a2a' : '#f3c56b'}" stroke-width="2" transform="rotate(${k * 6})"/>`;
  return `<svg viewBox="-210 -210 420 420">
    <defs>
      <radialGradient id="vg" cx="40%" cy="35%"><stop offset="0" stop-color="#5a1d16"/><stop offset=".7" stop-color="#1e0707"/><stop offset="1" stop-color="#0c0303"/></radialGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe9b0"/><stop offset=".5" stop-color="#e0a245"/><stop offset="1" stop-color="#8a4f12"/></linearGradient>
    </defs>
    <circle r="205" fill="none" stroke="rgba(255,40,60,.35)" stroke-width="2" id="vRing"/>
    <g id="vDoor">
      ${bolts}
      <circle r="180" fill="url(#vg)" stroke="url(#gold)" stroke-width="6"/>
      <circle r="150" fill="none" stroke="rgba(243,197,107,.35)" stroke-width="2" stroke-dasharray="4 8"/>
      <g id="vDial">${ticks}
        <circle r="92" fill="#140404" stroke="url(#gold)" stroke-width="4"/>
        <g stroke="#e0a245" stroke-width="14" stroke-linecap="round"><line x1="0" y1="-70" x2="0" y2="70"/><line x1="-70" y1="0" x2="70" y2="0"/></g>
        <circle r="26" fill="url(#gold)"/>
      </g>
    </g>
  </svg>`;
}

function vault() {
  state.phase = 'vault';
  $('#hintBtn').classList.add('hidden');
  setSceneNumber('00');
  let code = '';
  show(`
    <section class="screen">
      <div class="room-head">
        <div class="room-tag">FINAL VAULT</div>
        <h1 class="room-title">الخزنة <span class="accent">الأخيرة</span></h1>
        <p class="room-story">أدخل الشيفرة المكوّنة من خمسة أرقام بترتيب الغرف.</p>
      </div>
      <div class="vault">
        <div class="vault-door" id="vaultDoor">${vaultSVG()}</div>
        <div class="console" id="padBox">
          <div class="slots" id="slots">${'<div class="slot"></div>'.repeat(5)}</div>
          <div class="keypad">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="key" data-n="${n}">${n}</button>`).join('')}
            <button class="key del" data-n="del">حذف</button>
            <button class="key" data-n="0">0</button>
            <button class="key enter" data-n="ok">فتح</button>
          </div>
          <div class="collected">الأجزاء المستعادة: <b>${CONFIG.rooms.map(r => r.digit).join(' ')}</b></div>
          <div class="attempts" id="attempts">المحاولات المتبقية: ${state.attemptsLeft}</div>
        </div>
      </div>
    </section>`, el => {
    gsap.to('#vDial', { rotation: 360, svgOrigin: '0 0', duration: 30, repeat: -1, ease: 'none' });
    const draw = () => el.querySelectorAll('.slot').forEach((s, k) => { s.textContent = code[k] || ''; s.classList.toggle('filled', !!code[k]); });
    const press = n => {
      if (state.over) return;
      if (n === 'del') { code = code.slice(0, -1); Sound.click(); }
      else if (n === 'ok') return submit();
      else if (code.length < 5) {
        code += n; Sound.type();
        gsap.to('#vDial', { rotation: '+=' + (36 * (+n + 1)), svgOrigin: '0 0', duration: .4, overwrite: false });
      }
      draw();
    };
    const submit = () => {
      if (code.length < 5) { toast('الشيفرة لازم تكون 5 أرقام', true); return; }
      if (code === FINAL_CODE) return unlockVault();
      state.attemptsLeft--;
      if (state.attemptsLeft <= 0) return endGame(false, CONFIG.loseTextCode);
      code = ''; draw();
      wrong($('#padBox'), `شيفرة خاطئة… تبقّت ${state.attemptsLeft} محاولة`);
      $('#attempts').textContent = `المحاولات المتبقية: ${state.attemptsLeft}`;
    };
    el.querySelectorAll('.key').forEach(k => k.onclick = () => press(k.dataset.n));
    // لوحة المفاتيح الحقيقية أيضاً
    document.onkeydown = e => {
      if (state.phase !== 'vault') return;
      const d = toLatinDigits(e.key);
      if (/^[0-9]$/.test(d)) press(d);
      else if (e.key === 'Backspace') press('del');
      else if (e.key === 'Enter') press('ok');
    };
  });
}

// أنيميشن فتح الخزنة الذهبي
function unlockVault() {
  state.over = true; clearInterval(state.timerId); state.phase = 'end';
  document.onkeydown = null;
  Sound.success();
  const tl = gsap.timeline({ onComplete: () => endGame(true) });
  tl.to('#padBox', { opacity: 0, x: -40, duration: .4 })
    .to('#vDial', { rotation: '+=720', svgOrigin: '0 0', duration: 1.2, ease: 'power3.inOut' }, 0)
    .to('#vaultDoor', { x: () => innerWidth > 900 ? -(innerWidth * 0.22) : 0, duration: .8, ease: 'power3.inOut' }, .3)
    .to('#vRing', { stroke: '#ffd27a', strokeWidth: 8, duration: .4 }, 1)
    .to('#vaultDoor', { scale: 1.25, filter: 'drop-shadow(0 0 60px rgba(255,190,80,.9))', duration: .8 }, 1.1)
    .to('#vDoor', { rotation: 140, svgOrigin: '0 0', scale: .2, opacity: 0, duration: 1, ease: 'power2.in' }, 1.6);
}

/* =========================================================
   ١١) النهايات
   ========================================================= */
function endGame(win, reason) {
  if (state.phase === 'end' && !win && state.over) return;
  state.over = true; state.phase = 'end';
  clearInterval(state.timerId);
  document.onkeydown = null;
  $('#hintBtn').classList.add('hidden');
  clearTimeout(toastT); gsap.set('#toast', { opacity: 0 });
  const left = fmt(remainingMs());
  if (win) {
    document.body.classList.add('win-mode');
    setSceneNumber('');
    show(`
      <section class="screen ending win">
        <div class="frag-lock">${lockSVG(true, true)}</div>
        <h1>${CONFIG.winTitle}</h1>
        <p>${CONFIG.winText}</p>
        <div class="stat">CODE ${FINAL_CODE} · TIME LEFT ${left}</div>
        <button class="btn gold" id="againBtn">العب مرة أخرى</button>
      </section>`, el => {
      const rays = document.createElement('div'); rays.className = 'rays'; document.body.appendChild(rays);
      gsap.to(rays, { opacity: 1, duration: 1.2 });
      gsap.to(rays, { rotation: 360, duration: 60, repeat: -1, ease: 'none' });
      gsap.fromTo('.ending h1', { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4, ease: 'expo.out' });
      goldBurst();
      $('#againBtn', el).onclick = restart;
    });
  } else {
    Sound.alarm(); setTimeout(() => Sound.alarm(), 700);
    document.body.classList.add('lose-mode');
    setSceneNumber('XX');
    flashRed();
    show(`
      <section class="screen ending lose">
        <div class="frag-lock">${lockSVG(false, false)}</div>
        <h1>${CONFIG.loseTitle}</h1>
        <p>${reason || CONFIG.loseTextTime}</p>
        <div class="stat">ACCESS TERMINATED · ${state.solved.length}/5</div>
        <button class="btn" id="againBtn">حاول مرة أخرى</button>
      </section>`, el => {
      gsap.fromTo('.ending h1', { x: -10 }, { x: 10, duration: .06, repeat: 9, yoyo: true, clearProps: 'x' });
      $('#againBtn', el).onclick = restart;
    });
  }
}

// شرارات ذهبية عند الفوز
function goldBurst() {
  for (let k = 0; k < 60; k++) {
    const s = document.createElement('div');
    Object.assign(s.style, { position: 'fixed', left: '50%', top: '45%', width: '6px', height: '6px', borderRadius: '50%',
      background: k % 3 ? '#ffd27a' : '#fff1c9', boxShadow: '0 0 12px #ffb547', zIndex: 30, pointerEvents: 'none' });
    document.body.appendChild(s);
    const a = Math.random() * Math.PI * 2, d = 200 + Math.random() * 450;
    gsap.to(s, { x: Math.cos(a) * d, y: Math.sin(a) * d, opacity: 0, duration: 1.6 + Math.random(), ease: 'power3.out', onComplete: () => s.remove() });
  }
}

function restart() {
  Sound.click();
  document.querySelectorAll('.rays').forEach(r => r.remove());
  document.body.classList.remove('win-mode', 'lose-mode');
  startGame();
}

/* =========================================================
   ١٢) أزرار الشريط العلوي: التلميح وكتم الصوت
   ========================================================= */
$('#hintBtn').onclick = () => {
  if (state.phase !== 'room' || state.over) return;
  state.hintsUsed++;
  penalty(CONFIG.hintPenalty);
  Sound.click();
  toast('💡 ' + CONFIG.rooms[state.room].hint + `  (−${CONFIG.hintPenalty} دقيقة)`, false, 6000);
};
$('#muteBtn').onclick = () => {
  Sound.init(); Sound.setMuted(!Sound.muted);
  $('#muteBtn').textContent = Sound.muted ? '🔇' : '🔊';
};

/* =========================================================
   ١٣) التشغيل
   ========================================================= */
initBackground();
intro();

// للتجربة فقط: نافذة على حالة اللعبة من الـ Console
window.LastCode = { CONFIG, state, FINAL_CODE, setMinutesLeft: m => { state.endAt = Date.now() + m * 60000; updateTimer(); } };
