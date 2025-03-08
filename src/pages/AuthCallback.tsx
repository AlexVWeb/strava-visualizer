import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { exchangeToken } from '../services/strava';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Extraire le code d'autorisation de l'URL
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const errorParam = params.get('error');

        if (errorParam) {
          setError('Autorisation refusée ou erreur d\'authentification.');
          setLoading(false);
          return;
        }

        if (!code) {
          setError('Code d\'autorisation manquant.');
          setLoading(false);
          return;
        }

        // Échanger le code contre un token d'accès
        await exchangeToken(code);
        
        // Rediriger vers le tableau de bord
        navigate('/dashboard');
      } catch (err) {
        console.error('Erreur lors de l\'authentification:', err);
        setError('Une erreur s\'est produite lors de l\'authentification. Veuillez réessayer.');
        setLoading(false);
      }
    };

    handleAuth();
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-bg-primary text-dark-text-primary">
        <div className="max-w-md w-full p-6 bg-dark-bg-secondary rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-strava mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Authentification en cours...</h2>
          <p className="text-dark-text-secondary">Connexion à votre compte Strava</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-bg-primary text-dark-text-primary">
        <div className="max-w-md w-full p-6 bg-dark-bg-secondary rounded-lg shadow-lg text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Erreur d'authentification</h2>
          <p className="text-dark-text-secondary mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="py-2 px-4 bg-strava hover:bg-strava-hover text-white font-bold rounded-md transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback; 