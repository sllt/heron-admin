import { BasicStatus, PermissionType } from './enum';

export interface Meta {
  page: number;
  size: number;
  total: number;
}

export interface Pagination {
  page?: number;
  size?: number;
}

export interface Response<T> {
  data: T;
  meta: Meta;
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

export type PermissionSearchFormFieldType = Pick<Permission, 'menuName' | 'label' | 'status'>;

export interface Role {
  roleId: number;
  roleName?: string;
  status?: string;
  roleKey?: string;
  roleSort?: number;
  flag?: string;
  remark?: string;
  admin: boolean;
  dataScope?: string;
  params?: string;
  permission?: Permission[];
  createdAt?: string;
  updatedAt?: string;
}

export type RoleSearchFormFieldType = Pick<Role, 'roleName' | 'roleKey' | 'status'>;

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

export interface Config {
  id: number;
  configName?: string;
  configKey?: string;
  configValue?: string;
  configType?: string;
  isFrontend?: string;
  remark?: string;
  createdAt?: string;
}

export type ConfigSearchFormFieldType = Pick<Config, 'configName' | 'configKey' | 'configType'>;

export interface DictType {
  id: number;
  dictName?: string;
  dictType?: string;
  status?: number;
  remark?: string;
  createBy?: number;
  updateBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type DictTypeSearchFormFieldType = Pick<DictType, 'dictName' | 'dictType' | 'status'> &
  Pagination;

export interface Dict {
  dictCode: number;
  dictSort?: number;
  dictLabel?: string;
  dictValue?: string;
  dictType?: string;
  cssClass?: string;
  listClass?: string;
  isDefault?: string;
  status?: number;
  default?: string;
  remark?: string;
  createBy?: number;
  updateBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type DictSearchFormFieldType = Pick<Dict, 'dictLabel' | 'status' | 'dictType'>;
