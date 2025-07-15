export interface ResSalesinfo {
  status: boolean;
  message: string;
  data: {
    salesCode: string;
    employeeCode: string;
    prefixThai: string;
    nameThai: string;
    suffixThai: string;
  };
}