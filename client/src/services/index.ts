import { AxiosRequestConfig } from 'axios';

const GET = 'get';
const PUT = 'put';
const POST = 'post';
const DELETE = 'delete';

export const base = 'api';
export const version = 'v1';

export const resources = {
  COMPANIES: `/${base}/${version}/companies`,
  UNITS: `/${base}/${version}/units`,
  USERS: `/${base}/${version}/users`,
  ASSETS: `/${base}/${version}/assets`,
  REPORTS: `/${base}/${version}/reports`,
};

export const endPoints = {
  login: (username: string, password: string): AxiosRequestConfig => {
    return {
      url: '/login',
      method: POST,
      data: { username, password },
    };
  },
  reports: (
    groupFields: string[] = ['status'],
    filterFields: Record<string, string | number> = {},
  ): AxiosRequestConfig => {
    let groupBy = '';
    let filters = '';
    groupFields.forEach(field => {
      groupBy = groupBy.concat(`groupField[]=${field}&`);
    });
    Object.entries(filterFields).forEach(filter => {
      filters = filters.concat(`${filter[0]}=${filter[1]}&`);
    });
    let url = resources.REPORTS;
    if (groupBy && filters) {
      url = `${url}?${groupBy}&${filters}`;
    } else if (groupBy) {
      url = `${url}?${groupBy}`;
    } else if (filters) {
      url = `${url}?${filters}`;
    }
    return {
      url: url,
      method: GET,
    };
  },
  get: (
    resource: string,
    page?: number,
    size?: number,
    id?: number | string,
  ): AxiosRequestConfig => {
    let url = id ? `${resource}/${id}` : resource;
    if (
      page !== undefined &&
      page !== null &&
      size !== undefined &&
      size !== null
    ) {
      url = `${url}?page=${page}&size=${size}`;
    } else if (page !== undefined && page !== null) {
      url = `${url}?page=${page}`;
    } else if (size !== undefined && size !== null) {
      url = `${url}?size=${size}`;
    }
    return {
      url: url,
      method: GET,
    };
  },
  put: (resource: string, data: unknown): AxiosRequestConfig => {
    return {
      url: resource,
      method: PUT,
      data: data,
    };
  },
  post: (
    resource: string,
    data: unknown,
    id?: number | string,
  ): AxiosRequestConfig => {
    return {
      url: id ? `${resource}/${id}` : resource,
      method: POST,
      data: data,
    };
  },
  delete: (resource: string, id?: number | string): AxiosRequestConfig => {
    return {
      url: id ? `${resource}/${id}` : resource,
      method: DELETE,
    };
  },
};
