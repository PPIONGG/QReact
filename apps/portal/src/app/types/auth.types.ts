import { resSalesinfo } from "./api";

export interface CompanyPermission {
  companyCode: string;
  companyName: string;
  allPermission: boolean;
  accessPermission: AccessPermission[];
}

export interface User {
  username: string;
  loginTime: number;
  company: CompanyPermission[];
}

export interface ApiResponse {
  code: number;
  msg?: string;
  result?: {
    user: string;
    company: CompanyPermission[];
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingLogin: boolean;
  errorLogin: string | null;
  selectedCompanyCode: string | null;
  Salesinfo: resSalesinfo | null;
  isloadingSalesinfo: boolean;
  errorSalesinfo: string | null;


  setSelectedCompany: (code: string) => void;
  clearErrorLogin: () => void;
  login: (
    username: string,
    password: string,
    loginType: 'Q' | 'DB'
  ) => Promise<boolean>;
  logout: () => void;

  setLoadingSalesinfo: (isLoadingLogin: boolean) => void;
  setSalesinfo: (Salesinfo: resSalesinfo) => void;
  fetchSalesinfo: (user: string) => Promise<void>;
  clearSalesinfo: () => void;
  clearErrorSalesinfo: () => void;
}

export type LoginType = 'Q' | 'DB';

export interface AccessPermission {
  programName: string[];
}
