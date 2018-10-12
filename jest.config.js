module.exports = {
  setupFiles: [
    './test/jestsetup.js',
  ],
  snapshotSerializers: [
    'enzyme-to-json/serializer',
  ],
  moduleNameMapper: {
    'canvas-overlay.js': '<rootDir>/test/empty_module.js',
    'mapbox-gl.css': '<rootDir>/test/empty.css',
  },
  globals: {
      MapboxAccessToken: '',
  },
};
