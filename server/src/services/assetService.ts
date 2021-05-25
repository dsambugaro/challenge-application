import {
  FilterQuery,
  UpdateQuery,
  QueryFindOneAndUpdateOptions,
} from 'mongoose';

import AssetRepository from '../repositories/assetRepository';
import Asset from '../models/assetModel';

/**
 * Asset service layer
 */
class AssetService {
  /**
   * Get all assets
   * @param page Page starting in 0
   * @param size Size of the page
   * @param query Asset query
   * @return assets list
   */
  async get(page: number, size: number, query: FilterQuery<Asset> = {}) {
    const total = await AssetRepository.countDocuments(query);
    const data = await AssetRepository.find(query, { __v: 0 })
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
   * Get an asset by id
   * @param _id Asset id
   * @return Asset
   */
  getById(_id: number) {
    return AssetRepository.findById(_id, { __v: 0 });
  }

  /**
   * Create an asset
   * @param asset Asset to be created
   * @return Created asset
   */
  create(asset: Asset) {
    return AssetRepository.create(asset);
  }

  /**
   * Update an asset
   * @param query Asset query
   * @param update Asset fields to be updated
   * @param options Options for update
   * @returns Updates on asset
   */
  update(
    query: FilterQuery<Asset>,
    update: UpdateQuery<Asset>,
    options: QueryFindOneAndUpdateOptions = { new: true },
  ) {
    return AssetRepository.findOneAndUpdate(query, update, options);
  }

  /**
   * Remove an asset
   * @param _id Asset id
   * @returns Removed asset
   */
  remove(_id: number) {
    return AssetRepository.findOneAndDelete({ _id });
  }
}

export default new AssetService();
