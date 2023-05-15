const Talk = ({ words, setupFlg }) => {
    if (!setupFlg) { return "" }
    return words.map((word) => {
        return <span>{word}</span>
    })
}

export default Talk;