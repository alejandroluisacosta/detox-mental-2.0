import { useState, useContext } from 'react';
import CloseIcon from '../CloseIcon/CloseIcon';
import './ExerciseModal.css';

const ExerciseModal = ({ setOpenExerciseModal, exercise, exerciseId }) => {
    const handleCloseModal = () => setOpenExerciseModal(false);
    const [isExerciseBlocked, setIsExerciseBlocked] = useState(exercise.blocked);
    const [userInput, setUserInput] = useState('');

    const handleInputChange = ({ target }) => {
        setUserInput(target.value.toUpperCase());
    }

    const handleUnblockSession = ({ target }) => {
        if (userInput === exercise.answer) {
            setIsExerciseBlocked(false);
            exercise.blocked = false;
        }
    }

    return (
        <div className='modal-overlay'>
            <div className='exercise-modal modal-fade-in'>
                <CloseIcon handleCloseModal={handleCloseModal}/>
                <h2 className='exercise-modal__title'>{`Ejercicio #${exerciseId}`}</h2>
                {isExerciseBlocked ? 
                <div className='exercise-modal__unblock-container'>
                    <p className='exercise-modal__question'>{exercise.question}</p>
                    <input className='exercise-modal__input' placeholder='Tu respuesta'onChange={handleInputChange} value={userInput} maxLength="18"/>
                    <button className="exercise-modal__button" type="submit" onClick={handleUnblockSession}>DESBLOQUEAR</button>
                </div>
                :
                <p className='exercise-modal__exercise-text'>{exercise.text}</p>
                }
                <span className="exercise-modal__close-text" onClick={handleCloseModal}>Cerrar</span>
            </div>
        </div>
    )
}

export default ExerciseModal;