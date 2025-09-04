import CloseIcon from '../CloseIcon/CloseIcon';
import './ComingSoonModal.css'

const ComingSoonModal = ({ setOpenComingSoonModal }) => {
    const handleCloseModal = () => { setOpenComingSoonModal(false) }

    return (
        <div className="coming-soon-modal coming-soon-modal--buy-course modal-fade-in--buy-course">
            <CloseIcon handleCloseModal={handleCloseModal} />
            <p>Próximamente disponible</p>
        </div>
    )
}

export default ComingSoonModal;