import { AnyAction } from 'redux';
import { ThunkDispatch as Dispatch } from 'redux-thunk';

import { User } from '../commons';
import { setStore, getStore, removeItem } from '../utils';

interface UserAction {
  type: string;
  payload?: User;
}

const constants = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
};

const initialState: User = {
  name: null,
  username: null,
  email: null,
  role: null,
  token: null,
  company: null,
};

export const login = (user: User): UserAction => {
  setStore('user', user);
  return {
    type: constants.LOGIN,
    payload: user,
  };
};

export const logout = (): UserAction => {
  removeItem('user');
  return { type: constants.LOGOUT };
};

export const checkAuthentication = () => {
  return (dispatch: Dispatch<UserAction, void, AnyAction>): void => {
    const user = getStore('user') as User;
    user ? dispatch(login(user)) : dispatch(logout());
  };
};

export default (
  state: User = {
    name: undefined,
    username: undefined,
    email: undefined,
    role: undefined,
    token: 'token',
    company: undefined,
  },
  action: UserAction,
): User => {
  switch (action.type) {
    case constants.LOGIN:
      return { ...action.payload };
    case constants.LOGOUT:
      return { ...initialState };
  }
  return state;
};
