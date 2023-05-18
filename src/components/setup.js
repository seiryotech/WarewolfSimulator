const Setup = ({ gameSelect, progress, levelSelect }) => {
    if (progress > 0) { return "" };
    return (

        <>
            <div className="explain_sentence">プレイ人数を選んでください</div>
            <select id="member_num">
                {gameSelect.map((select) => (
                    <option key={select.value} value={select.value}>
                        {select.label}
                    </option>
                ))}
            </select>
            <div className="start_button">
                <button onClick={() => {
                    levelSelect(document.querySelector("#member_num").value)
                }}>ゲーム開始</button>
            </div>
        </>
    );
}
export default Setup;