// Minimalist Node.js shims for browser environment
export const stream = {
  Readable: class {},
  Writable: class {},
  Transform: class {},
  PassThrough: class {},
  pipeline: () => {},
  finished: () => {},
};

export const buffer = {
  Buffer: typeof Buffer !== 'undefined' ? Buffer : class {
    static isBuffer() { return false; }
    static from() { return new Uint8Array(); }
  },
};

export const fs = {
  readFileSync: () => '',
  writeFileSync: () => {},
  createWriteStream: () => ({ 
    on: () => {}, 
    once: () => {}, 
    emit: () => {},
    write: () => {},
    end: () => {}
  }),
  promises: {}
};

export const path = {
  join: (...args) => args.join('/'),
  resolve: (...args) => args.join('/'),
  dirname: () => '',
};

export const os = {
  tmpdir: () => '/tmp',
  platform: () => 'browser',
};

export const util = {
  promisify: (fn) => fn,
  inherits: () => {},
};

export const events = {
  EventEmitter: class {
    on() {}
    emit() {}
    once() {}
    removeListener() {}
  },
};

export const crypto = {
  createHash: () => ({ update: () => ({ digest: () => '' }) }),
};

export const zlib = {
  createGzip: () => ({}),
  createDeflate: () => ({}),
};

export default {
  stream, buffer, fs, path, os, util, events, crypto, zlib
};
