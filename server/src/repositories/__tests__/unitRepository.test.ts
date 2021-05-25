import mongoose from 'mongoose';

import { setupTest } from '../../utils/test-setup';
import UnitRepository from '../unitRepository';

const unitData = {
  name: 'Teste Unit',
  company: 1,
};

describe('test Unit Repository layer', () => {
  setupTest(true);

  it('create Unit successfully', async () => {
    const unit = await UnitRepository.create(new UnitRepository(unitData));

    expect(unit._id).toBeDefined();
    expect(unit.name).toBe(unitData.name);
    expect(unit.company).toBe(unitData.company);
  });

  it('create Unit without required field should fail', async () => {
    try {
      const invalidUnit = { ...unitData, company: undefined };
      await UnitRepository.create(new UnitRepository(invalidUnit));
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    }
  });

  it('find Unit successfully', async () => {
    const unit = await UnitRepository.create(new UnitRepository(unitData));

    let result;

    result = await UnitRepository.findById(unit._id);
    expect(result).toBeDefined();
    expect(result?.name).toBe(unit.name);
    expect(result?.company).toBe(unit.company);

    result = await UnitRepository.findById(-42);
    expect(result).toBeNull();

    result = await UnitRepository.find({ name: 'some name' });
    expect(result).toBeDefined();
    expect(result).toHaveLength(0);

    result = await UnitRepository.find({ company: unit.company });
    expect(result).toBeDefined();
    expect(result).toHaveLength(1);

    result = await UnitRepository.find({ _id: -42 });
    expect(result).toBeDefined();
    expect(result).toHaveLength(0);
  });

  it('find Unit by id with wrong type should fail', async () => {
    try {
      await UnitRepository.findById('some wrong type id');
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.CastError);
    }
  });

  it('update Unit successfully', async () => {
    const unit = await UnitRepository.create(new UnitRepository(unitData));
    const modifiedName = 'modified name';
    const modifiedUnit = await UnitRepository.findOneAndUpdate(
      { _id: unit._id },
      { name: modifiedName },
      { new: true },
    );

    expect(modifiedUnit).toBeDefined();
    expect(modifiedUnit?.name).toBe(modifiedName);
  });

  it('remove Unit successfully', async () => {
    const unit = await UnitRepository.create(new UnitRepository(unitData));

    const removedUnit = await UnitRepository.findByIdAndDelete(unit._id);
    expect(removedUnit).toBeDefined();
    expect(removedUnit?._id).toBe(unit._id);

    const result = await UnitRepository.findById(unit._id);
    expect(result).toBeNull();
  });

  it('Unit toObject & toJSON works properly', async () => {
    const unit = await UnitRepository.create(new UnitRepository(unitData));
    const unitAsObject = unit.toObject();
    const unitAsJson = JSON.parse(JSON.stringify(unit));

    // Verify unitAsObject
    expect(unitAsObject._id).toBeUndefined();
    expect(unitAsObject.id).toBeDefined();
    expect(unitAsObject.name).toBe(unitData.name);
    expect(unitAsObject.company).toBe(unitData.company);

    // Verify unitAsJson
    expect(unitAsJson._id).toBeUndefined();
    expect(unitAsJson.id).toBeDefined();
    expect(unitAsJson.name).toBe(unitData.name);
    expect(unitAsJson.company).toBe(unitData.company);
  });
});
