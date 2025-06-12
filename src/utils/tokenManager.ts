
import { secureStorage } from './secureStorage';

const BASE_URL = 'http://127.0.0.1:8000';

export interface TokenValidationResult {
  isValid: boolean;
  needsRefresh: boolean;
  timeUntilExpiry: number;
}

class TokenManager {
  private refreshPromise: Promise<boolean> | null = null;
  private requestQueue: Array<{ resolve: Function; reject: Function }> = [];

  /**
   * Validates if the current access token is valid and not expired
   */
  validateToken(): TokenValidationResult {
    const token = secureStorage.getAccessToken();
    
    if (!token) {
      return { isValid: false, needsRefresh: false, timeUntilExpiry: 0 };
    }

    try {
      // Decode JWT payload (simple base64 decode without verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - currentTime;
      
      // Token is expired
      if (timeUntilExpiry <= 0) {
        return { isValid: false, needsRefresh: true, timeUntilExpiry: 0 };
      }
      
      // Token expires in less than 5 minutes, needs refresh
      if (timeUntilExpiry < 300) {
        return { isValid: true, needsRefresh: true, timeUntilExpiry };
      }
      
      return { isValid: true, needsRefresh: false, timeUntilExpiry };
    } catch {
      // Invalid token format
      return { isValid: false, needsRefresh: false, timeUntilExpiry: 0 };
    }
  }

  /**
   * Refreshes the access token using the refresh token
   */
  async refreshAccessToken(): Promise<boolean> {
    // If there's already a refresh in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    const result = await this.refreshPromise;
    this.refreshPromise = null;
    
    // Process queued requests
    this.processRequestQueue(result);
    
    return result;
  }

  private async performTokenRefresh(): Promise<boolean> {
    try {
      const refresh = secureStorage.getRefreshToken();
      if (!refresh) {
        console.log('No refresh token available');
        return false;
      }

      const response = await fetch(`${BASE_URL}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });

      if (response.ok) {
        const data = await response.json();
        secureStorage.updateTokens(data.access, refresh);
        console.log('Token refreshed successfully');
        return true;
      }
      
      console.log('Token refresh failed:', response.status);
      return false;
    } catch (error) {
      console.log('Token refresh error:', error);
      return false;
    }
  }

  /**
   * Adds a request to the queue while token refresh is in progress
   */
  queueRequest(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ resolve, reject });
    });
  }

  private processRequestQueue(refreshSuccess: boolean) {
    while (this.requestQueue.length > 0) {
      const { resolve } = this.requestQueue.shift()!;
      resolve(refreshSuccess);
    }
  }

  /**
   * Clears all tokens and performs secure logout
   */
  performSecureLogout(): void {
    secureStorage.remove();
    this.refreshPromise = null;
    this.requestQueue = [];
    console.log('Secure logout performed');
  }

  /**
   * Ensures a valid token is available for API calls
   */
  async ensureValidToken(): Promise<string | null> {
    const validation = this.validateToken();
    
    if (!validation.isValid && !validation.needsRefresh) {
      // No valid token and can't refresh
      return null;
    }
    
    if (validation.needsRefresh) {
      // If refresh is already in progress, queue this request
      if (this.refreshPromise) {
        const refreshSuccess = await this.queueRequest();
        return refreshSuccess ? secureStorage.getAccessToken() : null;
      }
      
      // Attempt to refresh the token
      const refreshSuccess = await this.refreshAccessToken();
      return refreshSuccess ? secureStorage.getAccessToken() : null;
    }
    
    return secureStorage.getAccessToken();
  }
}

export const tokenManager = new TokenManager();
