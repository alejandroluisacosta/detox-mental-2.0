import { useState, useEffect } from 'react';
import CloseIcon from '../CloseIcon/CloseIcon';
import './ExerciseModal.css';

const ExerciseModal = ({ setOpenExerciseModal, exercise, exerciseId, handleCheckAnswer }) => {
    const handleCloseModal = () => setOpenExerciseModal(false);
    const [isExerciseBlocked, setIsExerciseBlocked] = useState(exercise.isBlocked);
    const [userInput, setUserInput] = useState('');
    const [errorCount, setErrorCount] = useState(0);

    const handleInputChange = ({ target }) => {
        setUserInput(target.value.toUpperCase());
    }

    const handleUnblockSession = (e) => {
        e.preventDefault();
        const input = userInput.trim();
        const success = handleCheckAnswer(input);
        if (!success) {
            setErrorCount(prev => prev + 1);
        }
    }

    const formClass = [
        'exercise-modal',
        errorCount > 0 && isExerciseBlocked && 'modal-incorrect-code',
        errorCount > 0 && 'shake'
    ].filter(Boolean).join(' ');

    useEffect(() => {
        setIsExerciseBlocked(exercise.isBlocked);
    }, [exercise])

    return (
        <div className='modal-overlay'>
            <form className={formClass} key={errorCount}>
                <CloseIcon handleCloseModal={handleCloseModal}/>
                <h2 className="exercise-modal__title">{`Ejercicio #${exerciseId}`}</h2>
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
            </form>
        </div>
    )
}

export default ExerciseModal;