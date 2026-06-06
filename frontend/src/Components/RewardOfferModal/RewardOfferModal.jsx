import { useNavigate } from 'react-router-dom';
import CloseIcon from '../CloseIcon/CloseIcon';
import { PROMO_DEADLINE_LABEL } from '../../data/promoConfig.js';
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
          nuestro curso a cambio de una <strong>gift card de Amazon de 25€</strong>.
        </p>
        <div className='reward-offer-modal__image-wrapper'>
          <img
            className='reward-offer-modal__image'
            src='/images/gift_card.webp'
            alt='Persona relajada representando el curso Detox Mental'
          />
        </div>
        <p className='reward-offer-modal__footer-text'>
          Aplica ahora para saber si eres elegible. Válido hasta el{' '}
          {PROMO_DEADLINE_LABEL}
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
