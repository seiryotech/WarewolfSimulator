import playerData from "./playerData";
const result = [];
export const print = (message = "メッセージが存在しません", speaker = 'noset') => {
    result.push(<>
        <div className="box">
            <div className="icon_div">
                <img className="icon_src"
                    src={playerData[playerData[speaker.myPlayerCode] ? speaker.myPlayerCode : speaker].src['normal']}
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
