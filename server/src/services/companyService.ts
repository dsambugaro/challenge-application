import {
  FilterQuery,
  UpdateQuery,
  QueryFindOneAndUpdateOptions,
} from 'mongoose';

import CompanyRepository from '../repositories/companyRepository';
import Company from '../models/companyModel';

/**
 * Company service layer
 */
class CompanyService {
  /**
   * Get all companies
   * @param page Page starting in 0
   * @param size Size of the page
   * @param query Company query
   * @return companies list
   */
  async get(page: number, size: number, query: FilterQuery<Company> = {}) {
    const total = await CompanyRepository.countDocuments(query);
    const data = await CompanyRepository.find(query, { __v: 0 })
      .limit(size)
      .skip(page * size);
    return {
      content: JSON.parse(JSON.stringify(data)),
      total: total,
      page: page,
      size: size,
    };
  }

  /**
   * Get a company by id
   * @param _id Company id
   * @return Company
   */
  getById(_id: number) {
    return CompanyRepository.findById(_id, { __v: 0 });
  }

  /**
   * Create a Company
   * @param company Company to be created
   * @return Created company
   */
  create(company: Company) {
    return CompanyRepository.create(company);
  }

  /**
   * Update a Company
   * @param query Company query
   * @param update Company fields to be updated
   * @param options Options for update
   * @returns Updates on company
   */
  update(
    query: FilterQuery<Company>,
    update: UpdateQuery<Company>,
    options: QueryFindOneAndUpdateOptions = { new: true },
  ) {
    return CompanyRepository.findOneAndUpdate(query, update, options);
  }

  /**
   * Remove a Company
   * @param _id Company id
   * @returns Removed company
   */
  remove(_id: number) {
    return CompanyRepository.findOneAndDelete({ _id });
  }
}

export default new CompanyService();
