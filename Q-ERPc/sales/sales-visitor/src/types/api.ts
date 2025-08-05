interface BaseApiResponse {
  status: boolean;
  message: string;
}

export interface ListVisitedItem {
  noItem: number;
  customerCode: string;
  customerName: string;
  visitorName: string;
  salesCode: string;
  employeeCode: string | null;
  dateVisit: string;
  customerPrefix: string | null;
  customerSuffix: string | null;
  lastUpdated: string | Date | null;
  createdDate: string | Date | null;
  recStatus: 0 | 1; // 0 = Active, 1 = Inactive
}

export interface ResListVisited extends BaseApiResponse {
  data: ListVisitedItem[];
}

export interface VisitDetailItem {
  noItem: number;
  customerCode: string;
  companyName: string;
  visitorName: string;
  dateVisit: string;
  contactPerson: string;
  tel: string;
  email: string;
  address: string;
  objective: string | null;
  status: string | null;
  note: string | null;
  note2: string | null;
  salesClose: string;
  latitude: number | null;
  longitude: number | null;
  currentLocation: string | null;
  issuedStatusWithdraw: string | null;
  salesCode: string;
  salesName: string;
  employeeCode: string | null;
  imageFilePatch: string | null;
  isUpdateImage: boolean;
  customerPrefix: string | null;
  customerSuffix: string | null;
  salesPrefix: string | null;
  salesSuffix: string | null;
  isDeleteImage: boolean;
}

export interface ResVisitDetail extends BaseApiResponse {
  data: VisitDetailItem;
}

export interface VisitRequestData {
  noItem: number;
  customerCode: string;
  companyName: string;
  visitorName: string;
  dateVisit: string;
  contactPerson: string;
  tel: string;
  email: string;
  address: string;
  objective: string;
  status: string;
  note: string;
  note2: string;
  salesClose: string;
  latitude: number;
  longitude: number;
  currentLocation: string;
  issuedStatusWithdraw: boolean;
  salesCode: string;
  salesName: string;
  employeeCode: string;
  imageFilePatch: string;
  imageFileName?: boolean;
  isUpdateImage: boolean;
  isDeleteImage: boolean;

  customerPrefix: string | null;
  customerSuffix: string | null;
  salesPrefix: string | null;
  salesSuffix: string | null;
}

export interface UpdateVisitRequest {
  userName: string;
  data: VisitRequestData;
}

export interface ResUpdateVisit extends BaseApiResponse {
  data: string;
}

export interface ResListAllCustomer extends BaseApiResponse {
  data: CustomerDataItem[];
}

export interface CustomerDataItem {
  noItem: string;
  customerCode: string;
  customerName: string;
  customerPrefix: string;
  customerSuffix: string;
  phone: string | null;
  fax: null;
  typeInfo: string;
}

export interface CustomerDetailItem {
  customerCode: string;
  customerName: string;
  contactPerson: string | null;
  tel: string;
  email: string;
  address: string;
}

export interface ResCustomerDetails extends BaseApiResponse {
  data: CustomerDetailItem | null;
}

export interface ResFileUpload {
  filename: string;
  url: string;
}

export interface UploadedImage {
  filename: string; // ชื่อไฟล์สำหรับส่งไป API
  url: string; // URL สำหรับแสดงรูป
  originalName?: string; // ชื่อเดิมของไฟล์
  size?: number; // ขนาดไฟล์
}
