import apiClient from '../apiClient';

import { Config, ConfigSearchFormFieldType, Response } from '#/entity';

export enum ConfigApi {
  Config = '/config',
}

const getConfigList = (params: ConfigSearchFormFieldType) => {
  return apiClient.get<Response<Config[]>>({ url: ConfigApi.Config, params });
};

const deleteConfig = (ids: number[]) => {
  return apiClient.delete({ url: ConfigApi.Config, data: { ids } });
};

const createConfig = (data: Config) => {
  return apiClient.post({ url: ConfigApi.Config, data });
};

const updateConfig = (data: Config) => {
  return apiClient.put({ url: `${ConfigApi.Config}/${data.id}`, data });
};

const getConfig = (id: number) => {
  return apiClient.get({ url: `${ConfigApi.Config}/${id}` });
};

export default {
  getConfigList,
  deleteConfig,
  createConfig,
  updateConfig,
  getConfig,
};
