import { BasicStatus, PermissionType } from './enum';

export interface Pagination {
  page: number;
  size: number;
  total: number;
}

export interface Response<T> {
  data: T;
  meta: Pagination;
}

export interface UserToken {
  token?: string;
  expire?: string;
}

export interface UserInfo {
  userId: string;
  email: string;
  userName: string;
  password?: string;
  avatar?: string;
  role?: Role;
  status?: BasicStatus;
  permissions?: Permission[];
}

export interface Organization {
  id: string;
  name: string;
  status: 'enable' | 'disable';
  desc?: string;
  order?: number;
  children?: Organization[];
}

export interface Permission {
  menuId: string;
  parentId: string;
  menuName: string;
  label: string;
  menuType: PermissionType;
  path: string;
  status?: BasicStatus;
  order?: number;
  icon?: string;
  component?: string;
  hide?: boolean;
  hideTab?: boolean;
  frameSrc?: string;
  newFeature?: boolean;
  children?: Permission[];
}

export interface Role {
  id: string;
  name: string;
  label: string;
  status: BasicStatus;
  order?: number;
  desc?: string;
  permission?: Permission[];
}

export interface Department {
  deptId: number;
  parentId?: number;
  deptPath: string;
  deptName?: string;
  sort: number;
  leader?: string;
  phone?: string;
  email: string;
  status?: number;
  dataScope: string;
  params?: string;
  createdAt: string;
  children?: Department[];
  remark?: string;
}

export type SearchFormFieldType = Pick<Department, 'deptName' | 'status'>;

export interface Post {
  postId: number;
  postName?: string;
  postCode?: string;
  sort: number;
  status?: number;
  remark?: string;
  createBy?: number;
  updateBy?: number;
  createdAt?: string;
  updatedAt?: string;
  dataScope?: string;
  params?: string;
}

export type PostSearchFormFieldType = Pick<Post, 'postName' | 'status' | 'postCode'>;
