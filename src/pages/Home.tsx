import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStravaAuthUrl } from '../services/strava';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà authentifié
    const token = localStorage.getItem('strava_access_token');
    const tokenExpiry = localStorage.getItem('strava_token_expiry');
    
    if (token && tokenExpiry && parseInt(tokenExpiry) > Date.now()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleStravaLogin = () => {
    window.location.href = getStravaAuthUrl();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-bg-primary text-dark-text-primary">
      <div className="max-w-md w-full p-6 bg-dark-bg-secondary rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Strava Runs Visualizer</h1>
        <p className="text-dark-text-secondary text-center mb-8">
          Visualisez tous vos parcours de course sur une carte interactive
        </p>
        
        <button
          onClick={handleStravaLogin}
          className="w-full py-3 px-4 bg-strava hover:bg-strava-hover text-white font-bold rounded-md flex items-center justify-center transition-colors"
        >
          <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
          </svg>
          Se connecter avec Strava
        </button>
      </div>
    </div>
  );
};

export default Home; 