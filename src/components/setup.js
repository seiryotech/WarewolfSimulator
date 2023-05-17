const Setup = ({ gameSelect, progress, levelSelect }) => {
    if (progress > 0) { return "" };
    return (

        <>
            <div>プレイ人数を選んでください</div>
            <select id="memberNum">
                {gameSelect.map((select) => (
                    <option key={select.value} value={select.value}>
                        {select.label}
                    </option>
                ))}
            </select>
            <div className="start_button">
                <button onClick={() => {
                    levelSelect(document.querySelector("#memberNum").value)
                }}>ゲーム開始</button>
            </div>
        </>
    );
}
export default Setup;