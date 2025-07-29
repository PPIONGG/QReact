export interface ButtonProps {
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export interface ButtonState {
  count: number;
  clicked: boolean;
  lastClickTime: number;
}

export interface ApiConfig {
  baseUrl: string;
  token: string;
  package: string;
}

export interface VisitedLog {
  id: number;
  title: string;
  date: string;
  lastUpdate: string;
  account: string;
  status: 'completed' | 'pending';
}

export interface VisitorFormData {
  visitDate?: string;
  visitor?: string;
  customerCode?: string;
  customerName?: string;
  contactPerson?: string;
  tel?: string;
  email?: string;
  address?: string;
  salesClose?: string;
  note?: string;
  businessDetails?: string;
  status?: string;
  photos?: any[];
}
