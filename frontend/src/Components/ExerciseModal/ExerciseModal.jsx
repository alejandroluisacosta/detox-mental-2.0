import CloseIcon from '../CloseIcon/CloseIcon';
import './ExerciseModal.css';

const ExerciseModal = ({ setOpenExerciseModal }) => {
    const handleCloseModal = () => setOpenExerciseModal(false);
    
    return (
        <div className='exercise-modal-overlay'>
            <div className='exercise-modal'>
                <CloseIcon handleCloseModal={handleCloseModal}/>
                <h2>Ejercicio #1</h2>
                
                <span className="exercise-modal__close-text" onClick={handleCloseModal}>Cerrar</span>
            </div>
        </div>
    )
}

export default ExerciseModal;