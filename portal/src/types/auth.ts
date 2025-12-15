export interface ApiJWTResponse<T> {
  code: number;
  msg: string | null;
  result: T;
}

export interface ResLoginJWT {
  accessToken: string;
  permission: {
    user: string;
    companys: Company[];
  };
}

export interface Company {
  companyCode: string;
  companyName: string;
  allPermission: boolean;
  moduleCodes: string[];
}

// Response from QERPcMenuJWT (single company permission)
export interface ResMenuJWT {
  accessToken: string;
  permission: {
    companyCode: string;
    companyName: string;
    allPermission: boolean;
    moduleCodes: string[];
  };
}

export type LoginType = "Q" | "DB";

export interface LoginRequest {
  QERPUserOrDBUser: LoginType;
  UserLogin: string;
  Password: string;
}
