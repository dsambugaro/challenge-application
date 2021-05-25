/**
 * Class for config params
 */
class Config {
  /**
   * Mongoose options
   */
  static mongooseOptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  };

  /**
   * Cors options
   */
  static corsOptions = {
    methods: 'OPTIONS,GET,POST,PUT,POST,DELETE',
    origin: '*',
  };
}

export default Config;
