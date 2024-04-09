const baseConfig = require('./jest-all.config');

module.exports = {
  ...baseConfig,
  coverageThreshold: {},
  testRegex: '.*\\.db-spec\\.ts$',
};
