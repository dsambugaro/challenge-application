import {
  setupTest,
  doServiceMock,
  mockRequest,
  mockResponse,
} from '../../utils/test-setup';
import UnitService from '../../services/unitService';
import UnitController from '../unitController';

const throwUnexpectedError = () => {
  throw new Error('Unexpected error');
};

const unitData = {
  name: 'Teste Unit',
  company: 1,
};

const res = mockResponse();

describe('test Unit Controller layer', () => {
  setupTest(true);

  it('create Unit should return status 200', async () => {
    const req = mockRequest({}, {}, { ...unitData });
    await UnitController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith('unit created');
  });

  it('create Unit without required field should return status 400', async () => {
    const req = mockRequest({}, {}, { ...unitData, name: undefined });
    await UnitController.create(req, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('get & paginate should return status 200', async () => {
    const req = mockRequest(
      { id: 1 },
      { page: 0, size: 10 },
      { name: { $regex: 'teste', $options: 'i' } },
    );
    await UnitController.get(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    await UnitController.getById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    await UnitController.filter(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.status).toBeCalledTimes(3);
    expect(res.json).toBeCalledTimes(3);
  });

  it('get with user filter company should return status 200', async () => {
    const req = mockRequest({ id: 1 }, {}, {}, { company: 1 });
    await UnitController.get(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    await UnitController.getById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.status).toBeCalledTimes(2);
    expect(res.json).toBeCalledTimes(2);
  });

  it('get with query filter company should return status 200', async () => {
    const req = mockRequest({}, { company: 1 }, {}, {});
    await UnitController.get(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.status).toBeCalledTimes(1);
    expect(res.json).toBeCalledTimes(1);
  });

  it('getById with user filter company should return status 200', async () => {
    const req = mockRequest({ id: 1 }, {}, {}, { company: 42 });

    await UnitController.getById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.status).toBeCalledTimes(1);
    expect(res.json).toBeCalledTimes(1);
  });

  it('get & paginate with wrong page/size type should return status 400', async () => {
    const req = mockRequest({}, { page: 'abc', size: -10 }, {});
    await UnitController.get(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    await UnitController.filter(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toBeCalled();
  });

  it('update Unit should return status 200', async () => {
    const req = mockRequest({ id: 1 }, {}, { ...unitData });
    await UnitController.update(req, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('remove Unit should return status 200', async () => {
    const req = mockRequest({ id: 1 }, {}, { ...unitData });
    await UnitController.remove(req, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('test Unit Controller layer unexpected errors', () => {
  setupTest(false);

  it('create with unexpected error should return 500', async () => {
    doServiceMock(UnitService, ['create'], throwUnexpectedError);
    const req = mockRequest({}, {}, { ...unitData });
    await UnitController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toBeCalled();
  });

  it('get & paginate with unexpected error should return 500', async () => {
    const req = mockRequest(
      { id: 1 },
      { page: 0, size: 10 },
      { name: { $regex: 'teste', $options: 'i' } },
    );

    doServiceMock(UnitService, ['get', 'getById'], throwUnexpectedError);
    await UnitController.get(req, res);
    expect(res.status).toHaveBeenCalledWith(500);

    await UnitController.getById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);

    await UnitController.filter(req, res);
    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.status).toBeCalledTimes(3);
    expect(res.json).toBeCalledTimes(3);
  });

  it('update Unit with unexpected error should return 500', async () => {
    const req = mockRequest({ id: 1 }, {}, { ...unitData });
    doServiceMock(UnitService, ['update'], throwUnexpectedError);
    await UnitController.update(req, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('remove Unit with unexpected error should return 500', async () => {
    const req = mockRequest({ id: 1 }, {}, { ...unitData });
    doServiceMock(UnitService, ['remove'], throwUnexpectedError);
    await UnitController.remove(req, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
