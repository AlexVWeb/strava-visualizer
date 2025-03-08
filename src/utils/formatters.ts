/**
 * Formate une date au format français
 * @param dateString - La date au format ISO
 * @returns La date formatée
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

/**
 * Formate une distance en kilomètres
 * @param meters - La distance en mètres
 * @returns La distance formatée en kilomètres
 */
export const formatDistance = (meters: number): string => {
  return (meters / 1000).toFixed(1) + ' km';
};

/**
 * Formate une durée en heures et minutes
 * @param seconds - La durée en secondes
 * @returns La durée formatée
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}; 