import apiClient from '../apiClient';

import { Post, SearchFormFieldType, Response } from '#/entity';

export enum PostApi {
  Post = '/post',
}

const getPostList = (params: SearchFormFieldType) => {
  return apiClient.get<Response<Post[]>>({ url: PostApi.Post, params });
};

const deletePost = (ids: number[]) => {
  return apiClient.delete({ url: PostApi.Post, data: { ids } });
};

const createPost = (data: Post) => {
  return apiClient.post({ url: PostApi.Post, data });
};

const updatePost = (data: Post) => {
  return apiClient.put({ url: `${PostApi.Post}/${data.postId}`, data });
};

const getPost = (id: number) => {
  return apiClient.get({ url: `${PostApi.Post}/${id}` });
};

export default {
  getPostList,
  deletePost,
  createPost,
  updatePost,
  getPost,
};
