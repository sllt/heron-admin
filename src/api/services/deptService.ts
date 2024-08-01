import apiClient from '../apiClient';

import { Department, SearchFormFieldType } from '#/entity';

export enum OrgApi {
  Dept = '/dept',
}

const getDeptList = (params: SearchFormFieldType) => {
  apiClient.get<Department[]>({ url: OrgApi.Dept, params });
};

export default {
  getDeptList,
};
