const debugMode = true;

let jobSetting = {
    'human1': '村人',
    'human2': '村人',
    'wolf1': '人狼',
    'wolf2': '人狼',
    'pre': '占い師',
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

const playerData = {

    'jk': {
        'src': {
            'normal': 'images/jk.png'
        },
        'intro': {
            0: 'よろしくね。',
            1: '人狼やるの久々かもw',
            2: 'やばｗｗ'
        }
    },
    'man': {
        'src': {
            'normal': 'images/man.png'
        },
        'intro': {
            0: '営業課長の田中太郎です。本日はよろしくお願いします。',
            1: '娘に教えられて来ました。よろしくお願いいたします。',
            2: '平素より大変お世話になっております。本日はよろしくお願いいたします。'
        }
    },
    'ol': {
        'src': {
            'normal': 'images/ol.png'
        },
        'intro': {
            0: '人狼、大学生の時によくやったわ',
            1: '昼休みの暇つぶしでーす',
            2: '・・・'
        }
    },
    'girl': {
        'src': {
            'normal': 'images/girl.png'
        },
        'intro': {
            0: 'よろしくー！',
            1: '今度友達も呼んでいい？',
            2: '村人だったらつまんなーい！'
        }
    },
    'boy': {
        'src': {
            'normal': 'images/boy.png'
        },
        'intro': {
            0: '役職、人狼が一番面白くね？？人狼こい！',
            1: 'ムシキング',
            2: 'スマイルプリキュア'
        }
    },
    'neet': {
        'src': {
            'normal': 'images/boy.png'
        },
        'intro': {
            0: '俺の足引っ張ったら許さねーからな',
            1: '俺が一番頭がいいんだからなめんじゃねーぞクソガキども',
            2: 'よろ＾＾'

        }
    }

};

class Utils {
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

    static print(disp_message = 'メッセージが設定されていません', speaker = 'noset') {
        // const div = document.createElement('div');
        // div.className = 'box';

        // const messageDiv = document.createElement('div');
        // messageDiv.className = 'message';
        // messageDiv.innerText = disp_message;

        // if (speaker !== "noset") {
        //     const iconDiv = document.createElement('div');
        //     iconDiv.className = 'icon_div';

        //     const img = document.createElement('img');
        //     const name = document.createElement('div');
        //     name.className = 'player_name'

        //     img.className = 'icon_src';

        //     img.src = playerData[speaker.myPlayerCode].src['normal'];
        //     img.alt = speaker.myPlayerName; // 代替テキスト
        //     img.width = 60; // 横サイズ（px）
        //     img.height = 60; // 縦サイズ（px）

        //     iconDiv.appendChild(img);
        //     name.innerHTML = speaker.myPlayerName;
        //     iconDiv.appendChild(name);

        //     div.appendChild(iconDiv);
        // }

        // div.appendChild(messageDiv);
        // const message = window.document.querySelector('#message');
        // message.appendChild(div);

        // const nextBtn = document.createElement('button');
        // nextBtn.textContent = '次へ'
        // nextBtn.addEventListener('click', () => isWait = false);

        // let isWait = true;


        // async function wait() {
        //     await sleep(3000);
        // }
        // while (isWait) {
        //     // wait;

        // }


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
            if (0 == Utils.getRand(0, 2)) {
                this.impersonate();
            }
            return true;
        }

        //村人ターン行動
        if (gm.preDoneFlg) {
            if (gm.isCheckCo(this.myPlayerCode) && this.lieJobCode === 'human1') { //既にCOしている
                Utils.print('さっきも言ったけど、' + jobSetting[this.lieJobCode] + 'です。', this);
            } else if (!gm.isCheckCo(this.myPlayerCode)) {
                this.lieJobCode = 'human1';
                Utils.print('CO村人です。', this);
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
        if (0 == Utils.getRand(0, 2) || !target.myJobCode.startsWith('wolf')) {
            Utils.print(`CO占い師、${target.myPlayerName}は人狼！`, this);
            super.predictResultSet(this, this.lieJobCode, target, 'wolf');
            target.reAct('wolf1');
        } else {
            Utils.print(`CO占い師、${target.myPlayerName}は白みたい`, this);
            super.predictResultSet(this, this.lieJobCode, target, 'white');
            target.reAct('white');
        }
    }

    //占われた時の反応
    reAct(doubtJob) {
        if (doubtJob.startsWith('wolf')) {
            Utils.print('ちがう！俺は' + jobSetting[doubtJob] + 'じゃねえ！', this);
            if (gm.isCheckCo(this.myPlayerCode)) {
                Utils.print('さっき言った通り、俺は' + jobSetting[this.lieJobCode] + 'だ！', this);
            } else {
                this.impersonate();
            }
        } else {
            if (gm.isCheckCo(this.myPlayerCode)) {
                Utils.print('そのとおり、俺は' + jobSetting[this.lieJobCode] + 'です。', this);
                Utils.print('さっき自分でCOしたし、信憑性高いね。', this.myPlayerName);
            } else {
                this.lieJobCode = 'human1';
                Utils.print('そのとおり、俺は' + jobSetting[this.lieJobCode] + 'です。', this);
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
            if (0 == Utils.getRand(0, 2)) {
                this.impersonate();
            }
            return true;
        }

        //村人ターン行動
        if (gm.preDoneFlg) {
            if (gm.isCheckCo(this.myPlayerCode) && this.lieJobCode === 'human1') { //既にCOしている
                Utils.print('さっきも言ったけど、' + jobSetting[this.lieJobCode] + 'です。', this);
            } else if (!gm.isCheckCo(this.myPlayerCode)) {
                this.lieJobCode = 'human1';
                Utils.print('CO村人です。', this);
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
        if (0 == Utils.getRand(0, 2) || !target.myJobCode.startsWith('wolf')) {
            Utils.print(`CO占い師、${target.myPlayerName}は人狼！`, this);
            super.predictResultSet(this, this.lieJobCode, target, 'wolf');
            target.reAct('wolf1');
        } else {
            Utils.print(`CO占い師、${target.myPlayerName}は白みたい`, this);
            super.predictResultSet(this, this.lieJobCode, target, 'white');
            target.reAct('white');
        }
    }

    //占われた時の反応
    reAct(doubtJob) {
        if (doubtJob.startsWith('wolf')) {
            Utils.print('ちがう！俺は' + jobSetting[doubtJob] + 'じゃねえ！', this);
            if (gm.isCheckCo(this.myPlayerCode)) {
                Utils.print('さっき言った通り、俺は' + jobSetting[this.lieJobCode] + 'だ！', this);
            } else {
                this.impersonate();
            }
        } else {
            if (gm.isCheckCo(this.myPlayerCode)) {
                Utils.print('そのとおり、俺は' + jobSetting[this.lieJobCode] + 'です。', this);
                Utils.print('さっき自分でCOしたし、信憑性高いね。', this.myPlayerName);
            } else {
                this.lieJobCode = 'human1';
                Utils.print('そのとおり、俺は' + jobSetting[this.lieJobCode] + 'です。', this);
                super.coResultSet(this, this.lieJobCode);
            }
        }
    }
};

class Human extends Player {
    constructor(myPlayerCode, myPlayerName, myJobCode) {
        super(myPlayerCode, myPlayerName, myJobCode)
    }
    act() {
        if (!gm.preDoneFlg) {
            return true;
        }

        if (gm.isCheckCo(this.myPlayerCode)) {
            Utils.print('さっきも言ったけど、村人です。', this);
        } else {
            Utils.print('CO村人です。', this);
            super.coResultSet(this, this.myJobCode);
        }
        return true;
    }

    reAct(doubtJobCode) {
        if (doubtJobCode.startsWith('wolf')) {
            Utils.print('ちがう！俺は' + jobSetting[doubtJobCode] + 'じゃねえ！', this);

            if (gm.isCheckCo(this.myPlayerCode)) {
                Utils.print('さっき言った通り、俺は' + jobSetting[this.myJobCode] + 'だ！', this);
            } else {
                Utils.print('俺は' + jobSetting[this.myJobCode] + 'だ！', this);
                super.coResultSet(this, this.myJobCode);
            }

        } else { //White
            Utils.print('そのとおり。俺の役職は' + jobSetting[this.myJobCode] + 'です。', this);
            if (gm.isCheckCo(this.myPlayerCode)) {
                Utils.print('さっき自分でCOしたし、信憑性高いね。', this);
            } else {
                super.coResultSet(this, this.myJobCode);
            }
        }
    }
};

class Pre extends Player {
    constructor(myPlayerCode, myPlayerName, myJobCode) {
        super(myPlayerCode, myPlayerName, myJobCode)
    }
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
            Utils.print('CO占い師、' + targetObj.myPlayerName + 'は人狼！', this);
            super.predictResultSet(this, 'pre', targetObj, 'wolf');
        } else {
            Utils.print('CO占い師、' + targetObj.myPlayerName + 'は白みたい', this);
            super.predictResultSet(this, 'pre', targetObj, 'white');
        }
        targetObj.reAct(targetObj.myJobCode);
        return true;
    }

    reAct(doubtJob) {
        if (doubtJob.startsWith('wolf')) {
            if (gm.isCheckCo(this.myPlayerCode)) {
                Utils.print(`ちがう！俺は${jobSetting[doubtJob]}じゃねえ！`, this);
                Utils.print('さっき言った通り、俺は' + jobSetting[this.myJobCode] + 'だ！', this);
            } else {
                Utils.print('ちがう！俺は' + jobSetting[doubtJob] + 'じゃねえ！', this);
                Utils.print('こいつは偽物の占い師！俺が本物だ！俺の占い結果を発表する！', this);
                this.act();
            }
        } else {
            Utils.print('そのとおり、俺の役職は' + jobSetting[this.myJobCode] + 'です。', this);
            if (gm.isCheckCo(this.myPlayerCode)) {
                Utils.print('さっき自分でCOしたし、信憑性高いね。', this);
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
        Utils.print('■ゲームがはじまります■');
        Utils.print('■今回の役職■');
        for (let key in jobSetting) {
            if (dispString !== '') {
                dispString += '、';
            }
            dispString += jobSetting[key];
        }
        Utils.print(dispString);
    }

    //参加者の文字列表示
    printPlayer() {
        let dispString = ''
        Utils.print('■参加者の人たちです■');
        for (let key in playerSetting) {
            if (dispString !== '') {
                dispString += '、';
            }
            dispString += playerSetting[key];
        }
        Utils.print(dispString);
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
                    Utils.print('おや、何かがおかしいようです。')
                    return false;
            }

            const introMessageObj = playerData[key]['intro'];
            Utils.print(introMessageObj[Utils.getRand(0, Object.keys(introMessageObj).length)], this.playerInstance[i]);
            i++
        }
        debugMode && console.log(`【役職割り振り】${this.playerInstance}`);
        return true;
    }

    playerAct() {
        if (gm.preDoneFlg) {
            Utils.print('■では村人は名乗り出てください■');
        } else {
            Utils.print('■昼がはじまります。占い師は名乗り出てください■');
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
        Utils.print('■いままでのやりとりから、誰が人狼でしょうか？■')

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
                Utils.print('処刑対象は人狼でした。あなたの勝利です。');
                break;

            case target.startsWith('human') && target:
                Utils.print('処刑対象は村人でした。あなたの敗北です。');
                break;

            case 'pre':
                Utils.print('処刑対象は占い師でした。あなたの敗北です。');
                break;

            case 'thief':
                Utils.print('処刑対象は怪盗でした。あなたの敗北です。');
                break;

            default:
                Utils.print('おや、何かがおかしいようです。');
                break;
        }
        gm.printFinalResult();
    }

    printFinalResult() {
        Utils.print('■役職は以下でした■')

        for (let i = 0; i <= this.playerInstance.length - 1; i++) {
            Utils.print(this.playerInstance[i].myPlayerName + ':' + jobSetting[this.playerInstance[i].myJobCode]);
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

//ゲーム開始
// const Utils = new Utils();
const gm = new GameMaster();

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
