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

declare module '../services/strava' {
  export function getStravaAuthUrl(): string;
  export function exchangeToken(code: string): Promise<TokenResponse>;
  export function refreshToken(): Promise<TokenResponse>;
  export function getActivities(page?: number, perPage?: number): Promise<Activity[]>;
  export function getActivityDetails(activityId: string): Promise<Activity>;
}

declare module '../utils/polyline' {
  export function decodePolyline(encoded: string): [number, number][];
} 