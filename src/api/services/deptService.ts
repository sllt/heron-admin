import apiClient from '../apiClient';

import { Department, SearchFormFieldType } from '#/entity';

export enum OrgApi {
  Dept = '/dept',
}

const getDeptList = (params: SearchFormFieldType) => {
  return apiClient.get<Department[]>({ url: OrgApi.Dept, params });
};

const deleteDept = (ids: number[]) => {
  return apiClient.delete({ url: OrgApi.Dept, data: { ids } });
};

const createDept = (data: Department) => {
  return apiClient.post({ url: OrgApi.Dept, data });
};

const updateDept = (data: Department) => {
  return apiClient.put({ url: `${OrgApi.Dept}/${data.deptId}`, data });
};

const getDept = (id: number) => {
  return apiClient.get({ url: `${OrgApi.Dept}/${id}` });
};

export default {
  getDeptList,
  deleteDept,
  createDept,
  updateDept,
  getDept,
};
