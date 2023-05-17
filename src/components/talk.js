const Talk = ({ words, progress }) => {
    if (!progress === 0) { return "" }
    return words.map((word) => {
        return <span key={Math.random()}>{word}</span>
    })
}
export default Talk;