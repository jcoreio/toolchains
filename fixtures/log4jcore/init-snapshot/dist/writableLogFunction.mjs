import util from 'util';
export default function writableLogFunction(writable) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (format, ...args) => {
    writable.write(util.format(format, ...args) + '\n');
  };
}