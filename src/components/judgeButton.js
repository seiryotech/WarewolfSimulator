const JudgeButton = ({ playerInstance, judge }) => {

    console.log(["test", playerInstance]);
    // print('■いままでのやりとりから、誰が人狼でしょうか？■')
    // playerInstance = Utils.shuffleArry(playerInstance);
    playerInstance.map(instance => {
        return <input type="button" value={instance.myPlayerName + "処刑する"} onClick={(key) => {
            judge(key);
        }}></input>
    })
}

export default JudgeButton;