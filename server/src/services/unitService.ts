import {
  FilterQuery,
  UpdateQuery,
  QueryFindOneAndUpdateOptions,
} from 'mongoose';

import UnitRepository from '../repositories/unitRepository';
import Unit from '../models/unitModel';

/**
 * Unit service layer
 */
class UnitService {
  /**
   * Get all units
   * @param page Page starting in 0
   * @param size Size of the page
   * @param query Unit query
   * @return units list
   */
  async get(page: number, size: number, query: FilterQuery<Unit> = {}) {
    const total = await UnitRepository.countDocuments(query);
    const data = await UnitRepository.find(query, { __v: 0 })
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
   * Get a unit by id
   * @param _id Unit id
   * @return Unit
   */
  getById(_id: number) {
    return UnitRepository.findById(_id, { __v: 0 });
  }

  /**
   * Create a unit
   * @param unit Unit to be created
   * @return Created unit
   */
  create(unit: Unit) {
    return UnitRepository.create(unit);
  }

  /**
   * Update a unit
   * @param query Unit query
   * @param update Unit fields to be updated
   * @param options Options for update
   * @returns Updates on unit
   */
  update(
    query: FilterQuery<Unit>,
    update: UpdateQuery<Unit>,
    options: QueryFindOneAndUpdateOptions = { new: true },
  ) {
    return UnitRepository.findOneAndUpdate(query, update, options);
  }

  /**
   * Remove a unit
   * @param _id Unit id
   * @returns Removed unit
   */
  remove(_id: number) {
    return UnitRepository.findOneAndDelete({ _id });
  }
}

export default new UnitService();
