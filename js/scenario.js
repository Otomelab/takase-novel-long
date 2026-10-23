// 最終枠の一夜。口調は理性の高さで崩れる（js/branching.js の speechBand）。
// 脈が PULSE_BPM 以上のときだけ、由衣が橈骨動脈を取り返す。
// 「肙骨動脈」は解剖名ではないので、本編と同じ橈骨動脈で統一している。
(function () {
  var B = window.Branching || (typeof Branching !== 'undefined' ? Branching : null);

  function band(state) {
    return B.speechBand(state.reason);
  }

  function say(state, lines) {
    var text = lines[band(state)];
    if (!text) throw new Error('missing speech band ' + band(state));
    return text;
  }

  function takaseFace(state) {
    var key = band(state);
    if (key === 'casual') return '色気';
    if (key === 'mixed') return '照れ';
    if (key === 'cracked') return '真顔';
    return '笑顔';
  }

  function maskLine(state) {
    var key = band(state);
    if (key === 'polite') return '口は、まだ丁寧語のまま。です、ます、が死んでない。';
    if (key === 'cracked') return '「です」が、ところどころ落ちてる。まだ取り繕えてるつもりでいる。';
    if (key === 'mixed') return '俺、が漏れた。丁寧語に戻そうとして、戻せてない。';
    return 'もうタメ口だ。由衣さん、が、由衣、まで落ちかけてる。';
  }

  function pulseComment(state) {
    if (state.wall >= 3) {
      return say(state, {
        polite: 'ああ、すみません。プロの癖です。橈骨動脈、無理に取らなくて大丈夫ですよ',
        cracked: 'すみません。……癖です。橈骨動脈、無理に取らなくて、いいです',
        mixed: '悪い。……癖で触った。橈骨動脈、俺、もう数えないです',
        casual: '悪かった。橈骨動脈、勝手に取るな、だよな'
      });
    }
    if (state.cross >= 2) {
      return say(state, {
        polite: 'ご自分で言えますね。呼吸は戻っています。橈骨動脈だけ、別の速さをしています',
        cracked: '自分で、言えるんですね。……呼吸は戻ってる。橈骨動脈だけ、別',
        mixed: '自分で言うんだ。……呼吸、戻ってるのに。橈骨動脈、俺の指の中で暴れてる',
        casual: '自分で言えるじゃん。呼吸は戻ってる。橈骨動脈だけ、嘘がつけない'
      });
    }
    if (state.bpm >= B.PULSE_BPM) {
      return say(state, {
        polite: '呼吸は整っています。なのに橈骨動脈が、まったく落ちません',
        cracked: '呼吸は、整ってる。……橈骨動脈、落ちないです',
        mixed: '呼吸、整ってるだろ。……っ。橈骨動脈が落ちない。俺、ごまかせないです',
        casual: '呼吸は整ってる。橈骨動脈だけ、落ちないだろ'
      });
    }
    return say(state, {
      polite: 'いい落ちです。このくらいなら、運動の残りで説明がつきます',
      cracked: 'いい落ちです。……運動の残り、で説明がつく',
      mixed: 'いい落ちだ。……運動の残り、ってことにしとくです',
      casual: 'いい落ちだ。運動の残りで、説明がつく'
    });
  }

  function inviteText(state) {
    if (state.pulseReturned) {
      return say(state, {
        polite: '今日はこれで店じまいです。今の確認は、記録に残しません。奥へ来るかは、由衣さんが決めてください',
        cracked: '店じまい、なんで。……今の、橈骨動脈。奥へ来るかは、由衣さんが、決めてください',
        mixed: '店じまいだ。……っ、です。今の親指、俺、まだ感じてる。奥、来るかどうかは、由衣さんが決めてください',
        casual: '今の親指は、まだ残ってる。……奥、来るかどうかは、由衣さんが決めて'
      });
    }
    return say(state, {
      polite: '今日はこれで店じまいですので、おまけで少しだけほぐします。奥のベッドへ来るかは、由衣さんが決めてください',
      cracked: '今日はこれで店じまいなんで。……奥のベッドへ来るかは、由衣さんが決めてください',
      mixed: '店じまい、です。……奥に来るかは、由衣さんが決めてください。俺からは、誘わない',
      casual: '店じまいだ。……奥、来るかどうかは、由衣さんが決めて'
    });
  }

  function bedOpen(state) {
    if (state.asked) {
      return say(state, {
        polite: 'わかりました。由衣さんがそう言うまで、こちらからは越えません。今日見るのは、短縮した小胸筋です',
        cracked: '……聞こえました。今日は、まだ越えません。見るのは、小胸筋だけにします',
        mixed: '聞こえた。……越えていい、ってことだよな。でも今日は、まだ。小胸筋だけ、俺は見る',
        casual: '聞こえてる。越えていい夜だ。なのに今日は、まだだ。小胸筋だけ触る'
      });
    }
    if (state.wall >= 3) {
      return say(state, {
        polite: 'うつ伏せでお願いします。今日は深く行きません。痛かったら、すぐ言ってください',
        cracked: 'うつ伏せで。……深くは、行きません。痛かったら、言って',
        mixed: 'うつ伏せ。……深くは行かないです。痛かったら、俺、すぐ止める',
        casual: 'うつ伏せになれ。深くは行かない。痛かったら言え'
      });
    }
    return say(state, {
      polite: 'うつ伏せで、楽にしてください。息を吐いて、仕事はそこに置いてきてください',
      cracked: 'うつ伏せで、楽にして。……息、吐いて。仕事は、置いてきて',
      mixed: 'うつ伏せ。……力、抜け。仕事のことは、俺の前ではいいです',
      casual: 'うつ伏せになれ。力、抜け。仕事は、ここに置いていけ'
    });
  }

  function boundaryText(state) {
    if (state.slip) {
      return '親指が、レギンスの上、太ももの付け根の手前まで滑る。吐息が、うなじに落ちる。半秒。高瀬は自分の手に気づき、掌を小胸筋へ引き戻す。残したのは、その半秒だけだ。';
    }
    if (state.reason < 80) {
      return '大円筋の端で、掌が一拍だけ長くなる。高瀬の呼吸がそこで乱れ、すぐ、整体師の速度に戻る。戻るのに、半秒かかった。';
    }
    return '掌は、大円筋の走行に沿って綺麗に止まった。止めたあとの空気のほうが、触れていた間より濃い。';
  }

  function yuiBed(state) {
    if (state.slip) {
      return 'ん……っ。高瀬さん、息が、当たってました。小胸筋、って言った場所より、下に、熱が……';
    }
    if (state.wall >= 3) {
      return '……大丈夫、です。その、以上は……今日は';
    }
    return 'んっ……大円筋、ひびきます。……声、出して、ごめんなさい';
  }

  function normalNarration(state) {
    if (!state.sawBed) {
      return 'コートの袖に、夜の匂いが戻る。高瀬は引き止めない。引き止めないことが、この人の仕事の優しさだと、由衣はもう知っている。';
    }
    if (state.asked && state.reason > B.ALMOST_REASON) {
      return '「触れてほしい」は空気に残ったまま、掌は小胸筋の上で止まった。越えていい夜に、彼は越えないほうを選んだ。';
    }
    if (state.slip) {
      return '一度滑った掌は、小胸筋の上に戻ったままだ。由衣が力を抜いたのを見て、高瀬はその手を、自分から離した。';
    }
    if (state.reason < 64) {
      return '境界の上で震えていた指が、自分で剥がされる。声は、もう整っていない。それでも手は、離れた。';
    }
    return 'お疲れの挨拶が、えくぼと一緒に戻ってくる。触れられた肩甲骨の熱だけが、コートの下に残る。';
  }

  function normalTakase(state) {
    if (!state.sawBed) {
      return say(state, {
        polite: '了解です。水分を取って、湯船に浸かってください。また肩甲骨が重くなったら、連絡をください',
        cracked: '了解です。……水分、取って。湯船、浸かってください。また重くなったら',
        mixed: 'わかった。……湯船、浸かれ。また来たくなったら、俺に連絡していいです',
        casual: 'わかった。湯船に浸かれ。また肩が死んだら、来い'
      });
    }
    if (state.asked && state.reason > B.ALMOST_REASON) {
      return say(state, {
        polite: 'お言葉は、受け取っています。今日は、まだお答えしません。整体師として、ここまでです',
        cracked: '……聞こえました。今日は、まだ答えません。整体は、ここまでです',
        mixed: '聞こえてる。……今日は答えねえ。っ、ません。整体師のままで、終わる',
        casual: '聞こえてる。今日は答えねえ。整体師のまま、帰す'
      });
    }
    if (state.reason < 64) {
      return say(state, {
        polite: '今日はここまでにします。刺激が強いと、揉み返しが来ますので',
        cracked: '……今日は、ここまでにします。それ以上は、明日の由衣さんが困る',
        mixed: '今日は、ここまでだ。……っ、です。俺が今続けると、止められない',
        casual: '今日はここまでだ。今続けたら、俺が規則を破る'
      });
    }
    return say(state, {
      polite: 'はい、今日はここまでです。時計どおりです。お疲れさまでした',
      cracked: 'はい、ここまでです。……時計どおり。お疲れさまでした',
      mixed: 'ここまで。……です。時計どおりに、終わらす。俺、それだけは守る',
      casual: 'ここまでだ。時計どおりに終わらす。それだけは、守る'
    });
  }

  function normalYui(state) {
    if (!state.sawBed) return '……はい。また、肩が重くなったら、連絡します';
    if (state.asked && state.reason > B.ALMOST_REASON) return '……わかりました。今日は、ありがとうございます';
    if (state.reason < 64) return '……はい。声、掠れてました。……また、来ます';
    return 'ありがとうございました。……また、来ます';
  }

  function almostOpen(state) {
    if (state.pulseReturned) {
      return '由衣の親指が、もう一度、高瀬の橈骨動脈を探す。初回に彼がしたのと、同じ場所。同じ圧。彼は手首を引かない。引かないまま、距離だけが消える。';
    }
    return '「触れてほしい」を、彼は聞き逃さなかった。規則は、客が自分の足で越えてきたら動いていい、だった。額までの距離が、呼吸ひとつ分まで減る。';
  }

  function almostYui(state) {
    if (state.pulseReturned) return '……高瀬さんのも、落ちてない。すごく、速いです';
    return '……高瀬さん。今、整体師の、顔じゃ、ない';
  }

  function almostTakase(state) {
    if (state.pulseReturned) {
      return say(state, {
        polite: '由衣さん。それは、こちらの脈です。数えないでください。……っ',
        cracked: '……数えないで。それ、俺の……。誰のせいだと思ってるんですか',
        mixed: '……っ。誰のせいだと思ってんの。俺の橈骨動脈、由衣が押さえてる',
        casual: '誰のせいだと思ってんの。橈骨動脈、そこに触るな。……触るな、じゃなくて'
      });
    }
    return say(state, {
      polite: '由衣さん、今日は、まだ言葉だけにしてください。これ以上は、整体では、ありません',
      cracked: '……言葉だけ、にして。……これ以上は、整体じゃ、ない',
      mixed: '言葉だけだと思ってた。……俺、もうその顔してられない',
      casual: 'もう、その顔してられない。由衣が、越えたんだ'
    });
  }

  function awkwardOpen(state) {
    if (state.pulseReturned && !state.sawBed) {
      return '親指の熱を自分の手首に残したまま、由衣はコートに手を伸ばす。高瀬の声は、もう丁寧語の位置にいない。その低さが、由衣を扉の外へ急がせる。';
    }
    if (state.slip) {
      return '「やめてください」は小さくて、はっきりしていた。小胸筋に戻していた掌は、その語尾と同時に離れた。遅れたのは、その前だ。吐息がうなじに落ちた半秒を、由衣は見ていた。断られたあとに、彼は触っていない。';
    }
    if (state.wall >= 4 && state.reason >= 80) {
      return '高瀬は最後まで、です、ます、を崩さなかった。崩さなかった丁寧さそのものが、今夜の由衣には遠かった。礼の角度だけが、初回より深い。';
    }
    return '「大丈夫です」は、大丈夫な人の言い方ではなかった。追わない、が規則だ。低い声は、隠せていたとしても、もう遅かった。';
  }

  function awkwardTakase(state) {
    if (state.slip) {
      return say(state, {
        polite: 'はい。今、離しました。先に漏れた息のことは、謝ります。施術は、ここまでです',
        cracked: '……離しました。今です。先の息は、謝ります。今日は、ここまで',
        mixed: '離した。今、です。悪かったのは、その前の息だ。……俺の息だ',
        casual: '離した。今だ。悪かったのは、その前の息だ'
      });
    }
    if (state.pulseReturned) {
      return say(state, {
        polite: '了解しました。気をつけて帰ってください。今夜のことは、こちらから連絡しません',
        cracked: '……了解です。気をつけて。今夜のことは、こっちから、聞かない',
        mixed: '……わかった。追わねえ。……ません。今夜の脈は、俺からは聞かない',
        casual: 'わかった。追わねえ。今夜の脈、俺からは聞かない'
      });
    }
    return say(state, {
      polite: 'わかりました。水分だけ取って、お気をつけてください。次回のご予約は、急がなくて大丈夫です',
      cracked: 'わかりました。……お気をつけて。次回は、急がなくて、いいです',
      mixed: 'わかった。……急がなくていいです。俺から、枠は埋めない',
      casual: 'わかった。枠は、俺からは埋めない。気をつけて帰れ'
    });
  }

  function awkwardYui(state) {
    if (state.slip) return '……先に、息が落ちたのが、わかりました。やめてと言う前の、半秒です。次は、少し間を空けます';
    if (state.pulseReturned) return 'すみません。今日は、ここまでにします。……予定が、読めなくて';
    if (state.reason >= 80) return 'ありがとうございました。とても、勉強になりました';
    return 'ありがとうございました。また、連絡、できるときに';
  }

  function closingPulse(state, tail) {
    return '最後に残った脈は、' + state.bpm + '。理性の残りは、' + state.reason + '。' + tail;
  }

  function secretFor(state, ending) {
    var head = '脈は最後' + state.bpm + 'くらい。俺の残りは' + state.reason + '。' + maskLine(state);
    if (ending === 'almost') {
      if (state.pulseReturned) {
        return '【裏メモ】\n' + head + '\n由衣さんの親指が、俺の橈骨動脈を押さえた。初回、俺がやった手つきを、そのまま返された。\n「誰のせいだと思ってんの」まで言った。あれはもう、整体師の文じゃない。\n越えてきたのは由衣さんの指だ。規則は破ってない。規則のすぐ先で、電気を落とした。\n唇の前までが、今日の記録だ。先は、この紙の外に置く。書いたら、仕事のカルテじゃなくなる。';
      }
      return '【裏メモ】\n' + head + '\n「触れてほしい」と、由衣さんが言った。ベッドの上で、取り消さなかった。\n規則どおりなら、動いていい。動いていい夜に、丁寧語が先に死んだ。\n額を寄せたところまでが記録だ。小胸筋の名前を盾にして、その盾が持たなくなった。\n暗転させたのは俺だ。それ以上は書かない。明日、この人を客とは呼べない。';
    }
    if (ending === 'awkward') {
      if (state.slip) {
        return '【裏メモ】\n' + head + '\n吐息が先に落ちた。半秒、施術の速度に戻れなかった。由衣さんがやめてと言うより前の話だ。\n言われた瞬間、掌は離した。断られたあとに触ってはいない。\n気づかれる。あの人は、自分の脈は隠すのが下手で、俺の乱れには鋭い。\n先に熱が漏れた時点で、終わりだ。翌週の最終枠は、自分で休枠にした。';
      }
      if (state.pulseReturned) {
        return '【裏メモ】\n' + head + '\n脈を返されて、俺の口が先に崩れた。由衣さんはそれを聞いて、コートを掴んだ。\n追わなかった。追わないことだけは、まだ規則の内側だ。\n橈骨動脈に残った親指の形が、店じまいのあとでも消えない。\nLINEは来ない。既読の前に、送信箱ごと消える種類の夜だ。';
      }
      return '【裏メモ】\n' + head + '\n押しちゃいない。橈骨動脈も、抜かれたらすぐ離した。小胸筋にも、無理やり触ってない。\nなのに由衣さんは壁の向こうだった。丁寧に「勉強になりました」と言って帰るときが、一番戻ってこない。\n意地を張って「また来ます」と言ううちは、まだ客だ。今日は、それさえなかった。\n空いた枠を埋める気はない。来ない人の扉は、叩かない。';
    }
    if (state.asked && state.reason > B.ALMOST_REASON) {
      return '【裏メモ】\n' + head + '\n「触れてほしい」まで言われた。越えていい条件は、揃ってた。\n揃ってたのに、小胸筋の名前で止めた。止めたあとの俺の口は、まだ丁寧語を拾えてた。\n拾えてたから、今日は整体師でいられた。\n次、同じことを言われて、残りがこの数じゃなかったら。カルテは保証しない。';
    }
    if (state.reason < 64) {
      if (state.slip) {
        return '【裏メモ】\n' + head + '\n親指が、太ももの手前まで滑った。吐息が先に落ちて、半秒で自分の手を戻した。\n「今のは、施術じゃない」まで言えた。言えたから、今日はまだ帰せた。\n由衣さんは気づいて、それでも力を抜いた。また来る。歩き方でわかる。\n着地は、笑顔の側だ。この熱のまま次もプロでいられるか、今夜の紙は知らない。';
      }
      return '【裏メモ】\n' + head + '\n「今日はここまで」の声、掠れてた。丁寧語が途中で膝をついて、タメ口が顔を出した。\n由衣さんは気づいて、それでもコートを受け取った。また来る。歩き方でわかる。\n着地は、笑顔の側だ。この熱のまま次もプロでいられるか、今夜の紙は知らない。';
    }
    return '【裏メモ】\n' + head + '\n今日は守れた。大円筋も小胸筋も、名前のついた場所だけで終われた。\n由衣さんの脈は上がって、俺の丁寧語は死ななかった。死なないうちは、えくぼで返せる。\n越えてきたのは、まだ吐息だけだ。吐息は境界じゃない。\n都度払いで、湯船を勧めて、送らない。次も、待つ。';
  }

  // 癖を言い当てた夜と、営業トークで弾かれた夜の追記。終わりの種類には関わらない。
  function extraSecret(state) {
    var out = '';
    if (state.seen) {
      out += '\n【追記】由衣さんの癖、当たってた。右肩が先に上がる。会議で息を止める。言い当てたら、肩が半センチ落ちた。あの人は、見抜かれて、ほっとする側だ。';
    }
    if (state.bounced && state.mended) {
      out += '\n【追記】「営業トークですよね」と言われた。笑って流した。数字の話は、まだ古傷だ。……謝られた。客に気を遣わせたのは、俺の負けだ。でも、あれで少し、楽になった。';
    } else if (state.bounced) {
      out += '\n【追記】「営業トークですよね」と言われた。笑って流した。えくぼが引っ込んだのは、たぶん見られてない。数字の話は、まだ古傷だ。';
    }
    if (state.umbrella) {
      out += '\n【追記】傘は貸した。返しに来る口実を、渡した。口実があるうちは、次の予約を急がなくていい。';
    }
    if (state.rainstay) {
      out += '\n【追記】「止むまで、いてもいいですか」と言われた。時間は数えなかった。数えなかった自分が、いちばん危ない。';
    }
    if (state.rainrun) {
      out += '\n【追記】走って帰ると言われた。濡れたまま帰すのは、規則の外だ。タオルを渡した。それだけは、守れた。';
    }
    return out;
  }

  function publicFor(state, ending) {
    var body = '【主訴】デスクワークによる頚肩部の慢性緊張。肩甲骨挙上・巻き肩。\n【所見】大円筋および小胸筋の短縮。橈骨動脈で脈拍を確認。退店時おおよそ' + state.bpm + '。';
    if (ending === 'almost') {
      return body + '\n【内容】最終枠の徒手を開始したところで記録が途切れる。店じまいのため、公式には予定を繰り上げて終了。\n【備考】これ以上はカルテに書けない。';
    }
    if (ending === 'awkward') {
      return body + '\n【内容】' + (state.sawBed ? '施術途中、本人の申出により早期終了。' : '本人希望により早期退店。ベッド施術は見送り。') + '\n【次回】再予約の意思表示なし。こちらからの追跡はしない。';
    }
    return body + '\n【内容】' + (state.sawBed ? 'コンディショニング整体を予定範囲で実施。境界を越える介入は行わず終了。' : 'フロア中心。本人希望によりベッド施術は見送り。') + '\n【次回】都度払い。再予約は本人の連絡待ち。';
  }

  window.SCENARIO = {
    session: 1,
    start: 'intro',
    endingNode: {
      normal: 'end_normal',
      almost: 'end_almost',
      awkward: 'end_awkward'
    },
    endings: {
      normal: {
        name: '店じまいの笑顔',
        kicker: '境界は、越えていない',
        blurb: function (state) {
          if (state.asked && state.reason > B.ALMOST_REASON) return '聞こえていた。答えなかった。次の夜までは、まだ整体師でいる。';
          if (state.reason < 64) return '声は掠れた。手は離れた。また来る、と彼女の歩き方は言っている。';
          return '名前のついた筋肉だけを触って、えくぼのまま帰した。次の予約は、残る。';
        }
      },
      almost: {
        name: '寸前',
        kicker: '越えたのは、由衣のほう',
        blurb: function (state) {
          if (state.pulseReturned) return '親指が橈骨動脈に戻った夜。唇の前で、照明だけが落ちた。';
          return '触れてほしい、を取り消さなかった。彼は額まで来て、そこで暗転した。';
        }
      },
      awkward: {
        name: '空いた枠',
        kicker: '翌週の最終枠は、埋まらない',
        blurb: function (state) {
          if (state.slip) return '先に漏れたのは、吐息と半秒だった。断られた瞬間、手は離れていた。彼女は、もう来ない。';
          if (state.pulseReturned) return '脈を返したあとで、彼女は自分から降りた。追わないまま、枠は空く。';
          return '丁寧な礼だけが残った。LINEは、最初から生まれない。';
        }
      }
    },
    notes: function (state, ending) {
      if (!ending) {
        return {
          title: '高瀬の電子カルテ：小野寺由衣 様（施術中）',
          publicNote: '【主訴】デスクワークによる頚肩部の慢性緊張。肩甲骨挙上・巻き肩。\n【所見】大円筋・小胸筋の短縮を疑う。橈骨動脈で脈拍を確認中。現在おおよそ' + state.bpm + '。\n【備考】公式記録は、店じまいに締める。',
          secretNote: '【途中メモ】\n脈' + state.bpm + '。残り' + state.reason + '。\n' + maskLine(state) + '\n客が自分の足で越えてくるまで、俺からは動かない。その数を、今も数えてる。'
        };
      }
      return {
        title: '高瀬の電子カルテ：小野寺由衣 様（最終枠）',
        publicNote: publicFor(state, ending),
        secretNote: secretFor(state, ending) + extraSecret(state)
      };
    },
    nodes: {
      intro: {
        lines: [
          {
            bg: 'assets/bg_entrance.png',
            chara: null,
            speaker: '',
            text: '21時。雑居ビルの他の階はもう暗い。消毒液とアロマの混ざった廊下の先で、サロンの扉だけが暖色を漏らしている。最終枠。次の予約は、入っていない。'
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: 'いらっしゃい、由衣さん。髪が少し湿っています。雨、大丈夫でしたか',
                cracked: 'いらっしゃい、由衣さん。髪、湿ってる。……雨、大丈夫でした？',
                mixed: 'いらっしゃい。……髪、濡れてる。雨、大丈夫だったか。……ですか',
                casual: '来たな。髪、濡れてるだろ。雨、しのげたか'
              });
            }
          },
          {
            chara: 'yui',
            face: '微笑み',
            speaker: '由衣',
            text: 'こんにちは。大丈夫です。……会議が伸びて、首から肩甲骨のあたりが、上がったままなんです'
          },
          {
            chara: 'yui',
            face: '困り',
            speaker: '',
            text: '小野寺由衣、29。画面の前で肩をすくめたまま一日を終える会社員だ。同年代の女性トレーナーの前で息を切らして比べられるのが嫌で、整体もトレーニングも一人で見る、32の男性のところを選んだ。高瀬航。右頬に、浅いえくぼがある。指導して、施術して、越えない側に立つのは、いつも彼のほうだ。'
          },
          {
            chara: 'yui',
            face: '照れ',
            speaker: '',
            text: '（6回目。この人は、客が自分の足で越えるまで、自分からは動かない。その規則を、肩甲骨の裏のほうが先に覚えてしまった）'
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: 'カルテだと、肩甲骨が挙がったままの巻き肩です。今日もトレーニングのあとで整えますか。それとも最初からベッドで、小胸筋の短縮を見ますか',
                cracked: '肩甲骨、挙がったままですね。……トレーニングからいきますか。ベッドで、小胸筋から見ますか',
                mixed: '巻き肩、今日もそのままだ。……俺、トレーニングからでも、小胸筋からでもいいです',
                casual: '肩甲骨、上がったままだろ。トレーニングからやるか、小胸筋から潰すか'
              });
            },
            choices: [
              {
                id: 'c1_train',
                text: '「鍛えに来ました。トレーニングでお願いします」背筋を伸ばす',
                apply: { reason: 6, wall: 1, bpm: 2 },
                next: 'warmup'
              },
              {
                id: 'c1_both',
                text: '「首も、肩甲骨の周りも重いんです。両方、見てほしいです」',
                apply: { reason: -6, bpm: 10 },
                next: 'warmup'
              },
              {
                id: 'c1_yield',
                text: '「今日は、話したくないです。ただ……預けたい」目を伏せる',
                apply: { reason: -12, cross: 1, bpm: 16 },
                next: 'warmup'
              }
            ]
          }
        ]
      },

      // ウォームアップのバイクで雑談。通い始めたきっかけを聞かれる。数値は理性とBPMだけを少し動かし、floor の分岐（wall / cross）には触れない。
      warmup: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: null,
            speaker: '',
            text: 'ウォームアップのバイク。ペダルの音と、換気扇。話をするなら、このくらいの音量がちょうどいい。'
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: 'そういえば、6回目なのに聞いたことがなかったです。由衣さんは、どうしてうちに通おうと思ったんですか',
                cracked: 'そういえば、6回目なのに、聞いてなかった。……どうして、うちに通おうと思ったんですか',
                mixed: 'そういや、聞いてなかったな。……どうして、うちだったんだ。……ですか',
                casual: 'そういや、聞いてなかった。どうして、うちに来た'
              });
            }
          },
          {
            chara: 'yui',
            face: '困り',
            speaker: '',
            text: '理由は、二つある。人に言えるほうと、言えないほう。ペダルを漕ぐ脚だけが、先に正直になっていく。',
            choices: [
              {
                id: 'c_w_true',
                text: '正直に言う。「大手のジムで、同年代の女性トレーナーと比べられるのが嫌で……」',
                apply: { reason: -4, bpm: 4 },
                next: 'warmTrue'
              },
              {
                id: 'c_w_cover',
                text: '「家から近かったので」と、半分だけ答える',
                apply: { reason: 2, bpm: -2 },
                next: 'warmCover'
              },
              {
                id: 'c_w_ask',
                text: '「高瀬さんこそ、どうして独立したんですか」と聞き返す',
                apply: { reason: -3, bpm: 3 },
                next: 'warmAsk'
              }
            ]
          }
        ]
      },

      warmTrue: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: 'yui',
            face: '照れ',
            speaker: '由衣',
            text: '……大手だと、周りがみんなキラキラしてて。息切れしてる自分が、惨めになるんです。ここなら、それがないかなって'
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '',
            text: function (state) {
              if (state.reason >= 64) return '高瀬はペダルの回転を落とさない。笑わない。ただ、ひとつ頷いた。その頷きは、慰めより重い。';
              return '頷いた拍子に、視線が一度だけ由衣の横顔に留まった。留まりすぎたと、自分で気づいて逸らす。';
            }
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: '比べる必要は、ここにはありません。由衣さんの今日と、先週だけを見ます',
                cracked: '比べなくて、いいです。……先週の由衣さんと、今日だけ、見ます',
                mixed: '比べなくていい。……先週の由衣さんと、今日だけ見る。それだけで、足りるです',
                casual: '比べなくていい。先週の由衣と、今日の由衣だけ見る'
              });
            },
            goto: 'floor'
          }
        ]
      },

      warmCover: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: 'yui',
            face: '微笑み',
            speaker: '由衣',
            text: '家から近かったので。それだけです'
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '',
            text: '半分だけの答えだと、彼にはわかる。わかって、追わない。'
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: 'そうですか。近いのは、大事です。続けられる場所が、いちばん効きますから',
                cracked: 'そっか。……近いのは、大事です。続けられるのが、いちばん効くんで',
                mixed: '近い、か。……続けられるのが一番だ。……です。深くは、聞かないです',
                casual: '近いのか。続くのがいちばんだ。それ以上は、聞かない'
              });
            },
            goto: 'floor'
          }
        ]
      },

      warmAsk: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: 'yui',
            face: 'おちゃめ',
            speaker: '由衣',
            text: '高瀬さんこそ。大手にいたんですよね。どうして、独立したんですか'
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '',
            text: '高瀬は一拍だけ笑って、すぐ笑い止めた。右頬のえくぼが、引っ込む。'
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: '数字は出ていたんです。でも、数字を出すほど、客の顔を見る時間が減っていきました。それが、嫌になって',
                cracked: '数字は、出てたんです。……出すほど、客の顔を見る時間が減って。それが、嫌で',
                mixed: '数字は出てた。……でも、客の顔を見る暇が、なくなった。それが、嫌だったです',
                casual: '数字は出てたよ。でも、客の顔を見る暇がなくなった。それが嫌だった'
              });
            }
          },
          {
            chara: 'yui',
            face: '照れ',
            speaker: '',
            text: '客の顔を見る。この人はいま、私の顔を見ている。そのことに気づいて、由衣はペダルを少し、速く踏んだ。',
            goto: 'floor'
          }
        ]
      },

      floor: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              if (state.wall >= 1) {
                return say(state, {
                  polite: 'いい顔です。自重で3セットいきます。巻き肩のまま沈むと、大円筋が腰を引っ張ります。肩甲骨を下げて、息を吐きながら',
                  cracked: 'その目、いいですね。3セット。……大円筋が腰を持っていかないように、肩甲骨、下げて',
                  mixed: '逃げないで。3セットだ。……大円筋、腰を持っていく。肩甲骨、下げてください。俺が見る',
                  casual: '3セットだ。大円筋が腰を持っていく。肩甲骨、下げろ'
                });
              }
              if (state.cross >= 1) {
                return say(state, {
                  polite: 'わかりました。きつい負荷は入れません。大円筋が固いので、肩甲骨を下げる動きだけ一緒にやります',
                  cracked: 'きついのは、無しにします。……大円筋、固いので。肩甲骨を下げるところだけ',
                  mixed: 'わかった。……大円筋が固い。俺、肩甲骨を下げるとこだけ一緒にやる',
                  casual: 'きついのはやらない。大円筋、固いだろ。肩甲骨、一緒に下げる'
                });
              }
              return say(state, {
                polite: '了解です。使えていないところを出してから、ベッドで小胸筋と大円筋をまとめます。由衣さんは、受けるだけで大丈夫です',
                cracked: '了解です。使えてないところ、出してから。……小胸筋と大円筋、ベッドで見ます',
                mixed: '了解。……使えてないとこ出して、小胸筋と大円筋はベッドだ。由衣さんは、受けてればいいです',
                casual: '使えてないとこ、炙り出す。小胸筋と大円筋は俺がやる。由衣は、じっとしてろ'
              });
            }
          },
          {
            chara: 'yui',
            face: function (state) { return state.wall >= 1 ? '息切れ' : '赤面'; },
            speaker: '',
            text: function (state) {
              if (state.wall >= 1) {
                return '彼女は息を詰めて沈む。膝が細かく震えても、回数は意地が数える。職場で年下を仕切っている声は、ここでは出ない。大円筋が、正直に張っている。';
              }
              if (state.cross >= 1) {
                return '背後に回った掌が、説明より先に腰骨へ置かれる。ウェア越しの熱。大円筋の張りを、親指の腹が確かめていく。由衣の吐息が、一度、指示より先に漏れる。';
              }
              return '崩れた骨盤を、掌が両側から戻す。的確で、熱い。指は、名前のついた筋肉の上から外れない。外れないことが、今夜はいちばん近い。';
            }
          },
          {
            chara: 'yui',
            face: function (state) { return state.wall >= 1 ? '息切れ' : '照れ'; },
            speaker: '由衣',
            text: function (state) {
              if (state.wall >= 1) return 'くっ……まだ、いけます。肩甲骨、下がって、ますか';
              return 'っ……高瀬さん、近い、です。大円筋、そこ、ひびきます';
            }
          },
          {
            chara: null,
            speaker: '',
            apply: { bpm: 8 },
            text: 'セットが終わる。タオルと、冷たい水。呼吸は戻りかける。胸の奥だけが、別の速さで残った。'
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            effect: 'pulse',
            checkVoice: true,
            text: function (state) {
              return say(state, {
                polite: '手を貸してください。橈骨動脈、ここで触れます。10秒だけ数えますね',
                cracked: '手、貸してください。橈骨動脈、ここです。……10秒だけ',
                mixed: '手。……橈骨動脈、ここ。10秒でいいです。俺、数えるんで',
                casual: '手を出せ。橈骨動脈。……10秒も要らないだろ。跳ねてる'
              });
            }
          },
          {
            chara: 'takase',
            face: '真顔',
            speaker: '',
            text: '親指の腹が、右手首の橈骨動脈に吸い付く。スマートウォッチより、この人の手のほうが早い。由衣は、その場所を、もう指で覚えてしまっている。',
            choices: [
              {
                id: 'c2_pull',
                text: '手首を抜く。「……測らなくて、いいです」',
                apply: { reason: 10, wall: 2, bpm: -8 },
                next: 'afterPulse'
              },
              {
                id: 'c2_stay',
                text: '目を逸らしたまま、手首を預けておく',
                apply: { reason: -8, bpm: 12 },
                next: 'afterPulse'
              },
              {
                id: 'c2_name',
                text: '掌を返す。「落ちてないの、わかってます。運動のせいじゃないです」',
                apply: { cross: 1, reason: -14, bpm: 18 },
                next: 'afterPulse'
              }
            ]
          }
        ]
      },

      afterPulse: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: 'takase',
            face: function (state) {
              if (state.wall >= 3 && band(state) !== 'casual') return '困り';
              return takaseFace(state);
            },
            speaker: '高瀬',
            text: pulseComment
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '',
            text: function (state) {
              if (state.reason >= 80) return '指は、脈を数える秒数だけそこにいて、きれいに離れた。余韻を、置いていかない。';
              if (state.reason >= 64) return '離れる瞬間、親指が一拍だけ橈骨動脈の上に残った。高瀬がそれに気づいて、息をひとつ、鼻で返す。';
              if (state.reason >= 46) return '離したあとに、喉が一度鳴った。丁寧語を探し直す間が、はっきり空いた。';
              return '離したあとも、指の熱が輪郭を残している。戻そうとした敬語が、舌の途中で折れた。';
            }
          },
          {
            chara: 'yui',
            face: '照れ',
            speaker: '',
            text: function (state) {
              if (state.bpm >= B.PULSE_BPM) {
                return '指が離れたあとも、高瀬の手首は、由衣の手の届く距離に残っている。橈骨動脈の場所は、もう身体が覚えている。彼の脈も、同じように跳ねているのが、肌を合わせる前からわかる。';
              }
              return '由衣は自分の手を膝へ戻した。それ以上、脈の話はしない。しないほうが、今夜はまだ楽だった。';
            },
            goto: 'habit'
          }
        ]
      },

      // 癖の読み取り。触れずに姿勢を見て、由衣の癖を言い当てる。見抜かれて安心する夜。BPM は下がり、cross は上がる。
      habit: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: 'takase',
            face: takaseFace,
            speaker: '',
            text: '高瀬は由衣を立たせて、少し離れた位置から、肩の高さを見ている。触れない。見るだけ。視線が、肩甲骨の裏まで通っていく。'
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: '由衣さん、会議が長引くと、息を止めていませんか。肩甲骨の位置を見れば、わかります。右肩だけ、先に上がります',
                cracked: '会議が長いと、息、止めてませんか。……右肩だけ、先に上がってます。肩甲骨でわかります',
                mixed: '会議長いと、息止めてるだろ。……です。右肩だけ先に上がる。肩甲骨でわかる',
                casual: '会議が長いと、息止めてるだろ。右肩だけ先に上がる。肩甲骨でわかる'
              });
            }
          },
          {
            chara: 'yui',
            face: '困り',
            speaker: '',
            text: '図星だった。誰にも言ったことがない。電話を肩で挟む癖も、貧乏ゆすりを隠すために右足を組む癖も、この人にはたぶん、もう全部見えている。',
            choices: [
              {
                id: 'c_h_true',
                text: '「……当たってます。誰にも、言われたことなかったのに」',
                apply: { seen: 1, cross: 1, reason: -3, bpm: -6 },
                next: 'habitTrue'
              },
              {
                id: 'c_h_ask',
                text: '「どうしてわかるんですか」と、目を丸くして聞く',
                apply: { seen: 1, reason: -2, bpm: -3 },
                next: 'habitAsk'
              },
              {
                id: 'c_h_hide',
                text: '「……そんなこと、ないです」と、肩をすくめて隠す',
                apply: { wall: 1, reason: 3, bpm: 2 },
                next: 'habitHide'
              }
            ]
          }
        ]
      },

      habitTrue: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: 'takase',
            face: takaseFace,
            speaker: '',
            text: function (state) {
              if (state.reason >= 64) return '高瀬はえくぼを引っ込めて、真面目な顔で頷く。笑わない。それが、いちばん安心する。';
              return '頷く顔が、思ったより近い。笑っていないのに、声だけが柔らかい。';
            }
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: '言われたことがないのは、見せないように頑張ってきたからです。ここでは、頑張らなくていいです。癖は、名前のついた筋肉の、ただの履歴ですから',
                cracked: '言われたことない、のは。……見せないように、頑張ってきたからです。ここでは、頑張らなくていい。癖は、筋肉の履歴ですから',
                mixed: '見せないように、頑張ってきたんだろ。……です。ここでは、いい。癖は、筋肉の履歴だ。俺は、それを読むだけです',
                casual: '頑張って隠してきたんだろ。ここでは要らない。癖は筋肉の履歴だ。俺は読むだけだ'
              });
            }
          },
          {
            chara: 'yui',
            face: '照れ',
            speaker: '',
            text: '肩甲骨の裏の力が、半センチだけ抜けた。見抜かれるのが怖かったはずなのに、見抜かれたとたん、呼吸が深くなる。不思議な安心だった。',
            goto: 'stretch'
          }
        ]
      },

      habitAsk: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: '体は、嘘がつけないんです。座り方、立ち方、息の止め方。名前のついた筋肉が、毎日の一部を覚えています。僕は、それを読んでいるだけです',
                cracked: '体、嘘つけないんです。……座り方、息の止め方。筋肉が、毎日を覚えてて。……読んでるだけです',
                mixed: '体は嘘つかない。……座り方、息の止め方。筋肉が全部覚えてる。俺は読んでるだけです',
                casual: '体は嘘つかない。座り方も息の止め方も、筋肉が覚えてる。俺は読んでるだけだ'
              });
            }
          },
          {
            chara: 'yui',
            face: '微笑み',
            speaker: '',
            text: '読んでるだけ。そう言うのに、彼の目は、読んだ内容を一つも茶化さない。ここなら、全部見られても大丈夫かもしれない。由衣は、そう思った。',
            goto: 'stretch'
          }
        ]
      },

      habitHide: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: 'そうですか。失礼しました。……でも、無理に隠さなくていいです。気づいたことは、ここで終わりにします',
                cracked: 'そうですか。すみません。……隠さなくて、いいです。ここだけの話にします',
                mixed: '悪い。……隠さなくていいです。ここだけで、終わらす',
                casual: '悪い。隠さなくていい。ここだけで終わらす'
              });
            }
          },
          {
            chara: 'yui',
            face: '照れ',
            speaker: '',
            text: '追わない。気づいたことを、気づいたまま置いておく。その距離の取り方が、由衣の肩をほんの少しだけ緩めた。',
            goto: 'stretch'
          }
        ]
      },

      // 壁際のクールダウン。脈測りのあとに距離だけを詰める。ここで BPM が 120 を超えれば pulseGate が開く。
      stretch: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: null,
            speaker: '',
            text: 'クールダウン。高瀬はタオルを首にかけ直して、壁際を指した。「ドア枠の前、いいですか」。マットの端、壁の手前。逃げ場は、思ったより狭い。'
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: '壁に背中をつけて、右腕を上げます。小胸筋が伸びるところまでで止めます。痛かったら、言ってください',
                cracked: '壁に、背中つけて。……右腕、上げます。小胸筋が伸びるとこまで。痛かったら、言って',
                mixed: '壁に背中。……右腕、上げるぞ。小胸筋が伸びるとこまでだ。痛かったら、言ってくれ。……ください',
                casual: '壁に背中つけろ。右腕、上げる。小胸筋が伸びるとこまでだ。痛かったら言え'
              });
            }
          },
          {
            chara: 'yui',
            face: '照れ',
            speaker: '',
            text: function (state) {
              if (state.wall >= 2) return 'さっき手首は抜いたのに、今度は腕ごと預けている。背中に壁の冷たさ。肘を支える掌と、顔のすぐ横にある高瀬の肩。さっきより、一段、近い。';
              return '背中に壁の冷たさ。持ち上げられる右腕。肘を支える掌と、顔のすぐ横にある高瀬の肩。いつもの施術より、一段、近い。';
            }
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '',
            effect: function (state) { return state.reason < 64 ? 'pulse' : ''; },
            text: function (state) {
              if (state.reason >= 80) return '彼の視線は、由衣の肩の高さから動かない。顔の横にいても、見ているのは筋肉の名前だけだ。';
              if (state.reason >= 64) return '視線が一度だけ、肩から顔へ上がって、すぐ戻る。戻すのに、一拍かかった。';
              if (state.reason >= 46) return '息が、由衣の前髪を揺らす距離。高瀬は顎を引いて、距離を作り直そうとして、できていない。';
              return '右手が、由衣の頭の横の壁に、もう置かれている。置いてから、気づいた顔をする。';
            }
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: '……いま、肩の力が抜けました。いい反応です。ただ、脈のほうは、まだ抜けていません',
                cracked: '力、抜けましたね。……いい反応です。脈は、まだですけど',
                mixed: '力、抜けた。……脈のほうは、まだだな。……です',
                casual: '力、抜けたな。脈は、まだ抜けてない'
              });
            }
          },
          {
            chara: 'yui',
            face: '赤面',
            speaker: '由衣',
            text: '……高瀬さんの声、近いと、壁から響きます',
            choices: [
              {
                id: 'c_s_joke',
                text: '笑ってごまかす。「聞こえてますか、私の心臓」',
                apply: { reason: -5, bpm: 4 },
                next: 'stretchEnd'
              },
              {
                id: 'c_s_look',
                text: '顔を上げて、目を合わせる。逸らさない',
                apply: { cross: 1, reason: -9, bpm: 6 },
                next: 'stretchEnd'
              },
              {
                id: 'c_s_step',
                text: '壁から一歩ずれる。「……ちょっと、休憩で」',
                apply: { wall: 1, reason: 4, bpm: -8 },
                next: 'stretchEnd'
              }
            ]
          }
        ]
      },

      stretchEnd: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: 'yui',
            face: '照れ',
            speaker: '',
            text: function (state) {
              if (state.bpm >= B.PULSE_BPM) return '腕が下りる。それでも、どちらも壁の前から動かない。心拍の音が、空調に負けていない。';
              return '腕が下りる。熱だけが、肩の高さに残っている。由衣は壁から背中を剥がして、息を整え直した。';
            },
            goto: 'sales'
          }
        ]
      },

      // 回数券の話。由衣の冗談で高瀬が一瞬弾かれる。謝れば修復、気づかないふりもできる。終わりは強制しない。
      sales: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: '来月から、回数券を出す予定なんです。6回分で、少しお得になります。……すみません、営業みたいな話で',
                cracked: '来月から、回数券、出すんです。……6回分で、少し安くなります。営業みたいですね、すみません',
                mixed: '来月から回数券、出す。……です。営業、みたいだな。悪い',
                casual: '来月から回数券を出す。……営業みたいだな、悪い'
              });
            }
          },
          {
            chara: 'yui',
            face: 'おちゃめ',
            speaker: '',
            text: '由衣はタオルで口元を隠して、笑う。からかう気持ちのほうが、先に出た。',
            choices: [
              {
                id: 'c_t_joke',
                text: '笑って言う。「それ、営業トークですよね」',
                apply: { bounced: 1, reason: -2, bpm: 2 },
                next: 'salesBounce'
              },
              {
                id: 'c_t_buy',
                text: '「回数券、欲しいです」と、素直に言う',
                apply: { cross: 1, reason: -4, bpm: 4 },
                next: 'salesBuy'
              },
              {
                id: 'c_t_skip',
                text: '「考えておきます」と、やんわり受け流す',
                apply: { wall: 1, reason: 2, bpm: -2 },
                next: 'salesSkip'
              }
            ]
          }
        ]
      },

      salesBounce: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: 'takase',
            face: '真顔',
            speaker: '',
            text: '「営業」の二文字が、高瀬の右頬のえくぼを一瞬だけ消した。笑顔は戻る。戻すのに、いつもより半拍かかった。'
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: '……そう聞こえますよね。数字の話は、昔から、少し苦手で',
                cracked: '……そう、聞こえますよね。数字の話、昔から、少し苦手で',
                mixed: '……そう聞こえるか。……数字の話は、昔から苦手だ。……です',
                casual: '……そう聞こえるか。数字の話は、昔から苦手なんだ'
              });
            }
          },
          {
            chara: 'yui',
            face: '困り',
            speaker: '',
            text: '冗談のつもりだった。けれど今の笑顔は、さっきまでの彼と違う。由衣は、自分が一歩、彼の内側を踏んだことに気づく。',
            choices: [
              {
                id: 'c_t_mend',
                text: '「ごめんなさい。高瀬さんは、数字より先に、顔を見てくれる人です」',
                apply: { mended: 1, cross: 1, reason: -4, bpm: -4 },
                next: 'salesMend'
              },
              {
                id: 'c_t_leave',
                text: '何も言えず、タオルをたたむ。気づかなかったふりをする',
                apply: { wall: 1, reason: 3, bpm: -2 },
                next: 'salesLeave'
              }
            ]
          }
        ]
      },

      salesMend: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: 'takase',
            face: '笑顔',
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: 'ありがとうございます。……そう言われたのは、独立してから、初めてかもしれません',
                cracked: 'ありがとうございます。……そう言われたの、独立してから、初めてかもしれない',
                mixed: 'ありがとう。……そう言われたの、独立してから、初めてだ。……です',
                casual: 'ありがとな。そう言われたの、独立してから初めてだ'
              });
            }
          },
          {
            chara: 'yui',
            face: '照れ',
            speaker: '',
            text: 'えくぼが、戻っている。今度は、作った笑顔じゃなかった。由衣の脈が、彼の分まで落ち着いていく。安心させたのは、今度は、由衣のほうだった。',
            goto: function (state) {
              return state.bpm >= B.PULSE_BPM ? 'pulseGate' : 'tea';
            }
          }
        ]
      },

      salesLeave: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: 'takase',
            face: takaseFace,
            speaker: '',
            text: '高瀬は何も言わない。言わないまま、自分でタオルの角を揃えた。丁寧語の礼だけが、いつもより少し深い。',
            goto: function (state) {
              return state.bpm >= B.PULSE_BPM ? 'pulseGate' : 'tea';
            }
          }
        ]
      },

      salesBuy: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: 'ありがとうございます。……でも、まだ決めなくて大丈夫です。今日の最後で、決めてください',
                cracked: 'ありがとうございます。……でも、まだ決めなくて、いいです。今日の最後で、決めて',
                mixed: 'ありがとう。……まだ、決めなくていいです。今日の最後で、決めてくれ',
                casual: 'ありがとな。まだ決めなくていい。今日の最後で決めろ'
              });
            },
            goto: function (state) {
              return state.bpm >= B.PULSE_BPM ? 'pulseGate' : 'tea';
            }
          }
        ]
      },

      salesSkip: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: 'takase',
            face: takaseFace,
            speaker: '',
            text: '彼は笑って頷いた。その頷きの速さが、押し売りに慣れていない人のものだと、由衣にはわかる。'
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: 'もちろんです。急がせるつもりはありません。必要になったら、言ってください',
                cracked: 'もちろんです。……急がせないです。必要なときに、言って',
                mixed: 'ああ。……急がせない。必要になったら、言ってください',
                casual: 'ああ、急がせない。必要になったら言え'
              });
            },
            goto: function (state) {
              return state.bpm >= B.PULSE_BPM ? 'pulseGate' : 'tea';
            }
          }
        ]
      },

      pulseGate: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: 'yui',
            face: '赤面',
            speaker: '',
            effect: 'pulse',
            text: '（この人の左手首が、すぐそこにある。親指を置けば、いつも私が測られる場所を、逆に測れる。脈がうるさいのは、私だけじゃない）'
          },
          {
            chara: 'yui',
            face: '赤面',
            speaker: '由衣',
            text: '……高瀬さん。',
            choices: [
              {
                id: 'c_return',
                when: function (state) { return state.bpm >= B.PULSE_BPM; },
                text: '彼の左手首を取る。親指を、橈骨動脈に当てる',
                apply: { cross: 2, reason: -18, bpm: 8, pulseReturned: 1 },
                next: 'pulseBack'
              },
              {
                id: 'c_hold',
                when: function (state) { return state.bpm >= B.PULSE_BPM; },
                text: '欲しくても、自分の手は膝に戻す',
                next: 'tea'
              }
            ],
            fallback: 'tea'
          }
        ]
      },

      pulseBack: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: 'yui',
            face: '照れ',
            speaker: '',
            effect: 'pulse',
            text: '由衣の右手が、高瀬の左手首を下から包む。親指の腹が、橈骨動脈の真上にピタリと乗る。彼が何度も由衣にした、あの圧。あの角度。教えられた場所を、彼女は一度も外さない。'
          },
          {
            chara: 'yui',
            face: '赤面',
            speaker: '由衣',
            text: '……ここ、ですよね。高瀬さんがいつも押さえる、橈骨動脈。落ちて、ないです。私のせい、ですか'
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '',
            text: '高瀬の脈が、親指の下で一度大きく跳ねた。整体師の手首が、客の指に測られている。彼は引かない。近づきもしない。規則が、皮膚のすぐ下で音を立てている。'
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: '由衣さん、それは施術の手順にありません。橈骨動脈は、こちらが確認するものです',
                cracked: '由衣さん、それは……。橈骨動脈、数えないでください',
                mixed: '測らなくて、いいです。……っ、なんで。俺の、橈骨動脈だぞ',
                casual: 'やめろ。橈骨動脈、そこは反則だろ'
              });
            }
          },
          {
            chara: 'takase',
            face: '色気',
            speaker: '',
            text: '言い切ったあと、彼は自分の語尾を聞き直した顔をする。丁寧語が、親指の圧で折れた。それでも一歩は、由衣のほうへ出さない。出さないまま、呼吸だけが由衣の髪に触れている。',
            goto: 'tea'
          }
        ]
      },

      // 作業後のお茶。ほうじ茶を飲みながらの雑談。ここでは理性とBPMだけを少し動かし、終わりの規則は変えない。
      tea: {
        lines: [
          {
            bg: 'assets/bg_entrance.png',
            chara: null,
            speaker: '',
            text: 'トレーニングの汗が引いたころ、高瀬が湯呑みをふたつ持ってきた。ほうじ茶の香り。受付のカウンターの端、いつもより少しだけ照明が低い。'
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: 'どうぞ。施術のあとは、温かいものを。……最終枠は、こうして湯気を見る時間も込みなんです',
                cracked: 'どうぞ。……温かいもの、飲んで。最終枠は、湯気を見る時間も込みです',
                mixed: 'どうぞ。……最終枠は、湯気見る時間も込みだ。……です',
                casual: 'ほら。温かいの飲め。最終枠は、湯気見る時間も込みだ'
              });
            }
          },
          {
            chara: 'yui',
            face: '微笑み',
            speaker: '',
            text: '湯呑みを両手で包むと、指先がやっと自分のものに戻る。仕事の話をしてもいいし、しなくてもいい。そんな夜の隙間だった。',
            choices: [
              {
                id: 'c_tea_work',
                text: '会社の話をする。「今日の会議、また長引いたんです」',
                apply: { cross: 1, reason: -2, bpm: -3 },
                next: 'teaWork'
              },
              {
                id: 'c_tea_ask',
                text: '「どうして、最終枠は誰も入れないんですか」と聞く',
                apply: { reason: -3, bpm: 2 },
                next: 'teaAsk'
              },
              {
                id: 'c_tea_quiet',
                text: '何も言わず、湯気を見る',
                apply: { bpm: -2 },
                next: 'teaQuiet'
              }
            ]
          }
        ]
      },

      teaWork: {
        lines: [
          {
            bg: 'assets/bg_entrance.png',
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: '長引いた日の肩は、わかりやすいです。今日の右肩、いつもより二センチ高かった。……お疲れさまでした',
                cracked: '長引いた日の肩は、わかりやすい。……今日の右肩、二センチ高かったです。お疲れさまでした',
                mixed: '長引いた日の肩は、わかりやすい。……二センチ高かった。……お疲れ、です',
                casual: '長引いた日の肩は、わかりやすい。今日の右肩、二センチ高かった。……お疲れ'
              });
            }
          },
          {
            chara: 'yui',
            face: '照れ',
            speaker: '',
            text: '二センチ。測られていたことより、覚えていてくれたことのほうに、胸が動いた。',
            goto: 'rain'
          }
        ]
      },

      teaAsk: {
        lines: [
          {
            bg: 'assets/bg_entrance.png',
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: '最終枠は、客が帰る時間を、自分で決められるようにしておきたいんです。後ろに予約があると、帰りたいのに帰れない人が出ます',
                cracked: '最終枠は、客が、帰る時間を自分で決められるように。……後ろに予約があると、帰れない人が出るんで',
                mixed: '最終枠は、帰る時間を客が決める。……後ろに予約があると、帰れなくなる人がいる。……です',
                casual: '最終枠は、帰る時間を客が決める。後ろに予約があると、帰れなくなるやつがいる'
              });
            }
          },
          {
            chara: 'yui',
            face: '微笑み',
            speaker: '',
            text: '帰る時間を、自分で決められる。この人の規則は、触れないことだけじゃない。帰ってもいいと言い続けることまで、含まれている。由衣は、湯呑みの縁で息をついた。',
            goto: 'rain'
          }
        ]
      },

      teaQuiet: {
        lines: [
          {
            bg: 'assets/bg_entrance.png',
            chara: 'takase',
            face: takaseFace,
            speaker: '',
            text: '高瀬も、何も言わない。ほうじ茶の湯気が、ふたりのあいだで同じ高さまで上がる。沈黙が気まずくないことに、由衣のほうが先に気づいた。',
            goto: 'rain'
          }
        ]
      },

      // 帰り際の雨。傘を借りる、止むまでいる、走って帰る。どれも終わりの規則は変えず、裏カルテの追記に残る。
      rain: {
        lines: [
          {
            bg: 'assets/bg_entrance.png',
            chara: null,
            speaker: '',
            text: '窓の外で、雨音が変わった。さっきまでの霧雨ではない。雑居ビルの庇を叩く、本降りの音。'
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: '……強くなりましたね。傘、お貸ししましょうか。それとも、止むまで待ちますか',
                cracked: '……強くなりましたね。傘、貸します。……止むまで、待つのでも',
                mixed: '強くなったな。……傘、貸す。止むまで待つ、でもいいです',
                casual: '強くなったな。傘貸す。止むまで待つのでもいい'
              });
            }
          },
          {
            chara: 'yui',
            face: '照れ',
            speaker: '',
            text: '窓ガラスに、ふたりの影が薄く映っている。帰る理由と、残る理由が、同じ音で降っている。',
            choices: [
              {
                id: 'c_rain_umbrella',
                text: '「傘、お借りしていいですか」返しに来る口実ができる',
                apply: { umbrella: 1, bpm: -2 },
                next: 'rainUmbrella'
              },
              {
                id: 'c_rain_stay',
                text: '「……止むまで、ここにいてもいいですか」',
                apply: { rainstay: 1, cross: 1, reason: -6, bpm: 6 },
                next: 'rainStay'
              },
              {
                id: 'c_rain_run',
                text: '「走って帰ります」と笑って、コートを掴む',
                apply: { rainrun: 1, wall: 1, reason: 3, bpm: -3 },
                next: 'rainRun'
              }
            ]
          }
        ]
      },

      rainUmbrella: {
        lines: [
          {
            bg: 'assets/bg_entrance.png',
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: '返すのは、いつでもいいです。……次の最終枠でも、その次でも',
                cracked: '返すのは、いつでも。……次の最終枠でも',
                mixed: '返すのは、いつでもいい。……次でも、その次でも、です',
                casual: '返すのはいつでもいい。次でも、その次でもな'
              });
            }
          },
          {
            chara: 'yui',
            face: '照れ',
            speaker: '',
            text: '傘一本ぶんの、次回。それは約束じゃない。約束じゃないのに、予約より重い。',
            goto: 'invite'
          }
        ]
      },

      rainStay: {
        lines: [
          {
            bg: 'assets/bg_entrance.png',
            chara: 'takase',
            face: takaseFace,
            speaker: '',
            text: '高瀬は一拍、動かなかった。それから、湯呑みを二つとも洗い場へ下げる。止むまで、は、時間の単位じゃない。'
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: '……わかりました。止むまで、いてください。時間は、数えません',
                cracked: '……わかりました。止むまで、いてください。時間は、数えないです',
                mixed: '……わかった。止むまで、いろ。……いてください。時間は、数えない',
                casual: '止むまでいろ。時間は、数えない'
              });
            },
            goto: 'invite'
          }
        ]
      },

      rainRun: {
        lines: [
          {
            bg: 'assets/bg_entrance.png',
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: '待ってください。濡れたまま帰すのは、僕の規則に反します。タオルだけ、持ってきます',
                cracked: '待って。……濡れたまま帰すのは、規則に反します。タオル、持ってきます',
                mixed: '待て。……濡れたまま帰すのは、俺の規則に反する。タオル、持ってくる。……です',
                casual: '待て。濡れたまま帰すのは、俺の規則に反する。タオル持ってくる'
              });
            }
          },
          {
            chara: 'yui',
            face: '困り',
            speaker: '',
            text: '追いかけはしない。ただ、コートの袖を掴んだ手が、玄関の前で止まる。引き止められたのは、声ひとつ分だけだった。',
            goto: 'invite'
          }
        ]
      },

      invite: {
        lines: [
          {
            bg: 'assets/bg_entrance.png',
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: inviteText,
            choices: [
              {
                id: 'c3_leave',
                text: 'コートに手を伸ばす。「今日は、もう大丈夫です」',
                apply: { wall: 2, reason: 4, bpm: -10 },
                next: 'resolve'
              },
              {
                id: 'c3_bed',
                text: '言われるまま、ベッドの端に腰を下ろす',
                apply: { reason: -4, bpm: 8 },
                next: 'bed'
              },
              {
                id: 'c3_ask',
                text: '「……触れて、ほしいです」声にしてしまう',
                apply: { cross: 3, reason: -14, bpm: 16, asked: 1 },
                next: 'bed'
              }
            ]
          }
        ]
      },

      bed: {
        lines: [
          {
            bg: 'assets/bed.png',
            chara: null,
            speaker: '',
            applyFn: function (state) { state.sawBed = 1; },
            text: '間接照明だけになる。タオルの洗剤の匂い。外の車は、もう遠い。ここで高瀬は整体師で、由衣は受ける側のままだ。その境界が、部屋の湿度になっている。'
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: bedOpen
          },
          {
            chara: 'yui',
            face: '照れ',
            speaker: '',
            effect: function (state) { return state.reason < 64 ? 'pulse' : ''; },
            text: '肩甲骨の内側へ、親指が沈む。挙がったまま戻らない肩を、大円筋ごと下げる圧。痛くて、甘い。由衣の吐息がタオルに落ちかけて、彼女はそれを呑む。掌の熱は、筋肉の名前で説明がつく範囲に、まだ収まっている。'
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            checkVoice: true,
            applyFn: function (state) {
              if (state.reason < B.SLIP_REASON) {
                state.slip = 1;
                state.bpm = Math.min(168, state.bpm + 6);
              }
            },
            text: function (state) {
              return say(state, {
                polite: '小胸筋です。巻き肩の前側の原因は、ここです。鎖骨の下、肩の前を、服の上から押します。息を吐いてください',
                cracked: '小胸筋、ここです。……巻き肩の、前側。鎖骨の下を、服の上から。息、吐いて',
                mixed: '小胸筋、ここ。……巻き肩の本体だ。鎖骨の下、服の上から押す。俺、名前のついた場所しかしないです',
                casual: '小胸筋、ここだろ。巻き肩の前側。鎖骨の下。服の上からだ。名前のないところには、行かない'
              });
            }
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '',
            effect: function (state) { return state.slip ? 'pulse' : ''; },
            text: boundaryText
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            when: function (state) { return !!state.slip; },
            text: function (state) {
              return say(state, {
                polite: '……今のは、施術ではありません。すみません。手は戻します',
                cracked: '……今のは、施術じゃないです。すみません',
                mixed: '……今のは、施術じゃない。悪い。……俺、戻すです',
                casual: '……今のは、施術じゃない。悪い'
              });
            }
          },
          {
            chara: 'yui',
            face: function (state) { return state.wall >= 3 ? '困り' : '照れ'; },
            speaker: '由衣',
            text: yuiBed,
            choices: [
              {
                id: 'c4_stop',
                text: '身を硬くする。「……今日は、やめてください」',
                apply: { wall: 2, reason: 8, bpm: -10, revoked: 1 },
                next: 'resolve'
              },
              {
                id: 'c4_soften',
                text: '息を吐いて、力を抜く。自分からは、手を出さない',
                apply: { reason: -8, bpm: 12 },
                next: 'bedNeck'
              }
            ]
          }
        ]
      },

      // うなじ。触る前に聞く。掌は数センチ手前で止まり、由衣の返事を待つ。断れば語尾と同時に手が離れる。
      bedNeck: {
        lines: [
          {
            bg: 'assets/bed.png',
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: '最後に、うなじです。僧帽筋の上部と、後頭下筋。触る前に、聞きます。髪を、よけてもらえますか',
                cracked: '最後、うなじです。……僧帽筋と、後頭下筋。触る前に、聞きます。髪、よけて',
                mixed: '最後、うなじ。……僧帽筋、後頭下筋。触る前に聞く。それだけは、守るです。髪、よけて',
                casual: 'うなじだ。僧帽筋と後頭下筋。触る前に聞く。それだけは、守る。髪、よけろ'
              });
            }
          },
          {
            chara: 'yui',
            face: '照れ',
            speaker: '',
            effect: function (state) { return state.reason < 64 ? 'pulse' : ''; },
            text: '髪を片側へ寄せると、空気がうなじの産毛を撫でた。まだ触れていない。触れていないのに、皮膚のほうが先に答えを出している。'
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '',
            text: function (state) {
              if (state.reason >= 80) return '高瀬は掌を、うなじの数センチ上で止めている。温度だけが先に届く距離で、彼は返事を待つ。';
              if (state.reason >= 64) return '掌が、数センチ上で止まっている。呼吸が、一度、深くなった。返事を、待っている。';
              if (state.reason >= 46) return '止まった掌が、かすかに震えた。震えを自分の太腿に押しつけて隠す。返事は、まだ待つ。';
              return '掌が、うなじのすぐ上で固まったまま動かない。触れたい手と、触れない規則が、彼の腕の中で綱引きをしている。それでも、返事が来るまでは動かない。';
            }
          },
          {
            chara: 'yui',
            face: '赤面',
            speaker: '由衣',
            text: '……高瀬さん。',
            choices: [
              {
                id: 'c_n_yes',
                text: '「……お願いします」小さく、でも聞こえる声で',
                apply: { cross: 1, reason: -8, bpm: 10 },
                next: 'resolve'
              },
              {
                id: 'c_n_hair',
                text: '自分で髪をかき上げて、うなじを差し出す',
                apply: { cross: 2, reason: -12, bpm: 14 },
                next: 'resolve'
              },
              {
                id: 'c_n_wait',
                text: '何も言わず、枕に顔を埋める。答えは、まだ出さない',
                apply: { reason: -2, bpm: 4 },
                next: 'resolve'
              },
              {
                id: 'c_n_stop',
                text: '手の気配に気づいて、小さく首を振る。「……今日は、ここまでで」',
                apply: { wall: 2, reason: 6, bpm: -8, revoked: 1 },
                next: 'resolve'
              }
            ]
          }
        ]
      },

      end_normal: {
        lines: [
          {
            bg: function (state) { return state.sawBed ? 'assets/bed.png' : 'assets/bg_entrance.png'; },
            chara: null,
            speaker: '',
            text: normalNarration
          },
          {
            bg: 'assets/bg_entrance.png',
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: normalTakase
          },
          {
            chara: 'yui',
            face: '微笑み',
            speaker: '由衣',
            text: normalYui
          },
          {
            chara: null,
            speaker: '',
            text: function (state) {
              return closingPulse(state, '夜風が手首の内側を冷やす。また来る。そのことだけは、疑わなかった。');
            }
          },
          {
            chara: 'takase',
            face: '笑顔',
            speaker: '',
            text: '右上の心拍を開くと、今夜の裏カルテがある。',
            card: true
          }
        ]
      },

      end_almost: {
        lines: [
          {
            bg: 'assets/bed.png',
            chara: 'yui',
            face: '赤面',
            speaker: '',
            effect: 'pulse',
            text: almostOpen
          },
          {
            chara: 'yui',
            face: '照れ',
            speaker: '由衣',
            text: almostYui
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: almostTakase
          },
          {
            chara: 'takase',
            face: '色気',
            speaker: '',
            effect: 'fade',
            text: function (state) {
              if (state.slip) {
                return '由衣が、自分から力を抜いた。戻していた掌が、そのあとで持ち上がる。向かう先は、腿でも服の下でもない。由衣の顎の線までだ。額と額が、触れるか触れないかの距離で息を混ぜる。唇が重なる、その直前で、照明が落ちる。';
              }
              return '由衣が、自分から力を抜いた。そのあとで、掌が持ち上がる。向かう先は、顎の線までだ。額と額が、触れるか触れないかの距離で息を混ぜる。唇が重なる、その直前で、照明が落ちる。';
            }
          },
          {
            chara: null,
            speaker: '高瀬',
            text: function (state) {
              return say(state, {
                polite: '……今日は、もう店じまいです',
                cracked: '……もう、店じまい、です',
                mixed: '……もう店じまいだ。俺、ここまでしか',
                casual: '……もう、店じまいだ'
              });
            }
          },
          {
            chara: null,
            speaker: '',
            text: function (state) {
              return closingPulse(state, '暗がりの中に心拍だけが残る。先は、書かない。');
            }
          },
          {
            chara: null,
            speaker: '',
            text: '照明は、戻らない。',
            card: true
          }
        ]
      },

      end_awkward: {
        lines: [
          {
            bg: 'assets/bg_entrance.png',
            chara: 'yui',
            face: 'しょんぼり',
            speaker: '',
            text: awkwardOpen
          },
          {
            chara: 'takase',
            face: function (state) { return state.slip ? '困り' : takaseFace(state); },
            speaker: '高瀬',
            text: awkwardTakase
          },
          {
            chara: 'yui',
            face: '困り',
            speaker: '由衣',
            text: awkwardYui
          },
          {
            chara: null,
            speaker: '',
            text: function (state) {
              return closingPulse(state, '翌週の最終枠は、空いたまま残る。小野寺の名前は、次の月のどこにも現れない。');
            }
          },
          {
            chara: null,
            speaker: '',
            text: '翌週の最終枠は、空いたままだ。',
            card: true
          }
        ]
      }
    }
  };
})();
