module.exports = {
  setupFiles: [
    './test/jestsetup.js',
  ],
  snapshotSerializers: [
    'enzyme-to-json/serializer',
  ],
  moduleNameMapper: {
    'canvas-overlay.js': '<rootDir>/__mocks__/canvas-overlay.js',
  },
};
