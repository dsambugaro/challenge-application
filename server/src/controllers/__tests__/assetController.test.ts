import {
  setupTest,
  doServiceMock,
  mockRequest,
  mockResponse,
  base64Image,
} from '../../utils/test-setup';
import { Status } from '../../models/assetModel';
import AssetService from '../../services/assetService';
import AssetController from '../assetController';
import { Role } from '../../models/userModel';

const throwUnexpectedError = () => {
  throw new Error('Unexpected error');
};

const assetData = {
  name: 'Teste Asset',
  healthscore: 42,
  status: Status.IN_OPERATION,
  serialnumber: '3phMw9nm',
  image: base64Image,
  description: 'Asset for testing',
  user: 1,
  unit: 1,
  company: 1,
};

const res = mockResponse();

describe('test Asset Controller layer', () => {
  setupTest(true);

  it('create Asset should return status 200', async () => {
    const req = mockRequest({}, {}, { ...assetData });
    await AssetController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith('asset created');
  });

  it('create Asset without required field should return status 400', async () => {
    const req = mockRequest({}, {}, { ...assetData, company: undefined });
    await AssetController.create(req, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('get & paginate should return status 200', async () => {
    const req = mockRequest(
      { id: 1 },
      { page: 0, size: 10 },
      { name: { $regex: 'teste', $options: 'i' } },
    );
    await AssetController.get(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    await AssetController.getById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    await AssetController.filter(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.status).toBeCalledTimes(3);
    expect(res.json).toBeCalledTimes(3);
  });

  it('get filters should return status 200', async () => {
    const req = mockRequest(
      { id: 1 },
      { company: 1, unit: 1 },
      { name: { $regex: 'teste', $options: 'i' } },
      { role: Role.EMPLOYEE },
    );
    await AssetController.get(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.status).toBeCalledTimes(1);
    expect(res.json).toBeCalledTimes(1);
  });

  it('get & paginate with wrong page/size type should return status 400', async () => {
    const req = mockRequest({}, { page: 'abc', size: -10 }, {});
    await AssetController.get(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    await AssetController.filter(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toBeCalled();
  });

  it('update Asset should return status 200', async () => {
    const req = mockRequest({ id: 1 }, {}, { ...assetData });
    await AssetController.update(req, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('remove Asset should return status 200', async () => {
    const req = mockRequest({ id: 1 }, {}, { ...assetData });
    await AssetController.remove(req, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('test Asset Controller layer unexpected errors', () => {
  setupTest(false);

  it('create with unexpected error should return 500', async () => {
    doServiceMock(AssetService, ['create'], throwUnexpectedError);
    const req = mockRequest({}, {}, { ...assetData });
    await AssetController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toBeCalled();
  });

  it('get & paginate with unexpected error should return 500', async () => {
    const req = mockRequest(
      { id: 1 },
      { page: 0, size: 10 },
      { name: { $regex: 'teste', $options: 'i' } },
    );

    doServiceMock(AssetService, ['get', 'getById'], throwUnexpectedError);
    await AssetController.get(req, res);
    expect(res.status).toHaveBeenCalledWith(500);

    await AssetController.getById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);

    await AssetController.filter(req, res);
    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.status).toBeCalledTimes(3);
    expect(res.json).toBeCalledTimes(3);
  });

  it('update Asset with unexpected error should return 500', async () => {
    const req = mockRequest({ id: 1 }, {}, { ...assetData });
    doServiceMock(AssetService, ['update'], throwUnexpectedError);
    await AssetController.update(req, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('remove Asset with unexpected error should return 500', async () => {
    const req = mockRequest({ id: 1 }, {}, { ...assetData });
    doServiceMock(AssetService, ['remove'], throwUnexpectedError);
    await AssetController.remove(req, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
