import { useState } from 'react';
import CloseIcon from '../CloseIcon/CloseIcon';
import './ExerciseModal.css';

const ExerciseModal = ({ setOpenExerciseModal }) => {
    const handleCloseModal = () => setOpenExerciseModal(false);
    const [isExerciseBlocked, setIsExerciseBlocked] = useState(false);
    
    return (
        <div className='modal-overlay'>
            <div className='exercise-modal modal-fade-in'>
                <CloseIcon handleCloseModal={handleCloseModal}/>
                <h2 className='exercise-modal__title'>Ejercicio #1</h2>
                {isExerciseBlocked ? 
                <div className='exercise-modal__unblock-container'>
                    <p className='exercise-modal__question'>¿Qué filósofo dijo la frase "pienso, luego existo"</p>
                    <input className='exercise-modal__input' placeholder='Tu respuesta'/>
                </div>
                :
                <p className='exercise-modal__exercise-text'>
                    Escribe cuáles son los 2-3 pensamientos que más te frenan a la hora de lograr lo que quieres (no me alcanza el tiempo, ahora no me provoca, es muy difícil...). Pueden ser más de 3.
                    Detállalos bien. Puedes empezar escribiendo los patrones que suelas ver en ti (ej.: «no puedo hacer X porque no soy inteligente», «nunca conseguiré lo que quiero porque mi crianza me dejó dañado», «todo lo que hago, lo hago mal», la voz de tus padres criticándote en lugar de alentarte, preocupaciones por tu salud física o mental, por falta de éxitos, escenarios imaginarios negativos que reaparecen constantemente en tu mente, etc.).
                    Luego, agrupa los que provengan de la misma raíz. Por ejemplo: pensar que haces todo mal y el juicio de tus padres. La falta de éxito y las dudas sobre tu inteligencia o tu competencia. La preocupación por tu salud y escenarios imaginarios de accidentes donde te haces daño.
                    Si escribes 9 patrones de pensamientos recurrentes y ves que tres de ellos están enraizados en tu falta de éxitos, agrúpalos en una misma categoría llamada «ambiciones» o «falta de éxitos».
                    Al finalizar el curso te darás cuenta de que la mayoría de tus PQAs provienen de unas pocas causas principales. Conocer estas causas es información invaluable para empezar a trabajar en ellos.
                    Invierte al menos 20 minutos en este ejercicio. Si puedes llegar más, mejor. Los primeros minutos serán los más complicados y aburridos, pero cuando las ideas empiecen a fluir, te costará detenerte.
                    Empieza a exprimir tu mente y ten los resultados de esta actividad a la mano por el resto del curso.
                </p>
                }
                <span className="exercise-modal__close-text" onClick={handleCloseModal}>Cerrar</span>
            </div>
        </div>
    )
}

export default ExerciseModal;