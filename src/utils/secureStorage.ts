
const STORAGE_KEY = 'scratch_script_auth';

export interface StoredAuth {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    name: string;
    phone_number: string;
    profile_image: string;
  };
}

// Simple encoding/decoding for basic protection
const encode = (data: string): string => {
  return btoa(encodeURIComponent(data));
};

const decode = (encodedData: string): string => {
  try {
    return decodeURIComponent(atob(encodedData));
  } catch {
    return '';
  }
};

export const secureStorage = {
  set: (data: StoredAuth): void => {
    const encoded = encode(JSON.stringify(data));
    localStorage.setItem(STORAGE_KEY, encoded);
  },

  get: (): StoredAuth | null => {
    try {
      const encoded = localStorage.getItem(STORAGE_KEY);
      if (!encoded) return null;
      
      const decoded = decode(encoded);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  },

  remove: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },

  getAccessToken: (): string | null => {
    const auth = secureStorage.get();
    return auth?.access || null;
  },

  getRefreshToken: (): string | null => {
    const auth = secureStorage.get();
    return auth?.refresh || null;
  },

  updateTokens: (access: string, refresh: string): void => {
    const current = secureStorage.get();
    if (current) {
      secureStorage.set({ ...current, access, refresh });
    }
  }
};
