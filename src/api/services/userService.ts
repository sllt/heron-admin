import apiClient from '../apiClient';

import { Permission, UserInfo, UserToken, User, UserSearchFormFieldType, Response } from '#/entity';

export interface SignInReq {
  username: string;
  password: string;
  uuid: string;
  code: string;
}

export interface SignUpReq extends SignInReq {
  email: string;
}
export type SignInRes = UserToken & { user: UserInfo };

export enum UserApi {
  SignIn = '/auth/login',
  SignUp = '/auth/signup',
  Logout = '/auth/logout',
  Refresh = '/auth/refresh',
  Captcha = '/captcha',
  MenuRole = '/menurole',
  User = '/user',
  UserInfo = '/getinfo',
  SysUser = '/sys-user',
}

export interface CaptchaRes {
  id: string;
  b64s: string;
  answer: string;
}

export type PermissionList = [Permission];

const getUserInfo = () => apiClient.get<UserInfo>({ url: UserApi.UserInfo });
const getMenu = () => apiClient.get<[Permission]>({ url: UserApi.MenuRole });
const getCaptcha = () => apiClient.get<CaptchaRes>({ url: UserApi.Captcha });
const signin = (data: SignInReq) => apiClient.post<SignInRes>({ url: UserApi.SignIn, data });
const signup = (data: SignUpReq) => apiClient.post<SignInRes>({ url: UserApi.SignUp, data });
const logout = () => apiClient.get({ url: UserApi.Logout });
const findById = (id: string) => apiClient.get<UserInfo[]>({ url: `${UserApi.User}/${id}` });

const getUserList = (params: UserSearchFormFieldType) => {
  return apiClient.get<Response<User[]>>({ url: UserApi.SysUser, params });
};

const deleteUser = (ids: number[]) => {
  return apiClient.delete({ url: UserApi.SysUser, data: { ids } });
};

const createUser = (data: User) => {
  return apiClient.post({ url: UserApi.SysUser, data });
};

const updateUser = (data: User) => {
  return apiClient.put({ url: `${UserApi.SysUser}/${data.postId}`, data });
};

const getUser = (id: number) => {
  return apiClient.get({ url: `${UserApi.SysUser}/${id}` });
};

export default {
  signin,
  signup,
  findById,
  logout,
  getCaptcha,
  getMenu,
  getUserInfo,
  getUserList,
  deleteUser,
  createUser,
  updateUser,
  getUser,
};
