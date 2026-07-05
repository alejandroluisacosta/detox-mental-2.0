import { Navigate, Outlet } from 'react-router-dom';

// Intro-revealed: OnboardingWrapper sets "true"; we require getItem(key) === "true".
export default function OnboardingGate() {
  try {
    const revealed = localStorage.getItem('onboardingRevealed') === 'true';
    if (!revealed) {
      return <Navigate to="/onboarding" replace />;
    }
  } catch {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
