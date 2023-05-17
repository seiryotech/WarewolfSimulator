import { useState } from "react"
import { print, puts } from "./components/print"
import playerData from "./components/playerData";
import Setup from "./components/setup";
import Talk from "./components/talk";
import JudgeButton from "./components/judgeButton";
import JudgeResultDisp from "./components/JudgeResultDisp";
import AllJobDisp from "./components/AllJobDisp";
import "./style/style.css";

const debugMode = false;

//ゲームの進行度。0:初期状態、1:レベル選択後、2:会話後、3:処刑結果表示後、4:全役職公開
let progress = 0;

//使用役職。選択したレベルの職業が{human1:村人,human2:村人,wolf1:人狼}形式で登録される
let jobSetting = {};

//参加プレイヤー一覧
let playerSetting = {
  'jk': 'JK',
  'man': '爺',
  'ol': 'OL',
  'girl': '少女',
  'boy': '少年',
  'neet': 'ニート'
};

let gm; //ゲーム管理インスタンス
const App = () => {

  //難易度の選択肢（参加人数選択）
  const level = [
    { label: "3人（村人/村人/人狼）", value: "human1:村人,human2:村人,wolf1:人狼" },
    { label: "4人（村人/村人/人狼/占い師）", value: "human1:村人,human2:村人,wolf1:人狼,pre:占い師" },
    { label: "5人（村人/村人/人狼/人狼/占い師）", value: "human1:村人,human2:村人,wolf1:人狼,wolf2:人狼,pre:占い師" },
    { label: "6人（村人/村人/人狼/人狼/占い師/怪盗）", value: "human1:村人,human2:村人,wolf1:人狼,wolf2:人狼,pre:占い師,thief:怪盗" }
  ];

  const [val, setVal] = useState(level);

  //0:難易度選択
  const levelSelect = (selectval) => {
    if (progress === 0) { progress = 1; }
    setVal("");
    selectval.split(",").forEach((s) => {
      jobSetting[s.split(":")[0]] = s.split(":")[1]
    })

    //選択された参加人数にプレイヤー数を合わせる(ランダムでDELETE)
    Utils.shuffleObj(playerSetting);
    for (const key of Object.keys(playerSetting)) {
      if (Object.keys(jobSetting).length === Object.keys(playerSetting).length) {
        break;
      }
      delete playerSetting[key];
    }
  }

  //1:ゲーム実行（各プレイヤーの思考ルーチン実行）
  if (progress === 1) { GameStart(); }

  //2:処刑ボタン表示

  //3:処刑結果表示
  const [result, setResult] = useState([]);
  const judge = targetJobCode => {
    progress = 3;
    switch (targetJobCode) {
      case targetJobCode.startsWith('wolf') && targetJobCode: setResult('処刑対象は人狼でした。あなたの勝利です。'); break;
      case targetJobCode.startsWith('human') && targetJobCode: setResult('処刑対象は村人でした。あなたの敗北です。'); break;
      case 'pre': setResult('処刑対象は占い師でした。あなたの敗北です。'); break;
      case 'thief': setResult('処刑対象は怪盗でした。あなたの敗北です。'); break;
      default: setResult('おや、何かがおかしいようです。'); break;
    }
  }

  //4:全役職公開（ゲーム終了）
  return (<>
    <div className="setup_container">
      <div className="title">一人用人狼</div>
      <Setup gameSelect={val} progress={progress} levelSelect={levelSelect} />
    </div>
    <Talk words={puts()} progress={progress}></Talk>
    {progress === 2 ? <JudgeButton playerInstance={gm.playerInstance} progress={progress} judge={judge}></JudgeButton> : null}
    <JudgeResultDisp result={result}></JudgeResultDisp>
    {progress === 3 ? <AllJobDisp playerInstance={gm.playerInstance} jobSetting={jobSetting}></AllJobDisp> : null}
  </>)
}
export default App;

///人狼ロジック///
class Utils {
  // static print(disp_message = 'メッセージが設定されていません', speaker = 'noset') {
  //   setVal(message.push(<>
  //     <div className="box">
  //       <div className="icon_div">
  //         <img className="icon_src"
  //           // src={playerData[speaker.myPlayerCode].src['normal']}
  //           alt={speaker.myPlayerName}
  //           width={60}
  //           height={60}>
  //         </img>
  //         <div className="name">
  //           {speaker.myPlayerName}
  //         </div>
  //       </div>
  //       <div className="message">
  //         {disp_message}
  //       </div>

  //     </div>
  //   </>
  //   ))
  // }

  static shuffleArry([...array]) {
    for (let i = array.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  static shuffleObj(obj) {
    let newObj = {};
    var keys = Object.keys(obj);
    keys.sort(function (a, b) { return Math.random() - 0.5; });
    keys.forEach(function (k) {
      newObj[k] = obj[k];
    });
    return newObj;
  }

  static getRand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }
};

class Player {
  constructor(myPlayerCode, myPlayerName, myJobCode, myJobName) {
    this.myPlayerCode = myPlayerCode
    this.myPlayerName = myPlayerName
    this.myJobCode = myJobCode
    this.myJobName = myJobName

    this.privateInfo = {} //自分だけがわかっている各プレイヤーのCO/占い情報
  }

  coResultSet(myPlayerObj, myJobCode) {
    if (!gm.publicInfo.hasOwnProperty(myPlayerObj.myPlayerCode)) {
      gm.publicInfo[myPlayerObj.myPlayerCode] = {
        'co': { [myPlayerObj.myPlayerCode]: myJobCode }
      }
    }
    debugMode && console.log(`【現在の情報】`);
    debugMode && console.log(gm.publicInfo);
  }

  predictResultSet(myPlayerObj, myJobCode, targetPlayerObj, targetJobCode) {
    if (!gm.publicInfo.hasOwnProperty(myPlayerObj.myPlayerCode)) {
      gm.publicInfo[myPlayerObj.myPlayerCode] = {
        'co': { [myPlayerObj.myPlayerCode]: myJobCode },
        'pre': { [targetPlayerObj.myPlayerCode]: targetJobCode }
      }
    }
    debugMode && console.log(`【現在の情報】`);
    debugMode && console.log(gm.publicInfo);
  }
};

class Wolf extends Player {
  constructor(myPlayerCode, myPlayerName, myJobCode) {
    super(myPlayerCode, myPlayerName, myJobCode)
    this.lieJobCode = ''
  }

  act() {
    //占い師ターン行動
    if (!gm.preDoneFlg && this.lieJobCode === '') {
      if (0 === Utils.getRand(0, 2)) {
        this.impersonate();
      }
      return true;
    }

    //村人ターン行動
    if (gm.preDoneFlg) {
      if (gm.isCheckCo(this.myPlayerCode) && this.lieJobCode === 'human1') { //既にCOしている
        print(`さっきも言ったけど、${jobSetting[this.lieJobCode]}です。`, this);
      } else if (!gm.isCheckCo(this.myPlayerCode)) {
        this.lieJobCode = 'human1';
        print('CO村人です。', this);
        super.coResultSet(this, this.lieJobCode);
      }
    }
    return true;
  }

  //占い騙り
  impersonate() {
    this.lieJobCode = 'pre';
    this.liePre();
  }

  //嘘占い
  liePre() {
    //占い対象決定
    let target = gm.playerInstance[Utils.getRand(0, gm.playerInstance.length - 1)];
    while (target === this) {
      target = gm.playerInstance[Utils.getRand(0, gm.playerInstance.length - 1)];
    }

    //偽りの占い
    if (0 === Utils.getRand(0, 2) || !target.myJobCode.startsWith('wolf')) {
      print(`CO占い師、${target.myPlayerName}は人狼！`, this);
      super.predictResultSet(this, this.lieJobCode, target, 'wolf');
      target.reAct('wolf1');
    } else {
      print(`CO占い師、${target.myPlayerName}は白みたい`, this);
      super.predictResultSet(this, this.lieJobCode, target, 'white');
      target.reAct('white');
    }
  }

  //占われた時の反応
  reAct(doubtJob) {
    if (doubtJob.startsWith('wolf')) {
      print(`ちがう！私は${jobSetting[doubtJob]}じゃない！`, this);
      if (gm.isCheckCo(this.myPlayerCode)) {
        print('さっき言った通り、私は' + jobSetting[this.lieJobCode] + 'です！', this);
      } else {
        this.impersonate();
      }
    } else {
      if (gm.isCheckCo(this.myPlayerCode)) {
        print(`そのとおり、私は${jobSetting[this.lieJobCode]}です。`, this);
        print('さっき自分でCOしたし、信憑性高いね。', this.myPlayerName);
      } else {
        this.lieJobCode = 'human1';
        print(`そのとおり、私は${jobSetting[this.lieJobCode]}です。`, this);
        super.coResultSet(this, this.lieJobCode);
      }
    }
  }
};

class Thief extends Player {
  constructor(myPlayerCode, myPlayerName, myJobCode) {
    super(myPlayerCode, myPlayerName, myJobCode)
    this.lieJobCode = ''
  }

  act() {
    //占い師ターン行動
    if (!gm.preDoneFlg && this.lieJobCode === '') {
      if (0 === Utils.getRand(0, 2)) {
        this.impersonate();
      }
      return true;
    }

    //村人ターン行動
    if (gm.preDoneFlg) {
      if (gm.isCheckCo(this.myPlayerCode) && this.lieJobCode === 'human1') { //既にCOしている
        print(`さっきも言ったけど、${jobSetting[this.lieJobCode]}です。`, this);
      } else if (!gm.isCheckCo(this.myPlayerCode)) {
        this.lieJobCode = 'human1';
        print('CO村人です。', this);
        super.coResultSet(this, this.lieJobCode);
      }
    }
    return true;
  }

  //占い騙り
  impersonate() {
    this.lieJobCode = 'pre';
    this.liePre();
  }

  //嘘占い
  liePre() {
    //占い対象決定
    let target = gm.playerInstance[Utils.getRand(0, gm.playerInstance.length - 1)];
    while (target === this) {
      target = gm.playerInstance[Utils.getRand(0, gm.playerInstance.length - 1)];
    }

    //偽りの占い
    if (0 === Utils.getRand(0, 2) || !target.myJobCode.startsWith('wolf')) {
      print(`CO占い師、${target.myPlayerName}は人狼！`, this);
      super.predictResultSet(this, this.lieJobCode, target, 'wolf');
      target.reAct('wolf1');
    } else {
      print(`CO占い師、${target.myPlayerName}は白みたい`, this);
      super.predictResultSet(this, this.lieJobCode, target, 'white');
      target.reAct('white');
    }
  }

  //占われた時の反応
  reAct(doubtJob) {
    if (doubtJob.startsWith('wolf')) {
      print(`ちがう！私は${jobSetting[doubtJob]}じゃないです！`, this);
      if (gm.isCheckCo(this.myPlayerCode)) {
        print('さっき言った通り、私は' + jobSetting[this.lieJobCode] + 'です！', this);
      } else {
        this.impersonate();
      }
    } else {
      if (gm.isCheckCo(this.myPlayerCode)) {
        print(`そのとおり、私は${jobSetting[this.lieJobCode]}です。`, this);
        print('さっき自分でCOしたし、信憑性高いね。', this.myPlayerName);
      } else {
        this.lieJobCode = 'human1';
        print(`そのとおり、私は${jobSetting[this.lieJobCode]}です。`, this);
        super.coResultSet(this, this.lieJobCode);
      }
    }
  }
};

class Human extends Player {
  // constructor(myPlayerCode, myPlayerName, myJobCode) {
  //   super(myPlayerCode, myPlayerName, myJobCode)
  // }
  act() {
    if (!gm.preDoneFlg) {
      return true;
    }

    if (gm.isCheckCo(this.myPlayerCode)) {
      print('さっきも言ったけど、村人です。', this);
    } else {
      print('CO村人です。', this);
      super.coResultSet(this, this.myJobCode);
    }
    return true;
  }

  reAct(doubtJobCode) {
    if (doubtJobCode.startsWith('wolf')) {
      print('ちがう！私は' + jobSetting[doubtJobCode] + 'じゃないです！', this);

      if (gm.isCheckCo(this.myPlayerCode)) {
        print('さっき言った通り、私は' + jobSetting[this.myJobCode] + 'です！', this);
      } else {
        print('私は' + jobSetting[this.myJobCode] + 'です！', this);
        super.coResultSet(this, this.myJobCode);
      }

    } else { //White
      print('そのとおり。俺の役職は' + jobSetting[this.myJobCode] + 'です。', this);
      if (gm.isCheckCo(this.myPlayerCode)) {
        print('さっき自分でCOしたし、信憑性高いね。', this);
      } else {
        super.coResultSet(this, this.myJobCode);
      }
    }
  }
};

class Pre extends Player {
  act() {
    if (gm.preDoneFlg) {
      return true;
    }
    this.pre();
  }

  pre() {
    //占い対象決定
    let targetObj;
    while (targetObj === undefined || targetObj === this) {
      targetObj = gm.playerInstance[Utils.getRand(0, gm.playerInstance.length - 1)];
    }

    //占い
    if (targetObj.myJobCode.startsWith('wolf')) {
      print(`CO占い師、${targetObj.myPlayerName}は人狼！`, this);
      super.predictResultSet(this, 'pre', targetObj, 'wolf');
    } else {
      print(`CO占い師、${targetObj.myPlayerName}は白みたい`, this);
      super.predictResultSet(this, 'pre', targetObj, 'white');
    }
    targetObj.reAct(targetObj.myJobCode);
    return true;
  }

  reAct(doubtJob) {
    if (doubtJob.startsWith('wolf')) {
      if (gm.isCheckCo(this.myPlayerCode)) {
        print(`ちがう！私は${jobSetting[doubtJob]}じゃないです！`, this);
        print('さっき言った通り、私は' + jobSetting[this.myJobCode] + 'です！', this);
      } else {
        print(`ちがう！私は${jobSetting[doubtJob]}じゃないです！`, this);
        print('こいつは偽物の占い師！俺が本物です！俺の占い結果を発表する！', this);
        this.act();
      }
    } else {
      print('そのとおり、俺の役職は' + jobSetting[this.myJobCode] + 'です。', this);
      if (gm.isCheckCo(this.myPlayerCode)) {
        print('さっき自分でCOしたし、信憑性高いね。', this);
      }
    }
  }
};

class GameMaster {
  constructor() {
    this.preDoneFlg = false //占い師ターンを終了したか
    this.playerInstance = [] //各プレイヤーのインスタンスを格納
    this.publicInfo = {} //場でわかっている各プレイヤーのCO/占い情報
  }

  //【ゲーム開始時】役職の文字列表示
  printJob() {
    print('■ゲームがはじまります■');
    print('■今回の役職■');
    print((Object.values(jobSetting).join("、")));
  }

  //参加者の文字列表示
  printPlayer() {
    let dispString = ''
    print('■参加者の人たちです■');
    for (let key in playerSetting) {
      if (dispString !== '') {
        dispString += '、';
      }
      dispString += playerSetting[key];
    }
    print(dispString);
  }

  //【ゲーム開始時】インスタンス生成
  createPlayer() {
    playerSetting = Utils.shuffleObj(playerSetting);
    let jobKeyArry = Utils.shuffleArry(Object.keys(jobSetting));
    let i = 0;
    for (let key in playerSetting) {
      debugMode && console.log(`【役職割り振り】${playerSetting[key]}は、${jobSetting[jobKeyArry[i]]}(${jobKeyArry[i]})`);
      switch (jobKeyArry[i]) {

        //村人の場合
        case jobKeyArry[i].startsWith('human') && jobKeyArry[i]:
          this.playerInstance.push(new Human(key, playerSetting[key], jobKeyArry[i]));
          break;

        case jobKeyArry[i].startsWith('wolf') && jobKeyArry[i]:
          this.playerInstance.push(new Wolf(key, playerSetting[key], jobKeyArry[i]));
          break;

        case 'pre':
          this.playerInstance.push(new Pre(key, playerSetting[key], jobKeyArry[i]));
          break;

        case 'thief':
          this.playerInstance.push(new Thief(key, playerSetting[key], jobKeyArry[i]));
          break;

        default:
          print('おや、何かがおかしいようです。')
          return false;
      }

      const introMessageObj = playerData[key]['intro'];
      print(introMessageObj[Utils.getRand(0, Object.keys(introMessageObj).length)], this.playerInstance[i]);
      i++
    }
    debugMode && console.log(`【役職割り振り】${this.playerInstance}`);
    return true;
  }

  playerAct() {
    if (gm.preDoneFlg) {
      print('■では村人は名乗り出てください■');
    } else {
      print('■昼がはじまります。占い師は名乗り出てください■');
    }

    this.playerInstance = Utils.shuffleArry(this.playerInstance);
    for (let i = 0; i <= this.playerInstance.length - 1; i++) {
      debugMode && console.log(`${this.playerInstance[i].myPlayerName}の行動`);
      if (!this.playerInstance[i].act()) {
        // return false;
      }
    }
    return true;
  }

  isCheckCo(me) {
    if (this.publicInfo.hasOwnProperty(me)) {
      return true;
    }
    return false;
  }
};

const GameStart = () => {
  if (progress > 1) { return; }
  progress = 2;

  //ゲーム開始
  gm = new GameMaster();

  //プレイヤー準備
  gm.printJob();
  gm.printPlayer();

  if (gm.createPlayer()) {
    debugMode && console.log('create_player成功');
  } else {
    debugMode && console.log('create_player失敗');
  }

  //各プレイヤー行動（占い系）
  if (gm.playerAct()) {
    gm.preDoneFlg = true;
    debugMode && console.log('player_act成功');
  } else {
    debugMode && console.log('player_act失敗');
  }

  //村人系
  if (gm.playerAct()) {
    debugMode && console.log('player_act成功');
  } else {
    debugMode && console.log('player_act失敗');
  }
}
