import mongoose from 'mongoose';

import { setupTest } from '../../utils/test-setup';
import CompanyRepository from '../companyRepository';

const companyData = {
  name: 'Teste Company',
  description: 'Company for testing',
  cnpj: '00155513000171',
  active: true,
};

describe('test Company Repository layer', () => {
  setupTest(true);

  it('create Company successfully', async () => {
    const company = await CompanyRepository.create(
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
      await CompanyRepository.create(new CompanyRepository(invalidCompany));
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    }
  });

  it('find Company successfully', async () => {
    const company = await CompanyRepository.create(
      new CompanyRepository(companyData),
    );

    let result;

    result = await CompanyRepository.findById(company._id);
    expect(result).toBeDefined();
    expect(result?.name).toBe(company.name);
    expect(result?.description).toBe(company.description);
    expect(result?.cnpj).toBe(company.cnpj);
    expect(result?.active).toBe(company.active);

    result = await CompanyRepository.findById(-42);
    expect(result).toBeNull();

    result = await CompanyRepository.find({ name: 'some name' });
    expect(result).toBeDefined();
    expect(result).toHaveLength(0);

    result = await CompanyRepository.find({ cnpj: company.cnpj });
    expect(result).toBeDefined();
    expect(result).toHaveLength(1);

    result = await CompanyRepository.find({ _id: -42 });
    expect(result).toBeDefined();
    expect(result).toHaveLength(0);
  });

  it('find Company by id with wrong type should fail', async () => {
    try {
      await CompanyRepository.findById('some wrong type id');
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.CastError);
    }
  });

  it('update Company successfully', async () => {
    const company = await CompanyRepository.create(
      new CompanyRepository(companyData),
    );
    const modifiedName = 'modified name';
    const modifiedCompany = await CompanyRepository.findOneAndUpdate(
      { _id: company._id },
      { name: modifiedName },
      { new: true },
    );

    expect(modifiedCompany).toBeDefined();
    expect(modifiedCompany?.name).toBe(modifiedName);
  });

  it('remove Company successfully', async () => {
    const company = await CompanyRepository.create(
      new CompanyRepository(companyData),
    );

    const removedCompany = await CompanyRepository.findByIdAndDelete(
      company._id,
    );
    expect(removedCompany).toBeDefined();
    expect(removedCompany?._id).toBe(company._id);

    const result = await CompanyRepository.findById(company._id);
    expect(result).toBeNull();
  });

  it('Company toObject & toJSON works properly', async () => {
    const company = await CompanyRepository.create(
      new CompanyRepository(companyData),
    );
    const companyAsObject = company.toObject();
    const companyAsJson = JSON.parse(JSON.stringify(company));

    // Verify companyAsObject
    expect(companyAsObject._id).toBeUndefined();
    expect(companyAsObject.id).toBeDefined();
    expect(companyAsObject.name).toBe(companyData.name);
    expect(companyAsObject.description).toBe(companyData.description);
    expect(companyAsObject.cnpj).toBe(companyData.cnpj);
    expect(companyAsObject.active).toBe(companyData.active);

    // Verify companyAsJson
    expect(companyAsJson._id).toBeUndefined();
    expect(companyAsJson.id).toBeDefined();
    expect(companyAsJson.name).toBe(companyData.name);
    expect(companyAsJson.description).toBe(companyData.description);
    expect(companyAsJson.cnpj).toBe(companyData.cnpj);
    expect(companyAsJson.active).toBe(companyData.active);
  });
});
