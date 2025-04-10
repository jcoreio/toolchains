"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.CanceledError = void 0;
class CanceledError extends Error {
  constructor() {
    super('throttled invocation was canceled');
    this.name = 'CanceledError';
  }
}
exports.CanceledError = CanceledError;
class Delay {
  canceled = false;
  constructor(lastInvocationDone, wait) {
    const delay = new Promise(resolve => {
      this.timeout = setTimeout(resolve, wait);
      this.resolve = resolve;
    });
    this.ready = lastInvocationDone.then(() => delay, () => delay).then(() => {
      this.ready = null;
    });
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
    return (this.ready || Promise.resolve()).then(() => {
      if (this.canceled) throw new CanceledError();
      return handler();
    });
  }
}
function throttle(fn, _wait, options = {
  ...null
}) {
  const wait = _wait != null && Number.isFinite(_wait) ? Math.max(_wait, 0) : 0;
  const getNextArgs = options.getNextArgs || ((prev, next) => next);
  let nextArgs;
  let lastInvocationDone = null;
  let delay = null;
  let nextInvocation = null;
  function invoke() {
    const args = nextArgs;
    // istanbul ignore next
    if (!args) {
      return Promise.reject(new Error('unexpected error: nextArgs is null'));
    }
    nextInvocation = null;
    nextArgs = null;
    const result = Promise.resolve(fn(...args));
    lastInvocationDone = result.catch(() => {}).then(() => {
      lastInvocationDone = null;
    });
    delay = new Delay(lastInvocationDone, wait);
    return result;
  }
  function setNextArgs(args) {
    nextArgs = nextArgs ? getNextArgs(nextArgs, args) : args;
    if (!nextArgs) throw new Error('unexpected error: nextArgs is null');
  }
  function doInvoke() {
    return nextInvocation = (delay || Promise.resolve()).then(invoke);
  }
  function wrapper(...args) {
    try {
      setNextArgs(args);
    } catch (error) {
      return Promise.reject(error);
    }
    return nextInvocation || doInvoke();
  }

  /**
   * Calls the throttled function soon, but doesn't return a promise, catches
   * any CanceledError, and doesn't create any new promises if a call is already
   * pending.
   *
   * The throttled function should handle all errors internally,
   * e.g.:
   *
   * asyncThrottle(async () => {
   *   try {
   *     await foo()
   *   } catch (err) {
   *     // handle error
   *   }
   * })
   *
   * If the throttled function throws an error or returns a promise that is
   * eventually rejected, the runtime's unhandled promise rejection handler will
   * be called, which may crash the process, route the rejection to a handler
   * that has been previously registered, or ignore the rejection, depending
   * on the runtime and your code.
   */
  wrapper.invokeIgnoreResult = (...args) => {
    setNextArgs(args);
    if (!nextInvocation) {
      doInvoke().catch(err => {
        if (!(err instanceof CanceledError)) {
          // trigger the unhandled promise rejection handler
          throw err;
        }
      });
    }
  };
  wrapper.cancel = async () => {
    var _delay, _delay$cancel;
    const prevLastInvocationDone = lastInvocationDone;
    (_delay = delay) === null || _delay === void 0 || (_delay$cancel = _delay.cancel) === null || _delay$cancel === void 0 || _delay$cancel.call(_delay);
    nextInvocation = null;
    nextArgs = null;
    lastInvocationDone = null;
    delay = null;
    await prevLastInvocationDone;
  };
  wrapper.flush = async () => {
    var _delay2, _delay2$flush;
    (_delay2 = delay) === null || _delay2 === void 0 || (_delay2$flush = _delay2.flush) === null || _delay2$flush === void 0 || _delay2$flush.call(_delay2);
    await lastInvocationDone;
  };
  return wrapper;
}
const defaultExport = Object.assign(throttle, {
  CanceledError
});
var _default = exports.default = defaultExport;
//# sourceMappingURL=index.js.map