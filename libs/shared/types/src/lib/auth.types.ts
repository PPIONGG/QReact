export interface ApiResponse {
  code: number;
  msg: string;
  result: {
    user: string;
    company: Company[];
  };
}

export interface Company {
  companyCode: string;
  companyName: string;
}

// Auth State Type
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  selectedCompanyCode: string | null;
  
  // Actions
  setSelectedCompany: (code: string) => void;
  clearError: () => void;
  login: (
    username: string,
    password: string,
    loginType: 'Q' | 'DB'
  ) => Promise<boolean>;
  logout: () => void;
}

// User Type
export interface User {
  username: string;
  loginTime: number;
  company: Company[];
}
