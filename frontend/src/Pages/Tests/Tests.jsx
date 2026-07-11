import { useNavigate } from 'react-router-dom';
import Navigation from '../../Components/Navigation/Navigation.jsx';
import { thoughtsTests } from '../../data';
import './Tests.css';

const Tests = () => {
  const navigate = useNavigate();
  const tests = Object.values(thoughtsTests);

  return (
    <div className='tests-page'>
      <Navigation />
      <main className='tests-page__content'>
        <header className='tests-page__header'>
          <h1 className='tests-page__title'>Tests de pensamientos</h1>
          <p className='tests-page__subtitle'>Aprende sobre tu mente</p>
        </header>

        <div className='tests-page__grid'>
          {tests.map((test) => (
            <button
              key={test.id}
              type='button'
              className='tests-page__button'
              onClick={() => navigate(`/test/${test.id}`)}
            >
              {test.title}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Tests;
