import { useState } from 'react';
import CloseIcon from '../CloseIcon/CloseIcon';
import './ExerciseModal.css';

const ExerciseModal = ({ setOpenExerciseModal }) => {
    const handleCloseModal = () => setOpenExerciseModal(false);
    const [isExerciseBlocked, setIsExerciseBlocked] = useState(true);
    
    return (
        <div className='exercise-modal-overlay'>
            <div className='exercise-modal'>
                <CloseIcon handleCloseModal={handleCloseModal}/>
                <h2 className='exercise-modal__title'>Ejercicio #1</h2>
                {isExerciseBlocked ? 
                <div className='exercise-modal__unblock-container'>
                    <p className='exercise-modal__question'>¿Qué filósofo dijo la frase "pienso, luego existo"</p>
                    <input className='exercise-modal__input' placeholder='Tu respuesta'/>
                </div>
                :
                <></>
                }
                <span className="exercise-modal__close-text" onClick={handleCloseModal}>Cerrar</span>
            </div>
        </div>
    )
}

export default ExerciseModal;