"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = memoryLogProvider;
function memoryLogProvider() {
  const messages = [];
  const result = (loggerPath, level, ...args) => {
    messages.push({
      loggerPath,
      level,
      time: Date.now(),
      args
    });
  };
  result.messages = messages;
  return result;
}
module.exports = exports.default;
//# sourceMappingURL=memoryLogProvider.js.map