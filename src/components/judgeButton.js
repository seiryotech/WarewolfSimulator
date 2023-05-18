const JudgeButton = ({ playerInstance, judge }) => {
    return playerInstance.map(instance => {
        return <input type="button" className="judge_button" key={instance.myPlayerName} value={instance.myPlayerName + "を処刑する"} onClick={(key) => {
            judge(instance.myJobCode);
        }}></input >
    })
}

export default JudgeButton;