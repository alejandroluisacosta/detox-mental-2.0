import { useLocale } from '../../Context/LocaleContext.jsx';

const AudioPlayer = ({ src }) => {
    const { t } = useLocale();
    return (
        <audio className="session__audio" controls>
            <source src={src} type="audio/mpeg" />
            {t('session.audioFallback')}
        </audio>
    )
}

export default AudioPlayer;
