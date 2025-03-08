import { Activity } from '../../types/strava';
import { formatDate, formatDistance, formatDuration } from '../../utils/formatters';

interface ActivityCardProps {
  activity: Activity;
  isSelected: boolean;
  onClick: () => void;
}

const ActivityCard = ({ activity, isSelected, onClick }: ActivityCardProps) => {
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

export default ActivityCard; 