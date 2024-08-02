import apiClient from '../apiClient';

import { Response, Role, RoleSearchFormFieldType } from '#/entity';

export enum RoleApi {
  Role = '/role',
}

const getRoleList = (params: RoleSearchFormFieldType) => {
  return apiClient.get<Response<Role[]>>({ url: RoleApi.Role, params });
};

const deleteRole = (ids: number[]) => {
  return apiClient.delete({ url: RoleApi.Role, data: { ids } });
};

const createRole = (data: Role) => {
  return apiClient.post({ url: RoleApi.Role, data });
};

const updateRole = (data: Role) => {
  return apiClient.put({ url: `${RoleApi.Role}/${data.roleId}`, data });
};

const getRole = (id: number) => {
  return apiClient.get({ url: `${RoleApi.Role}/${id}` });
};

export default {
  getRoleList,
  deleteRole,
  createRole,
  updateRole,
  getRole,
};
