import LoadingStatus from '../../Components/LoadingStatus/LoadingStatus.jsx';
import { useAuth } from '../../Context/AuthContext.jsx';
import Home from '../Home/Home.jsx';
import Landing from '../Landing/Landing.jsx';
import './Root.css';

const Root = () => {
  const { user, status } = useAuth();

  if (status === 'loading') {
    return (
      <main className="root-loading">
        <LoadingStatus>Cargando tu espacio…</LoadingStatus>
      </main>
    );
  }

  return user ? <Home /> : <Landing />;
};

export default Root;
