import { FilterQuery } from 'mongoose';

import AssetRepository from '../repositories/assetRepository';
import Asset from '../models/assetModel';

/**
 * Asset service layer
 */
class ReportsService {
  /**
   * Get average healthscore
   * @param groupfield Asset fields to group results by
   * @param idProjection Projection to apply on id
   * @param query Asset query
   * @return reports
   */
  getAvgHealth(
    groupfield = {},
    idProjection = {},
    query: FilterQuery<Asset> = {},
  ) {
    return AssetRepository.aggregate([
      { $match: query },
      {
        $group: {
          _id: groupfield,
          averageHealth: { $avg: '$healthscore' },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          ...idProjection,
          total: '$total',
          averageHealth: { $round: ['$averageHealth', 2] },
        },
      },
    ]);
  }
}

export default new ReportsService();
