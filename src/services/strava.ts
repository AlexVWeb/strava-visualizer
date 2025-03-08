// Utilisation des variables d'environnement pour les identifiants Strava
const STRAVA_CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID || '102520';
const STRAVA_CLIENT_SECRET = import.meta.env.VITE_STRAVA_CLIENT_SECRET || '91e522778e26bbb4dd1438f83caa0996b510d3e1';
const REDIRECT_URI = `${window.location.origin}/auth/callback`;

// Types
interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
}

interface Activity {
  id: number;
  name: string;
  start_date: string;
  distance: number;
  moving_time: number;
  total_elevation_gain: number;
  map: {
    summary_polyline: string;
  };
  type: string;
}

// URL d'authentification Strava
export const getStravaAuthUrl = (): string => {
  const scope = 'read,activity:read_all';
  return `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&approval_prompt=force&scope=${scope}`;
};

// Échanger le code d'autorisation contre un token d'accès
export const exchangeToken = async (code: string): Promise<TokenResponse> => {
  try {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'échange du token');
    }

    const data = await response.json();
    
    // Stocker les tokens
    localStorage.setItem('strava_access_token', data.access_token);
    localStorage.setItem('strava_refresh_token', data.refresh_token);
    localStorage.setItem('strava_token_expiry', (Date.now() + data.expires_in * 1000).toString());
    
    return data;
  } catch (error) {
    console.error('Erreur d\'authentification Strava:', error);
    throw error;
  }
};

// Rafraîchir le token d'accès
export const refreshToken = async (): Promise<TokenResponse> => {
  const refreshToken = localStorage.getItem('strava_refresh_token');
  
  if (!refreshToken) {
    throw new Error('Aucun token de rafraîchissement disponible');
  }
  
  try {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors du rafraîchissement du token');
    }

    const data = await response.json();
    
    // Mettre à jour les tokens
    localStorage.setItem('strava_access_token', data.access_token);
    localStorage.setItem('strava_refresh_token', data.refresh_token);
    localStorage.setItem('strava_token_expiry', (Date.now() + data.expires_in * 1000).toString());
    
    return data;
  } catch (error) {
    console.error('Erreur de rafraîchissement du token Strava:', error);
    throw error;
  }
};

// Récupérer les activités de l'utilisateur
export const getActivities = async (page = 1, perPage = 30): Promise<Activity[]> => {
  let token = localStorage.getItem('strava_access_token');
  const tokenExpiry = localStorage.getItem('strava_token_expiry');
  
  // Vérifier si le token est expiré
  if (!token || !tokenExpiry || parseInt(tokenExpiry) <= Date.now()) {
    // Rafraîchir le token
    const refreshData = await refreshToken();
    token = refreshData.access_token;
  }
  
  try {
    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des activités');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des activités Strava:', error);
    throw error;
  }
};

// Récupérer les détails d'une activité spécifique, y compris les données de parcours
export const getActivityDetails = async (activityId: string): Promise<Activity> => {
  let token = localStorage.getItem('strava_access_token');
  const tokenExpiry = localStorage.getItem('strava_token_expiry');
  
  // Vérifier si le token est expiré
  if (!token || !tokenExpiry || parseInt(tokenExpiry) <= Date.now()) {
    // Rafraîchir le token
    const refreshData = await refreshToken();
    token = refreshData.access_token;
  }
  
  try {
    const response = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}?include_all_efforts=true`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des détails de l\'activité');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de l\'activité Strava:', error);
    throw error;
  }
}; 