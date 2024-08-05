import apiClient from '../apiClient';

import {
  Dict,
  DictSearchFormFieldType,
  DictType,
  DictTypeSearchFormFieldType,
  Response,
} from '#/entity';

export enum DictApi {
  Dict = '/dict/data',
  DictType = '/dict/type',
}

const getDictList = (params: DictSearchFormFieldType) => {
  return apiClient.get<Response<Dict[]>>({ url: DictApi.Dict, params });
};

const deleteDict = (ids: number[]) => {
  return apiClient.delete({ url: DictApi.Dict, data: { ids } });
};

const createDict = (data: Dict) => {
  return apiClient.post({ url: DictApi.Dict, data });
};

const updateDict = (data: Dict) => {
  return apiClient.put({ url: `${DictApi.Dict}/${data.dictCode}`, data });
};

const getDict = (id: number) => {
  return apiClient.get({ url: `${DictApi.Dict}/${id}` });
};

const getDictTypeList = (params: DictTypeSearchFormFieldType) => {
  return apiClient.get<Response<DictType[]>>({ url: DictApi.DictType, params });
};

const deleteDictType = (ids: number[]) => {
  return apiClient.delete({ url: DictApi.DictType, data: { ids } });
};

const createDictType = (data: DictType) => {
  return apiClient.post({ url: DictApi.DictType, data });
};

const updateDictType = (data: DictType) => {
  return apiClient.put({ url: `${DictApi.Dict}/${data.id}`, data });
};

const getDictType = (id: number) => {
  return apiClient.get({ url: `${DictApi.DictType}/${id}` });
};

export default {
  getDictList,
  deleteDict,
  createDict,
  updateDict,
  getDict,
  getDictTypeList,
  deleteDictType,
  createDictType,
  updateDictType,
  getDictType,
};
