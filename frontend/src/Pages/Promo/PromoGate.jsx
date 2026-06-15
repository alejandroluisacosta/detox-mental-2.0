import { Navigate } from 'react-router-dom';
import { isPromoEnabled } from '../../data/promoConfig.js';
import Promo from './Promo.jsx';

export default function PromoGate() {
  if (!isPromoEnabled()) return <Navigate to='/course' replace />;
  return <Promo />;
}
