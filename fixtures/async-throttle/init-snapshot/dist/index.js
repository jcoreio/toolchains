"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
class CanceledError extends Error {
  constructor() {
    super('throttled invocation was canceled');
    this.name = 'CanceledError';
  }
}
class Delay {
  canceled = false;
  constructor(lastInvocationDone, wait) {
    const delay = new Promise(resolve => {
      this.timeout = setTimeout(resolve, wait);
      this.resolve = resolve;
    });
    this.ready = lastInvocationDone.then(() => delay, () => delay);
  }
  flush() {
    clearTimeout(this.timeout);
    this.resolve();
  }
  cancel() {
    this.canceled = true;
    clearTimeout(this.timeout);
    this.resolve();
  }
  then(handler) {
    return this.ready.then(() => {
      if (this.canceled) throw new CanceledError();
      return handler();
    });
  }
}
function throttle(fn, _wait, options = {}) {
  const wait = _wait != null && Number.isFinite(_wait) ? Math.max(_wait, 0) : 0;
  const getNextArgs = options.getNextArgs || ((prev, next) => next);
  let nextArgs;
  let lastInvocationDone = Promise.resolve();
  let delay = new Delay(lastInvocationDone, 0);
  let nextInvocation = null;
  function invoke() {
    const args = nextArgs;
    // istanbul ignore next
    if (!args) throw new Error('unexpected error: nextArgs is null');
    nextInvocation = null;
    nextArgs = null;
    const result = (async () => await fn(...args))();
    lastInvocationDone = result.catch(() => {});
    delay = new Delay(lastInvocationDone, wait);
    return result;
  }
  function wrapper(...args) {
    nextArgs = nextArgs ? getNextArgs(nextArgs, args) : args;
    if (!nextArgs) throw new Error('unexpected error: nextArgs is null');
    if (!nextInvocation) nextInvocation = delay.then(invoke);
    return nextInvocation;
  }
  wrapper.cancel = async () => {
    const prevLastInvocationDone = lastInvocationDone;
    delay.cancel();
    nextInvocation = null;
    nextArgs = null;
    lastInvocationDone = Promise.resolve();
    delay = new Delay(lastInvocationDone, 0);
    await prevLastInvocationDone;
  };
  wrapper.flush = async () => {
    delay.flush();
    await lastInvocationDone;
  };
  return wrapper;
}
;
throttle.CanceledError = CanceledError;
var _default = exports.default = throttle;
module.exports = exports.default;
//# sourceMappingURL=index.js.map