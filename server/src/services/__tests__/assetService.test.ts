import mongoose from 'mongoose';

import { setupTest, base64Image } from '../../utils/test-setup';
import { Role } from '../../models/userModel';
import { Status } from '../../models/assetModel';
import AssetRepository from '../../repositories/assetRepository';
import AssetService from '../assetService';
import CompanyRepository from '../../repositories/companyRepository';
import UnitRepository from '../../repositories/unitRepository';
import UserRepository from '../../repositories/userRepository';

const splited = base64Image.split(',');

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

const userData = {
  name: 'Teste User',
  email: 'user@teste.com.br',
  role: Role.ADMIN,
  username: 'teste-user',
  password: '$2y$10$eI//zb5.M5N1MOAylazh2eea.e3LoiNY1S8ypIg7Se/hWPvpL5q.y',
  company: 1,
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

describe('test Asset Service layer', () => {
  setupTest(true);

  it('create Asset successfully', async () => {
    const asset = await AssetService.create(new AssetRepository(assetData));

    expect(asset._id).toBeDefined();
    expect(asset.name).toBe(assetData.name);
    expect(asset.healthscore).toBe(assetData.healthscore);
    expect(asset.status).toBe(assetData.status);
    expect(asset.serialnumber).toBe(assetData.serialnumber);
    expect(asset.image).toBe(assetData.image);
    expect(asset.imageType).toBe(splited[0]);
    expect(asset.imageBuffer).toBe(splited[1]);
    expect(asset.description).toBe(assetData.description);
    expect(asset.user).toBe(assetData.user);
    expect(asset.unit).toBe(assetData.unit);
    expect(asset.company).toBe(assetData.company);
  });

  it('create Asset without required field should fail', async () => {
    try {
      const invalidAsset = { ...assetData, company: undefined };
      await AssetService.create(new AssetRepository(invalidAsset));
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    }
  });

  it('get & paginate Asset successfully', async () => {
    const companyArray = [];
    const unitArray = [];
    const userArray = [];
    for (let i = 0; i < 4; i++) {
      const id = (i + 2) * 5;
      companyArray.push(
        await CompanyRepository.create(
          new CompanyRepository({
            ...companyData,
            cnpj: `3764004100015${i * 5}`,
            _id: id,
          }),
        ),
      );
      unitArray.push(
        await UnitRepository.create(
          new UnitRepository({
            ...unitData,
            company: id,
            _id: id,
          }),
        ),
      );
      userArray.push(
        await UserRepository.create(
          new UserRepository({
            ...userData,
            company: id,
            username: `user${i}`,
            email: `user${i}@teste.com.br`,
            _id: id,
          }),
        ),
      );
    }

    const assetArray = [];
    for (let index = 0; index < companyArray.length; index++) {
      const company = companyArray[index];
      const unit = unitArray[index];
      const user = userArray[index];
      assetArray.push(
        await AssetService.create(
          new AssetRepository({
            ...assetData,
            serialnumber: `${assetData.serialnumber}${index}`,
            company: company._id,
            unit: unit._id,
            user: user._id,
          }),
        ),
      );
    }

    const asset = assetArray[0];
    let result;

    result = await AssetService.getById(asset._id);
    expect(result).toBeDefined();
    expect(result?.name).toBe(asset.name);
    expect(result?.company).toBe(asset.company);
    expect(result?.name).toBe(asset.name);
    expect(result?.healthscore).toBe(asset.healthscore);
    expect(result?.status).toBe(asset.status);
    expect(result?.serialnumber).toBe(asset.serialnumber);
    expect(result?.image).toBe(asset.image);
    expect(result?.imageType).toBe(splited[0]);
    expect(result?.imageBuffer).toBe(splited[1]);
    expect(result?.description).toBe(asset.description);
    expect(result?.user).toBe(asset.user);
    expect(result?.unit).toBe(asset.unit);
    expect(result?.company).toBe(asset.company);

    result = await AssetService.getById(-42);
    expect(result).toBeNull();

    result = await AssetService.get(0, 1, { name: 'some name' });
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(0);

    result = await AssetService.get(0, 1, { company: asset.company });
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(1);

    result = await AssetService.get(0, 1, { _id: -42 });
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(0);

    result = await AssetService.get(0, 4);
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(4);

    for (let index = 0; index < assetArray.length; index++) {
      const a = assetArray[index];
      expect(result.content).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: a._id })]),
      );
    }

    result = await AssetService.get(0, 2);
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(2);
    for (let index = 0; index < assetArray.length / 2; index++) {
      const a = assetArray[index];
      expect(result.content).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: a._id })]),
      );
    }

    result = await AssetService.get(1, 2);
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(2);
    for (let index = 2; index < assetArray.length; index++) {
      const a = assetArray[index];
      expect(result.content).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: a._id })]),
      );
    }
  });

  it('update Asset successfully', async () => {
    const asset = await AssetService.create(new AssetRepository(assetData));
    const modifiedName = 'modified name';
    const modifiedAsset = await AssetService.update(
      { _id: asset._id },
      { name: modifiedName },
      { new: true },
    );

    expect(modifiedAsset).toBeDefined();
    expect(modifiedAsset?.name).toBe(modifiedName);
  });

  it('remove Asset successfully', async () => {
    const asset = await AssetService.create(new AssetRepository(assetData));

    const removedAsset = await AssetService.remove(asset._id);
    expect(removedAsset).toBeDefined();
    expect(removedAsset?._id).toBe(asset._id);

    const result = await AssetService.getById(asset._id);
    expect(result).toBeNull();
  });
});
