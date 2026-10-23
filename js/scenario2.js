// 2回目。入り方は state.prior（1回目の終わり）で変わる。
// 口調の四段階は js/branching.js の speechBand。暗転は由衣が越えたあとだけ。
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

  function Q(polite, cracked, mixed, casual) {
    if (!polite || !cracked || !mixed || !casual) throw new Error('incomplete speech');
    return { polite: polite, cracked: cracked, mixed: mixed, casual: casual };
  }

  function priorOf(state) {
    if (state.prior === 'almost' || state.prior === 'awkward') return state.prior;
    return 'normal';
  }

  function byPrior(state, book) {
    return say(state, book[priorOf(state)]);
  }

  function choiceText(normal, almost, awkward) {
    return function (state) {
      if (priorOf(state) === 'almost') return almost;
      if (priorOf(state) === 'awkward') return awkward;
      return normal;
    };
  }

  function takaseFace(state) {
    var key = band(state);
    if (state.prior === 'almost' && key === 'polite') return '真顔';
    if (state.prior === 'awkward' && key === 'polite') return '困り';
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

  // 長編版の追加場面。口調は理性で四段階。丁寧=です/ます、崩れ=……、混じり=俺、タメ口=丁寧語なし。
  var talkAsk = Q(
    '最近のお仕事は、いかがですか。デスクの時間が長いと、肩甲骨は上がりやすいです。差し支えなければ、聞かせてください',
    '最近の仕事は、どう？ ……デスクの時間が長いと、肩甲骨は上がりやすい。差し支えなければ、聞かせて',
    '最近の仕事、どうだ。……デスクが長いと、肩甲骨は上がる。俺は、聞くだけでいい',
    '最近の仕事、どうだ。デスクが長いと、肩甲骨は上がる。話したいとこだけでいい'
  );
  var talkRebuff = Q(
    'わかりました。話したくなったら、いつでもどうぞ。今は、肩だけ見ています',
    'わかった。……話したくなったら、いつでも。今は、肩だけ見てる',
    'わかった。……話したくなったら、でいい。俺は、肩だけ見てる',
    'わかった。話したくなったらでいい。今は、肩だけ見てる'
  );
  var habitSee = Q(
    '話しているとき、右の肩が少し上がります。前回と同じ癖です。嘘をつくときではなく、我慢しているときに出ます',
    '話してるとき、右の肩が上がる。……前回と同じ癖。嘘のときじゃなくて、我慢してるときに出る',
    '話してるとき、右の肩が上がるんだ。……前回と同じ癖だ。俺は、我慢してるときだって知ってる',
    '話してるとき、右の肩が上がる。前回と同じ癖だ。嘘のときじゃねえ、我慢してるときに出る'
  );
  var teaOffer = Q(
    'お茶を淹れました。施術のあとは、体温が下がりやすいです。座って、少し温まってください',
    'お茶、淹れた。……施術のあとは、体温が下がる。座って、少し温まって',
    'お茶、淹れた。……体温が下がるから、座れ。俺は、立ってていい',
    'お茶、淹れた。体温が下がるから、座って温まれ。俺は立ってていい'
  );

  var priorName = { normal: '店じまいの笑顔', almost: '寸前', awkward: '空いた枠' };

  var openLine = {
    normal: Q(
      'いらっしゃい、由衣さん。肩甲骨、前回より下がったままです。大円筋も、いい位置です。大円筋からいきますか。それとも肩甲骨だけ、甘やかしますか',
      'いらっしゃい、由衣さん。肩甲骨、前回の位置のまま。……大円筋からいく？ それとも肩甲骨だけ、甘やかす？',
      'いらっしゃい。……肩甲骨、前回のままだ。大円筋もいい。どっちからいく？ 俺は、横で見てる',
      '来たな。肩甲骨、前回の位置だ。大円筋もいい。大円筋からいくか、肩甲骨だけ甘やかすか'
    ),
    almost: Q(
      'いらっしゃいませ。小野寺様。本日は肩甲骨挙上の確認のみ、実施させていただきます。小胸筋より先には触れません。どこまで見るかは……由衣さん',
      'いらっしゃい、ます。……小野寺様。本日は、肩甲骨挙上の確認のみです。小胸筋より先には、触れません。どこまでは……由衣さん',
      'いらっしゃい、ます。……っ、小野寺様。肩甲骨だけ、確認します。小胸筋より先は、俺からは越えません。……由衣さん',
      '小野寺、様。肩甲骨の確認だけだ。小胸筋より先は、触らねえ。……由衣'
    ),
    awkward: Q(
      'いらっしゃい。ご無沙汰しています。肩甲骨、見ますか',
      'ご無沙汰、しています。……肩甲骨、見ますか',
      'ご無沙汰、です。……肩甲骨を、見るか。俺からは、追わない',
      'ご無沙汰だ。肩甲骨、見るか。追いはしねえ'
    )
  };

  // 寸前の冒頭だけ。由衣さん、まで落ちた舌を、一拍おいて小野寺様へ戻す。
  var catchLine = Q(
    '……失礼しました。小野寺様。範囲は、小野寺様がお決めになります',
    '……失礼、しました。小野寺様、です。範囲は、小野寺様が決めて',
    '……今のは、俺の言い間違いです。小野寺様。範囲は、小野寺様が決める',
    '……今のは、言い間違いだ。小野寺様。範囲は、向こうが決める'
  );

  var openPrompt = {
    normal: Q(
      'どっちでも、できます。急がなくていいですよ',
      'どっちでも、いい。……急がなくていい',
      'どっちでもいいです。……俺は、急がない',
      'どっちでもいい。急ぐな'
    ),
    almost: Q(
      '大円筋の確認か、肩甲骨のみか、ご指定ください。こちらからは、選びません',
      '大円筋の確認か、肩甲骨のみか。……ご指定を、お願いします。こちらからは、選びません',
      '大円筋か、肩甲骨だけか。……俺からは、選ばないです',
      '大円筋か、肩甲骨か。選ぶのは、向こうだ。俺からは、選ばねえ'
    ),
    awkward: Q(
      '……返事は、待ちます',
      '……返事は、待つ',
      '……返事は、待つ。俺からは、聞かない',
      '返事は、待つ。もう聞かねえ'
    )
  };

  var floorBook = {
    quiet: {
      normal: Q(
        '承知しました。今日は大円筋の張りだけ、確認します。肩甲骨は、下げると楽になる場所だけ触ります',
        '承知しました。……大円筋の張りだけ、見ます。肩甲骨は、必要なところだけ',
        'わかった。……大円筋の張りだけだ。肩甲骨は、必要なとこだけ、俺が触るです',
        'わかった。大円筋の張りだけ見る。肩甲骨は、必要なとこだけだ'
      ),
      almost: Q(
        '承知いたしました。大円筋の走行のみ、確認させていただきます。前回越えた側の肩甲骨へは、必要な圧以上は加えません',
        '承知、いたしました。……大円筋の走行のみ、です。前回越えた側の肩甲骨へは、必要な圧以上は、加えません',
        '承知、です。……大円筋の走行だけ。前回越えた側には、俺からは圧を足さないです',
        '大円筋の走行だけだ。前回越えた側の肩甲骨には、圧を足さねえ'
      ),
      awkward: Q(
        '承知しました。空いた週のぶん張った大円筋だけ、お伝えします。肩甲骨は、由衣さんが許可した深さまでです',
        '承知しました。……空いた週のぶん、大円筋が張ってる。肩甲骨は、許可された深さまで',
        'わかった。……空いた週のぶん、大円筋が張ってる。肩甲骨の深さは、俺が決めないです',
        'わかった。空いた週のぶん、大円筋が張ってる。肩甲骨の深さは、由衣が決めて'
      )
    },
    easy: {
      normal: Q(
        '預かります。いつもの肩甲骨です。大円筋が腰を引っ張るので、そこを理由に下げます。息を、吐いてください',
        '預かります。いつもの肩甲骨。……大円筋が腰を引っ張る。そこを理由に、下げる。息、吐いて',
        '預かる。……いつもの肩甲骨だ。大円筋が腰を引っ張る。そこを理由に、俺が下げるです',
        '預かる。いつもの肩甲骨だ。大円筋が腰を引っ張る。そこを理由に、下げる。息を吐け'
      ),
      almost: Q(
        'お預かりします。本日の肩甲骨挙上です。前回越えた側には触れません。大円筋の名前の上だけ、下げさせていただきます',
        'お預かり、します。……本日の肩甲骨挙上です。前回越えた側には、触れません。大円筋の名前の上だけ、下げます',
        '預かる。……肩甲骨挙上だけだ。前回越えた側には、俺は触れないです。大円筋の名前の上だけ',
        '預かる。肩甲骨挙上だけだ。前回越えた側には、触らねえ。大円筋の名前の上だけ、下げる'
      ),
      awkward: Q(
        'お預かりします。空いた週のぶん、肩甲骨が上がっています。理由は大円筋の張りです。苦しいと言った瞬間、圧は零します',
        'お預かりします。……空いた週のぶん、肩甲骨が上がってる。理由は、大円筋。苦しいと言ったら、圧は零す',
        '預かる。……空いた週のぶん、肩甲骨が上がってる。理由は大円筋だ。苦しいと言ったら、俺は零すです',
        '預かる。空いた週のぶん、肩甲骨が上がってる。理由は大円筋だ。苦しいと言ったら、零す'
      )
    },
    work: {
      normal: Q(
        '肩甲骨だけ、ですね。いつもの肩甲骨です。大円筋が短縮しています。それを理由に、挙上を下げます',
        '肩甲骨だけ、ですね。いつもの肩甲骨。……大円筋が短縮してる。それを理由に、下げる',
        '肩甲骨だけ、だな。……いつもの肩甲骨だ。大円筋の短縮が理由だ。俺が、そこを下げるです',
        '肩甲骨だけだ。いつもの肩甲骨だ。大円筋の短縮が理由だ。そこを下げる'
      ),
      almost: Q(
        '肩甲骨のみ、承知いたしました。前回越えた側には、触れません。大円筋の短縮が、今日触る理由です',
        '肩甲骨のみ、承知しました。……前回越えた側には、触れません。大円筋の短縮が、今日の理由です',
        '肩甲骨だけ、承知です。……前回越えた側には、俺は触れない。大円筋の短縮が、理由です',
        '肩甲骨だけだ。前回越えた側には、触らねえ。理由は、大円筋の短縮だ'
      ),
      awkward: Q(
        '肩甲骨のみ、ですね。空いた週のぶん、大円筋が短縮しています。下げる合図は、由衣さんからです',
        '肩甲骨のみ、ですね。……空いた週のぶん、大円筋が短縮してる。下げる合図は、由衣さんから',
        '肩甲骨だけ、だ。……空いた週のぶん、大円筋が短縮してる。下げる合図は、俺からは出さないです',
        '肩甲骨だけだ。空いた週のぶん、大円筋が短縮してる。下げる合図は、由衣が出して'
      )
    }
  };

  var pulseBook = {
    normal: Q(
      '手を貸してください。橈骨動脈、ここで触れます。前回と同じ場所です。10秒だけ数えますね',
      '手、貸してください。橈骨動脈、ここです。……前回と同じ場所。10秒だけ',
      '手。……橈骨動脈、ここ。前回と同じ場所だ。10秒でいいです。俺、数えるんで',
      '手を出せ。橈骨動脈。前回と同じ場所だ。10秒も要らない'
    ),
    almost: Q(
      '右手を、お貸しください。橈骨動脈を、こちらが確認いたします。前回の手順どおり、10秒、数えさせていただきます',
      '右手を、お貸しください。……橈骨動脈、こちらが確認します。10秒、数えさせて、いただきます',
      '手、貸して。……橈骨動脈、俺が数える。10秒です。手順は、守るんで',
      '手を出せ。橈骨動脈は、俺が数える。10秒でいい。手順の外は、触らねえ'
    ),
    awkward: Q(
      '手を、貸してください。橈骨動脈、ここで触れます。空いていた週のことは、この脈では測りません。10秒だけです',
      '手を、貸してください。橈骨動脈、ここです。……空いていた週は、この脈では測らない。10秒だけ',
      '手。……橈骨動脈、ここだ。空いた週は、俺はこの脈では測らないです',
      '手を出せ。橈骨動脈、ここで測る。空いた週は、この脈では測らねえ'
    )
  };

  var pulseBackBook = {
    normal: Q(
      '由衣さん。それは、こちらの橈骨動脈です。数えるなら、どうぞ。引くも、そのままでいいです',
      '由衣さん、それは……。こちらの、橈骨動脈です。数えるなら、どうぞ',
      'それは、俺の橈骨動脈だ。……数えていいです。引くも、そのままでいい',
      '俺の橈骨動脈だ。数えるなら、数えろ。引いては、いねえ'
    ),
    almost: Q(
      'その接触は、手順にございません。橈骨動脈は、こちらが確認するものです。続けるなら、小野寺様のご判断でお願いします',
      'その接触は、手順に、ありません。……橈骨動脈は、こちらが確認するものです。続けるなら、小野寺様が決めて',
      '手順に、ないです。……俺の橈骨動脈だ。続けるなら、小野寺様が決めてください',
      '手順の外だ。俺の橈骨動脈に、触れてる。続けるのは、向こうが決めて'
    ),
    awkward: Q(
      '橈骨動脈、そこです。受け取ります。離しますか',
      '橈骨動脈、そこは……受け取ります。離しますか',
      '橈骨動脈、そこは俺が測る場所だ。……受け取る。離すか',
      '橈骨動脈、そこだ。受け取る。離すか'
    )
  };

  var inviteBook = {
    normal: Q(
      '店じまいです。奥で小胸筋を見ますか。それとも、今日はここまでにしますか',
      '店じまい、です。……奥で小胸筋、見る？ 今日は、ここまでにする？',
      '店じまい、です。……小胸筋を見るか、今日で終えるか。俺からは、誘わない',
      '店じまいだ。小胸筋を見るか、今日で終えるか。俺からは、誘わねえ'
    ),
    almost: Q(
      '本日は、ここまでにもできます。小胸筋を見るかは、小野寺様がお決めください。前回の範囲へは、こちらからご案内いたしません',
      '本日は、ここまでにも、できます。……小胸筋を見るかは、小野寺様が決めて。前回の範囲へは、ご案内しません',
      'ここまでにも、できるです。……小胸筋を見るかは、小野寺様だ。前回の範囲へは、俺からは案内しない',
      'ここまででもいい。小胸筋を見るかは、向こうが決めて。前回の範囲へは、俺からは案内しねえ'
    ),
    awkward: Q(
      '大円筋の張りは、お伝えしました。ベッドへ、来ますか',
      '大円筋の張りは、お伝えしました。……ベッドへ、来ますか',
      '大円筋の張りは、伝えた。……ベッドへ来るか。俺からは、埋めない',
      '大円筋の張りは、伝えた。ベッドへ来るか。次の枠は、埋めねえ'
    )
  };

  var bedOpenBook = {
    normal: Q(
      'うつ伏せで、楽にしてください。見るのは、いつもの肩甲骨と、短縮した小胸筋です。息を吐いてください',
      'うつ伏せで、楽にして。……見るのは、いつもの肩甲骨と、小胸筋。息、吐いて',
      'うつ伏せ。……いつもの肩甲骨と、小胸筋だけだ。俺は、名前のある場所しかしないです',
      'うつ伏せになれ。いつもの肩甲骨と、小胸筋だけだ。名前のないところには、行かない'
    ),
    almost: Q(
      'うつ伏せで、お願いいたします。施術範囲は肩甲骨挙上と小胸筋の短縮までです。前回の外側へは、進みません',
      'うつ伏せで、お願いします。……範囲は、肩甲骨挙上と小胸筋まで。前回の外側へは、進みません',
      'うつ伏せ。……範囲は肩甲骨と小胸筋までだ。前回の外側へは、俺は進まないです',
      'うつ伏せになれ。範囲は肩甲骨と小胸筋までだ。前回の外側へは、進まねえ'
    ),
    awkward: Q(
      'うつ伏せで、お願いします。空いた週で戻った肩甲骨挙上を、大円筋と小胸筋の短縮として下げます。深さは、言われたところで止めます',
      'うつ伏せで。……空いた週で戻った肩甲骨を、大円筋と小胸筋として下げる。深さは、言われたところで止める',
      'うつ伏せ。……空いた週の肩甲骨を、大円筋と小胸筋として下げる。深さは、俺が勝手に足さないです',
      'うつ伏せになれ。空いた週の肩甲骨を、大円筋と小胸筋として下げる。深さは、言われたところで止める'
    )
  };

  var pecBook = {
    normal: Q(
      '小胸筋です。巻き肩の前側の理由は、ここです。鎖骨の下、服の上から。前回と同じ、名前の範囲です',
      '小胸筋、ここです。……巻き肩の前側。鎖骨の下、服の上から。前回と同じ範囲',
      '小胸筋、ここ。……巻き肩の本体だ。鎖骨の下、服の上からだ。俺、名前のついた場所しかしないです',
      '小胸筋、ここだ。巻き肩の前側。鎖骨の下。服の上からだ。名前のないところには、行かない'
    ),
    almost: Q(
      '小胸筋を、確認させていただきます。前回、この名前の外へ出かかった場所です。本日は鎖骨の下、服の上、名前の内側だけです',
      '小胸筋、ここです。……前回、名前の外へ出かかった場所。今日は鎖骨の下、服の上だけ',
      '小胸筋、ここ。……前回、名前の外へ出かかった。今日は鎖骨の下だけだ。俺は、外へ出ないです',
      '小胸筋、ここだ。前回、名前の外へ出かかった。今日は鎖骨の下だけだ。外へは、出ねえ'
    ),
    awkward: Q(
      '小胸筋です。空いていたあいだに、短縮が戻っています。鎖骨の下を、服の上から押します。ベッドに残ったのは、由衣さんです',
      '小胸筋、ここです。……空いていたあいだに、短縮が戻ってる。鎖骨の下、服の上から。残ったのは、由衣さん',
      '小胸筋、ここ。……空いたあいだに、短縮が戻ってる。鎖骨の下、服の上からだ。残ったのは、俺じゃなくて由衣さんだ',
      '小胸筋、ここだ。空いたあいだに、短縮が戻ってる。鎖骨の下、服の上からだ。残ったのは、由衣のほうだ'
    )
  };

  var apologyBook = {
    normal: Q(
      '……今のは、施術ではありません。すみません。手は、小胸筋へ戻します',
      '……今のは、施術じゃないです。すみません。手は、戻しました',
      '……今のは、施術じゃない。悪い。……俺、小胸筋へ戻した',
      '……今のは、施術じゃない。悪い'
    ),
    almost: Q(
      '……ただいまのは、施術ではございません。失礼いたしました。掌は、小胸筋へ戻します',
      '……今のは、施術では、ありません。失礼しました。掌は、小胸筋です',
      '……今のは、施術じゃない。失礼、しました。……俺の掌だ。小胸筋へ戻す',
      '……今のは、施術じゃない。掌は、戻した。小胸筋までだ'
    ),
    awkward: Q(
      '……外れました。小胸筋へ、戻します。追いません',
      '……外れました。小胸筋へ、戻す。追いません',
      '……外れた。小胸筋へ戻す。俺は、追わないです',
      '……外れた。小胸筋へ戻す。追わねえ'
    )
  };

  var keepBook = {
    normal: Q(
      'はい、今日はここまでです。いつもの肩甲骨は、いい位置で終わります。また来るかは、由衣さんの機嫌次第です',
      '今日は、ここまでです。……いつもの肩甲骨は、いい位置。また来るかは、機嫌次第',
      'ここまで、です。……肩甲骨は、いい位置だ。また来るかは、由衣さんだ。俺からは、決めない',
      'ここまでだ。肩甲骨は、いい位置で終わった。また来るかは、由衣の機嫌次第だ'
    ),
    almost: Q(
      '本日の施術は、以上とさせていただきます。肩甲骨挙上は、確認の範囲で終了です。次回は、小野寺様のご判断でお願いいたします',
      '本日は、以上とさせていただきます。……肩甲骨挙上は、確認の範囲で終了です。次回は、小野寺様の判断で',
      '以上、です。……肩甲骨は、確認の範囲で終わった。次回は、俺からは決めないです',
      '以上だ。肩甲骨は、確認の範囲で終わった。次回を決めるのは、向こうだ'
    ),
    awkward: Q(
      'ここまでです。大円筋の張りは、お伝えしました。次は、埋めますか',
      'ここまで、です。……大円筋の張りは、伝えた。次は、埋めますか',
      'ここまでだ。……大円筋のことは、伝えた。次の枠は、俺からは埋めない',
      'ここまでだ。大円筋のことは、伝えた。次の枠は、埋めねえ'
    )
  };

  var keepStopBook = {
    normal: Q(
      'はい。今、離しました。小胸筋は、ここまでです',
      '……離しました。今です。小胸筋は、ここまで',
      '離した。今、です。小胸筋より先は、俺は行ってない',
      '離した。今だ。小胸筋より先は、行ってねえ'
    ),
    almost: Q(
      'はい。ただいま、離しました。小胸筋より先へは、進みません',
      '……離しました。今です。小胸筋より先へは、進みません',
      '離した。今、です。小胸筋より先は、俺は進まない',
      '離した。今だ。小胸筋より先は、進まねえ'
    ),
    awkward: Q(
      'はい。今、離しました。追いません。小胸筋は、ここまでです',
      '……離しました。今です。追わない。小胸筋は、ここまで',
      '離した。今、です。俺は、追わない。小胸筋までだ',
      '離した。今だ。追わねえ。小胸筋までだ'
    )
  };

  var leaveStopBook = {
    normal: Q(
      'はい。今、離しました。先に漏れた息のことは、謝ります。施術は、ここまでです',
      '……離しました。今です。先の息は、謝ります。今日は、ここまで',
      '離した。今、です。悪かったのは、その前の息だ。……俺の息だ',
      '離した。今だ。悪かったのは、その前の息だ'
    ),
    almost: Q(
      'はい。ただいま、離しました。先に漏れた息は、失礼いたしました。施術は、ここまでです',
      '……離しました。今です。先の息は、失礼でした。今日は、ここまで',
      '離した。今、です。悪かったのは、その前の息だ。俺の、丁寧さが遅れた',
      '離した。今だ。悪かったのは、その前の息だ。積んだぶん、遅れた'
    ),
    awkward: Q(
      'はい。今、離しました。先の息は、謝ります。追いません',
      '……離しました。今です。先の息は、謝る。追わない',
      '離した。今、です。悪かったのは、その前の息だ。俺は、追わない',
      '離した。今だ。悪かったのは、その前の息だ。追わねえ'
    )
  };

  var nearBook = {
    normal: Q(
      '……由衣さんが、越えてきました。こちらは、顎の線までです',
      '……越えて、きた。こちらは、顎の線まで、です',
      '……越えてきた。俺は、顎までだ。……です',
      '由衣が、越えた。俺は、顎までだ'
    ),
    almost: Q(
      '……手続きの、外側です。由衣さんが越えたので、顎の線まで、参ります',
      '……手続きの、外です。由衣さんが、越えた。顎の線まで、です',
      '……手続きの外だ。越えたのは、由衣だ。俺は、顎まで、です',
      '手続きは、もうない。越えたのは由衣だ。俺は、顎までだ'
    ),
    awkward: Q(
      '……三週、待ちませんでした。越えてきたのは、由衣さんです。顎の線まで、触れます',
      '……待って、ない。越えてきたのは、由衣さんだ。顎の線まで、です',
      '……俺は、待ってない。越えたのは由衣だ。顎まで、です',
      '待っちゃいねえ。越えたのは由衣だ。俺は、顎までだ'
    )
  };

  var leaveCalmBook = {
    normal: Q(
      '承知しました。肩甲骨は、今日の位置のままお帰りください。見送りは、しません',
      '承知しました。……肩甲骨は、今日の位置のまま。見送りは、しません',
      'わかった。……肩甲骨は、その位置のままだ。見送りは、俺からはしないです',
      'わかった。肩甲骨は、その位置のままでいい。見送りは、しねえ'
    ),
    almost: Q(
      '承知いたしました。本日は肩甲骨の確認のみで、終了とさせていただきます。扉の外までは、お送りしません',
      '承知、いたしました。……肩甲骨の確認のみで、終了です。扉の外までは、送りません',
      '承知、です。……肩甲骨の確認だけで、終わる。扉の外までは、俺は送らないです',
      '承知した。肩甲骨の確認だけで、終わる。扉の外までは、送らねえ'
    ),
    awkward: Q(
      '承知しました。大円筋の所見だけ、残します。次の予約は、由衣さんからでない限り、入れません',
      '承知しました。……大円筋の所見だけ、残す。次の予約は、由衣さんからでないと、入れない',
      'わかった。……大円筋の所見だけ残す。次は、俺からは入れないです',
      'わかった。大円筋の所見だけ残す。次は、俺からは入れねえ'
    )
  };

  function openNarration(state) {
    if (priorOf(state) === 'almost') {
      return '翌週の最終枠。前回、唇の手前で照明が落ちた。その話を、どちらも予約の名には書いていない。高瀬は扉の前で息を整え、丁寧語を一段、厚く積む。';
    }
    if (priorOf(state) === 'awkward') {
      return '最終枠は、三週空いていた。由衣が自分で、もう一度この時間を入れた。高瀬は空いていた週の数を口にしないまま、扉を開ける。';
    }
    return '翌週の、同じ最終枠。由衣はコートのボタンを、来る前から外していた。高瀬のえくぼは、まだ仕事の距離にある。';
  }

  function openYui(state) {
    if (priorOf(state) === 'almost') return '……今、由衣さん、って言って、戻しましたね';
    if (priorOf(state) === 'awkward') return '……三週間、自分で空けました。肩は、また上がってます';
    return 'こんにちは。前回、肩甲骨が下がったまま帰れたんです。今日も、お願いします';
  }

  function floorMode(state) {
    if (state.wall >= 2) return 'quiet';
    if (state.cross >= 1) return 'easy';
    return 'work';
  }

  function floorNarration(state) {
    var mode = floorMode(state);
    if (priorOf(state) === 'almost') {
      return '掌は、言うより先に大円筋へは乗らない。乗せる前に、肩甲骨挙上という言葉を置く。前回、名前が遅れた場所を、今日は先に囲っている。' + (mode === 'easy' ? '由衣が預けたのに、距離だけは手順の長さで保たれている。' : '');
    }
    if (priorOf(state) === 'awkward') {
      return '大円筋は、空いた週のぶんだけ正直に硬い。高瀬はそれを所見として言い、なぜ来なかったかは聞かない。肩甲骨を下げる圧は、名前のついた筋の上から外れない。';
    }
    return 'いつもの肩甲骨へ、親指が沈む。理由は大円筋が腰を引っ張っているからだ、と掌の熱より先に言葉がある。預かった信頼は、まだ施術の距離のまま温かい。';
  }

  function floorYui(state) {
    var prior = priorOf(state);
    if (state.wall >= 2) {
      if (prior === 'almost') return '……はい。今日は、確認だけでお願いします';
      if (prior === 'awkward') return '……はい。深くは、しないでください';
      return '……はい。今日は、肩甲骨だけで';
    }
    if (state.cross >= 1) {
      if (prior === 'almost') return 'っ……大円筋、そこ。前回より、言葉が先です';
      if (prior === 'awkward') return 'っ……大円筋、三週ぶん、張ってます';
      return 'っ……大円筋、そこ、前回の場所です';
    }
    if (prior === 'almost') return 'くっ……肩甲骨、その言い方のまま、お願いします';
    if (prior === 'awkward') return 'くっ……肩甲骨、上がったままです。いけます';
    return 'くっ……肩甲骨、下がってますか。まだ、いけます';
  }

  function wristNarration(state) {
    if (priorOf(state) === 'almost') {
      return '手首が引かれた瞬間、親指は手順ごと橈骨動脈から離れた。理由のなくなった指は、一秒も残さない。';
    }
    if (priorOf(state) === 'awkward') {
      return '手首が引かれた瞬間、親指は橈骨動脈から離れた。追いかけない。空いた週と同じで、手は伸ばさない。';
    }
    return '手首が引かれた瞬間、親指は橈骨動脈から離れた。数える理由が消えたので、熱も置いていかない。';
  }

  function pulseComment(state) {
    if (state.cross >= 2) {
      return byPrior(state, {
        normal: Q(
          'ご自分で言えますね。呼吸は戻っています。橈骨動脈だけ、別の速さをしています',
          '自分で、言えるんですね。……呼吸は戻ってる。橈骨動脈だけ、別',
          '自分で言うんだ。……呼吸は戻ってる。橈骨動脈は、俺の指の中で別だ',
          '自分で言える。呼吸は戻ってる。橈骨動脈だけ、嘘がつけない'
        ),
        almost: Q(
          'ご申告、承知いたしました。呼吸は回復しております。橈骨動脈のみ、手順の説明を超えています',
          'ご申告、承知しました。……呼吸は、戻ってる。橈骨動脈だけ、説明を超えてます',
          '自分で言った。……呼吸は戻ってる。橈骨動脈は、俺の説明の外です',
          '自分で言ったな。呼吸は戻ってる。橈骨動脈は、説明の外だ'
        ),
        awkward: Q(
          'その申告は、受け取っておきます。呼吸は戻っています。橈骨動脈だけが、空いた週を説明しません',
          'その申告、受け取っておきます。……呼吸は戻ってる。橈骨動脈だけ、週の説明にならない',
          '自分で言った。……呼吸は戻ってる。橈骨動脈は、俺には空いた週を説明しないです',
          '自分で言った。呼吸は戻ってる。橈骨動脈は、空いた週の説明にはならねえ'
        )
      });
    }
    return byPrior(state, pulseBook);
  }

  function boundaryText(state) {
    if (state.slip) {
      if (priorOf(state) === 'almost') {
        return '親指が、前回と同じところまで滑る。鎖骨の下、小胸筋の名前の外。吐息がうなじに落ちて、半秒。高瀬は自分の手に気づき、掌を小胸筋へ引き戻す。残したのは、その半秒だけだ。';
      }
      if (priorOf(state) === 'awkward') {
        return '空いた週のぶん硬い大円筋を辿っていた親指が、半秒、名前の外へ出る。吐息が落ちる。高瀬は追いかけず、掌を小胸筋へ戻す。';
      }
      return '大円筋の熱が、名前の外側まで落ちる。吐息がうなじに触れて、半秒。高瀬は掌を小胸筋へ引き戻す。残したのは、その半秒だけだ。';
    }
    if (priorOf(state) === 'almost') {
      return '掌は、小胸筋の走行で止まる。止めるための言葉が、いつもより長い。長いぶん、前回の沈黙は埋まらない。';
    }
    if (priorOf(state) === 'awkward') {
      return '掌は、大円筋の端で止まる。空いていた週を、彼は質問にしない。';
    }
    return '掌は、大円筋の走行に沿って止まる。前回と同じ場所で、同じ理由で、終わる。';
  }

  function bedScapula(state) {
    if (priorOf(state) === 'almost') {
      return '肩甲骨の内側へ、親指が沈む。理由は挙上を戻すためだと、触れる前に言った。前回、名前が足りなくなった場所を、今日は先に囲っている。';
    }
    if (priorOf(state) === 'awkward') {
      return '肩甲骨の内側へ、親指が沈む。空いた週で戻った挙上を、大円筋ごと下げる。深さは、由衣が残ると決めたぶんだけだ。';
    }
    return '肩甲骨の内側へ、親指が沈む。いつもの挙上を、大円筋ごと下げる。痛くて、甘い。熱は、筋肉の名前の内側にある。';
  }

  function yuiBed(state) {
    if (state.slip) {
      if (priorOf(state) === 'almost') return 'ん……っ。今の息、施術の言葉より、先に落ちました。小胸筋の、下です';
      if (priorOf(state) === 'awkward') return '……息が、先に落ちました。空いてたぶん、わかりやすいです';
      return 'ん……っ。息が、当たってました。小胸筋、って言った場所より、下に、熱が……';
    }
    if (priorOf(state) === 'almost') return '……小胸筋、ですね。前回より、言葉が、多いです';
    if (priorOf(state) === 'awkward') return '……大円筋、ひびきます。空いてたあいだに、硬くなってます';
    return 'んっ……肩甲骨、下がります。声、出して、ごめんなさい';
  }

  function nearNarration(state) {
    var prior = priorOf(state);
    var head;
    if (state.pulseReturned) {
      if (prior === 'almost') head = '由衣の親指が、丁寧語の下の橈骨動脈を押さえたまま、離さない。';
      else if (prior === 'awkward') head = '由衣の親指が、三週ぶりの橈骨動脈を押さえたまま、離さない。';
      else head = '由衣の親指が、高瀬の橈骨動脈を押さえたまま、離さない。';
    } else if (prior === 'almost') {
      head = '「触れてほしい」と、厚い敬語のあいだで由衣が言った。取り消していない。';
    } else if (prior === 'awkward') {
      head = '「触れてほしい」と、空いた週のあとに由衣が言った。取り消していない。';
    } else {
      head = '「触れてほしい」と、由衣が言った。取り消していない。';
    }
    var tail = 'そのあとで、戻していた掌が顎の線まで上がる。唇の直前で、照明が落ちる。';
    if (prior === 'almost') return head + '厚い丁寧語は、由衣が越えたあとに折れる。' + tail;
    if (prior === 'awkward') return head + '三週ぶんの沈黙を、先に破ったのは由衣のほうだ。' + tail;
    return head + 'いつもの肩甲骨の熱を、今日は由衣が自分で名前にした。' + tail;
  }

  function leaveNarration(state) {
    var prior = priorOf(state);
    if (state.revoked) {
      if (prior === 'almost') {
        return '「やめてください」は、厚い丁寧語を割って届いた。掌は、その語尾と同時に離れた。手順の外に、指は残さない。';
      }
      if (prior === 'awkward') {
        return '「やめてください」は、空いた週のあとの声だった。掌は、その語尾と同時に離れた。追いかけない。';
      }
      return '「やめてください」は、小さくて、はっきりしていた。掌は、その語尾と同時に離れた。断られたあとに、彼は触っていない。';
    }
    if (state.pulseReturned && !state.sawBed) {
      if (prior === 'almost') return '脈を返した指を膝へ戻して、由衣はコートを取る。丁寧語のまま、高瀬は扉まで出ない。';
      if (prior === 'awkward') return '脈を返した指を膝へ戻して、由衣はコートを取る。高瀬は空いた週を埋めに、扉まで出ない。';
      return '脈を返した指を膝へ戻して、由衣はコートを取る。高瀬は扉まで出ない。';
    }
    if (priorOf(state) === 'awkward') {
      return '空いていた週が、もう一度、予定表に戻りかける。高瀬は次の枠を自分からは埋めない。大円筋の所見だけが、カルテに残る。';
    }
    if (priorOf(state) === 'almost') {
      return '丁寧語は、最後まで厚いまま扉の内側に残る。高瀬は、落ちた照明の話をしない。見送りもしない。';
    }
    return '由衣は、自分の足で玄関に戻った。いつもの肩甲骨の熱だけが、コートの下に残る。高瀬は、追いかけていない。';
  }

  function keepNarration(state) {
    if (state.revoked) {
      if (priorOf(state) === 'almost') {
        return '止めて、の言葉と同時に、掌は小胸筋から離れた。厚い丁寧語ごと、施術はそこで閉じる。次は、由衣が決める。';
      }
      if (priorOf(state) === 'awkward') {
        return '止めて、の言葉と同時に、掌は小胸筋から離れた。空いた週の所見は、そこで閉じる。次の枠は、埋めない。';
      }
      return '止めて、の言葉と同時に、掌は小胸筋から離れた。名前のついた施術は、そこで閉じる。次に来るかは、まだ由衣の側にある。';
    }
    if (priorOf(state) === 'almost') {
      return '厚い丁寧語のまま、最終枠が終わる。前回の暗がりは、どちらの口からも出なかった。距離は不自然で、それでも壊れてはいない。';
    }
    if (priorOf(state) === 'awkward') {
      return '空いた週の所見を伝えきって、高瀬は次の予約欄を空白のまま閉じる。埋めるなら、由衣が自分で入れる。';
    }
    return 'いつものえくぼが、仕事の距離で戻ってくる。肩甲骨の熱はコートの下に残り、由衣はまたこの時間を選べる。';
  }

  function closingPulse(state, tail) {
    return '最後に残った脈は、' + state.bpm + '。理性の残りは、' + state.reason + '。' + tail;
  }

  function catchMemo(state) {
    if (priorOf(state) !== 'almost') return '';
    return '冒頭で、小野寺様が由衣さんまで落ちた。一拍置いて、自分で小野寺様へ戻した。\n';
  }

  function secretFor(state, ending) {
    var head = '2回目。前回は' + (priorName[priorOf(state)] || '') + '。脈は最後' + state.bpm + 'くらい。俺の残りは' + state.reason + '。' + maskLine(state) + '\n' + catchMemo(state);
    if (ending === 'near') {
      return '【裏メモ】\n' + head + '\n越えてきたのは由衣のほうだ。俺は顎までしか行ってない。\n肩甲骨も小胸筋も大円筋も、名前を先に置いた。名前の外へ滑った半秒は、自分で戻した。\n照明を落としたのは、唇の前だ。先は、この紙の外に置く。';
    }
    if (ending === 'leave') {
      if (state.revoked) {
        return '【裏メモ】\n' + head + '\nやめて、の語尾と同時に離した。断られたあとに触ってはいない。\n漏れたのは、その前の吐息と半秒だ。大円筋の終わりだと思った場所より、熱が下だった。\n次の枠は、自分からは埋めない。';
      }
      return '【裏メモ】\n' + head + '\n追ってない。橈骨動脈も、抜かれたらその場で離した。\n肩甲骨の所見は伝えた。来なかった週の理由は、聞いてない。\n空いた枠を、自分から埋める気はない。';
    }
    return '【裏メモ】\n' + head + '\n今日は、名前のついた場所で終われた。肩甲骨、大円筋、小胸筋。\n由衣さんが自分で越えるまでは、俺からは動かない。その規則は、2回目も生きてる。\n次を決めるのは、向こうだ。';
  }

  function publicFor(state, ending) {
    var body = '【主訴】頚肩部慢性緊張。肩甲骨挙上・巻き肩。2回目。\n【所見】大円筋および小胸筋の短縮。橈骨動脈で脈拍を確認。退店時おおよそ' + state.bpm + '。\n【前回】' + (priorName[priorOf(state)] || '') + 'の最終枠の続き。';
    if (ending === 'near') return body + '\n【内容】徒手の途中で記録が途切れる。公式には予定を繰り上げて終了。';
    if (ending === 'leave') return body + '\n【内容】' + (state.sawBed ? '本人の申出により早期終了。' : '本人希望によりベッド施術は見送り。') + '\n【次回】再予約の意思表示なし。追跡しない。';
    return body + '\n【内容】名前のついた筋の範囲で終了。\n【次回】再予約は本人の連絡待ち。';
  }

  window.SCENARIO2 = {
    session: 2,
    start: 'open',
    resolveEnding: function (state) { return B.resolveSession2(state); },
    endingNode: {
      keep: 'end_keep',
      near: 'end_near',
      leave: 'end_leave'
    },
    endings: {
      keep: {
        name: function (state) {
          if (priorOf(state) === 'almost') return '丁寧な距離';
          if (priorOf(state) === 'awkward') return '空いた週のあと';
          return 'いつもの最終枠';
        },
        kicker: function (state) {
          if (priorOf(state) === 'almost') return '厚い丁寧語のまま、名前の内側で終わった';
          if (priorOf(state) === 'awkward') return '空いた週の所見だけで、名前の内側で終わった';
          return '2回目は、名前の内側で終わった';
        },
        blurb: function (state) {
          if (priorOf(state) === 'almost') return '丁寧語は厚いまま、前回の暗がりは口に出なかった。';
          if (priorOf(state) === 'awkward') return '所見は伝えた。次の枠を埋めるかは、由衣が決める。';
          return 'いつもの肩甲骨で終えて、また来るかどうかは由衣に残した。';
        }
      },
      near: {
        name: function (state) {
          if (priorOf(state) === 'almost') return '敬語が折れる';
          if (priorOf(state) === 'awkward') return '自分の足で';
          return '名前を越えて';
        },
        kicker: function (state) {
          if (priorOf(state) === 'almost') return '厚い丁寧語を折ったのは、由衣のほう';
          if (priorOf(state) === 'awkward') return '空いた週を破ったのは、由衣のほう';
          return '越えたのは、由衣のほう';
        },
        blurb: function (state) {
          if (state.pulseReturned) {
            if (priorOf(state) === 'almost') return '親指が、丁寧語の下の橈骨動脈に戻った。唇の前で、照明だけが落ちた。';
            if (priorOf(state) === 'awkward') return '親指が、三週ぶりの橈骨動脈に戻った。唇の前で、照明だけが落ちた。';
            return '親指が橈骨動脈に戻った。唇の前で、照明だけが落ちた。';
          }
          if (priorOf(state) === 'almost') return '厚い敬語のあいだで、触れてほしい、を取り消さなかった。顎まで来て、そこで暗転した。';
          if (priorOf(state) === 'awkward') return '空いた週のあとに、触れてほしい、を取り消さなかった。顎まで来て、そこで暗転した。';
          return '触れてほしい、を取り消さなかった。顎まで来て、そこで暗転した。';
        }
      },
      leave: {
        name: function (state) {
          if (priorOf(state) === 'almost') return '言わないまま';
          if (priorOf(state) === 'awkward') return 'また空く枠';
          return '今日はここまで';
        },
        kicker: function (state) {
          if (priorOf(state) === 'almost') return '丁寧語のまま、扉まで出ない';
          if (priorOf(state) === 'awkward') return '空いた週は、扉の外まで追わない';
          return '高瀬は、扉まで出ない';
        },
        blurb: function (state) {
          if (state.revoked) {
            if (priorOf(state) === 'almost') return '拒まれた語尾で、手順ごと手が離れた。次の枠は、自分からは埋めない。';
            if (priorOf(state) === 'awkward') return '拒まれた語尾で手が離れた。空いた週は、追いかけない。';
            return '拒まれた瞬間、手は離れていた。次の枠は、自分からは埋めない。';
          }
          if (priorOf(state) === 'awkward') return '空いた週の所見だけが残った。追跡はしない。';
          if (priorOf(state) === 'almost') return '丁寧語のまま、由衣が自分で玄関へ戻った。見送りはしない。';
          return '由衣が自分で玄関へ戻った。見送りはしない。';
        }
      }
    },
    notes: function (state, ending) {
      if (!ending) {
        return {
          title: '高瀬の電子カルテ：小野寺由衣 様（2回目・施術中）',
          publicNote: '【主訴】肩甲骨挙上・巻き肩。2回目。\n【前回】' + (priorName[priorOf(state)] || '') + '。\n【所見】大円筋・小胸筋を確認中。橈骨動脈はおおよそ' + state.bpm + '。',
          secretNote: '【途中メモ】\n前回は' + (priorName[priorOf(state)] || '') + '。脈' + state.bpm + '。残り' + state.reason + '。\n' + maskLine(state) + '\n' + catchMemo(state) + '客が自分の足で越えてくるまで、俺からは動かない。'
        };
      }
      return {
        title: '高瀬の電子カルテ：小野寺由衣 様（2回目）',
        publicNote: publicFor(state, ending),
        secretNote: secretFor(state, ending)
      };
    },
    nodes: {
      open: {
        lines: [
          {
            bg: 'assets/bg_entrance.png',
            chara: null,
            speaker: '',
            text: openNarration
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) { return byPrior(state, openLine); }
          },
          {
            chara: null,
            speaker: '',
            when: function (state) { return priorOf(state) === 'almost'; },
            text: '一拍、店の中が黙る。高瀬は自分の舌に気づき、息を一度だけ飲み直す。'
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            when: function (state) { return priorOf(state) === 'almost'; },
            text: function (state) { return say(state, catchLine); }
          },
          {
            chara: 'yui',
            face: function (state) {
              if (priorOf(state) === 'almost') return '困り';
              if (priorOf(state) === 'awkward') return 'しょんぼり';
              return '微笑み';
            },
            speaker: '由衣',
            text: openYui
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) { return byPrior(state, openPrompt); },
            choices: [
              {
                id: 's2_easy',
                text: choiceText(
                  '「前回の続きで、肩を預けたいです」コートを置く',
                  '「確認の続きで、肩を預けたいです」コートを置く',
                  '「三週ぶりでも、肩を預けます」コートを置く'
                ),
                apply: { reason: -6, cross: 1, bpm: 14 },
                next: 'floor'
              },
              {
                id: 's2_work',
                text: choiceText(
                  '「肩甲骨だけ、見てください」背筋を伸ばす',
                  '「肩甲骨の確認だけ、お願いします」背筋を伸ばす',
                  '「肩甲骨だけ、見てください」それ以上は言わない'
                ),
                apply: { reason: 4, wall: 1, bpm: 4 },
                next: 'floor'
              },
              {
                id: 's2_quiet',
                text: choiceText(
                  '前回の話は、しない。バッグを抱えたまま頷く',
                  '照明の話は、しない。バッグを抱えたまま頷く',
                  '空いた週の話は、しない。バッグを抱えたまま頷く'
                ),
                apply: { reason: 2, wall: 2, bpm: -8 },
                next: 'floor'
              }
            ]
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
            text: function (state) { return byPrior(state, floorBook[floorMode(state)]); }
          },
          {
            chara: 'yui',
            face: function (state) { return state.wall >= 2 ? '困り' : '赤面'; },
            speaker: '',
            text: floorNarration
          },
          {
            chara: 'yui',
            face: function (state) { return state.wall >= 2 ? '困り' : '息切れ'; },
            speaker: '由衣',
            text: floorYui
          },
          {
            chara: null,
            speaker: '',
            apply: { bpm: 12 },
            text: function (state) {
              if (priorOf(state) === 'almost') return 'セットが終わる。タオルを渡す手は、手順の長さだけ丁寧だ。残った熱を、高瀬は所見の言葉で覆う。';
              if (priorOf(state) === 'awkward') return 'セットが終わる。冷たい水だけを置く。空いた週の熱は、大円筋の所見に収めて、それ以上は聞かない。';
              return 'セットが終わる。タオルと、冷たい水。残った熱は、まだいつもの肩甲骨の名前で説明がつく。';
            }
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            effect: 'pulse',
            text: function (state) { return byPrior(state, pulseBook); }
          },
          {
            chara: 'takase',
            face: '真顔',
            speaker: '',
            text: function (state) {
              if (priorOf(state) === 'almost') return '親指の腹が、右手首の橈骨動脈に乗る。手順書のとおり、数えるためだけに置く。前回の熱は、ここに置かない。';
              if (priorOf(state) === 'awkward') return '親指の腹が、右手首の橈骨動脈に乗る。数えるためだけだ。空いた週は、この脈では測らない。';
              return '親指の腹が、右手首の橈骨動脈に乗る。触る理由は、前回と同じ、脈を数えるためだけだ。';
            },
            choices: [
              {
                id: 's2_pull',
                text: choiceText(
                  '手首を抜く。「……測らなくて、いいです」',
                  '手首を抜く。「……手順どおりで、いいです」',
                  '手首を抜く。「……測らなくて、いいです。聞かないで」'
                ),
                apply: { reason: 8, wall: 2, bpm: -10, wristOff: 1 },
                next: 'afterPulse'
              },
              {
                id: 's2_stay',
                text: choiceText(
                  '目を逸らしたまま、手首を預けておく',
                  '目を逸らしたまま、厚い丁寧語に手首を預けておく',
                  '目を逸らしたまま、三週ぶりの手首を預けておく'
                ),
                apply: { reason: -8, bpm: 14 },
                next: 'afterPulse'
              },
              {
                id: 's2_name',
                text: choiceText(
                  '「落ちてないのは、前回のせいです。運動じゃ、ない」',
                  '「落ちてないのは、前回の、あの距離のせいです」',
                  '「落ちてないのは、空けた週のせいです。運動じゃ、ない」'
                ),
                apply: { cross: 1, reason: -14, bpm: 20 },
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
            chara: null,
            speaker: '',
            when: function (state) { return !!state.wristOff; },
            text: wristNarration
          },
          {
            bg: 'assets/bg_training.png',
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            when: function (state) { return !state.wristOff; },
            text: pulseComment
          },
          {
            chara: null,
            speaker: '',
            when: function (state) { return !state.wristOff; },
            text: function (state) {
              var prior = priorOf(state);
              if (state.reason >= 80) {
                if (prior === 'almost') return '指は、数える秒数で離れ、丁寧語は厚いまま残る。';
                if (prior === 'awkward') return '指は、数える秒数だけで離れ、次の質問はしない。';
                return '指は、数える秒数だけいて、きれいに離れた。';
              }
              if (state.reason >= 46) {
                if (prior === 'almost') return '離したあとに、敬語を一段積み直す間が空いた。';
                if (prior === 'awkward') return '離したあとに、空いた週を聞かないための間が空いた。';
                return '離したあとに、丁寧語を探し直す間が空いた。';
              }
              if (prior === 'almost') return '離したあとも、厚い敬語が途中で折れる。指の熱だけが手順の外に残る。';
              if (prior === 'awkward') return '離したあとも、指の熱が残る。それでも、空いた週は口にしない。';
              return '離したあとも、指の熱の輪郭が残る。敬語は、舌の途中で折れた。';
            }
          },
          {
            chara: 'yui',
            face: '照れ',
            speaker: '',
            text: function (state) {
              var prior = priorOf(state);
              if (state.bpm >= B.PULSE_BPM) {
                if (prior === 'almost') return '指が離れたあとも、高瀬の左手首は届く。厚い敬語の下の橈骨動脈を、身体は覚えている。';
                if (prior === 'awkward') return '指が離れたあとも、高瀬の左手首は届く。三週空けても、橈骨動脈の場所は消えていない。';
                return '指が離れたあとも、高瀬の左手首は届く距離にある。橈骨動脈の場所は、身体が覚えている。';
              }
              if (prior === 'almost') return '由衣は自分の手を膝へ戻した。敬語の厚さに、脈の話を足さない。';
              if (prior === 'awkward') return '由衣は自分の手を膝へ戻した。空いた週の話も、脈の話も、しない。';
              return '由衣は自分の手を膝へ戻した。それ以上、脈の話はしない。';
            },
            goto: function (state) {
              return state.bpm >= B.PULSE_BPM ? 's2_pulse' : 'talk';
            }
          }
        ]
      },

      s2_pulse: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: 'yui',
            face: '赤面',
            speaker: '',
            effect: 'pulse',
            text: function (state) {
              if (priorOf(state) === 'almost') return '（厚い敬語のままの左手首が、すぐそこにある。親指を置けば、測られる側を、逆に測れる）';
              if (priorOf(state) === 'awkward') return '（三週ぶりなのに、左手首はすぐそこにある。親指を置けば、測られる側を、逆に測れる）';
              return '（この人の左手首が、すぐそこにある。親指を置けば、測られる側を、逆に測れる）';
            }
          },
          {
            chara: 'yui',
            face: '赤面',
            speaker: '由衣',
            text: function (state) {
              if (priorOf(state) === 'almost') return '……高瀬さん。今日の、その丁寧さのまま';
              if (priorOf(state) === 'awkward') return '……高瀬さん。聞かないで、いてくれますか';
              return '……高瀬さん。いいですか';
            },
            choices: [
              {
                id: 's2_return',
                when: function (state) { return state.bpm >= B.PULSE_BPM; },
                text: choiceText(
                  '彼の左手首を取る。親指を、橈骨動脈に当てる',
                  '丁寧語のままの左手首を取る。親指を、橈骨動脈に当てる',
                  '三週ぶりの左手首を取る。親指を、橈骨動脈に当てる'
                ),
                apply: { cross: 2, reason: -18, bpm: 8, pulseReturned: 1 },
                next: 'pulseBack'
              },
              {
                id: 's2_hold',
                when: function (state) { return state.bpm >= B.PULSE_BPM; },
                text: choiceText(
                  '欲しくても、自分の手は膝に戻す',
                  '欲しくても、丁寧な距離のまま手は膝に戻す',
                  '欲しくても、空いた週のまま手は膝に戻す'
                ),
                next: 'talk'
              }
            ],
            fallback: 'talk'
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
            text: function (state) {
              if (priorOf(state) === 'almost') return '由衣の親指が、厚い丁寧語のままの左手首へ伸びる。橈骨動脈を、教わった場所から外さない。';
              if (priorOf(state) === 'awkward') return '由衣の親指が、三週ぶりの左手首へ伸びる。橈骨動脈の場所は、空いた週でも外さない。';
              return '由衣の親指が、高瀬の左手首の橈骨動脈に乗る。教わった場所を、彼女は外さない。';
            }
          },
          {
            chara: 'yui',
            face: '赤面',
            speaker: '由衣',
            text: function (state) {
              if (priorOf(state) === 'almost') return '……ここ、ですよね。手順の、橈骨動脈。落ちて、ないです。言葉より、先に';
              if (priorOf(state) === 'awkward') return '……ここ、ですよね。三週あいても、橈骨動脈。落ちて、ないです';
              return '……ここ、ですよね。高瀬さんが押さえる、橈骨動脈。落ちて、ないです';
            }
          },
          {
            chara: null,
            speaker: '',
            text: function (state) {
              if (priorOf(state) === 'almost') return '高瀬の脈が、丁寧語の下で跳ねた。手首は引かない。一歩も、由衣のほうへは出さない。';
              if (priorOf(state) === 'awkward') return '高瀬の脈が、親指の下で跳ねた。手首は引かない。空いた週を埋めるように、一歩も出さない。';
              return '高瀬の脈が、親指の下で跳ねた。彼は手首を引かない。一歩も、由衣のほうへ出さない。';
            }
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) { return byPrior(state, pulseBackBook); },
            goto: 'talk'
          }
        ]
      },

      // --- 長編版で足した場面: 会話 → 癖 → お茶。どれも枠の中の話で、越える・越えないの判定は変えない。 ---
      talk: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) { return say(state, talkAsk); }
          },
          {
            chara: 'yui',
            face: function (state) { return priorOf(state) === 'normal' ? '微笑み' : '困り'; },
            speaker: '由衣',
            text: function (state) {
              var prior = priorOf(state);
              if (prior === 'almost') return '……仕事の締め切りが、重なってて。それと、この前のこと、考えないようにしてたら、余計に肩が上がって';
              if (prior === 'awkward') return '……来なかった間、デスクにずっと座ってました。ここを避けたぶん、肩だけ先に壊れたみたいで';
              return '最初に来た日のこと、思い出してました。あの日は、肩を下げる方法を探しに来たのに、今は、肩を下げてもらう時間のほうを探してる気がして';
            },
            choices: [
              {
                id: 's2_t_open',
                text: choiceText(
                  '来続けている理由を、少しだけ話す',
                  '前回のあとも来た理由を、少しだけ話す',
                  '空けてしまった理由を、少しだけ話す'
                ),
                apply: { reason: -3, cross: 1, bpm: 4 },
                next: 'habit2'
              },
              {
                id: 's2_t_light',
                text: '仕事の愚痴だけ、軽く話す',
                next: 'habit2'
              },
              {
                id: 's2_t_deflect',
                text: '「大丈夫です」と笑って、話を流す',
                apply: { wall: 1, reason: 3, bpm: -4 },
                next: 'talkRebuff'
              }
            ]
          }
        ]
      },

      talkRebuff: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: 'yui',
            face: '困り',
            speaker: '',
            text: function (state) {
              if (priorOf(state) === 'almost') return '笑ったまま、話の入口を閉めた。口調だけが、丁寧に整っていく。';
              if (priorOf(state) === 'awkward') return '笑ったまま、また話の入口を閉めた。三週ぶんの沈黙が、一段厚くなる。';
              return '笑ったまま、話の入口を閉めた。いつもの声なのに、そこから先へは、誰も入れない。';
            }
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) { return say(state, talkRebuff); }
          },
          {
            chara: null,
            speaker: '',
            text: '高瀬は、それ以上は聞かない。手だけが、ほんの少し、由衣の背中から遠くなった。',
            goto: 'habit2'
          }
        ]
      },

      habit2: {
        lines: [
          {
            bg: 'assets/bg_training.png',
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) { return say(state, habitSee); }
          },
          {
            chara: 'yui',
            face: '照れ',
            speaker: '由衣',
            text: function (state) {
              if (priorOf(state) === 'almost') return '……どうして、わかるんですか。私、言ってないのに';
              if (priorOf(state) === 'awkward') return '……三週も空けたのに。どうして、まだ覚えてるんですか';
              return '……どうして、わかるんですか。誰にも、言ったことないのに';
            }
          },
          {
            chara: null,
            speaker: '',
            text: function (state) {
              if (priorOf(state) === 'awkward') return '癖を言い当てられた。責められる覚悟をしていた肩から、ゆっくり力が抜ける。';
              return '癖を言い当てられた。知られて困るはずのことなのに、肩から力が抜けていくのが、自分でわかる。';
            },
            choices: [
              {
                id: 's2_h_trust',
                text: '「……見抜かれると、安心します」',
                apply: { reason: -3, cross: 1, bpm: 3 },
                next: 'tea2'
              },
              {
                id: 's2_h_laugh',
                text: '「プロですね」と、笑ってごまかす',
                next: 'tea2'
              },
              {
                id: 's2_h_hide',
                text: '肩を意識して、癖を隠そうとする',
                apply: { wall: 1, reason: 2, bpm: 2 },
                next: 'tea2'
              }
            ]
          }
        ]
      },

      tea2: {
        lines: [
          {
            bg: 'assets/bg_entrance.png',
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) { return say(state, teaOffer); }
          },
          {
            chara: null,
            speaker: '',
            text: function (state) {
              if (priorOf(state) === 'almost') return '湯気の立つカップが二つ、カウンターに置かれる。距離は、前回より半歩だけ長い。';
              if (priorOf(state) === 'awkward') return '湯気の立つカップが二つ、カウンターに置かれる。三週ぶんの空白が、間に置かれたままだ。';
              return '湯気の立つカップが二つ、カウンターに置かれる。施術のあとの、いつもの温度の紅茶だ。';
            }
          },
          {
            chara: 'yui',
            face: '微笑み',
            speaker: '由衣',
            text: function (state) {
              if (state.pulseReturned) return '……さっきのこと、まだ指先が覚えてます。紅茶、あったかいですね';
              return '……あったかい。ここで飲む紅茶だけ、味が違うんです。不思議ですよね';
            },
            choices: [
              {
                id: 's2_tea_work',
                text: '仕事の話に戻して、カップに口をつける',
                next: 'invite'
              },
              {
                id: 's2_tea_ask',
                text: '「……もう少し、ここにいていいですか」',
                apply: { reason: -3, cross: 1, bpm: 4 },
                next: 'invite'
              }
            ]
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
            text: function (state) { return byPrior(state, inviteBook); },
            choices: [
              {
                id: 's2_leave',
                text: choiceText(
                  'コートに手を伸ばす。「今日は、もう大丈夫です」',
                  'コートに手を伸ばす。「今日は、この丁寧さのままで」',
                  'コートに手を伸ばす。「今日は、もう大丈夫です。追わなくていい」'
                ),
                apply: { wall: 2, reason: 4, bpm: -10 },
                next: 'resolve'
              },
              {
                id: 's2_bed',
                text: choiceText(
                  '自分で、いつものベッドの端に腰を下ろす',
                  '自分で、手順の言葉のままベッドの端に腰を下ろす',
                  '自分で、三週ぶりのベッドの端に腰を下ろす'
                ),
                apply: { reason: -4, bpm: 8 },
                next: 'bed'
              },
              {
                id: 's2_ask',
                text: choiceText(
                  '「……触れて、ほしいです」声にしてしまう',
                  '「……触れて、ほしいです」厚い丁寧語のあいだで、声にしてしまう',
                  '「……触れて、ほしいです」空いた週のあとに、声にしてしまう'
                ),
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
            text: function (state) {
              if (priorOf(state) === 'almost') return '間接照明だけになる。由衣が自分で、ベッドの端を選んだ。高瀬は手順の言葉を先に置き、前回の外側には理由を置かない。';
              if (priorOf(state) === 'awkward') return '間接照明だけになる。由衣が自分で、ベッドの端を選んだ。高瀬は空いた週を聞かないまま、名前のついた筋にだけ理由を置く。';
              return '間接照明だけになる。由衣が自分で、ベッドの端を選んだ。高瀬は整体師のまま、いつもの肩甲骨にしか理由を置かない。';
            }
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) { return byPrior(state, bedOpenBook); }
          },
          {
            chara: 'yui',
            face: '照れ',
            speaker: '',
            text: bedScapula
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            applyFn: function (state) {
              if (state.reason < B.SLIP_REASON) {
                state.slip = 1;
                state.bpm = Math.min(168, state.bpm + 6);
              }
            },
            text: function (state) { return byPrior(state, pecBook); }
          },
          {
            chara: null,
            speaker: '',
            effect: function (state) { return state.slip ? 'pulse' : ''; },
            text: boundaryText
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            when: function (state) { return !!state.slip; },
            text: function (state) { return byPrior(state, apologyBook); }
          },
          {
            chara: 'yui',
            face: '照れ',
            speaker: '由衣',
            text: yuiBed,
            choices: [
              {
                id: 's2_stop',
                text: choiceText(
                  '身を硬くする。「……今日は、やめてください」',
                  '身を硬くする。「……今日は、やめてください。その息の前に」',
                  '身を硬くする。「……今日は、やめてください。追わないで」'
                ),
                apply: { wall: 2, reason: 8, bpm: -10, revoked: 1 },
                next: 'resolve'
              },
              {
                id: 's2_soften',
                text: choiceText(
                  '息を吐いて、力を抜く。自分からは、手を出さない',
                  '息を吐いて、力を抜く。丁寧語は、自分からは割らない',
                  '息を吐いて、力を抜く。空いた週の話は、自分からはしない'
                ),
                apply: { reason: -8, bpm: 12 },
                next: 'resolve'
              }
            ]
          }
        ]
      },

      end_keep: {
        lines: [
          {
            bg: 'assets/bg_entrance.png',
            chara: null,
            speaker: '',
            text: keepNarration
          },
          {
            chara: 'takase',
            face: takaseFace,
            speaker: '高瀬',
            text: function (state) {
              if (state.revoked) return byPrior(state, keepStopBook);
              return byPrior(state, keepBook);
            }
          },
          {
            chara: 'yui',
            face: '微笑み',
            speaker: '由衣',
            text: function (state) {
              if (priorOf(state) === 'awkward') return '……また、自分で連絡します。追わなくて、いいです';
              if (priorOf(state) === 'almost') return '……今日は、その丁寧さのままで。また、来ます';
              return 'ありがとうございました。肩甲骨、楽です。また、来ます';
            }
          },
          {
            chara: null,
            speaker: '',
            text: function (state) {
              var tail = '次の最終枠を埋めるかどうかは、由衣の手元にある。';
              if (priorOf(state) === 'almost') tail = '次の最終枠を入れるかどうかは、由衣の判断だけが持つ。';
              if (priorOf(state) === 'awkward') tail = '次の枠を埋める紙は、由衣の手元に残したまま閉じる。';
              return closingPulse(state, tail);
            },
            card: true
          }
        ]
      },

      end_near: {
        lines: [
          {
            bg: 'assets/bed.png',
            chara: 'yui',
            face: '赤面',
            speaker: '',
            effect: 'fade',
            text: nearNarration
          },
          {
            chara: null,
            speaker: '高瀬',
            text: function (state) { return byPrior(state, nearBook); }
          },
          {
            chara: null,
            speaker: '',
            text: function (state) {
              var tail = '暗がりの中に心拍だけが残る。先は、書かない。';
              if (priorOf(state) === 'almost') tail = '暗がりの中に心拍だけが残る。厚い丁寧語は、唇の前で折れたままだ。';
              if (priorOf(state) === 'awkward') tail = '暗がりの中に心拍だけが残る。三週ぶんの沈黙は、由衣が先に破った。';
              return closingPulse(state, tail);
            }
          },
          {
            chara: null,
            speaker: '',
            text: function (state) {
              if (priorOf(state) === 'almost') return '照明は、戻らない。丁寧語も、戻らない。';
              if (priorOf(state) === 'awkward') return '照明は、戻らない。空いた週も、もう戻らない。';
              return '照明は、戻らない。';
            },
            card: true
          }
        ]
      },

      end_leave: {
        lines: [
          {
            bg: 'assets/bg_entrance.png',
            chara: 'yui',
            face: 'しょんぼり',
            speaker: '',
            text: leaveNarration
          },
          {
            chara: 'takase',
            face: function (state) { return state.revoked ? '困り' : takaseFace(state); },
            speaker: '高瀬',
            text: function (state) {
              if (state.revoked) return byPrior(state, leaveStopBook);
              return byPrior(state, leaveCalmBook);
            }
          },
          {
            chara: 'yui',
            face: '困り',
            speaker: '由衣',
            text: function (state) {
              if (state.revoked) {
                if (priorOf(state) === 'almost') return '……先に、息が落ちました。丁寧な言葉より、半秒、早かったです';
                if (priorOf(state) === 'awkward') return '……先に、息が落ちたのが、わかりました。空いた週のあとでも、半秒は、同じです';
                return '……先に、息が落ちたのが、わかりました。やめてと言う前の、半秒です';
              }
              if (priorOf(state) === 'awkward') return 'ありがとうございました。次は、自分で考えます';
              if (priorOf(state) === 'almost') return 'ありがとうございました。今日は、この丁寧さのまま、帰ります';
              return 'ありがとうございました。今日は、ここまでにします';
            }
          },
          {
            chara: null,
            speaker: '',
            text: function (state) {
              var tail = '高瀬は、次の枠を自分では埋めない。';
              if (priorOf(state) === 'almost') tail = '高瀬は、丁寧語のまま、次の枠を自分では埋めない。';
              if (priorOf(state) === 'awkward') tail = '高瀬は、空いた週を埋めにいかない。次の枠も、自分では入れない。';
              return closingPulse(state, tail);
            },
            card: true
          }
        ]
      }
    }
  };
})();
