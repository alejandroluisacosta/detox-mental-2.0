import { useLocale } from '../../Context/LocaleContext.jsx';
import './CloseIcon.css'

const CloseIcon = ({ handleCloseModal }) => {
    const { t } = useLocale();
    return (
            <img className="close-icon" src='/icons/close.svg' alt={t('common.closeDialog')} onClick={handleCloseModal}/>
    )
}

export default CloseIcon;