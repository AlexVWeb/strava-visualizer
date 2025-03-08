export interface Activity {
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

export interface Stats {
  totalActivities: number;
  totalDistance: number;
  totalElevation: number;
  totalTime: number;
} 