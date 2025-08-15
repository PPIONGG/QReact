export interface ResSalesinfo {
  status: boolean;
  message: string;
  messageE : string | null;
  data: {
    salesCode: string;
    employeeCode: string;
    prefixThai: string;
    nameThai: string;
    suffixThai: string;
  };
}