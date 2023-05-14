const Setup = ({ gameSelect, startFlg, start }) => {
    if (startFlg === true) { return "" };
    // const gameStart = (e) => {
    //     start();
    // }
    return (
        <div>
            <div>プレイ人数を選んでください</div>
            <select id="test">
                {gameSelect.map((select) => (
                    <option key={select.value} value={select.value}>
                        {select.label}
                    </option>
                ))}
            </select>
            <div>
                <button onClick={() => {
                    start(document.querySelector("#test").value)
                    console.log(document.querySelector("#test").value)
                }}>ゲーム開始</button>
            </div>
        </div >

    );
}
export default Setup;