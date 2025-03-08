import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getActivities } from '../services/strava';
import { decodePolyline } from '../utils/polyline';
import L from 'leaflet';

// Types
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

interface Stats {
  totalActivities: number;
  totalDistance: number;
  totalElevation: number;
  totalTime: number;
}

// Composant pour ajuster la vue de la carte
const MapBounds = ({ activities, selectedActivity }: { activities: Activity[], selectedActivity: Activity | null }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedActivity) {
      // Si une activité est sélectionnée, zoomer sur celle-ci
      const coordinates = decodePolyline(selectedActivity.map.summary_polyline);
      if (coordinates.length > 0) {
        // Créer un objet bounds à partir des coordonnées de l'activité sélectionnée
        const latLngs = coordinates.map((point: [number, number]) => [point[0], point[1]]);
        // @ts-expect-error - Ignorer les erreurs de type pour L.latLngBounds
        const bounds = L.latLngBounds(latLngs);
        
        // Ajuster la vue avec un zoom plus proche pour l'activité sélectionnée
        map.fitBounds(bounds, { 
          padding: [50, 50],
          maxZoom: 15 // Limiter le zoom maximum
        });
      }
    } else if (activities.length > 0) {
      // Sinon, ajuster la vue pour montrer toutes les activités
      const allPoints = activities
        .filter(activity => activity.map?.summary_polyline)
        .flatMap(activity => decodePolyline(activity.map.summary_polyline));
      
      if (allPoints.length > 0) {
        // Créer un objet bounds à partir de tous les points
        const latLngs = allPoints.map((point: [number, number]) => [point[0], point[1]]);
        // @ts-expect-error - Ignorer les erreurs de type pour L.latLngBounds
        const bounds = L.latLngBounds(latLngs);
        
        // Ajuster la vue pour montrer toutes les activités
        map.fitBounds(bounds, { 
          padding: [50, 50],
          maxZoom: 13 // Zoom moins proche pour la vue d'ensemble
        });
      }
    }
  }, [activities, selectedActivity, map]);
  
  return null;
};

// Styles de carte Mapbox disponibles
const mapStyles = [
  { id: 'mapbox/dark-v11', name: 'Dark' },
  { id: 'mapbox/light-v11', name: 'Light' },
  { id: 'mapbox/streets-v12', name: 'Streets' },
  { id: 'mapbox/outdoors-v12', name: 'Outdoors' },
  { id: 'mapbox/satellite-streets-v12', name: 'Satellite' },
];

// Composant pour afficher une carte d'activité dans la sidebar
const ActivityCard = ({ activity, isSelected, onClick }: { 
  activity: Activity, 
  isSelected: boolean, 
  onClick: () => void 
}) => {
  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };
  
  // Formater la distance en km
  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(1) + ' km';
  };
  
  // Formater la durée
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  };
  
  // Déterminer l'icône et la couleur en fonction du type d'activité
  let icon = '🏃‍♂️';
  let bgColor = 'bg-[#fc4c02]';
  
  switch (activity.type) {
    case 'Run':
      icon = '🏃‍♂️';
      bgColor = 'bg-[#fc4c02]';
      break;
    case 'TrailRun':
      icon = '🏞️';
      bgColor = 'bg-[#8B4513]';
      break;
    case 'Ride':
      icon = '🚴‍♂️';
      bgColor = 'bg-[#1e88e5]';
      break;
    case 'Hike':
      icon = '🥾';
      bgColor = 'bg-[#4CAF50]';
      break;
  }
  
  return (
    <div 
      className={`p-3 rounded-lg mb-3 cursor-pointer transition-all ${
        isSelected 
          ? 'bg-strava text-white shadow-lg transform scale-105' 
          : 'bg-dark-bg-secondary hover:bg-dark-bg-tertiary'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center mb-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white mr-2 ${bgColor}`}>
          <span>{icon}</span>
        </div>
        <h3 className="font-medium truncate">{activity.name}</h3>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-dark-text-secondary">Date</p>
          <p>{formatDate(activity.start_date)}</p>
        </div>
        <div>
          <p className="text-dark-text-secondary">Distance</p>
          <p>{formatDistance(activity.distance)}</p>
        </div>
        <div>
          <p className="text-dark-text-secondary">Durée</p>
          <p>{formatDuration(activity.moving_time)}</p>
        </div>
        <div>
          <p className="text-dark-text-secondary">Dénivelé</p>
          <p>{activity.total_elevation_gain.toFixed(0)} m</p>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalActivities: 0,
    totalDistance: 0,
    totalElevation: 0,
    totalTime: 0,
  });
  const [showStats, setShowStats] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [mapStyle, setMapStyle] = useState('mapbox/dark-v11');
  const mapToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Vérifier si l'utilisateur est authentifié
        const token = localStorage.getItem('strava_access_token');
        if (!token) {
          navigate('/');
          return;
        }
        
        // Récupérer les activités
        const activitiesData = await getActivities(1, 200);
        
        // Filtrer pour ne garder que les activités avec des données de parcours
        const validActivities = activitiesData.filter(
          (activity: Activity) => activity.map?.summary_polyline && 
          (activity.type === 'Run' || activity.type === 'Ride' || 
           activity.type === 'TrailRun' || activity.type === 'Hike')
        );
        
        // Trier les activités par date (plus récentes en premier)
        const sortedActivities = validActivities.sort((a, b) => 
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        );
        
        setActivities(sortedActivities);
        setFilteredActivities(sortedActivities);
        
        // Extraire les années disponibles
        const years = sortedActivities
          .map(activity => new Date(activity.start_date).getFullYear())
          .filter((year, index, self) => self.indexOf(year) === index)
          .sort((a, b) => b - a); // Tri décroissant
        
        setAvailableYears(years);
        
        // Calculer les statistiques
        const stats = sortedActivities.reduce(
          (acc, activity) => ({
            totalActivities: acc.totalActivities + 1,
            totalDistance: acc.totalDistance + activity.distance,
            totalElevation: acc.totalElevation + activity.total_elevation_gain,
            totalTime: acc.totalTime + activity.moving_time,
          }),
          { totalActivities: 0, totalDistance: 0, totalElevation: 0, totalTime: 0 }
        );
        
        setStats(stats);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des activités:', err);
        setError('Impossible de récupérer vos activités. Veuillez vous reconnecter.');
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [navigate]);
  
  // Appliquer les filtres (type et année)
  useEffect(() => {
    let filtered = activities;
    
    // Filtre par type
    if (filterType) {
      filtered = filtered.filter(activity => activity.type === filterType);
    }
    
    // Filtre par année
    if (filterYear) {
      filtered = filtered.filter(activity => {
        const activityYear = new Date(activity.start_date).getFullYear();
        return activityYear === filterYear;
      });
    }
    
    setFilteredActivities(filtered);
    
    // Réinitialiser l'activité sélectionnée lors du changement de filtre
    setSelectedActivity(null);
    
    // Mettre à jour les statistiques pour les activités filtrées
    const filteredStats = filtered.reduce(
      (acc, activity) => ({
        totalActivities: acc.totalActivities + 1,
        totalDistance: acc.totalDistance + activity.distance,
        totalElevation: acc.totalElevation + activity.total_elevation_gain,
        totalTime: acc.totalTime + activity.moving_time,
      }),
      { totalActivities: 0, totalDistance: 0, totalElevation: 0, totalTime: 0 }
    );
    
    setStats(filteredStats);
  }, [activities, filterType, filterYear]);
  
  // Filtrer les activités par type
  const handleTypeFilter = (type: string | null) => {
    setFilterType(type);
  };
  
  // Filtrer les activités par année
  const handleYearFilter = (year: number | null) => {
    setFilterYear(year);
  };
  
  // Changer le style de la carte
  const handleMapStyleChange = (style: string) => {
    setMapStyle(style);
  };
  
  // Sélectionner une activité
  const handleActivitySelect = (activity: Activity) => {
    setSelectedActivity(activity === selectedActivity ? null : activity);
  };
  
  // Afficher/masquer la sidebar
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem('strava_access_token');
    localStorage.removeItem('strava_refresh_token');
    localStorage.removeItem('strava_token_expiry');
    navigate('/');
  };
  
  // Formater la durée en heures et minutes
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-bg-primary text-dark-text-primary">
        <div className="max-w-md w-full p-6 bg-dark-bg-secondary rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-strava mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Chargement de vos activités...</h2>
          <p className="text-dark-text-secondary">Récupération des données depuis Strava</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-bg-primary text-dark-text-primary">
        <div className="max-w-md w-full p-6 bg-dark-bg-secondary rounded-lg shadow-lg text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Erreur</h2>
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

  return (
    <div className="h-screen w-screen flex flex-col bg-dark-bg-primary text-dark-text-primary">
      {/* Barre d'outils */}
      <div className="bg-dark-bg-secondary shadow-md p-4 flex flex-col md:flex-row justify-between items-start md:items-center z-10">
        <h1 className="text-xl font-bold mb-2 md:mb-0">Strava Runs Visualizer</h1>
        
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <button
            onClick={() => setShowStats(!showStats)}
            className="py-2 px-4 bg-dark-bg-tertiary hover:bg-gray-700 rounded-md transition-colors"
          >
            {showStats ? 'Masquer les stats' : 'Afficher les stats'}
          </button>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-dark-text-secondary">Type:</span>
            <button
              onClick={() => handleTypeFilter(null)}
              className={`py-1 px-3 rounded-md transition-colors ${
                filterType === null ? 'bg-strava text-white' : 'bg-dark-bg-tertiary'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => handleTypeFilter('Run')}
              className={`py-1 px-3 rounded-md transition-colors ${
                filterType === 'Run' ? 'bg-strava text-white' : 'bg-dark-bg-tertiary'
              }`}
            >
              Course
            </button>
            <button
              onClick={() => handleTypeFilter('TrailRun')}
              className={`py-1 px-3 rounded-md transition-colors ${
                filterType === 'TrailRun' ? 'bg-strava text-white' : 'bg-dark-bg-tertiary'
              }`}
            >
              Trail
            </button>
            <button
              onClick={() => handleTypeFilter('Ride')}
              className={`py-1 px-3 rounded-md transition-colors ${
                filterType === 'Ride' ? 'bg-strava text-white' : 'bg-dark-bg-tertiary'
              }`}
            >
              Vélo
            </button>
            <button
              onClick={() => handleTypeFilter('Hike')}
              className={`py-1 px-3 rounded-md transition-colors ${
                filterType === 'Hike' ? 'bg-strava text-white' : 'bg-dark-bg-tertiary'
              }`}
            >
              Rando
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-dark-text-secondary">Année:</span>
            <button
              onClick={() => handleYearFilter(null)}
              className={`py-1 px-3 rounded-md transition-colors ${
                filterYear === null ? 'bg-strava text-white' : 'bg-dark-bg-tertiary'
              }`}
            >
              Toutes
            </button>
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => handleYearFilter(year)}
                className={`py-1 px-3 rounded-md transition-colors ${
                  filterYear === year ? 'bg-strava text-white' : 'bg-dark-bg-tertiary'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleLogout}
            className="py-2 px-4 bg-dark-bg-tertiary hover:bg-gray-700 rounded-md transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>
      
      {/* Panneau de statistiques */}
      {showStats && (
        <div className="bg-dark-bg-secondary shadow-md p-4 grid grid-cols-2 md:grid-cols-4 gap-4 z-10">
          <div className="text-center p-3 bg-dark-bg-tertiary rounded-lg">
            <p className="text-dark-text-secondary text-sm">Activités</p>
            <p className="text-2xl font-bold">{stats.totalActivities}</p>
          </div>
          <div className="text-center p-3 bg-dark-bg-tertiary rounded-lg">
            <p className="text-dark-text-secondary text-sm">Distance totale</p>
            <p className="text-2xl font-bold">{(stats.totalDistance / 1000).toFixed(1)} km</p>
          </div>
          <div className="text-center p-3 bg-dark-bg-tertiary rounded-lg">
            <p className="text-dark-text-secondary text-sm">Dénivelé total</p>
            <p className="text-2xl font-bold">{stats.totalElevation.toFixed(0)} m</p>
          </div>
          <div className="text-center p-3 bg-dark-bg-tertiary rounded-lg">
            <p className="text-dark-text-secondary text-sm">Temps total</p>
            <p className="text-2xl font-bold">{formatDuration(stats.totalTime)}</p>
          </div>
        </div>
      )}
      
      {/* Sélecteur de style de carte */}
      <div className="bg-dark-bg-secondary shadow-md p-2 flex justify-center z-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-dark-text-secondary text-sm">Style de carte:</span>
          {mapStyles.map(style => (
            <button
              key={style.id}
              onClick={() => handleMapStyleChange(style.id)}
              className={`py-1 px-3 text-sm rounded-md transition-colors ${
                mapStyle === style.id ? 'bg-strava text-white' : 'bg-dark-bg-tertiary'
              }`}
            >
              {style.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Contenu principal avec sidebar et carte */}
      <div className="flex-grow flex relative overflow-hidden">
        {/* Bouton pour afficher/masquer la sidebar */}
        <button 
          className="absolute top-4 left-4 z-20 bg-dark-bg-secondary p-2 rounded-full shadow-lg"
          onClick={toggleSidebar}
        >
          {showSidebar ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
        
        {/* Sidebar avec liste des activités */}
        {showSidebar && (
          <div className="w-80 bg-dark-bg-secondary z-10 flex flex-col h-full">
            <div className="p-4 border-b border-dark-bg-tertiary">
              <h2 className="text-lg font-semibold">Activités ({filteredActivities.length})</h2>
              {selectedActivity && (
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="mt-2 py-1 px-3 bg-dark-bg-tertiary hover:bg-gray-700 rounded-md text-sm transition-colors"
                >
                  Voir toutes les activités
                </button>
              )}
            </div>
            <div className="flex-grow overflow-y-auto p-4">
              {filteredActivities.length === 0 ? (
                <p className="text-dark-text-secondary text-center py-4">Aucune activité ne correspond aux filtres sélectionnés.</p>
              ) : (
                filteredActivities.map(activity => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    isSelected={selectedActivity?.id === activity.id}
                    onClick={() => handleActivitySelect(activity)}
                  />
                ))
              )}
            </div>
          </div>
        )}
        
        {/* Carte */}
        <div className={`absolute inset-0 ${showSidebar ? 'left-80' : 'left-0'} transition-all duration-300`}>
          <MapContainer
            center={[48.8566, 2.3522]} // Paris par défaut
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
              url={`https://api.mapbox.com/styles/v1/${mapStyle}/tiles/{z}/{x}/{y}?access_token=${mapToken}`}
            />
            
            {filteredActivities.map((activity) => {
              const coordinates = decodePolyline(activity.map.summary_polyline);
              let color = '#fc4c02'; // Couleur Strava par défaut
              let weight = 3;
              let opacity = 0.7;
              const dashArray = '';
              const className = selectedActivity?.id === activity.id ? 'pulse-animation' : '';
              
              // Définir la couleur en fonction du type d'activité
              switch (activity.type) {
                case 'Run':
                  color = '#fc4c02'; // Orange Strava
                  break;
                case 'TrailRun':
                  color = '#8B4513'; // Marron pour les trails
                  break;
                case 'Ride':
                  color = '#1e88e5'; // Bleu pour le vélo
                  break;
                case 'Hike':
                  color = '#4CAF50'; // Vert pour les randonnées
                  break;
              }
              
              // Si cette activité est sélectionnée, la mettre en évidence
              if (selectedActivity?.id === activity.id) {
                weight = 6;
                opacity = 1;
                // Ajouter un contour blanc pour faire ressortir l'activité
                return (
                  <div key={activity.id}>
                    {/* Contour blanc plus large */}
                    <Polyline
                      positions={coordinates.map((point: [number, number]) => [point[0], point[1]])}
                      color="white"
                      weight={weight + 4}
                      opacity={0.6}
                    />
                    {/* Tracé principal avec effet de pulsation */}
                    <Polyline
                      positions={coordinates.map((point: [number, number]) => [point[0], point[1]])}
                      color={color}
                      weight={weight}
                      opacity={opacity}
                      className={className}
                      eventHandlers={{
                        click: () => handleActivitySelect(activity)
                      }}
                    />
                  </div>
                );
              }
              
              return (
                <Polyline
                  key={activity.id}
                  positions={coordinates.map((point: [number, number]) => [point[0], point[1]])}
                  color={color}
                  weight={weight}
                  opacity={opacity}
                  dashArray={dashArray}
                  eventHandlers={{
                    click: () => handleActivitySelect(activity)
                  }}
                />
              );
            })}
            
            <MapBounds activities={filteredActivities} selectedActivity={selectedActivity} />
          </MapContainer>
          
          {/* Légende */}
          <div className="absolute bottom-5 right-5 bg-dark-bg-secondary p-3 rounded-lg shadow-lg z-10">
            <h3 className="text-sm font-semibold mb-2">Légende</h3>
            <div className="space-y-1">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#fc4c02] mr-2"></div>
                <span className="text-xs">Course</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#8B4513] mr-2"></div>
                <span className="text-xs">Trail</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#1e88e5] mr-2"></div>
                <span className="text-xs">Vélo</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#4CAF50] mr-2"></div>
                <span className="text-xs">Rando</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 