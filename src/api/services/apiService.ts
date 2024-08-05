import apiClient from '../apiClient';

import { Api, ApiSearchFormFieldType, Response } from '#/entity';

export enum SysApi {
  Api = '/sys-api',
}

const getApiList = (params: ApiSearchFormFieldType) => {
  return apiClient.get<Response<Api[]>>({ url: SysApi.Api, params });
};

const deleteApi = (ids: number[]) => {
  return apiClient.delete({ url: SysApi.Api, data: { ids } });
};

const createApi = (data: Api) => {
  return apiClient.post({ url: SysApi.Api, data });
};

const updateApi = (data: Api) => {
  return apiClient.put({ url: `${SysApi.Api}/${data.id}`, data });
};

const getApi = (id: number) => {
  return apiClient.get({ url: `${SysApi.Api}/${id}` });
};

export default {
  getApiList,
  deleteApi,
  createApi,
  updateApi,
  getApi,
};
