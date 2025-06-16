import { secureStorage } from '@/utils/secureStorage';
import { tokenManager } from '@/utils/tokenManager';

export const BASE_URL = 'http://127.0.0.1:8000';

export interface RegisterRequest {
  username: string;
  email: string;
  name: string;
  phone_number: string;
  profile_image?: string;
  password: string;
}

export interface LoginRequest {
  username_or_email: string;
  password: string;
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  name?: string;
  phone_number?: string;
  profile_image?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  uid: string;
  new_password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  phone_number: string;
  profile_image: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface CertificateRequest {
  name: string;
  description?: string;
  cpe_hours?: string;
  logo1?: File;
  logo2?: File;
  issued_date: string;
  expiry_date?: string;
}

export interface Signatory {
  id: number;
  name: string;
  logo: string | null;
  signature: string | null;
  title: string | null;
  organization: string | null;
  created_at: string;
  updated_at: string;
}

export interface SignatoryRequest {
  certificate: string; // UUID of the certificate
  name: string;
  logo?: File;
  signature?: File;
  title?: string;
  organization?: string;
}

export interface Certificate {
  id: string;
  name: string;
  description: string | null;
  cpe_hours: string | null;
  logo1: string | null;
  logo2: string | null;
  issued_date: string;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
  signatories: Signatory[];
}

export interface UserProfile extends User {
  date_joined: string;
  certificates: Certificate[];
}

export interface CertificateEntry {
  id: number;
  certificate: string;
  name: string;
  email: string;
  member_no: string;
  email_sent: boolean;
  certificate_create: boolean;
  created_at: string;
  updated_at: string;
}

export interface CertificateEntryRequest {
  certificate: string;
  name: string;
  email: string;
  member_no: string;
}

export interface CertificateEntriesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CertificateEntry[];
}

class APIError extends Error {
  constructor(public status: number, public data: any) {
    super(`API Error: ${status}`);
  }
}

const makeRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const url = `${BASE_URL}${endpoint}`;
  
  // Ensure we have a valid token before making the request
  const token = await tokenManager.ensureValidToken();
  
  if (!token && endpoint !== '/api/auth/login/' && endpoint !== '/api/auth/register/' && endpoint !== '/api/auth/password-reset/' && endpoint !== '/api/auth/password-reset/confirm/') {
    // No valid token for protected endpoints
    tokenManager.performSecureLogout();
    throw new APIError(401, { detail: 'Authentication required' });
  }
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Handle different content types
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        // If this was already a retry or if token refresh fails, perform secure logout
        if (config.headers?.['Authorization']?.includes('Bearer')) {
          const refreshSuccess = await tokenManager.refreshAccessToken();
          if (!refreshSuccess) {
            tokenManager.performSecureLogout();
            throw new APIError(401, { detail: 'Session expired. Please login again.' });
          }
          
          // Retry the request with the new token
          const newToken = secureStorage.getAccessToken();
          const retryConfig = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };
          
          const retryResponse = await fetch(url, retryConfig);
          let retryData;
          const retryContentType = retryResponse.headers.get('content-type');
          if (retryContentType && retryContentType.includes('application/json')) {
            retryData = await retryResponse.json();
          } else {
            retryData = await retryResponse.text();
          }
          
          if (!retryResponse.ok) {
            throw new APIError(retryResponse.status, retryData);
          }
          return retryData;
        }
      }
      
      throw new APIError(response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
};

export const authAPI = {
  register: (data: RegisterRequest) =>
    makeRequest('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: LoginRequest): Promise<AuthResponse> =>
    makeRequest('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProfile: (data: UpdateProfileRequest): Promise<User> =>
    makeRequest('/api/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateProfileImage: (formData: FormData): Promise<User> =>
    makeRequest('/api/auth/profile/', {
      method: 'PATCH',
      headers: {}, // Don't set Content-Type for FormData, let browser set it
      body: formData,
    }),

  registerWithFormData: (formData: FormData) =>
    makeRequest('/api/auth/register/', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type
    }),

  changePassword: (data: ChangePasswordRequest) =>
    makeRequest('/api/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  passwordReset: (data: PasswordResetRequest) =>
    makeRequest('/api/auth/password-reset/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  passwordResetConfirm: (data: PasswordResetConfirmRequest) =>
    makeRequest('/api/auth/password-reset/confirm/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  refreshToken: () => tokenManager.refreshAccessToken(),
};

export const certificateAPI = {
  create: (data: CertificateRequest): Promise<Certificate> => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    return makeRequest('/api/auth/certificates/', {
      method: 'POST',
      body: formData,
    });
  },

  update: (id: string, data: Partial<CertificateRequest>): Promise<Certificate> => {
    const formData = new FormData();
  
    // Add dynamic data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
  
    // Explicitly include certificate_id in the form body
    formData.append('id', id);
  
    return makeRequest(`/api/auth/certificates/`, {
      method: 'PATCH',
      body: formData,
    });
  },


  // api.ts
  delete: (id: string): Promise<void> => {
    const formData = new FormData();
    formData.append('id', id);
    
    return makeRequest(`/api/auth/certificates/${id}/`, {
      method: 'DELETE',
      body: formData,
    }).then(response => {
      // Explicitly handle 204 responses
      if (response.status === 200) {
        return;
      }
      return response.json();
    });
  },
  

  getAll: (): Promise<Certificate[]> =>
    makeRequest('/api/auth/certificates/', {
      method: 'GET',
    }),

  getById: (id: string): Promise<Certificate> =>
    makeRequest(`/api/auth/certificates/${id}/`, {
      method: 'GET',
    }),
};

export const signatoryAPI = {
  create: (data: SignatoryRequest): Promise<Signatory> => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    return makeRequest('/api/auth/signatory/', {
      method: 'POST',
      body: formData,
    });
  },

  update: (id: number, data: Partial<SignatoryRequest>): Promise<Signatory> => {
    const formData = new FormData();
    formData.append('id', id.toString());
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    return makeRequest('/api/auth/signatory/', {
      method: 'PATCH',
      body: formData,
    });
  },

  delete: (id: number): Promise<void> =>
    makeRequest('/api/auth/signatory/', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    }),
};

export const profileAPI = {
  getProfile: (): Promise<UserProfile> =>
    makeRequest('/api/auth/view-all/', {
      method: 'GET',
    }),

  deleteCertificate: (id: string): Promise<void> =>
    makeRequest(`/api/auth/certificates/`, {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    }),
};

export const certificateEntriesAPI = {
  create: (data: CertificateEntryRequest): Promise<CertificateEntry> =>
    makeRequest('/api/auth/CertificateEntry/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<CertificateEntryRequest>): Promise<CertificateEntry> =>
    makeRequest('/api/auth/CertificateEntry/', {
      method: 'PATCH',
      body: JSON.stringify({ id, ...data }),
    }),

  delete: (id: number): Promise<void> =>
    makeRequest('/api/auth/CertificateEntry/', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    }),

  uploadFile: (certificateId: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('certificate_id', certificateId);
    formData.append('file', file);

    return makeRequest('/api/auth/certificates/upload/', {
      method: 'POST',
      body: formData,
    });
  },

  getEntries: (params: {
    search?: string;
    page?: number;
    limit?: number;
    certificate__id?: string;
  }): Promise<CertificateEntriesResponse> => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.certificate__id) searchParams.append('certificate__id', params.certificate__id);

    return makeRequest(`/api/auth/certificate-entries/?${searchParams.toString()}`, {
      method: 'GET',
    });
  },
};

export const certificateGenerationAPI = {
  generate: (certificateId: string): Promise<void> =>
    makeRequest('/generate-certificates/', {
      method: 'POST',
      body: JSON.stringify({ certificate_id: certificateId }),
    }),

  sendEmails: (certificateId: string): Promise<{ success: number; total: number }> =>
    makeRequest(`/api/auth/send-certificate-emails/`, {
      method: 'POST',
      body: JSON.stringify({ certificate_id: certificateId }),
    }),
};

// Certificate Template Editor APIs
export const getCertificate = async (certificateId: string) => {
  return makeRequest(`/certificate/${certificateId}/`, {
    method: 'GET',
  });
};

export const updateCertificateTemplate = async (certificateId: string, template_html: string) => {
  return makeRequest(`/certificate/${certificateId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ template_html }),
    headers: { 'Content-Type': 'application/json' },
  });
};

// Template APIs
export interface CertificateTemplate {
  id: number;
  name: string;
  template_html?: string;
}

// Fetch all templates
export const fetchTemplates = async (): Promise<CertificateTemplate[]> => {
  return makeRequest('/api/auth/templates/', {
    method: 'GET',
  });
};

// Fetch template by id
export const fetchTemplateById = async (id: number): Promise<CertificateTemplate> => {
  return makeRequest(`/api/auth/templates/?id=${id}`, {
    method: 'GET',
  });
};

// Apply template to certificate
export const applyTemplateToCertificate = async (template_id: number, certificate_id: string): Promise<any> => {
  return makeRequest('/api/auth/templates/', {
    method: 'PATCH',
    body: JSON.stringify({ template_id, certificate_id }),
    headers: { 'Content-Type': 'application/json' },
  });
};
