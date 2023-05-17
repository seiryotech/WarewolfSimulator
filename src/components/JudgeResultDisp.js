const JudgeResultDisp = ({ result }) => {

    for (const val in result) {
        console.log(val);
    }

    // return playerInstance.map(instance => {
    //     console.log(instance);
    //     return <input type="button" key={instance.myPlayerName} value={instance.myPlayerName + "を処刑する"} onClick={(key) => {
    //         judge(instance.myJobCode);
    //     }}></input >
    // })
}

export default JudgeResultDisp;