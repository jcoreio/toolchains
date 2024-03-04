export default function memoryLogProvider() {
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