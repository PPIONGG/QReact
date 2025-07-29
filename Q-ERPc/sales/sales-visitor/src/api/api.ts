import {
  ResCustomerDetails,
  ResListAllCustomer,
  ResListVisited,
  ResUpdateVisit,
  ResVisitDetail,
  UpdateVisitRequest,
} from '../types/api';
import { ApiConfig } from './config';

const createHeaders = (config: ApiConfig) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.token}`,
    'X-PACKAGE': config.package,
  };
  
  // เพิ่ม ngrok header เฉพาะตอน development
  if (config.baseUrl.includes('ngrok')) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  
  return headers;
};

export const getListVisited = async (
  config: ApiConfig,
  salescode: string
): Promise<ResListVisited> => {
  const response = await fetch(
    `${config.baseUrl}/api/SalesVisitor/ListVisited/${salescode}`,
    {
      method: 'GET',
      headers: createHeaders(config),
    }
  );

  if (!response.ok) {
    if (response.status === 400) {
      const errorData = (await response.json()) as ResListVisited;
      return errorData;
    }
    throw new Error(`HTTP ${response.status}`);
  }

  const data = (await response.json()) as ResListVisited;
  return data;
};

export const VisitDetailsAPI = async (
  config: ApiConfig,
  noItem: string
): Promise<ResVisitDetail> => {
  const response = await fetch(
    `${config.baseUrl}/api/SalesVisitor/VisitDetails/${noItem}`,
    {
      method: 'GET',
      headers: createHeaders(config),
    }
  );

  if (!response.ok) {
    if (response.status === 400) {
      const errorData = (await response.json()) as ResVisitDetail;
      return errorData;
    }
    throw new Error(`HTTP ${response.status}`);
  }

  const data = (await response.json()) as ResVisitDetail;
  return data;
};

// Generic function สำหรับ Create และ Update
const saveVisitReport = async (
  config: ApiConfig,
  requestBody: UpdateVisitRequest,
  endpoint: 'Create' | 'Update'
): Promise<ResUpdateVisit> => {
  const response = await fetch(`${config.baseUrl}/api/SalesVisitor/${endpoint}`, {
    method: 'POST',
    headers: createHeaders(config),
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    if (response.status === 400) {
      const errorData = (await response.json()) as ResUpdateVisit;
      return errorData;
    }
    throw new Error(`HTTP ${response.status}`);
  }

  const data = (await response.json()) as ResUpdateVisit;
  return data;
};

// Export specific functions
export const createVisitReport = async (
  config: ApiConfig,
  requestBody: UpdateVisitRequest
): Promise<ResUpdateVisit> => {
  return saveVisitReport(config, requestBody, 'Create');
};

export const updateVisitReport = async (
  config: ApiConfig,
  requestBody: UpdateVisitRequest
): Promise<ResUpdateVisit> => {
  return saveVisitReport(config, requestBody, 'Update');
};

export const listAllCustomerAPI = async (
  config: ApiConfig,
): Promise<ResListAllCustomer> => {
  const response = await fetch(
    `${config.baseUrl}/api/SalesVisitor/Customer`,
    {
      method: 'GET',
      headers: createHeaders(config),
    }
  );

  if (!response.ok) {
    if (response.status === 400) {
      const errorData = (await response.json()) as ResListAllCustomer;
      return errorData;
    }
    throw new Error(`HTTP ${response.status}`);
  }

  const data = (await response.json()) as ResListAllCustomer;
  return data;
};

export const customerDetailsAPI = async (
  config: ApiConfig,
  customerCode : string,
  typeInfo : string
): Promise<ResCustomerDetails> => {
  const response = await fetch(
    `${config.baseUrl}/api/SalesVisitor/CustomerDetails/${customerCode}/${typeInfo}`,
    {
      method: 'GET',
      headers: createHeaders(config),
    }
  );

  if (!response.ok) { 
    if (response.status === 400) {
      const errorData = (await response.json()) as ResCustomerDetails;
      return errorData;
    }
    throw new Error(`HTTP ${response.status}`);
  }

  const data = (await response.json()) as ResCustomerDetails;
  return data;
};