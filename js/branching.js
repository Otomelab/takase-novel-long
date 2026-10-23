// パラメータとエンディング判定。シナリオの選択肢はここを通ってだけ数値を動かす。
// almost  … ベッドまで残って、由衣が自分で越えたまま、理性が持たない
// awkward … 引いたまま終わる、脈を返したのに逃げる、先に滲んだあと拒まれる
// normal  … 規則が守られたまま店じまいする
// 口調は理性の高さそのもの。80以上が丁寧語、そこから段階的にタメ口へ崩れる。
(function (root) {
  var FLAGS = { slip: 1, revoked: 1, pulseReturned: 1, sawBed: 1, asked: 1, wristOff: 1 };

  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  function initialState() {
    return {
      bpm: 86,
      reason: 82,
      cross: 0,
      wall: 0,
      slip: 0,
      revoked: 0,
      pulseReturned: 0,
      sawBed: 0,
      asked: 0,
      wristOff: 0
    };
  }

  // 2回目。prior は1回目の終わりで、数値では動かさない。
  function initialState2(prior) {
    var state = initialState();
    state.prior = prior === 'almost' || prior === 'awkward' ? prior : 'normal';
    if (state.prior === 'almost') {
      state.bpm = 98;
      state.reason = 100;
    } else if (state.prior === 'awkward') {
      state.bpm = 74;
      state.reason = 94;
    } else {
      state.bpm = 84;
      state.reason = 88;
    }
    return state;
  }

  // 脈は高いほど上がりにくい。90 までは書いた量のまま、上限に近づくほど効きが弱くなる（下限 35%）。
  function easeUp(bpm, amount) {
    var scale = Math.max(0.35, Math.min(1, (BPM_MAX - bpm) / (BPM_MAX - 90)));
    return Math.round(amount * scale);
  }

  function applyDelta(state, delta) {
    if (!delta) return state;
    Object.keys(delta).forEach(function (key) {
      if (FLAGS[key]) state[key] = delta[key];
      else if (key === 'bpm' && delta[key] > 0) state.bpm += easeUp(state.bpm, delta[key]);
      else state[key] = (state[key] || 0) + delta[key];
    });
    state.bpm = clamp(Math.round(state.bpm), 64, BPM_MAX);
    state.reason = clamp(Math.round(state.reason), 0, 100);
    state.cross = Math.max(0, state.cross | 0);
    state.wall = Math.max(0, state.wall | 0);
    return state;
  }

  // 理性が 62 を下回ったまま深い施術に入ると、吐息と半秒だけ熱が漏れる。
// 高瀬は自分で手を戻す。拒まれたあとに触り続けることはない。
  var SLIP_REASON = 62;
  // 「触れてほしい」まで言ってベッドに残り、理性が 58 以下なら、笑顔のさよならには戻れない。
  var ALMOST_REASON = 58;
  // 脈を返したまま施術に残り、理性が 68 以下なら、暗転まで行く。
  var RETURN_ALMOST = 68;
  // ベッドに入らず、理性が 70 を下回ったまま距離を置くと、次の予約は入らない。
  var FLEE_REASON = 70;
  // 由衣の脈がこの値以上のときだけ、高瀬の橈骨動脈を取り返す選択肢が出る。
  var PULSE_BPM = 110;
  // 運動中のときめきとして無理のない上限。これ以上は上がらない。
  var BPM_MAX = 135;

  function speechBand(reason) {
    if (reason >= 80) return 'polite';
    if (reason >= 64) return 'cracked';
    if (reason >= 46) return 'mixed';
    return 'casual';
  }

  function resolveEnding(state) {
    var stayed = !!state.sawBed && !state.revoked;
    if (stayed && state.pulseReturned && state.reason <= RETURN_ALMOST) return 'almost';
    if (stayed && state.cross >= 3 && state.reason <= ALMOST_REASON) return 'almost';
    if (state.pulseReturned && !state.sawBed) return 'awkward';
    if (state.revoked && state.slip) return 'awkward';
    if (state.wall >= 4 && state.cross < 3) return 'awkward';
    if (!state.sawBed && state.wall >= 2 && state.reason < FLEE_REASON && state.cross < 3) return 'awkward';
    return 'normal';
  }

  // 2回目。暗転は由衣が越えたあとのみ。拒まれた掌は、語尾と同時に離れた夜として扱う。
  function resolveSession2(state) {
    var stayed = !!state.sawBed && !state.revoked;
    var sheCrossed = state.cross >= 3 || !!state.pulseReturned;
    if (stayed && sheCrossed && state.reason <= 68) return 'near';
    if (state.revoked && (state.slip || state.prior === 'awkward')) return 'leave';
    if (state.pulseReturned && !state.sawBed) return 'leave';
    if (!state.sawBed && state.wall >= 4) return 'leave';
    if (state.prior === 'awkward' && !state.sawBed && state.wall >= 2 && state.cross < 3) return 'leave';
    return 'keep';
  }

  var api = {
    FLAGS: FLAGS,
    SLIP_REASON: SLIP_REASON,
    ALMOST_REASON: ALMOST_REASON,
    RETURN_ALMOST: RETURN_ALMOST,
    FLEE_REASON: FLEE_REASON,
    PULSE_BPM: PULSE_BPM,
    BPM_MAX: BPM_MAX,
    speechBand: speechBand,
    initialState: initialState,
    initialState2: initialState2,
    applyDelta: applyDelta,
    resolveEnding: resolveEnding,
    resolveSession2: resolveSession2
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.Branching = api;
})(typeof window !== 'undefined' ? window : global);
