const AllJobDisp = ({ playerInstance, jobSetting }) => {
    const result = [];
    result.push(<div key={Math.random()}>■役職は以下でした■</div>)
    for (let i = 0; i <= playerInstance.length - 1; i++) {
        result.push(<div key={Math.random()}>{playerInstance[i].myPlayerName + ':' + jobSetting[playerInstance[i].myJobCode]}</div>);
    }
    result.push(<input key={Math.random()} type="button" value={'もう一度'} onClick={() => window.location.reload()}></input>)
    return result;
}

export default AllJobDisp;