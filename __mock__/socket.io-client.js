const io = () => {
  return {
    events: {},
    on: (eventName, cb) => {
      this.events[event] = cb;
    },
    trigger: (eventName, args) => {
      this.events[eventName].apply(null, args);
    },
    send: jest.fn(),
  };
};
