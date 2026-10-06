import { useNavigate } from 'react-router-dom';
import CloseIcon from '../CloseIcon/CloseIcon';
import { PROMO_DEADLINE_LABEL } from '../../data/promoConfig.js';
import { useLocale } from '../../Context/LocaleContext.jsx';
import './RewardOfferModal.css';

const RewardOfferModal = ({ setOpenRewardOfferModal }) => {
  const navigate = useNavigate();
  const { t } = useLocale();

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
        <p className='reward-offer-modal__eyebrow'>{t('course.rewardEyebrow')}</p>
        <h2 className='reward-offer-modal__title'>
          {t('course.rewardTitle')}
        </h2>
        <p className='reward-offer-modal__description'>
          {t('course.rewardDescriptionBefore')}
          <strong>{t('course.rewardGiftCard')}</strong>
          {t('course.rewardDescriptionAfter')}
        </p>
        <div className='reward-offer-modal__image-wrapper'>
          <img
            className='reward-offer-modal__image'
            src='/images/gift_card.webp'
            alt={t('course.rewardImageAlt')}
          />
        </div>
        <p className='reward-offer-modal__footer-text'>
          {t('course.rewardDeadline', { deadline: PROMO_DEADLINE_LABEL })}
        </p>
        <button
          type='button'
          className='reward-offer-modal__button'
          onClick={handleApply}
        >
          {t('course.rewardApply')}
        </button>
      </div>
    </div>
  );
};

export default RewardOfferModal;
