import { Navigate, Outlet } from 'react-router-dom';

export default function OnboardingGate() {
  try {
    const revealed = localStorage.getItem('courseRevealed') === 'true';
    if (!revealed) {
      return <Navigate to="/onboarding" replace />;
    }
  } catch (e) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
