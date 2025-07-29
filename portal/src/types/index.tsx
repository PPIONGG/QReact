export interface RemoteStatus {
  [key: string]: 'online' | 'offline' | 'checking';
}

export interface RemoteConfig {
  name: string;
  port: number;
  required?: boolean;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export interface SubMenuItem {
  id: string;
  name: string;
  icon?: React.ReactNode;
  url?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  url?: string;
  subItems?: SubMenuItem[];
}

export interface ActiveApp {
  parentId: string;
  subId?: string;
}

