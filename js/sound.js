// アンビエントの低い和音と、BPMに合わせた二拍の心音。ファイルの音声素材は使わない。
(function (root) {
  function Sound() {
    this.ctx = null;
    this.enabled = false;
    this.bpm = 86;
    this.master = null;
    this.oscs = [];
    this.heartTimer = null;
  }

  Sound.prototype.ensure = function () {
    var Ctx = root.AudioContext || root.webkitAudioContext;
    if (!Ctx) return null;
    if (!this.ctx) this.ctx = new Ctx();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  };

  Sound.prototype.toggle = function () {
    if (!this.ensure()) return false;
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.startPad();
      this.startHeart();
    } else {
      this.stopPad();
      this.stopHeart();
    }
    return this.enabled;
  };

  Sound.prototype.startPad = function () {
    if (!this.ctx || this.master) return;
    var ctx = this.ctx;
    var master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 2.4);
    master.connect(ctx.destination);
    this.master = master;
    this.oscs = [];
    // A1 / A2 / E3。低くて、密室に残る和音。
    [55, 110, 164.81].forEach(function (freq, index) {
      var osc = ctx.createOscillator();
      var filter = ctx.createBiquadFilter();
      var gain = ctx.createGain();
      osc.type = index === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      filter.type = 'lowpass';
      filter.frequency.value = 280;
      gain.gain.value = 0.22 / (index + 1);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      osc.start();
      this.oscs.push(osc);
    }, this);
  };

  Sound.prototype.stopPad = function () {
    var ctx = this.ctx;
    var master = this.master;
    var oscs = this.oscs;
    this.master = null;
    this.oscs = [];
    if (master && ctx) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    }
    root.setTimeout(function () {
      oscs.forEach(function (osc) {
        try { osc.stop(); } catch (e) { /* already stopped */ }
      });
    }, 500);
  };

  Sound.prototype.setBpm = function (bpm) {
    this.bpm = bpm;
    if (this.enabled) this.startHeart();
  };

  Sound.prototype.startHeart = function () {
    var self = this;
    this.stopHeart();
    var interval = Math.max(280, (60 / this.bpm) * 1000);
    this.heartTimer = root.setInterval(function () {
      self.thump();
    }, interval);
  };

  Sound.prototype.stopHeart = function () {
    if (this.heartTimer) {
      root.clearInterval(this.heartTimer);
      this.heartTimer = null;
    }
  };

  Sound.prototype.thump = function () {
    if (!this.ctx || !this.enabled) return;
    var now = this.ctx.currentTime;
    this.beat(now, 52, 0.16, 0.22);
    this.beat(now + 0.12, 40, 0.14, 0.14);
  };

  Sound.prototype.beat = function (time, freq, duration, volume) {
    var ctx = this.ctx;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    var filter = ctx.createBiquadFilter();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(28, time + duration);
    filter.type = 'lowpass';
    filter.frequency.value = 120;
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + duration + 0.02);
  };

  Sound.prototype.tap = function () {
    if (!this.ctx || !this.enabled) return;
    var ctx = this.ctx;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    var now = ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(720, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.03);
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  };

  root.novelSound = new Sound();
})(typeof window !== 'undefined' ? window : global);
