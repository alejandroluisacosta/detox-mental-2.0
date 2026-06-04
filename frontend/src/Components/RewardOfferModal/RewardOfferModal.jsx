import { useNavigate } from 'react-router-dom';
import CloseIcon from '../CloseIcon/CloseIcon';
import './RewardOfferModal.css';

const RewardOfferModal = ({ setOpenRewardOfferModal }) => {
  const navigate = useNavigate();

  const handleCloseModal = () => {
    setOpenRewardOfferModal(false);
  };

  const handleApply = () => {
    handleCloseModal();
    navigate('/promo');
  };

  return (
    <div
      className='modal-overlay'
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseModal();
      }}
    >
      <div className='reward-offer-modal modal-fade-in'>
        <CloseIcon handleCloseModal={handleCloseModal} />
        <p className='reward-offer-modal__eyebrow'>Nueva oportunidad</p>
        <h2 className='reward-offer-modal__title'>
          Limpia tu mente y gana una gift card de 25€
        </h2>
        <p className='reward-offer-modal__description'>
          En Detox Mental buscamos prospectos para probar la nueva versión de
          nuestro curso a cambio de una gift card de Amazon de 25€.
        </p>
        <p className='reward-offer-modal__description'>
          Limpia tu mente, libérate del estrés de tus pensamientos, y gana una
          recompensa a cambio.
        </p>
        <div className='reward-offer-modal__image-wrapper'>
          <img
            className='reward-offer-modal__image'
            src='/images/gift_card.webp'
            alt='Persona relajada representando el curso Detox Mental'
          />
        </div>
        <p className='reward-offer-modal__footer-text'>
          Aplica ahora para saber si eres elegible. Válido hasta el 01 de julio
          2026
        </p>
        <button
          type='button'
          className='reward-offer-modal__button'
          onClick={handleApply}
        >
          APLICA
        </button>
      </div>
    </div>
  );
};

export default RewardOfferModal;
