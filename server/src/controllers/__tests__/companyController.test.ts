import {
  setupTest,
  doServiceMock,
  mockRequest,
  mockResponse,
} from '../../utils/test-setup';
import CompanyService from '../../services/companyService';
import CompanyController from '../companyController';

const throwUnexpectedError = () => {
  throw new Error('Unexpected error');
};

const companyData = {
  name: 'Teste Company',
  description: 'Company for testing',
  cnpj: '00155513000171',
  active: true,
};

const res = mockResponse();

describe('test Company Controller layer', () => {
  setupTest(true);

  it('create Company should return status 200', async () => {
    const req = mockRequest({}, {}, { ...companyData });
    await CompanyController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith('company created');
  });

  it('create Company without required field should return status 400', async () => {
    const req = mockRequest({}, {}, { ...companyData, cnpj: undefined });
    await CompanyController.create(req, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('get & paginate should return status 200', async () => {
    const req = mockRequest(
      { id: 1 },
      { page: 0, size: 10 },
      { name: { $regex: 'teste', $options: 'i' } },
    );
    await CompanyController.get(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    await CompanyController.getById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    await CompanyController.filter(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.status).toBeCalledTimes(3);
    expect(res.json).toBeCalledTimes(3);
  });

  it('get with user filter company should return status 200', async () => {
    const req = mockRequest({}, {}, {}, { company: 1 });
    await CompanyController.get(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.status).toBeCalledTimes(1);
    expect(res.json).toBeCalledTimes(1);
  });

  it('get with query filter company should return status 200', async () => {
    const req = mockRequest({}, { company: 1 }, {}, {});
    await CompanyController.get(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.status).toBeCalledTimes(1);
    expect(res.json).toBeCalledTimes(1);
  });

  it('get & paginate with wrong page/size type should return status 400', async () => {
    const req = mockRequest({}, { page: 'abc', size: -10 }, {});
    await CompanyController.get(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    await CompanyController.filter(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toBeCalled();
  });

  it('update Company should return status 200', async () => {
    const req = mockRequest({ id: 1 }, {}, { ...companyData });
    await CompanyController.update(req, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('remove Company should return status 200', async () => {
    const req = mockRequest({ id: 1 }, {}, { ...companyData });
    await CompanyController.remove(req, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('test Company Controller layer unexpected errors', () => {
  setupTest(false);

  it('create with unexpected error should return 500', async () => {
    doServiceMock(CompanyService, ['create'], throwUnexpectedError);
    const req = mockRequest({}, {}, { ...companyData });
    await CompanyController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toBeCalled();
  });

  it('get & paginate with unexpected error should return 500', async () => {
    const req = mockRequest(
      { id: 1 },
      { page: 0, size: 10 },
      { name: { $regex: 'teste', $options: 'i' } },
    );

    doServiceMock(CompanyService, ['get', 'getById'], throwUnexpectedError);
    await CompanyController.get(req, res);
    expect(res.status).toHaveBeenCalledWith(500);

    await CompanyController.getById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);

    await CompanyController.filter(req, res);
    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.status).toBeCalledTimes(3);
    expect(res.json).toBeCalledTimes(3);
  });

  it('update Company with unexpected error should return 500', async () => {
    const req = mockRequest({ id: 1 }, {}, { ...companyData });
    doServiceMock(CompanyService, ['update'], throwUnexpectedError);
    await CompanyController.update(req, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('remove Company with unexpected error should return 500', async () => {
    const req = mockRequest({ id: 1 }, {}, { ...companyData });
    doServiceMock(CompanyService, ['remove'], throwUnexpectedError);
    await CompanyController.remove(req, res);

    expect(res.json).toBeCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
