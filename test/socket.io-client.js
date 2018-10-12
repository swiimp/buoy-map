const io = () => {
  const mockIO = {};
  mockIO.events = {};
  mockIO.on = (eventName, cb) => {
    this.events[event] = cb;
  };
  mockIO.trigger = (eventName, args) => {
    this.events[eventName].apply(null, args);
  };
  mockIO.send = jest.fn();
  return mockIO;
};

module.exports = io;
