const Setup = ({ gameSelect, setupFlg, setup }) => {
    if (setupFlg === true) { return "" };
    return (
        <div>
            <div>プレイ人数を選んでください</div>
            <select id="memberNum">
                {gameSelect.map((select) => (
                    <option key={select.value} value={select.value}>
                        {select.label}
                    </option>
                ))}
            </select>
            <div>
                <button onClick={() => {
                    setup(document.querySelector("#memberNum").value)
                    // console.log(document.querySelector("#memberNum").value)
                }}>ゲーム開始</button>
            </div>
        </div >

    );
}
export default Setup;