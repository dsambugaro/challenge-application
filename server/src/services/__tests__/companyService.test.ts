import mongoose from 'mongoose';

import { setupTest } from '../../utils/test-setup';
import CompanyRepository from '../../repositories/companyRepository';
import CompanyService from '../companyService';

const companyData = {
  name: 'Teste Company',
  description: 'Company for testing',
  cnpj: '00155513000171',
  active: true,
};

describe('test Company Service layer', () => {
  setupTest(true);

  it('create Company successfully', async () => {
    const company = await CompanyService.create(
      new CompanyRepository(companyData),
    );

    expect(company._id).toBeDefined();
    expect(company.name).toBe(companyData.name);
    expect(company.description).toBe(companyData.description);
    expect(company.cnpj).toBe(companyData.cnpj);
    expect(company.active).toBe(companyData.active);
  });

  it('create Company without required field should fail', async () => {
    try {
      const invalidCompany = { ...companyData, cnpj: undefined };
      await CompanyService.create(new CompanyRepository(invalidCompany));
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    }
  });

  it('get & paginate Company successfully', async () => {
    const companyArray = [];
    for (let i = 0; i < 4; i++) {
      companyArray.push(
        await CompanyService.create(
          new CompanyRepository({ ...companyData, cnpj: `3764004100015${i}` }),
        ),
      );
    }

    const company = companyArray[0];

    let result;

    result = await CompanyService.getById(company._id);
    expect(result).toBeDefined();
    expect(result?.name).toBe(company.name);
    expect(result?.description).toBe(company.description);
    expect(result?.cnpj).toBe(company.cnpj);
    expect(result?.active).toBe(company.active);

    result = await CompanyService.getById(-42);
    expect(result).toBeNull();

    result = await CompanyService.get(0, 1, { name: 'some name' });
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(0);

    result = await CompanyService.get(0, 1, { cnpj: company.cnpj });
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(1);

    result = await CompanyService.get(0, 1, { _id: -42 });
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(0);

    result = await CompanyService.get(0, 4);
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(4);

    for (let index = 0; index < companyArray.length; index++) {
      const c = companyArray[index];
      expect(result.content).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: c._id })]),
      );
    }

    result = await CompanyService.get(0, 2);
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(2);
    for (let index = 0; index < companyArray.length / 2; index++) {
      const c = companyArray[index];
      expect(result.content).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: c._id })]),
      );
    }

    result = await CompanyService.get(1, 2);
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(2);
    for (let index = 2; index < companyArray.length; index++) {
      const c = companyArray[index];
      expect(result.content).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: c._id })]),
      );
    }
  });

  it('update Company successfully', async () => {
    const company = await CompanyService.create(
      new CompanyRepository(companyData),
    );
    const modifiedName = 'modified name';
    const modifiedCompany = await CompanyService.update(
      { _id: company._id },
      { name: modifiedName },
      { new: true },
    );

    expect(modifiedCompany).toBeDefined();
    expect(modifiedCompany?.name).toBe(modifiedName);
  });

  it('remove Company successfully', async () => {
    const company = await CompanyService.create(
      new CompanyRepository(companyData),
    );

    const removedCompany = await CompanyService.remove(company._id);
    expect(removedCompany).toBeDefined();
    expect(removedCompany?._id).toBe(company._id);

    const result = await CompanyService.getById(company._id);
    expect(result).toBeNull();
  });
});
