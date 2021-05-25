interface BaseStructure {
  id?: number;
  name: string;
}

export interface Company extends BaseStructure {
  description?: string;
  cnpj: string;
  active: boolean;
}

export interface Unit extends BaseStructure {
  company: number;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

export interface User extends BaseStructure {
  username: string;
  email: string;
  role: UserRole;
  token?: string;
  password?: string;
  company?: number;
}

export enum AssetStatus {
  IN_OPERATION = 'inOperation',
  IN_DOWNTIME = 'inDowntime',
  IN_ALERT = 'inAlert',
}

export interface Asset extends BaseStructure {
  healthscore: number;
  status: AssetStatus;
  serialnumber: string;
  user: number;
  unit: number;
  company: number;
  image: string;
}

export interface WithUserProps {
  user?: User;
}

export interface ReportsData {
  status: AssetStatus;
  unit?: number;
  company?: number;
  total: number;
  averageHealth: number;
}

export interface Reports {
  inOperation: ReportsData;
  inAlert: ReportsData;
  inDowntime: ReportsData;
}

export interface Page<T> {
  content: Array<T>;
  total: number;
  page: number;
  size: number;
}

export enum ChartTypes {
  BAR = 'bar',
  PIE = 'pie',
}
