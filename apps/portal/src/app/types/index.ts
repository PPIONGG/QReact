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