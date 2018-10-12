const io = () => {
  const mockIO = {};
  mockIO.events = {};
  mockIO.on = (eventName, cb) => {
    mockIO.events[eventName] = cb;
  };
  mockIO.triggerNotification = (paramStr) => {
    mockIO.events['notification'](paramStr);
  };
  mockIO.send = jest.fn().mockName('io.send');
  return mockIO;
};

module.exports = io;
