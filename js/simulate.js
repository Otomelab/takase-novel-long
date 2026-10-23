// 全選択肢を歩き、3つの終わりがすべて到達でき、本文が空にならないことを確認する。
// 使い方: node js/simulate.js
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var Branching = require('./branching.js');
var sandbox = { window: {}, console: console, Branching: Branching };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'scenario.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'scenario2.js'), 'utf8'), sandbox);
var scenario = sandbox.window.SCENARIO;
var scenario2 = sandbox.window.SCENARIO2;

if (!scenario || !scenario.nodes[scenario.start]) {
  console.error('scenario failed to load');
  process.exit(1);
}

function clone(state) {
  return JSON.parse(JSON.stringify(state));
}

var counts = { normal: 0, almost: 0, awkward: 0 };
var routes = [];

function readText(line, state, where) {
  var text = typeof line.text === 'function' ? line.text(state) : line.text;
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('empty text at ' + where);
  }
  if (typeof line.face === 'function') {
    var face = line.face(state);
    if (typeof face !== 'string' || !face) throw new Error('empty face at ' + where);
  }
  return text;
}

function walk(nodeId, state, route) {
  if (route.length > 16) throw new Error('route too deep ' + route.join(' > '));
  if (nodeId === 'pulseGate' && state.bpm < Branching.PULSE_BPM) {
    throw new Error('pulse gate opened at bpm ' + state.bpm + ' via ' + route.join(' > '));
  }
  var node = scenario.nodes[nodeId];
  if (!node) throw new Error('missing node ' + nodeId + ' via ' + route.join(' > '));
  var lines = node.lines;
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (line.when && !line.when(state)) {
      if (line.choices || line.goto) throw new Error('cannot skip a branching line at ' + nodeId);
      continue;
    }
    if (line.apply) Branching.applyDelta(state, line.apply);
    if (line.applyFn) line.applyFn(state);
    readText(line, state, nodeId + '#' + i + ' [' + route.join(' > ') + ']');
    if (line.choices) {
      if (i !== lines.length - 1) throw new Error('choices must be the last line of ' + nodeId);
      var visible = line.choices.filter(function (choice) {
        return !choice.when || choice.when(state);
      });
      if (!visible.length) {
        if (!line.fallback) throw new Error('no visible choice and no fallback at ' + nodeId);
        walk(line.fallback, state, route);
        return;
      }
      visible.forEach(function (choice) {
        if (choice.id === 'c_return' && state.bpm < Branching.PULSE_BPM) {
          throw new Error('pulse return offered at bpm ' + state.bpm);
        }
        var next = clone(state);
        if (choice.apply) Branching.applyDelta(next, choice.apply);
        if (choice.applyFn) choice.applyFn(next);
        var nextRoute = route.concat(choice.id);
        if (choice.next === 'resolve') {
          var ending = Branching.resolveEnding(next);
          if (!counts.hasOwnProperty(ending)) throw new Error('unknown ending ' + ending);
          counts[ending] += 1;
          var note = scenario.notes(next, ending);
          if (!note.secretNote || !note.publicNote || !note.title) {
            throw new Error('incomplete note for ' + ending);
          }
          routes.push({
            route: nextRoute.join(' > '),
            ending: ending,
            bpm: next.bpm,
            reason: next.reason,
            cross: next.cross,
            wall: next.wall,
            slip: next.slip,
            pulseReturned: next.pulseReturned,
            secret: note.secretNote
          });
          walk(scenario.endingNode[ending], next, nextRoute.concat(ending));
        } else {
          walk(choice.next, next, nextRoute);
        }
      });
      return;
    }
    if (line.goto) {
      var dest = typeof line.goto === 'function' ? line.goto(state) : line.goto;
      walk(dest, state, route);
      return;
    }
  }
  if (nodeId.indexOf('end_') === 0 && !lines[lines.length - 1].card) {
    throw new Error(nodeId + ' is missing the ending card');
  }
}

Object.keys(scenario.endingNode).forEach(function (key) {
  if (!scenario.nodes[scenario.endingNode[key]]) {
    throw new Error('ending node missing for ' + key);
  }
});

walk(scenario.start, Branching.initialState(), []);

var expected = {
  'c1_train > c_w_cover > c2_stay > c_h_ask > c_s_step > c_t_skip > c_tea_quiet > c_rain_umbrella > c3_bed > c4_soften > c_n_wait': 'normal',
  'c1_yield > c_w_cover > c2_name > c_h_ask > c_s_joke > c_t_skip > c_hold > c_tea_quiet > c_rain_umbrella > c3_bed > c4_soften > c_n_wait': 'normal',
  'c1_yield > c_w_cover > c2_stay > c_h_ask > c_s_look > c_t_joke > c_t_mend > c_return > c_tea_quiet > c_rain_umbrella > c3_bed > c4_soften > c_n_wait': 'almost',
  'c1_both > c_w_cover > c2_name > c_h_ask > c_s_joke > c_t_buy > c_hold > c_tea_quiet > c_rain_umbrella > c3_ask > c4_soften > c_n_wait': 'almost',
  'c1_train > c_w_cover > c2_pull > c_h_ask > c_s_step > c_t_skip > c_tea_quiet > c_rain_umbrella > c3_leave': 'awkward',
  'c1_yield > c_w_cover > c2_name > c_h_ask > c_s_joke > c_t_skip > c_hold > c_tea_quiet > c_rain_umbrella > c3_bed > c4_stop': 'awkward',
  'c1_yield > c_w_cover > c2_stay > c_h_ask > c_s_look > c_t_joke > c_t_mend > c_return > c_tea_quiet > c_rain_umbrella > c3_leave': 'awkward',
  // 温まったあとに自分で帰る夜は、店じまいの笑顔のまま
  'c1_both > c_w_ask > c2_name > c_h_true > c_s_joke > c_t_buy > c_hold > c_tea_quiet > c_rain_umbrella > c3_leave': 'normal',
  'c1_train > c_w_cover > c2_pull > c_h_ask > c_s_step > c_t_skip > c_tea_quiet > c_rain_umbrella > c3_ask > c4_soften > c_n_wait': 'normal',
  'c1_train > c_w_cover > c2_pull > c_h_ask > c_s_step > c_t_skip > c_tea_quiet > c_rain_umbrella > c3_bed > c4_stop': 'awkward',
  // 新シーン: 三つの場面で距離を置き、うなじでも断った夜は空いた枠。素直に買った夜は笑顔のまま
  'c1_train > c_w_cover > c2_stay > c_h_ask > c_s_step > c_t_skip > c_tea_quiet > c_rain_umbrella > c3_bed > c4_soften > c_n_stop': 'awkward',
  'c1_train > c_w_cover > c2_stay > c_h_ask > c_s_joke > c_t_buy > c_tea_quiet > c_rain_umbrella > c3_bed > c4_soften > c_n_stop': 'normal'
};

var byRoute = {};
routes.forEach(function (row) { byRoute[row.route] = row; });
Object.keys(expected).forEach(function (route) {
  var row = byRoute[route];
  if (!row) {
    var strip = function (r) { return r.replace(/ > c_hold| > c_return/g, ''); };
    var alt = routes.filter(function (r) { return strip(r.route) === strip(route); }).map(function (r) { return r.route + ' => ' + r.ending; });
    throw new Error('missing route ' + route + '\n  candidates:\n  ' + alt.join('\n  '));
  }
  if (row.ending !== expected[route]) {
    throw new Error(route + ' → ' + row.ending + ' (expected ' + expected[route] + ') ' + JSON.stringify(row));
  }
});

['normal', 'almost', 'awkward'].forEach(function (ending) {
  if (!counts[ending]) throw new Error(ending + ' is unreachable');
});

var secrets = {};
routes.forEach(function (row) {
  if (!secrets[row.ending]) secrets[row.ending] = row.secret;
});
if (secrets.normal === secrets.almost || secrets.almost === secrets.awkward || secrets.normal === secrets.awkward) {
  throw new Error('secret notes are not distinct');
}

var calm = Branching.initialState();
var hot = Branching.applyDelta(Branching.initialState(), { bpm: 40, reason: -50, cross: 2 });
var calmNote = scenario.notes(calm, null).secretNote;
var hotNote = scenario.notes(hot, null).secretNote;
if (calmNote === hotNote) throw new Error('provisional notes ignore parameters');

routes.forEach(function (row) {
  if (row.route.indexOf('c_return') < 0) return;
  // 手首を抜いた夜には、脈返しは出ない。意地で始めても、掌を返して雑談・ストレッチでも逃げなければ解放される。
  var ok = /^c1_(yield|both|train) > c_w_\w+ > c2_(stay|name)/.test(row.route);
  if (!ok) throw new Error('pulse return on a cool path: ' + row.route);
});
if (!routes.some(function (row) { return row.route.indexOf('c_return') >= 0; })) {
  throw new Error('pulse return is unreachable');
}
if (byRoute['c1_train > c_w_cover > c2_stay > c_h_ask > c_s_step > c_t_skip > c_tea_quiet > c_rain_umbrella > c3_bed > c4_soften > c_n_wait'].route.indexOf('c_return') >= 0) {
  throw new Error('low-bpm route offered the pulse return');
}

var voiceLines = [];
Object.keys(scenario.nodes).forEach(function (id) {
  scenario.nodes[id].lines.forEach(function (line) {
    if (line.checkVoice) voiceLines.push(line);
  });
});
if (voiceLines.length < 2) throw new Error('expected voice-checked lines');
voiceLines.forEach(function (line) {
  var samples = [90, 70, 52, 30].map(function (reason) {
    var state = Branching.initialState();
    state.reason = reason;
    state.bpm = 100;
    return line.text(state);
  });
  if (samples[0].indexOf('ます') < 0) throw new Error('polite line missing ます: ' + samples[0]);
  if (samples[1].indexOf('……') < 0) throw new Error('cracked line missing a break: ' + samples[1]);
  if (samples[2].indexOf('俺') < 0) throw new Error('mixed line missing 俺: ' + samples[2]);
  if (samples[3].indexOf('です') >= 0 || samples[3].indexOf('ます') >= 0) {
    throw new Error('casual line still polite: ' + samples[3]);
  }
  var unique = {};
  samples.forEach(function (text) { unique[text] = 1; });
  if (Object.keys(unique).length !== 4) throw new Error('speech bands collapsed: ' + samples.join(' / '));
});

function transcript(choiceIds) {
  var state = Branching.initialState();
  var lines = [];
  var guard = 0;
  var ids = choiceIds.slice();
  function step(nodeId) {
    if (guard++ > 40) throw new Error('transcript loop');
    var node = scenario.nodes[nodeId];
    for (var i = 0; i < node.lines.length; i++) {
      var line = node.lines[i];
      if (line.when && !line.when(state)) {
        if (line.choices || line.goto) throw new Error('cannot skip a branching line at ' + nodeId);
        continue;
      }
      if (line.apply) Branching.applyDelta(state, line.apply);
      if (line.applyFn) line.applyFn(state);
      var text = typeof line.text === 'function' ? line.text(state) : line.text;
      lines.push((line.speaker || '　') + '｜' + text);
      if (line.choices) {
        var id = ids.shift();
        var choice = line.choices.filter(function (item) {
          return item.id === id && (!item.when || item.when(state));
        })[0];
        if (!choice) throw new Error('cannot take ' + id + ' at ' + nodeId + ' bpm=' + state.bpm);
        var label = typeof choice.text === 'function' ? choice.text(state) : choice.text;
        lines.push('選択｜' + label);
        if (choice.apply) Branching.applyDelta(state, choice.apply);
        if (choice.next === 'resolve') {
          var ending = Branching.resolveEnding(state);
          lines.push('判定｜' + ending + '　脈' + state.bpm + '　理性' + state.reason + '　' + Branching.speechBand(state.reason));
          step(scenario.endingNode[ending]);
        } else {
          step(choice.next);
        }
        return;
      }
      if (line.goto) {
        step(typeof line.goto === 'function' ? line.goto(state) : line.goto);
        return;
      }
    }
  }
  step(scenario.start);
  if (ids.length) throw new Error('unused choices ' + ids.join(','));
  return lines.join('\n');
}

var normalScript = transcript(['c1_train', 'c_w_cover', 'c2_stay', 'c_h_ask', 'c_s_step', 'c_t_skip', 'c_tea_quiet', 'c_rain_umbrella', 'c3_bed', 'c4_soften', 'c_n_wait']);
var almostScript = transcript(['c1_yield', 'c_w_cover', 'c2_stay', 'c_h_ask', 'c_s_look', 'c_t_joke', 'c_t_mend', 'c_return', 'c_tea_quiet', 'c_rain_umbrella', 'c3_bed', 'c4_soften', 'c_n_wait']);
var awkwardScript = transcript(['c1_train', 'c_w_cover', 'c2_pull', 'c_h_ask', 'c_s_step', 'c_t_skip', 'c_tea_quiet', 'c_rain_umbrella', 'c3_leave']);
// 新シーン: 癖の読み取りと営業トーク。裏カルテに追記が出て、修復の台詞が台本に載る
if (almostScript.indexOf('営業') < 0 || almostScript.indexOf('えくぼが、戻っている') < 0) {
  throw new Error('sales scene (mend) missing from the mend route');
}
if (almostScript.indexOf('右肩だけ') < 0) throw new Error('habit scene missing from the almost route');
var mendSecret = byRoute['c1_yield > c_w_cover > c2_stay > c_h_ask > c_s_look > c_t_joke > c_t_mend > c_return > c_tea_quiet > c_rain_umbrella > c3_bed > c4_soften > c_n_wait'].secret;
if (mendSecret.indexOf('半センチ') < 0 || mendSecret.indexOf('謝られた') < 0) {
  throw new Error('secret note lacks the habit / mend addenda');
}
var plainSecret = byRoute['c1_train > c_w_cover > c2_stay > c_h_ask > c_s_step > c_t_skip > c_tea_quiet > c_rain_umbrella > c3_bed > c4_soften > c_n_wait'].secret;
if (plainSecret.indexOf('古傷') >= 0) throw new Error('bounce addendum shown without the bounce');
// 新シーン: お茶と雨。台本に載り、選んだ雨の選択肢だけが裏カルテに追記される
if (almostScript.indexOf('ほうじ茶') < 0 || almostScript.indexOf('雨音') < 0) {
  throw new Error('tea / rain scenes missing from the almost route');
}
var rainAddenda = { c_rain_umbrella: '傘は貸した', c_rain_stay: '止むまで、いてもいいですか', c_rain_run: 'タオルを渡した' };
routes.forEach(function (row) {
  Object.keys(rainAddenda).forEach(function (id) {
    var chosen = row.route.indexOf(id) >= 0;
    var shown = row.secret.indexOf(rainAddenda[id]) >= 0;
    if (chosen !== shown) throw new Error('rain addendum mismatch for ' + id + ' at ' + row.route);
  });
});
['大円筋', '小胸筋', '橈骨動脈'].forEach(function (term) {
  if (normalScript.indexOf(term) < 0) throw new Error('normal route never names ' + term);
});
if (almostScript.indexOf('だろ') < 0) throw new Error('almost route never breaks into casual speech');
if (almostScript.indexOf('ます') < 0) throw new Error('almost route never starts polite');
if (almostScript.indexOf('由衣さんが決めて') < 0) throw new Error('almost invite still decides for her');
if (almostScript.indexOf('今のは、施術じゃない。悪い') < 0) throw new Error('almost route never pulls the hand back');
if (almostScript.indexOf('名前のないところには、行かない') < 0) throw new Error('almost route lost the named-muscle line');
['来るだろ', '震えたまま', '止まらない', '漏らせ', '時計、どおり'].forEach(function (banned) {
  if (almostScript.indexOf(banned) >= 0) throw new Error('almost route still contains ' + banned);
});
if (normalScript.indexOf('漏らせ') >= 0 || normalScript.indexOf('時計、どおり') >= 0) {
  throw new Error('typos remain on the normal route');
}
if (normalScript.indexOf('時計どおり') < 0 || normalScript.indexOf('漏らしている') < 0) {
  throw new Error('typo fixes missing on the normal route');
}
if (normalScript.indexOf('施術じゃない') >= 0) throw new Error('calm route showed the slip apology');
if (awkwardScript.indexOf('c_return') >= 0 || awkwardScript.indexOf('橈骨動脈に当てる') >= 0) {
  throw new Error('awkward distance route took his pulse');
}
var stopScript = transcript(['c1_yield', 'c_w_cover', 'c2_name', 'c_h_ask', 'c_s_joke', 'c_t_skip', 'c_hold', 'c_tea_quiet', 'c_rain_umbrella', 'c3_bed', 'c4_stop']);
if (stopScript.indexOf('今のは、施術じゃない。悪い') < 0) throw new Error('stop route never pulls the hand back');
if (stopScript.indexOf('語尾と同時に離れた') < 0) throw new Error('stop route does not release at her word');
if (stopScript.indexOf('断られたあとに、彼は触っていない') < 0) throw new Error('stop route still reads as ignoring a no');
['居座', '半秒、遅かった', '来るだろ', '震えたまま'].forEach(function (banned) {
  if (stopScript.indexOf(banned) >= 0) throw new Error('stop route still contains ' + banned);
});

function survey(tree, state, resolveEnding) {
  var bucket = {};
  var found = [];
  function walk2(nodeId, current, route) {
    if (route.length > 12) throw new Error('session2 route too deep ' + route.join(' > '));
    if ((nodeId === 'pulseGate' || nodeId === 's2_pulse') && current.bpm < Branching.PULSE_BPM) {
      throw new Error('pulse gate opened at bpm ' + current.bpm + ' via ' + route.join(' > '));
    }
    var node = tree.nodes[nodeId];
    if (!node) throw new Error('missing node ' + nodeId);
    var lines = node.lines;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (line.when && !line.when(current)) {
        if (line.choices || line.goto) throw new Error('cannot skip a branching line at ' + nodeId);
        continue;
      }
      if (line.apply) Branching.applyDelta(current, line.apply);
      if (line.applyFn) line.applyFn(current);
      var text = readText(line, current, nodeId + '#' + i + ' [' + route.join(' > ') + ']');
      ['来るだろ', '居座', '震えたまま', '漏らせ', '時計、どおり', '半秒、遅かった'].forEach(function (banned) {
        if (text.indexOf(banned) >= 0) throw new Error('banned 「' + banned + '」 in ' + nodeId + ': ' + text);
      });
      if (line.choices) {
        var visible = line.choices.filter(function (choice) {
          return !choice.when || choice.when(current);
        });
        if (!visible.length) {
          if (!line.fallback) throw new Error('no visible choice at ' + nodeId);
          walk2(line.fallback, current, route);
          return;
        }
        visible.forEach(function (choice) {
          if ((choice.id === 'c_return' || choice.id === 's2_return') && current.bpm < Branching.PULSE_BPM) {
            throw new Error('pulse return offered at bpm ' + current.bpm);
          }
          var next = clone(current);
          if (choice.apply) Branching.applyDelta(next, choice.apply);
          var nextRoute = route.concat(choice.id);
          if (choice.next === 'resolve') {
            var ending = resolveEnding(next);
            bucket[ending] = (bucket[ending] || 0) + 1;
            var note = tree.notes(next, ending);
            if (!note.secretNote || !note.publicNote) throw new Error('incomplete note ' + ending);
            found.push({ route: nextRoute.join(' > '), ending: ending, prior: next.prior, bpm: next.bpm, reason: next.reason, secret: note.secretNote });
            walk2(tree.endingNode[ending], next, nextRoute.concat(ending));
          } else {
            walk2(choice.next, next, nextRoute);
          }
        });
        return;
      }
      if (line.goto) {
        walk2(typeof line.goto === 'function' ? line.goto(current) : line.goto, current, route);
        return;
      }
    }
    if (nodeId.indexOf('end_') === 0 && !lines[lines.length - 1].card) throw new Error(nodeId + ' missing card');
  }
  walk2(tree.start, state, []);
  return { counts: bucket, routes: found };
}

function transcript2(prior, choiceIds) {
  var state = Branching.initialState2(prior);
  var lines = [];
  var guard = 0;
  var ids = choiceIds.slice();
  function step(nodeId) {
    if (guard++ > 40) throw new Error('transcript2 loop');
    var node = scenario2.nodes[nodeId];
    for (var i = 0; i < node.lines.length; i++) {
      var line = node.lines[i];
      if (line.when && !line.when(state)) continue;
      if (line.apply) Branching.applyDelta(state, line.apply);
      if (line.applyFn) line.applyFn(state);
      var text = typeof line.text === 'function' ? line.text(state) : line.text;
      lines.push((line.speaker || '　') + '｜' + text);
      if (line.choices) {
        var id = ids.shift();
        var choice = line.choices.filter(function (item) { return item.id === id; })[0];
        if (!choice) throw new Error('cannot take ' + id + ' at ' + nodeId + ' bpm=' + state.bpm + ' prior=' + prior);
        var label = typeof choice.text === 'function' ? choice.text(state) : choice.text;
        lines.push('選択｜' + label);
        if (choice.apply) Branching.applyDelta(state, choice.apply);
        if (choice.next === 'resolve') {
          var ending = Branching.resolveSession2(state);
          lines.push('判定｜' + ending + '　脈' + state.bpm + '　理性' + state.reason + '　' + Branching.speechBand(state.reason));
          step(scenario2.endingNode[ending]);
        } else step(choice.next);
        return;
      }
      if (line.goto) {
        step(typeof line.goto === 'function' ? line.goto(state) : line.goto);
        return;
      }
    }
  }
  step(scenario2.start);
  if (ids.length) throw new Error('unused choices ' + ids.join(','));
  return lines.join('\n');
}

['normal', 'almost', 'awkward'].forEach(function (prior) {
  Object.keys(scenario2.nodes).forEach(function (nodeId) {
    scenario2.nodes[nodeId].lines.forEach(function (line, index) {
      if (line.speaker !== '高瀬') return;
      [{}, { wall: 2 }, { cross: 1 }, { cross: 2 }, { revoked: 1 }, { slip: 1 }, { wristOff: 1 }, { pulseReturned: 1 }].forEach(function (extra) {
        var probe = Branching.initialState2(prior);
        Object.keys(extra).forEach(function (key) { probe[key] = extra[key]; });
        if (line.when && !line.when(probe)) return;
        var samples = [90, 70, 52, 30].map(function (reason) {
          var state = Branching.initialState2(prior);
          Object.keys(extra).forEach(function (key) { state[key] = extra[key]; });
          state.reason = reason;
          return typeof line.text === 'function' ? line.text(state) : line.text;
        });
        var where = prior + ' ' + nodeId + '#' + index + ' ' + JSON.stringify(extra);
        function politeMark(text) {
          return text.indexOf('です') >= 0 || text.indexOf('ます') >= 0 || text.indexOf('ください') >= 0 || text.indexOf('ません') >= 0 || text.indexOf('ました') >= 0;
        }
        if (!politeMark(samples[0])) throw new Error('polite missing 丁寧語 @ ' + where + ' / ' + samples[0]);
        if (samples[1].indexOf('……') < 0) throw new Error('cracked missing break @ ' + where + ' / ' + samples[1]);
        if (samples[2].indexOf('俺') < 0) throw new Error('mixed missing 俺 @ ' + where + ' / ' + samples[2]);
        if (politeMark(samples[3])) throw new Error('casual still polite @ ' + where + ' / ' + samples[3]);
        var unique = {};
        samples.forEach(function (text) { unique[text] = 1; });
        if (Object.keys(unique).length !== 4) throw new Error('bands collapsed @ ' + where + ' / ' + samples.join(' / '));
      });
    });
  });
});

var session2 = {};
['normal', 'almost', 'awkward'].forEach(function (prior) {
  session2[prior] = survey(scenario2, Branching.initialState2(prior), Branching.resolveSession2);
  ['keep', 'near', 'leave'].forEach(function (ending) {
    if (!session2[prior].counts[ending]) throw new Error(prior + ' cannot reach ' + ending);
  });
});

var expected2 = {
  normal: {
    's2_work > s2_stay > s2_hold > s2_t_light > s2_h_laugh > s2_tea_work > s2_bed > s2_soften': 'keep',
    's2_easy > s2_name > s2_return > s2_t_light > s2_h_laugh > s2_tea_work > s2_bed > s2_soften': 'near',
    's2_quiet > s2_pull > s2_t_light > s2_h_laugh > s2_tea_work > s2_leave': 'leave'
  },
  almost: {
    's2_work > s2_pull > s2_t_light > s2_h_laugh > s2_tea_work > s2_bed > s2_soften': 'keep',
    's2_easy > s2_stay > s2_hold > s2_t_light > s2_h_laugh > s2_tea_work > s2_ask > s2_soften': 'near',
    's2_quiet > s2_pull > s2_t_light > s2_h_laugh > s2_tea_work > s2_leave': 'leave'
  },
  awkward: {
    's2_work > s2_stay > s2_t_light > s2_h_laugh > s2_tea_work > s2_bed > s2_soften': 'keep',
    's2_easy > s2_name > s2_return > s2_t_light > s2_h_laugh > s2_tea_work > s2_bed > s2_soften': 'near',
    's2_quiet > s2_pull > s2_t_light > s2_h_laugh > s2_tea_work > s2_leave': 'leave'
  }
};
Object.keys(expected2).forEach(function (prior) {
  var byRoute = {};
  session2[prior].routes.forEach(function (row) { byRoute[row.route] = row; });
  Object.keys(expected2[prior]).forEach(function (route) {
    var row = byRoute[route];
    if (!row) {
      var strip2 = function (r) { return r.replace(/ > s2_hold| > s2_return/g, ''); };
      var alt2 = session2[prior].routes.filter(function (r) { return strip2(r.route) === strip2(route); }).map(function (r) { return r.route + ' => ' + r.ending; });
      throw new Error('missing ' + prior + ' ' + route + '\n  candidates:\n  ' + alt2.join('\n  '));
    }
    if (row.ending !== expected2[prior][route]) {
      throw new Error(prior + ' ' + route + ' → ' + row.ending + ' expected ' + expected2[prior][route] + ' ' + JSON.stringify(row));
    }
  });
});

var openNormal = transcript2('normal', ['s2_work', 's2_stay', 's2_hold', 's2_t_light', 's2_h_laugh', 's2_tea_work', 's2_bed', 's2_soften']);
var openAlmost = transcript2('almost', ['s2_quiet', 's2_pull', 's2_t_light', 's2_h_laugh', 's2_tea_work', 's2_leave']);
var openAwkward = transcript2('awkward', ['s2_work', 's2_stay', 's2_t_light', 's2_h_laugh', 's2_tea_work', 's2_bed', 's2_soften']);
var nearAlmost = transcript2('almost', ['s2_easy', 's2_stay', 's2_hold', 's2_t_light', 's2_h_laugh', 's2_tea_work', 's2_ask', 's2_soften']);
var stopNormal = transcript2('normal', ['s2_easy', 's2_name', 's2_return', 's2_t_light', 's2_h_laugh', 's2_tea_work', 's2_bed', 's2_stop']);
if (openNormal.indexOf('いつもの肩甲骨') < 0) throw new Error('normal session2 lost the familiar scapula');
if (openNormal.indexOf('甘やかしますか') < 0) throw new Error('normal opening is not a light offer');
if (openNormal.indexOf('由衣さんが決めてください') >= 0) throw new Error('normal opening still ends on the shared consent line');
if (openAlmost.indexOf('させていただきます') < 0 || openAlmost.indexOf('小野寺様') < 0) throw new Error('almost opening is not over-correct');
if (openAlmost.indexOf('どこまで見るかは……由衣さん') < 0) throw new Error('almost opening does not slip to 由衣さん');
if (openAlmost.indexOf('一拍、店の中が黙る') < 0) throw new Error('almost opening has no beat of silence');
if (openAlmost.indexOf('失礼しました。小野寺様') < 0) throw new Error('almost opening does not correct back to 小野寺様');
if (openAlmost.indexOf('俺') >= 0) throw new Error('stiff almost route broke into 俺');
if (openAwkward.indexOf('ご無沙汰') < 0 || openAwkward.indexOf('空いた週') < 0) throw new Error('awkward opening lost the gap');
if (openAwkward.indexOf('肩甲骨、見ますか') < 0 || openAwkward.indexOf('返事は、待ちます') < 0) throw new Error('awkward opening does not ask once and wait');
if (openAwkward.indexOf('由衣さんが決めてください') >= 0) throw new Error('awkward opening still ends on the shared consent line');
if (openNormal === openAlmost || openAlmost === openAwkward || openNormal === openAwkward) throw new Error('openings are not distinct');
[null, 'keep', 'near', 'leave'].forEach(function (ending) {
  var secret = scenario2.notes(Branching.initialState2('almost'), ending).secretNote;
  if (secret.indexOf('小野寺様が由衣さんまで落ちた') < 0) throw new Error('almost chart misses the self-catch at ' + ending);
});
if (scenario2.notes(Branching.initialState2('normal'), null).secretNote.indexOf('由衣さんまで落ちた') >= 0) {
  throw new Error('normal chart recorded the almost slip');
}
if (nearAlmost.indexOf('照明が落ちる') < 0) throw new Error('near ending does not go dark');
if (stopNormal.indexOf('語尾と同時に離れた') < 0) throw new Error('refusal does not release the hand');
['肩甲骨', '小胸筋', '大円筋', '橈骨動脈'].forEach(function (term) {
  if (openNormal.indexOf(term) < 0) throw new Error('normal session2 never names ' + term);
});

var rebuff2 = transcript2('normal', ['s2_work', 's2_stay', 's2_hold', 's2_t_deflect', 's2_h_trust', 's2_tea_ask', 's2_bed', 's2_soften']);
if (rebuff2.indexOf('話の入口を閉めた') < 0) throw new Error('night 2 deflect does not close the door');
if (rebuff2.indexOf('前回と同じ癖') < 0 || rebuff2.indexOf('安心します') < 0) throw new Error('night 2 habit scene lost the reassurance');
if (rebuff2.indexOf('お茶') < 0) throw new Error('night 2 tea scene missing');
['almost', 'awkward'].forEach(function (prior) {
  var t = transcript2(prior, ['s2_work', 's2_pull', 's2_t_open','s2_h_hide', 's2_tea_work', 's2_leave']);
  if (t.indexOf('湯気の立つカップ') < 0) throw new Error(prior + ' night 2 tea narration missing');
});

console.log('paths ' + routes.length);
console.log('endings ' + JSON.stringify(counts));
console.log('canonical routes ok');
console.log('session2 ' + JSON.stringify({
  normal: session2.normal.counts,
  almost: session2.almost.counts,
  awkward: session2.awkward.counts
}));
routes.forEach(function (row) {
  console.log(row.ending + '\t' + row.route + '\tbpm=' + row.bpm + ' reason=' + row.reason + ' cross=' + row.cross + ' wall=' + row.wall + ' slip=' + row.slip + ' pulse=' + row.pulseReturned);
});
fs.writeFileSync('/tmp/vn-transcripts.txt',
  '=== 店じまいの笑顔 ===\n' + normalScript +
  '\n\n=== 寸前 ===\n' + almostScript +
  '\n\n=== 空いた枠 ===\n' + awkwardScript +
  '\n\n=== 空いた枠（やめてください） ===\n' + stopScript + '\n');
