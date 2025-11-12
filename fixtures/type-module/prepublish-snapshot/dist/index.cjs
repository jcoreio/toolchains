"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _echo = require("./echo.cjs");
Object.keys(_echo).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _echo[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _echo[key];
    }
  });
});
//# sourceMappingURL=index.cjs.map