import apiClient from '../apiClient';

import { Permission } from '#/entity';

export enum MenuApi {
  Menu = '/menu',
}

const getMenuList = () => {
  return apiClient.get<Permission[]>({ url: MenuApi.Menu });
};

const deleteMenu = (ids: number[]) => {
  return apiClient.delete({ url: MenuApi.Menu, data: { ids } });
};

const createMenu = (data: Permission) => {
  return apiClient.post({ url: MenuApi.Menu, data });
};

const updateMenu = (data: Permission) => {
  return apiClient.put({ url: `${MenuApi.Menu}/${data.menuId}`, data });
};

const getMenu = (id: number) => {
  return apiClient.get({ url: `${MenuApi.Menu}/${id}` });
};

export default {
  getMenuList,
  deleteMenu,
  createMenu,
  updateMenu,
  getMenu,
};
