import './CloseIcon.css'

const CloseIcon = ({ handleCloseModal }) => {
    return (
            <img className="close-icon" src='/icons/close.svg' alt="Cerrar recuadro" onClick={handleCloseModal}/>
    )
}

export default CloseIcon;