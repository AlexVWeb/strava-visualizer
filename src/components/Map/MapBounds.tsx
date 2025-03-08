import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { Activity } from '../../types/strava';
import { decodePolyline } from '../../utils/polyline';

interface MapBoundsProps {
  activities: Activity[];
  selectedActivity: Activity | null;
}

const MapBounds = ({ activities, selectedActivity }: MapBoundsProps) => {
  const map = useMap();
  
  useEffect(() => {
    try {
      if (selectedActivity) {
        // Si une activité est sélectionnée, zoomer sur celle-ci
        const coordinates = decodePolyline(selectedActivity.map.summary_polyline);
        if (coordinates.length > 0) {
          // Créer un tableau de LatLng pour Leaflet
          const latLngs = coordinates.map(point => {
            // Vérifier que le point a bien 2 éléments
            if (point.length >= 2) {
              return L.latLng(point[0], point[1]);
            }
            return L.latLng(0, 0); // Valeur par défaut en cas d'erreur
          });
          
          // Créer les limites à partir des points
          const bounds = L.latLngBounds(latLngs);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
      } else if (activities.length > 0) {
        // Sinon, ajuster la vue pour montrer toutes les activités
        const allCoordinates = activities
          .filter(activity => activity.map?.summary_polyline)
          .flatMap(activity => decodePolyline(activity.map.summary_polyline));
        
        if (allCoordinates.length > 0) {
          // Créer un tableau de LatLng pour Leaflet
          const allLatLngs = allCoordinates.map(point => {
            // Vérifier que le point a bien 2 éléments
            if (point.length >= 2) {
              return L.latLng(point[0], point[1]);
            }
            return L.latLng(0, 0); // Valeur par défaut en cas d'erreur
          });
          
          // Créer les limites à partir de tous les points
          const bounds = L.latLngBounds(allLatLngs);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajustement de la carte:', error);
    }
  }, [activities, selectedActivity, map]);
  
  return null;
};

export default MapBounds; 