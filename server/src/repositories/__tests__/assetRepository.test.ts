import mongoose from 'mongoose';

import { setupTest, base64Image } from '../../utils/test-setup';
import { Status } from '../../models/assetModel';
import AssetRepository from '../assetRepository';

const splited = base64Image.split(',');

const assetData = {
  name: 'Teste Asset',
  healthscore: 42,
  status: Status.IN_OPERATION,
  serialnumber: '3phMw9nmAewq',
  image: base64Image,
  description: 'Asset for testing',
  user: 1,
  unit: 1,
  company: 1,
};

describe('test Asset Repository layer', () => {
  setupTest(true);

  it('create Asset successfully', async () => {
    let asset = await AssetRepository.create(new AssetRepository(assetData));
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

    asset = await AssetRepository.create(
      new AssetRepository({
        ...assetData,
        image: undefined,
        serialnumber: '3phMw9nm',
      }),
    );
    expect(asset._id).toBeDefined();
    expect(asset.name).toBe(assetData.name);
    expect(asset.healthscore).toBe(assetData.healthscore);
    expect(asset.status).toBe(assetData.status);
    expect(asset.serialnumber).toBe('3phMw9nm');
    expect(asset.image).toBe('');
    expect(asset.imageType).toBeUndefined();
    expect(asset.imageBuffer).toBeUndefined();
    expect(asset.description).toBe(assetData.description);
    expect(asset.user).toBe(assetData.user);
    expect(asset.unit).toBe(assetData.unit);
    expect(asset.company).toBe(assetData.company);
  });

  it('create Asset with healthscore outside the 0-100 range should fail', async () => {
    try {
      const invalidAsset = { ...assetData, healthscore: -42 };
      await AssetRepository.create(new AssetRepository(invalidAsset));
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    }

    try {
      const invalidAsset = { ...assetData, healthscore: 142 };
      await AssetRepository.create(new AssetRepository(invalidAsset));
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    }
  });

  it('create Asset without required field should fail', async () => {
    try {
      const invalidAsset = { ...assetData, company: undefined };
      await AssetRepository.create(new AssetRepository(invalidAsset));
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    }
  });

  it('find Asset successfully', async () => {
    const asset = await AssetRepository.create(new AssetRepository(assetData));

    let result;

    result = await AssetRepository.findById(asset._id);
    expect(result).toBeDefined();
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

    result = await AssetRepository.findById(-42);
    expect(result).toBeNull();

    result = await AssetRepository.find({ name: 'some name' });
    expect(result).toBeDefined();
    expect(result).toHaveLength(0);

    result = await AssetRepository.find({ company: asset.company });
    expect(result).toBeDefined();
    expect(result).toHaveLength(1);

    result = await AssetRepository.find({ _id: -42 });
    expect(result).toBeDefined();
    expect(result).toHaveLength(0);
  });

  it('find Asset by id with wrong type should fail', async () => {
    try {
      await AssetRepository.findById('some wrong type id');
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.CastError);
    }
  });

  it('update Asset successfully', async () => {
    const asset = await AssetRepository.create(new AssetRepository(assetData));
    const modifiedName = 'modified name';
    const modifiedAsset = await AssetRepository.findOneAndUpdate(
      { _id: asset._id },
      { name: modifiedName },
      { new: true },
    );

    expect(modifiedAsset).toBeDefined();
    expect(modifiedAsset?.name).toBe(modifiedName);
  });

  it('remove Asset successfully', async () => {
    const asset = await AssetRepository.create(new AssetRepository(assetData));

    const removedAsset = await AssetRepository.findByIdAndDelete(asset._id);
    expect(removedAsset).toBeDefined();
    expect(removedAsset?._id).toBe(asset._id);

    const result = await AssetRepository.findById(asset._id);
    expect(result).toBeNull();
  });

  it('Asset toObject & toJSON works properly', async () => {
    const asset = await AssetRepository.create(new AssetRepository(assetData));
    const assetAsObject = asset.toObject();
    const assetAsJson = JSON.parse(JSON.stringify(asset));

    // Verify assetAsObject
    expect(assetAsObject._id).toBeUndefined();
    expect(assetAsObject.id).toBeDefined();
    expect(assetAsObject.name).toBe(assetData.name);
    expect(assetAsObject.healthscore).toBe(assetData.healthscore);
    expect(assetAsObject.status).toBe(assetData.status);
    expect(assetAsObject.serialnumber).toBe(assetData.serialnumber);
    expect(assetAsObject.image).toBe(assetData.image);
    expect(assetAsObject.description).toBe(assetData.description);
    expect(assetAsObject.user).toBe(assetData.user);
    expect(assetAsObject.unit).toBe(assetData.unit);
    expect(assetAsObject.company).toBe(assetData.company);

    // Verify assetAsJson
    expect(assetAsJson._id).toBeUndefined();
    expect(assetAsJson.id).toBeDefined();
    expect(assetAsJson.name).toBe(assetData.name);
    expect(assetAsJson.healthscore).toBe(assetData.healthscore);
    expect(assetAsJson.status).toBe(assetData.status);
    expect(assetAsJson.serialnumber).toBe(assetData.serialnumber);
    expect(assetAsJson.image).toBe(assetData.image);
    expect(assetAsJson.description).toBe(assetData.description);
    expect(assetAsJson.user).toBe(assetData.user);
    expect(assetAsJson.unit).toBe(assetData.unit);
    expect(assetAsJson.company).toBe(assetData.company);
  });
});
