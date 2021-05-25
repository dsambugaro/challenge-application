import {
  setupTest,
  doServiceMock,
  mockRequest,
  mockResponse,
} from '../../utils/test-setup';

import { Role } from '../../models/userModel';
import UserRepository from '../../repositories/userRepository';
import UserService from '../../services/userService';
import UserController from '../userController';

const throwUnexpectedError = () => {
  throw new Error('Unexpected error');
};

const userData = {
  name: 'Teste User',
  email: 'user@teste.com.br',
  role: Role.ADMIN,
  username: 'teste-user',
  password: '$2y$10$eI//zb5.M5N1MOAylazh2eea.e3LoiNY1S8ypIg7Se/hWPvpL5q.y',
  company: 1,
};

const res = mockResponse();

describe('test User Controller layer', () => {
  setupTest(true);

  it('create User should return status 200', async () => {
    const req = mockRequest({}, {}, { ...userData });
    await UserController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith('user created');
  });

  it('create User without required field should return status 400', async () => {
    const req = mockRequest({}, {}, { ...userData, username: undefined });
    await UserController.create(req, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('get & paginate should return status 200', async () => {
    const req = mockRequest(
      { id: 1 },
      { page: 0, size: 10 },
      { name: { $regex: 'teste', $options: 'i' } },
    );
    await UserController.get(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    await UserController.getById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    await UserController.filter(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.status).toBeCalledTimes(3);
    expect(res.json).toBeCalledTimes(3);
  });

  it('get & paginate with wrong page/size type should return status 400', async () => {
    const req = mockRequest({}, { page: 'abc', size: -10 }, {});
    await UserController.get(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    await UserController.filter(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toBeCalled();
  });

  it('update User should return status 200', async () => {
    const req = mockRequest({ id: 1 }, {}, { ...userData });
    await UserController.update(req, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(200);

    const reqWithoutPassword = mockRequest(
      { id: 1 },
      {},
      { ...userData, password: undefined },
    );
    await UserController.update(reqWithoutPassword, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('remove User should return status 200', async () => {
    const req = mockRequest({ id: 1 }, {}, { ...userData });
    await UserController.remove(req, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('login User should return status 200', async () => {
    const req = mockRequest({}, {}, { ...userData, password: 'teste123' });
    const createdMock = jest.spyOn(UserService, 'login');
    createdMock.mockResolvedValue(new UserRepository(userData));
    process.env.SECRET_KEY = 'secret-key';
    await UserController.login(req, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('login User with wrong password should return status 401', async () => {
    const req = mockRequest(
      { id: 1 },
      {},
      { ...userData, password: 'wrong password' },
    );
    const createdMock = jest.spyOn(UserService, 'login');
    createdMock.mockResolvedValue(null);
    await UserController.login(req, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe('test User Controller layer unexpected errors', () => {
  setupTest(false);

  it('create with unexpected error should return 500', async () => {
    doServiceMock(UserService, ['create'], throwUnexpectedError);
    const req = mockRequest({}, {}, { ...userData });
    await UserController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toBeCalled();
  });

  it('get & paginate with unexpected error should return 500', async () => {
    const req = mockRequest(
      { id: 1 },
      { page: 0, size: 10 },
      { name: { $regex: 'teste', $options: 'i' } },
    );

    doServiceMock(UserService, ['get', 'getById'], throwUnexpectedError);
    await UserController.get(req, res);
    expect(res.status).toHaveBeenCalledWith(500);

    await UserController.getById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);

    await UserController.filter(req, res);
    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.status).toBeCalledTimes(3);
    expect(res.json).toBeCalledTimes(3);
  });

  it('update User with unexpected error should return 500', async () => {
    const req = mockRequest({ id: 1 }, {}, { ...userData });
    doServiceMock(UserService, ['update'], throwUnexpectedError);
    await UserController.update(req, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(500);

    const reqWithoutPassword = mockRequest(
      { id: 1 },
      {},
      { ...userData, password: undefined },
    );
    await UserController.update(reqWithoutPassword, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('remove User with unexpected error should return 500', async () => {
    const req = mockRequest({ id: 1 }, {}, { ...userData });
    doServiceMock(UserService, ['remove'], throwUnexpectedError);
    await UserController.remove(req, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('login User with unexpected error should return 500', async () => {
    const req = mockRequest({}, {}, { ...userData, password: 'teste123' });
    doServiceMock(UserService, ['login'], throwUnexpectedError);
    await UserController.login(req, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
