import {
  setupTest,
  doServiceMock,
  mockRequest,
  mockResponse,
} from '../../utils/test-setup';
import ReportsService from '../../services/reportsService';
import ReportsController from '../reportsController';

import { Role } from '../../models/userModel';

const throwUnexpectedError = () => {
  throw new Error('Unexpected error');
};

const res = mockResponse();

describe('test Reports Controller layer', () => {
  setupTest(true);

  it('get with user filter company should return status 200', async () => {
    const req = mockRequest(
      {},
      { groupField: 'status' },
      {},
      { id: 1, company: 1, role: Role.EMPLOYEE },
    );
    await ReportsController.getAvgHealth(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.status).toBeCalledTimes(1);
    expect(res.json).toBeCalledTimes(1);
  });

  it('get with query filter company should return status 200', async () => {
    const req = mockRequest({}, { company: 1, unit: 1, user: 1 }, {}, {});
    await ReportsController.getAvgHealth(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.status).toBeCalledTimes(1);
    expect(res.json).toBeCalledTimes(1);
  });
});

describe('test Reports Controller layer unexpected errors', () => {
  setupTest(false);

  it('create with unexpected error should return 500', async () => {
    doServiceMock(ReportsService, ['getAvgHealth'], throwUnexpectedError);
    const req = mockRequest({}, {}, {}, {});
    await ReportsController.getAvgHealth(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toBeCalled();
  });
});
