import CloseIcon from '../CloseIcon/CloseIcon';
import { useLocale } from '../../Context/LocaleContext.jsx';
import './ComingSoonModal.css'

const ComingSoonModal = ({ setOpenComingSoonModal }) => {
    const handleCloseModal = () => { setOpenComingSoonModal(false) }
    const { t } = useLocale();

    return (
        <div className="coming-soon-modal coming-soon-modal--buy-course modal-fade-in--buy-course">
            <CloseIcon handleCloseModal={handleCloseModal} />
            <p>{t('course.comingSoon')}</p>
        </div>
    )
}

export default ComingSoonModal;
