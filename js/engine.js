// クリックで進むノベル。本文は状態の関数になれる。数値は Branching だけが更新する。
(function () {
  var FACES = {
    takase: {
      '真顔': 'assets/expressions/takase/01_真顔.png',
      '笑顔': 'assets/expressions/takase/02_笑顔.png',
      '怒り': 'assets/expressions/takase/03_怒り.png',
      '驚き': 'assets/expressions/takase/04_驚き.png',
      '照れ': 'assets/expressions/takase/05_照れ.png',
      '困り': 'assets/expressions/takase/06_困り.png',
      '楽しみ': 'assets/expressions/takase/07_楽しみ.png',
      '不機嫌': 'assets/expressions/takase/08_不機嫌.png',
      '色気': 'assets/expressions/takase/09_色気.png',
      '甘え': 'assets/expressions/takase/10_甘え.png'
    },
    yui: {
      '笑顔': 'assets/expressions/yui/training_expression_01.png',
      '微笑み': 'assets/expressions/yui/training_expression_02.png',
      '嬉しい': 'assets/expressions/yui/training_expression_03.png',
      'しょんぼり': 'assets/expressions/yui/training_expression_04.png',
      'おちゃめ': 'assets/expressions/yui/training_expression_05.png',
      'むすっ': 'assets/expressions/yui/training_expression_06.png',
      '困り': 'assets/expressions/yui/training_expression_07.png',
      '赤面': 'assets/expressions/yui/training_expression_08.png',
      '照れ': 'assets/expressions/yui/training_expression_09.png',
      '息切れ': 'assets/expressions/yui/training_expression_10.png'
    }
  };

  function Novel(scenario) {
    this.scenario = scenario;
    this.delay = new URLSearchParams(location.search).has('instant') ? 0 : 28;
    this.auto = false;
    this.history = [];
    this.typing = false;
    this.full = '';
    this.typeTimer = null;
    this.autoTimer = null;
    this.nodeId = null;
    this.lineIndex = 0;
    this.endingId = null;
    this.state = Branching.initialState();
    this.lastReason = this.state.reason;
    this.cache();
    this.bind();
    this.syncMeters();
  }

  Novel.prototype.cache = function () {
    this.root = document.getElementById('game');
    this.bg = document.getElementById('bg-image');
    this.pulse = document.getElementById('pulse');
    this.fade = document.getElementById('fade');
    this.sprites = {
      takase: document.getElementById('sprite-takase'),
      yui: document.getElementById('sprite-yui')
    };
    this.speaker = document.getElementById('speaker');
    this.lineEl = document.getElementById('line');
    this.cursor = document.getElementById('cursor');
    this.choices = document.getElementById('choices');
    this.bpmEl = document.getElementById('bpm');
    this.reasonEl = document.getElementById('reason-num');
    this.reasonFill = document.getElementById('reason-fill');
    this.heart = document.getElementById('heart');
    this.heartIcon = document.getElementById('heart-icon');
    this.title = document.getElementById('title');
    this.card = document.getElementById('card');
    this.log = document.getElementById('log');
    this.logList = document.getElementById('log-list');
    this.btnSound = document.getElementById('btn-sound');
    this.btnAuto = document.getElementById('btn-auto');
  };

  Novel.prototype.bind = function () {
    var self = this;
    document.getElementById('box').addEventListener('click', function () {
      self.onAdvance();
    });
    document.getElementById('btn-start').addEventListener('click', function () {
      novelSound.ensure();
      self.startSession1();
    });
    document.getElementById('night2').addEventListener('click', function (event) {
      var button = event.target.closest('button[data-prior]');
      if (!button) return;
      novelSound.ensure();
      self.startSession2(button.getAttribute('data-prior'));
    });
    this.btnSound.addEventListener('click', function (event) {
      event.stopPropagation();
      var on = novelSound.toggle();
      self.btnSound.textContent = on ? 'BGM オン' : 'BGM';
      self.btnSound.classList.toggle('is-on', on);
    });
    this.btnAuto.addEventListener('click', function (event) {
      event.stopPropagation();
      self.auto = !self.auto;
      self.btnAuto.classList.toggle('is-on', self.auto);
      if (self.auto && !self.typing && self.choices.hidden && !self.current().choices) {
        self.queueAuto();
      }
    });
    document.getElementById('btn-log').addEventListener('click', function (event) {
      event.stopPropagation();
      self.openLog();
    });
    document.getElementById('log-close').addEventListener('click', function () {
      self.log.hidden = true;
    });
    this.heart.addEventListener('click', function (event) {
      event.stopPropagation();
      self.openChart();
    });
    document.getElementById('card-chart').addEventListener('click', function () {
      self.openChart();
    });
    document.getElementById('card-retry').addEventListener('click', function () {
      if (self.scenario.session === 2) self.startSession2(self.state.prior);
      else self.startSession1();
    });
    document.getElementById('card-next').addEventListener('click', function () {
      if (self.endingId) self.startSession2(self.endingId);
    });
    document.getElementById('card-title').addEventListener('click', function () {
      self.toTitle();
    });
    window.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'ArrowRight') return;
      if (event.target.closest && event.target.closest('button')) return;
      if (!self.title.hidden || !self.card.hidden || !self.log.hidden) return;
      if (document.getElementById('chart')) return;
      event.preventDefault();
      self.onAdvance();
    });
  };

  var NIGHT_LABEL = { normal: '店じまいの笑顔', almost: '寸前', awkward: '空いた枠' };
  var NIGHT_KEY = 'slot016.night1';

  function readNight() {
    try {
      var value = localStorage.getItem(NIGHT_KEY);
      if (value === 'normal' || value === 'almost' || value === 'awkward') return value;
    } catch (error) { /* 保存できない環境では、タイトルの選択だけで進む */ }
    return '';
  }

  function writeNight(value) {
    if (value !== 'normal' && value !== 'almost' && value !== 'awkward') return;
    try { localStorage.setItem(NIGHT_KEY, value); } catch (error) { /* 同上 */ }
  }

  Novel.prototype.refreshTitle = function () {
    var saved = readNight();
    var slot = document.getElementById('saved-night');
    if (!slot) return;
    slot.textContent = saved
      ? '保存された1回目：' + NIGHT_LABEL[saved]
      : '1回目の記録は、まだありません';
  };

  Novel.prototype.begin = function (state) {
    this.clearTimers();
    this.state = state;
    this.lastReason = state.reason;
    this.history = [];
    this.endingId = null;
    this.auto = false;
    this.btnAuto.classList.remove('is-on');
    this.title.hidden = true;
    this.card.hidden = true;
    this.log.hidden = true;
    this.choices.hidden = true;
    this.fade.classList.remove('is-on');
    this.root.classList.remove('is-title');
    this.root.dataset.ending = '';
    var chart = document.getElementById('chart');
    if (chart) chart.remove();
    this.syncMeters();
    this.goto(this.scenario.start);
  };

  Novel.prototype.startSession1 = function () {
    this.scenario = window.SCENARIO;
    this.begin(Branching.initialState());
  };

  Novel.prototype.startSession2 = function (prior) {
    if (prior !== 'normal' && prior !== 'almost' && prior !== 'awkward') prior = readNight() || 'normal';
    writeNight(prior);
    this.scenario = window.SCENARIO2;
    this.begin(Branching.initialState2(prior));
  };

  Novel.prototype.toTitle = function () {
    this.clearTimers();
    this.card.hidden = true;
    this.choices.hidden = true;
    this.title.hidden = false;
    this.root.classList.add('is-title');
    this.fade.classList.remove('is-on');
    this.refreshTitle();
  };

  Novel.prototype.clearTimers = function () {
    if (this.typeTimer) clearInterval(this.typeTimer);
    if (this.autoTimer) clearTimeout(this.autoTimer);
    this.typeTimer = null;
    this.autoTimer = null;
    this.typing = false;
  };

  Novel.prototype.goto = function (id) {
    if (id === 'resolve') {
      var resolve = this.scenario.resolveEnding || Branching.resolveEnding;
      this.endingId = resolve(this.state);
      this.root.dataset.ending = this.endingId;
      id = this.scenario.endingNode[this.endingId];
    }
    this.nodeId = id;
    this.lineIndex = 0;
    this.present();
  };

  Novel.prototype.current = function () {
    return this.scenario.nodes[this.nodeId].lines[this.lineIndex];
  };

  Novel.prototype.present = function () {
    var line = this.current();
    if (line.when && !line.when(this.state)) {
      if (line.choices || line.goto) throw new Error('cannot skip a branching line');
      if (this.lineIndex + 1 >= this.scenario.nodes[this.nodeId].lines.length) {
        throw new Error('skipped the last line of ' + this.nodeId);
      }
      this.lineIndex += 1;
      this.present();
      return;
    }
    this.settled = false;
    if (line.apply) Branching.applyDelta(this.state, line.apply);
    if (line.applyFn) line.applyFn(this.state);
    this.syncMeters();
    novelSound.setBpm(this.state.bpm);
    if (line.bg) {
      var bg = typeof line.bg === 'function' ? line.bg(this.state) : line.bg;
      if (bg) this.setBg(bg);
    }
    if (line.effect) {
      var effect = typeof line.effect === 'function' ? line.effect(this.state) : line.effect;
      if (effect) this.playEffect(effect);
    }
    this.showSprite(line);
    this.showSpeaker(line.speaker);
    var text = typeof line.text === 'function' ? line.text(this.state) : line.text;
    this.history.push({ speaker: line.speaker || '', text: text });
    this.choices.hidden = true;
    this.type(text);
  };

  Novel.prototype.setBg = function (url) {
    if (this.bg.dataset.bg === url) return;
    this.bg.dataset.bg = url;
    this.bg.style.backgroundImage = 'url("' + url + '")';
    this.bg.classList.remove('is-zooming');
    void this.bg.offsetWidth;
    this.bg.classList.add('is-zooming');
  };

  Novel.prototype.playEffect = function (name) {
    var self = this;
    if (name === 'pulse') {
      this.pulse.classList.remove('is-on');
      void this.pulse.offsetWidth;
      this.pulse.classList.add('is-on');
    } else if (name === 'fade') {
      this.fade.classList.add('is-on');
    }
  };

  Novel.prototype.showSprite = function (line) {
    var who = line.chara;
    var face = typeof line.face === 'function' ? line.face(this.state) : line.face;
    ['takase', 'yui'].forEach(function (name) {
      var img = this.sprites[name];
      var on = who === name;
      img.classList.toggle('on', on);
      if (on && face && FACES[name][face]) img.src = FACES[name][face];
    }, this);
  };

  Novel.prototype.showSpeaker = function (name) {
    this.speaker.textContent = name || '';
    this.speaker.className = name === '由衣' ? 'is-yui' : name ? 'is-takase' : 'is-none';
    if (name === '高瀬') this.speaker.dataset.band = Branching.speechBand(this.state.reason);
    else delete this.speaker.dataset.band;
  };

  Novel.prototype.type = function (text) {
    var self = this;
    this.full = text;
    this.typing = true;
    this.cursor.hidden = true;
    if (this.typeTimer) clearInterval(this.typeTimer);
    if (this.delay === 0) {
      this.lineEl.textContent = text;
      this.finishType();
      return;
    }
    var index = 0;
    this.lineEl.textContent = '';
    this.typeTimer = setInterval(function () {
      index += 1;
      self.lineEl.textContent = text.slice(0, index);
      if (index >= text.length) self.finishType();
    }, this.delay);
  };

  Novel.prototype.finishType = function () {
    if (this.settled) return;
    this.settled = true;
    if (this.typeTimer) clearInterval(this.typeTimer);
    this.typeTimer = null;
    this.lineEl.textContent = this.full;
    this.typing = false;
    var line = this.current();
    if (line.choices) {
      this.cursor.hidden = true;
      this.showChoices(line.choices);
      return;
    }
    this.cursor.hidden = false;
    if (this.auto && !line.card) this.queueAuto();
  };

  Novel.prototype.showChoices = function (choices) {
    var self = this;
    var visible = choices.filter(function (choice) {
      return !choice.when || choice.when(self.state);
    });
    if (!visible.length) {
      this.choices.hidden = true;
      var fallback = this.current().fallback;
      if (fallback) this.goto(fallback);
      return;
    }
    this.choices.hidden = false;
    this.choices.innerHTML = '';
    var head = document.createElement('p');
    head.className = 'choices-head';
    head.textContent = 'どうする';
    this.choices.appendChild(head);
    visible.forEach(function (choice) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice';
      button.dataset.choice = choice.id;
      button.textContent = typeof choice.text === 'function' ? choice.text(self.state) : choice.text;
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        novelSound.tap();
        self.choose(choice);
      });
      self.choices.appendChild(button);
    });
  };

  Novel.prototype.choose = function (choice) {
    this.choices.hidden = true;
    if (choice.apply) Branching.applyDelta(this.state, choice.apply);
    if (choice.applyFn) choice.applyFn(this.state);
    this.syncMeters();
    var label = typeof choice.text === 'function' ? choice.text(this.state) : choice.text;
    this.history.push({ speaker: '由衣', text: '（' + label + '）' });
    this.goto(choice.next);
  };

  Novel.prototype.onAdvance = function () {
    if (this.title && !this.title.hidden) return;
    if (!this.card.hidden || !this.log.hidden) return;
    if (!this.choices.hidden) return;
    novelSound.tap();
    if (this.autoTimer) clearTimeout(this.autoTimer);
    if (this.typing) {
      this.finishType();
      return;
    }
    var line = this.current();
    if (line.card) {
      this.showCard();
      return;
    }
    if (line.goto) {
      var dest = typeof line.goto === 'function' ? line.goto(this.state) : line.goto;
      this.goto(dest);
      return;
    }
    if (this.lineIndex + 1 < this.scenario.nodes[this.nodeId].lines.length) {
      this.lineIndex += 1;
      this.present();
    }
  };

  Novel.prototype.queueAuto = function () {
    var self = this;
    if (this.autoTimer) clearTimeout(this.autoTimer);
    this.autoTimer = setTimeout(function () {
      if (self.auto && !self.typing) self.onAdvance();
    }, 1600);
  };

  Novel.prototype.syncMeters = function () {
    var state = this.state;
    this.bpmEl.textContent = String(state.bpm);
    this.reasonEl.textContent = String(state.reason);
    this.reasonFill.style.width = state.reason + '%';
    this.heartIcon.style.animationDuration = Math.max(0.35, 60 / state.bpm) + 's';
    this.root.dataset.heat = state.reason < 45 || state.bpm >= 125 ? 'high' : state.bpm >= 105 ? 'mid' : 'low';
    this.root.dataset.band = Branching.speechBand(state.reason);
    this.root.classList.toggle('is-slip', !!state.slip);
    if (state.reason < this.lastReason) {
      this.reasonFill.classList.remove('is-drop');
      void this.reasonFill.offsetWidth;
      this.reasonFill.classList.add('is-drop');
    }
    this.lastReason = state.reason;
  };

  Novel.prototype.openLog = function () {
    var list = this.logList;
    list.innerHTML = '';
    this.history.forEach(function (entry) {
      var block = document.createElement('article');
      var who = document.createElement('p');
      who.className = 'log-who' + (entry.speaker === '由衣' ? ' is-yui' : entry.speaker ? '' : ' is-none');
      who.textContent = entry.speaker || '　';
      var body = document.createElement('p');
      body.className = 'log-body';
      body.textContent = entry.text;
      block.appendChild(who);
      block.appendChild(body);
      list.appendChild(block);
    });
    this.log.hidden = false;
    list.scrollTop = list.scrollHeight;
  };

  Novel.prototype.openChart = function () {
    var old = document.getElementById('chart');
    if (old) old.remove();
    var note = this.scenario.notes(this.state, this.endingId);
    var state = this.state;
    var chart = document.createElement('section');
    chart.id = 'chart';
    chart.setAttribute('role', 'dialog');
    chart.setAttribute('aria-label', '裏カルテ');

    var bar = document.createElement('header');
    var label = document.createElement('p');
    label.textContent = '裏カルテ';
    var close = document.createElement('button');
    close.type = 'button';
    close.textContent = '閉じる';
    close.addEventListener('click', function () { chart.remove(); });
    bar.appendChild(label);
    bar.appendChild(close);

    var title = document.createElement('h2');
    title.textContent = note.title;

    var stats = document.createElement('p');
    stats.className = 'chart-stats';
    stats.textContent = '脈 ' + state.bpm + '　理性 ' + state.reason + '　越えた ' + state.cross + '　引いた ' + state.wall;

    chart.appendChild(bar);
    chart.appendChild(title);
    chart.appendChild(stats);
    chart.appendChild(noteBlock('公式の記録', note.publicNote, 'is-public'));
    chart.appendChild(noteBlock('高瀬の非公開メモ', note.secretNote, 'is-secret'));
    this.root.appendChild(chart);
  };

  function noteBlock(heading, body, kind) {
    var section = document.createElement('section');
    section.className = 'note ' + kind;
    var h = document.createElement('h3');
    h.textContent = heading;
    section.appendChild(h);
    body.split('\n').forEach(function (paragraph) {
      if (!paragraph) return;
      var p = document.createElement('p');
      p.textContent = paragraph;
      section.appendChild(p);
    });
    return section;
  }

  Novel.prototype.showCard = function () {
    var info = this.scenario.endings[this.endingId];
    var state = this.state;
    if (this.scenario.session === 1) writeNight(this.endingId);
    this.card.hidden = false;
    this.card.dataset.ending = this.endingId;
    document.getElementById('card-kicker').textContent = typeof info.kicker === 'function' ? info.kicker(state) : info.kicker;
    document.getElementById('card-name').textContent = typeof info.name === 'function' ? info.name(state) : info.name;
    document.getElementById('card-next').hidden = this.scenario.session !== 1;
    document.getElementById('card-blurb').textContent = info.blurb(state);
    document.getElementById('card-stats').textContent =
      '脈 ' + state.bpm + '　理性 ' + state.reason + '　越えた ' + state.cross + '　引いた ' + state.wall;
    if (this.auto) {
      this.auto = false;
      this.btnAuto.classList.remove('is-on');
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    window.game = new Novel(window.SCENARIO);
    window.game.refreshTitle();
  });
})();
