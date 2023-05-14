// import { useState } from "react"
import { print, puts } from "./components/print"
import playerData from "./components/playerData";
import "./style/style.css";

// const createMessage = (arry) => {
//   return arry.map((val) => {
//     return <span>{val}</span>
//   })
// }
const createMessage = (arry) => {
  return arry.map((val) => {
    // setVal(val);
    return <span>{val}</span>
  })
}


const App = () => {
  // const [val, setVal] = useState("")
  // print = new print(val, setVal);
  return (<><div>title</div>
    {createMessage(puts)}
    {/* {val} */}
    {/* {createMessage(puts())} */}
  </>)
}
export default App;

const debugMode = true;
// let message = []; //画面表示
let gm; //ゲーム管理

let jobSetting = {
  'human1': '村人',
  'human2': '村人',
  'wolf1': '人狼',
  'pre': '占い師',
  'wolf2': '人狼',
  'thief': '怪盗'
};

let playerSetting = {
  'jk': 'JK',
  'man': '爺',
  'ol': 'OL',
  'girl': '少女',
  'boy': '少年',
  'neet': 'ニート'
};

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
        print('さっきも言ったけど、' + jobSetting[this.lieJobCode] + 'です。', this);
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
      print('ちがう！俺は' + jobSetting[doubtJob] + 'じゃねえ！', this);
      if (gm.isCheckCo(this.myPlayerCode)) {
        print('さっき言った通り、俺は' + jobSetting[this.lieJobCode] + 'だ！', this);
      } else {
        this.impersonate();
      }
    } else {
      if (gm.isCheckCo(this.myPlayerCode)) {
        print('そのとおり、俺は' + jobSetting[this.lieJobCode] + 'です。', this);
        print('さっき自分でCOしたし、信憑性高いね。', this.myPlayerName);
      } else {
        this.lieJobCode = 'human1';
        print('そのとおり、俺は' + jobSetting[this.lieJobCode] + 'です。', this);
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
        print('さっきも言ったけど、' + jobSetting[this.lieJobCode] + 'です。', this);
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
      print('ちがう！俺は' + jobSetting[doubtJob] + 'じゃねえ！', this);
      if (gm.isCheckCo(this.myPlayerCode)) {
        print('さっき言った通り、俺は' + jobSetting[this.lieJobCode] + 'だ！', this);
      } else {
        this.impersonate();
      }
    } else {
      if (gm.isCheckCo(this.myPlayerCode)) {
        print('そのとおり、俺は' + jobSetting[this.lieJobCode] + 'です。', this);
        print('さっき自分でCOしたし、信憑性高いね。', this.myPlayerName);
      } else {
        this.lieJobCode = 'human1';
        print('そのとおり、俺は' + jobSetting[this.lieJobCode] + 'です。', this);
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
      print('ちがう！俺は' + jobSetting[doubtJobCode] + 'じゃねえ！', this);

      if (gm.isCheckCo(this.myPlayerCode)) {
        print('さっき言った通り、俺は' + jobSetting[this.myJobCode] + 'だ！', this);
      } else {
        print('俺は' + jobSetting[this.myJobCode] + 'だ！', this);
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
  // constructor(myPlayerCode, myPlayerName, myJobCode) {
  //   super(myPlayerCode, myPlayerName, myJobCode)
  // }
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
      print('CO占い師、' + targetObj.myPlayerName + 'は人狼！', this);
      super.predictResultSet(this, 'pre', targetObj, 'wolf');
    } else {
      print('CO占い師、' + targetObj.myPlayerName + 'は白みたい', this);
      super.predictResultSet(this, 'pre', targetObj, 'white');
    }
    targetObj.reAct(targetObj.myJobCode);
    return true;
  }

  reAct(doubtJob) {
    if (doubtJob.startsWith('wolf')) {
      if (gm.isCheckCo(this.myPlayerCode)) {
        print(`ちがう！俺は${jobSetting[doubtJob]}じゃねえ！`, this);
        print('さっき言った通り、俺は' + jobSetting[this.myJobCode] + 'だ！', this);
      } else {
        print('ちがう！俺は' + jobSetting[doubtJob] + 'じゃねえ！', this);
        print('こいつは偽物の占い師！俺が本物だ！俺の占い結果を発表する！', this);
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
    let dispString = ''
    print('■ゲームがはじまります■');
    print('■今回の役職■');
    for (let key in jobSetting) {
      if (dispString !== '') {
        dispString += '、';
      }
      dispString += jobSetting[key];
    }
    print(dispString);
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

  createKillButton() {
    print('■いままでのやりとりから、誰が人狼でしょうか？■')

    // this.playerInstance = Utils.shuffleArry(this.playerInstance);

    // const button = window.document.querySelector('#button');
    // button.innerHTML = '';

    // for (let key in this.playerInstance) {
    //     button.innerHTML += '<input type="button" value="' + this.playerInstance[key].myPlayerName + 'を処刑する" onclick=gm.judge("' + key + '")>';
    // }
    return true;
  }

  judge(targetCode) {
    const button = window.document.querySelector('#button');
    button.innerHTML = '';

    const target = this.playerInstance[targetCode].myJobCode;

    switch (target) {
      case target.startsWith('wolf') && target:
        print('処刑対象は人狼でした。あなたの勝利です。');
        break;

      case target.startsWith('human') && target:
        print('処刑対象は村人でした。あなたの敗北です。');
        break;

      case 'pre':
        print('処刑対象は占い師でした。あなたの敗北です。');
        break;

      case 'thief':
        print('処刑対象は怪盗でした。あなたの敗北です。');
        break;

      default:
        print('おや、何かがおかしいようです。');
        break;
    }
    gm.printFinalResult();
  }

  printFinalResult() {
    print('■役職は以下でした■')

    for (let i = 0; i <= this.playerInstance.length - 1; i++) {
      print(this.playerInstance[i].myPlayerName + ':' + jobSetting[this.playerInstance[i].myJobCode]);
    }

    //リロードボタン
    const button = window.document.querySelector('#button');
    button.innerHTML += '<input type="button" value="もう一度" onclick="location.reload()">';

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

  //処刑用ボタン表示
  if (gm.createKillButton()) {
    debugMode && console.log('create_button成功');
  } else {
    debugMode && console.log('create_button失敗');
  }
}

GameStart();
