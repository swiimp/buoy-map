module.exports = {
  setupFiles: [
    './test/jestsetup.js',
  ],
  snapshotSerializers: [
    'enzyme-to-json/serializer',
  ],
  moduleNameMapper: {
    'canvas-overlay.js': '<rootDir>/test/empty_module.js',
    'socket.io-client': '<rootDir>/test/socket.io-client.js',
    'mapbox-gl.css': '<rootDir>/test/empty.css',
    'main.css': '<rootDir>/test/empty.css',
  },
  globals: {
      MapboxAccessToken: '',
  },
};
