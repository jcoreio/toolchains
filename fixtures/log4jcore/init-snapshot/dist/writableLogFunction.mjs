import util from 'util';
export default function writableLogFunction(writable) {
  return (format, ...args) => {
    writable.write(util.format(format, ...args) + '\n');
  };
}
//# sourceMappingURL=writableLogFunction.mjs.map