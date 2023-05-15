import playerData from "./playerData";
const result = [];
export const print = (message = "メッセージが存在しません", speaker = 'noset') => {
    console.log([playerData, playerData[speaker.myPlayerCode]])
    result.push(<>
        <div className="box">
            <div className="icon_div">
                <img className="icon_src"
                    src={playerData[speaker.myPlayerCode] ? playerData[speaker.myPlayerCode].src['normal'] : "test"}
                    alt={speaker.myPlayerName}
                    width={60}
                    height={60}>
                </img>
                <div className="name">
                    {speaker.myPlayerName}
                </div>
            </div>
            <div className="message">
                {message}
            </div>

        </div>
    </>
    )
}

export const puts = () => {
    return result;
}

// export print;