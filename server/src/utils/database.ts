import mongoose from 'mongoose';
import Config from '../config';

/**
 * class for DataBase handle
 */
class DataBase {
  private DataBaseURL =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/challenge_db';

  /**
   * Create a DataBase connection
   * @return void
   */
  createConnection(): void {
    mongoose.connect(this.DataBaseURL, Config.mongooseOptions);
  }

  /**
   * Close a DataBase connection
   * @return void
   */
  closeConnection(): void {
    mongoose.disconnect();
  }
}

export default new DataBase();
