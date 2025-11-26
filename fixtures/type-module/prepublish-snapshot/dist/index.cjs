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
var _dirname = require("./dirname.cjs");
Object.keys(_dirname).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _dirname[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _dirname[key];
    }
  });
});
//# sourceMappingURL=index.cjs.map