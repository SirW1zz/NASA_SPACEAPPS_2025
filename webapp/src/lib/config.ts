/**
 * API Configuration
 * 
 * Connected to your VS Code backend running on port 8080
 */

// Set to 'local' to connect to your backend, or 'mock' for offline testing
export const API_MODE: 'local' | 'mock' = 'local';

// Your VS Code backend URL
export const LOCAL_BACKEND_URL = 'http://localhost:8080';

// Get the appropriate base URL based on mode
export function getBaseURL(): string {
  if (API_MODE === 'mock') {
    return ''; // Will use mock data instead
  }
  return LOCAL_BACKEND_URL;
}

// CORS configuration helper
export const CORS_CONFIG = {
  mode: 'cors' as RequestMode,
  credentials: 'omit' as RequestCredentials,
};