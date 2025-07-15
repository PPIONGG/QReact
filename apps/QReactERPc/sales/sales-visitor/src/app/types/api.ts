export interface ListVisitedItem {
  noItem: number;
  customerCode: string;
  customerName: string;
  visitorName: string;
  salesCode: string;
  employeeCode: string | null;
  dateVisit: string;
}

export interface ResListVisited {
  status: boolean;
  message: string;
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
}

export interface ResVisitDetail {
  status: boolean;
  message: string;
  data: VisitDetailItem;
}

export interface UpdateVisitRequest {
  userName: string; 
  data: {
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
    isUpdateImage: boolean; 
  };
}

export interface ResUpdateVisit {
  status: boolean;
  message: string;
  data: string;
}
