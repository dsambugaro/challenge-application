import mongoose from 'mongoose';

import { setupTest } from '../../utils/test-setup';
import UnitRepository from '../../repositories/unitRepository';
import UnitService from '../unitService';
import CompanyRepository from '../../repositories/companyRepository';

const companyData = {
  name: 'Teste Company',
  description: 'Company for testing',
  cnpj: '00155513000171',
  active: true,
};

const unitData = {
  name: 'Teste Unit',
  company: 1,
};

describe('test Unit Service layer', () => {
  setupTest(true);

  it('create Unit successfully', async () => {
    const unit = await UnitService.create(new UnitRepository(unitData));

    expect(unit._id).toBeDefined();
    expect(unit.name).toBe(unitData.name);
    expect(unit.company).toBe(unitData.company);
  });

  it('create Unit without required field should fail', async () => {
    try {
      const invalidUnit = { ...unitData, company: undefined };
      await UnitService.create(new UnitRepository(invalidUnit));
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    }
  });

  it('get & paginate Unit successfully', async () => {
    const companyArray = [];
    for (let i = 0; i < 4; i++) {
      companyArray.push(
        await CompanyRepository.create(
          new CompanyRepository({
            ...companyData,
            cnpj: `3764004100015${i}`,
            _id: (i + 1) * 5,
          }),
        ),
      );
    }

    const unitArray = [];
    for (let index = 0; index < companyArray.length; index++) {
      const company = companyArray[index];
      unitArray.push(
        await UnitService.create(
          new UnitRepository({ ...unitData, company: company._id }),
        ),
      );
    }

    const unit = unitArray[0];
    let result;

    result = await UnitService.getById(unit._id);
    expect(result).toBeDefined();
    expect(result?.name).toBe(unit.name);
    expect(result?.company).toBe(unit.company);

    result = await UnitService.getById(-42);
    expect(result).toBeNull();

    result = await UnitService.get(0, 1, { name: 'some name' });
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(0);

    result = await UnitService.get(0, 1, { company: unit.company });
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(1);

    result = await UnitService.get(0, 1, { _id: -42 });
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(0);

    result = await UnitService.get(0, 4);
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(4);

    for (let index = 0; index < unitArray.length; index++) {
      const u = unitArray[index];
      expect(result.content).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: u._id })]),
      );
    }

    result = await UnitService.get(0, 2);
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(2);
    for (let index = 0; index < unitArray.length / 2; index++) {
      const u = unitArray[index];
      expect(result.content).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: u._id })]),
      );
    }

    result = await UnitService.get(1, 2);
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(2);
    for (let index = 2; index < unitArray.length; index++) {
      const u = unitArray[index];
      expect(result.content).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: u._id })]),
      );
    }
  });

  it('update Unit successfully', async () => {
    const unit = await UnitService.create(new UnitRepository(unitData));
    const modifiedName = 'modified name';
    const modifiedUnit = await UnitService.update(
      { _id: unit._id },
      { name: modifiedName },
      { new: true },
    );

    expect(modifiedUnit).toBeDefined();
    expect(modifiedUnit?.name).toBe(modifiedName);
  });

  it('remove Unit successfully', async () => {
    const unit = await UnitService.create(new UnitRepository(unitData));

    const removedUnit = await UnitService.remove(unit._id);
    expect(removedUnit).toBeDefined();
    expect(removedUnit?._id).toBe(unit._id);

    const result = await UnitService.getById(unit._id);
    expect(result).toBeNull();
  });
});
