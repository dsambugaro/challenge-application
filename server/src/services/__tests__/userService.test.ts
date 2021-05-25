import mongoose from 'mongoose';

import { setupTest } from '../../utils/test-setup';
import { Role } from '../../models/userModel';
import UserRepository from '../../repositories/userRepository';
import UserService from '../userService';
import CompanyRepository from '../../repositories/companyRepository';

const companyData = {
  name: 'Teste Company',
  description: 'Company for testing',
  cnpj: '00155513000171',
  active: true,
};

const userData = {
  name: 'Teste User',
  email: 'user@teste.com.br',
  role: Role.ADMIN,
  username: 'teste-user',
  password: '$2y$10$eI//zb5.M5N1MOAylazh2eea.e3LoiNY1S8ypIg7Se/hWPvpL5q.y',
  company: 1,
};

describe('test User Service layer', () => {
  setupTest(true);

  it('create User successfully', async () => {
    const user = await UserService.create(new UserRepository(userData));

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
      await UserService.create(new UserRepository(invalidUser));
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    }
  });

  it('get & paginate User successfully', async () => {
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

    const userArray = [];
    for (let index = 0; index < companyArray.length; index++) {
      const company = companyArray[index];
      userArray.push(
        await UserService.create(
          new UserRepository({
            ...userData,
            username: `user${index}`,
            email: `user${index}@teste.com.br`,
            company: company._id,
          }),
        ),
      );
    }

    const user = userArray[0];
    let result;

    result = await UserService.getById(user._id);
    expect(result).toBeDefined();
    expect(result?.name).toBe(user.name);
    expect(result?.email).toBe(user.email);
    expect(result?.role).toBe(user.role);
    expect(result?.username).toBe(user.username);
    expect(result?.password).toBeUndefined();
    expect(result?.company).toBe(user.company);

    result = await UserService.getById(-42);
    expect(result).toBeUndefined();

    result = await UserService.get(0, 1, { name: 'some name' });
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(0);

    result = await UserService.get(0, 1, { company: user.company });
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(1);

    result = await UserService.get(0, 1, { _id: -42 });
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(0);

    result = await UserService.get(0, 4);
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(4);

    for (let index = 0; index < userArray.length; index++) {
      const u = userArray[index];
      expect(result.content).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: u._id })]),
      );
    }

    result = await UserService.get(0, 2);
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(2);
    for (let index = 0; index < userArray.length / 2; index++) {
      const u = userArray[index];
      expect(result.content).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: u._id })]),
      );
    }

    result = await UserService.get(1, 2);
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(2);
    for (let index = 2; index < userArray.length; index++) {
      const u = userArray[index];
      expect(result.content).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: u._id })]),
      );
    }
  });

  it('update User successfully', async () => {
    const user = await UserService.create(
      new UserRepository({ ...userData, email: 'test@test.com' }),
    );
    const modifiedName = 'modified name';
    const modifiedUser = await UserService.update(
      { _id: user._id },
      { name: modifiedName },
      { new: true },
    );

    expect(modifiedUser).toBeDefined();
    expect(modifiedUser?.name).toBe(modifiedName);
  });

  it('remove User successfully', async () => {
    const user = await UserService.create(new UserRepository(userData));

    const removedUser = await UserService.remove(user._id);
    expect(removedUser).toBeDefined();
    expect(removedUser?._id).toBe(user._id);

    const result = await UserService.getById(user._id);
    expect(result).toBeUndefined();
  });

  it('User login works properly', async () => {
    const user = await UserRepository.create(new UserRepository(userData));
    let logedUser = await UserService.login(user.username, 'teste123');
    expect(logedUser?.username).toBe(userData.username);
    logedUser = await UserService.login(user.username, 'wrong password');
    expect(logedUser).toBeNull();
    try {
      await UserService.login('42', 'wrong password');
    } catch (error) {
      expect(error.message).toBe('User not found');
    }
  });
});
