const AudioPlayer = ({ src }) => {
    return (
        <audio className="session__audio" controls>
            <source src={src} type="audio/mpeg" />
            Your browser does not support the audio element.
        </audio>
    )
}

export default AudioPlayer;