const JudgeButton = ({ playerInstance, judge }) => {

    console.log(["JudgeButton", playerInstance]);
    // print('■いままでのやりとりから、誰が人狼でしょうか？■')
    // playerInstance = Utils.shuffleArry(playerInstance);
    return playerInstance.map(instance => {
        console.log(instance);
        return <input type="button" key={instance.myPlayerName} value={instance.myPlayerName + "を処刑する"} onClick={(key) => {
            judge(instance.myPlayerCode);
        }}></input >
    })
}

export default JudgeButton;