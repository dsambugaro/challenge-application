import mongoose from 'mongoose';

import { Role } from '../../models/userModel';
import { setupTest } from '../../utils/test-setup';
import UserRepository from '../userRepository';

const userData = {
  name: 'Teste User',
  email: 'user@teste.com.br',
  role: Role.ADMIN,
  username: 'teste-user',
  password: '$2y$10$eI//zb5.M5N1MOAylazh2eea.e3LoiNY1S8ypIg7Se/hWPvpL5q.y',
  company: 1,
};

describe('test User Repository layer', () => {
  setupTest(true);

  it('create User successfully', async () => {
    const user = await UserRepository.create(new UserRepository(userData));

    expect(user._id).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.role).toBe(userData.role);
    expect(user.username).toBe(userData.username);
    expect(user.password).toBe(userData.password);
    expect(user.company).toBe(userData.company);
  });

  it('create User without required field should fail', async () => {
    try {
      const invalidUser = { ...userData, company: undefined };
      await UserRepository.create(new UserRepository(invalidUser));
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    }
  });

  it('find User successfully', async () => {
    const user = await UserRepository.create(new UserRepository(userData));

    let result;

    result = await UserRepository.findById(user._id);
    expect(result).toBeDefined();
    expect(result?.name).toBe(user.name);
    expect(result?.email).toBe(user.email);
    expect(result?.role).toBe(user.role);
    expect(result?.username).toBe(user.username);
    expect(result?.password).toBe(user.password);
    expect(result?.company).toBe(user.company);

    result = await UserRepository.findById(-42);
    expect(result).toBeNull();

    result = await UserRepository.find({ name: 'some name' });
    expect(result).toBeDefined();
    expect(result).toHaveLength(0);

    result = await UserRepository.find({ company: user.company });
    expect(result).toBeDefined();
    expect(result).toHaveLength(1);

    result = await UserRepository.find({ _id: -42 });
    expect(result).toBeDefined();
    expect(result).toHaveLength(0);
  });

  it('find User by id with wrong type should fail', async () => {
    try {
      await UserRepository.findById('some wrong type id');
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.CastError);
    }
  });

  it('update User successfully', async () => {
    const user = await UserRepository.create(new UserRepository(userData));
    const modifiedName = 'modified name';
    const modifiedUser = await UserRepository.findOneAndUpdate(
      { _id: user._id },
      { name: modifiedName },
      { new: true },
    );

    expect(modifiedUser).toBeDefined();
    expect(modifiedUser?.name).toBe(modifiedName);
  });

  it('remove User successfully', async () => {
    const user = await UserRepository.create(new UserRepository(userData));

    const removedUser = await UserRepository.findByIdAndDelete(user._id);
    expect(removedUser).toBeDefined();
    expect(removedUser?._id).toBe(user._id);

    const result = await UserRepository.findById(user._id);
    expect(result).toBeNull();
  });

  it('User toObject & toJSON works properly', async () => {
    const user = await UserRepository.create(new UserRepository(userData));
    const userAsObject = user.toObject();
    const userAsJson = JSON.parse(JSON.stringify(user));

    // Verify userAsObject
    expect(userAsObject._id).toBeUndefined();
    expect(userAsObject.id).toBeDefined();
    expect(userAsObject.name).toBe(userData.name);
    expect(userAsObject.email).toBe(userData.email);
    expect(userAsObject.role).toBe(userData.role);
    expect(userAsObject.username).toBe(userData.username);
    expect(userAsObject.password).toBeUndefined();
    expect(userAsObject.company).toBe(userData.company);

    // Verify userAsJson
    expect(userAsJson._id).toBeUndefined();
    expect(userAsJson.id).toBeDefined();
    expect(userAsJson.name).toBe(userData.name);
    expect(userAsJson.email).toBe(userData.email);
    expect(userAsJson.role).toBe(userData.role);
    expect(userAsJson.username).toBe(userData.username);
    expect(userAsJson.password).toBeUndefined();
    expect(userAsJson.company).toBe(userData.company);
  });

  it('User password validade works properly', async () => {
    const user = await UserRepository.create(new UserRepository(userData));
    expect(user.passordIsValid('teste123')).toBeTruthy();
    expect(user.passordIsValid('some wrong password')).toBeFalsy();
  });
});
