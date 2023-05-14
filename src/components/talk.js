const Talk = ({ words, startFlg }) => {
    if (!startFlg) { return "" }
    return words.map((word) => {
        return <span>{word}</span>
    })
}

export default Talk;