// Test setup file for Jest

// Mock setTimeout for applyDelay tests
global.setTimeout = jest.fn((callback, delay) => {
  // Store the callback and delay for testing
  const timeoutId = setTimeout.mock.results.length;
  setTimeout.mock.timeouts = setTimeout.mock.timeouts || {};
  setTimeout.mock.timeouts[timeoutId] = { callback, delay };
  
  // Return a mock ID
  return timeoutId;
});

// Mock setInterval for setupHotReload tests
global.setInterval = jest.fn((callback, delay) => {
  const intervalId = setInterval.mock.results.length;
  setInterval.mock.intervals = setInterval.mock.intervals || {};
  setInterval.mock.intervals[intervalId] = { callback, delay };
  return intervalId;
});

// Mock clearInterval
global.clearInterval = jest.fn();

// Mock clearTimeout
global.clearTimeout = jest.fn();

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Mock process methods
global.process = {
  ...process,
  exit: jest.fn(),
  on: jest.fn(),
};
