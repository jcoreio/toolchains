"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = memoryLogProvider;

function memoryLogProvider() {
  var messages = [];

  var result = function result(loggerPath, level) {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    messages.push({
      loggerPath: loggerPath,
      level: level,
      time: Date.now(),
      args: args
    });
  };

  result.messages = messages;
  return result;
}