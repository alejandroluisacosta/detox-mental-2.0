import { Navigate, Outlet } from 'react-router-dom';

// Intro-revealed: OnboardingWrapper sets "true"; we require getItem(key) === "true".
export default function OnboardingGate() {
  try {
    const revealed = localStorage.getItem('onboardingRevealed') === 'true';
    console.log(revealed)
    if (!revealed) {
      console.log('onboarding not revealed');
      return <Navigate to="/onboarding" replace />;
    }
  } catch (e) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
