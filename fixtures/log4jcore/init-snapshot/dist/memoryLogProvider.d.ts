import { Level, LogProvider } from "./index.js";
export type MemoryLogMessage = {
  loggerPath: string;
  level: Level;
  time: number;
  args: any[];
};
export interface MemoryLogProvider extends LogProvider {
  (loggerPath: string, level: Level, ...args: Array<any>): void;
  messages: MemoryLogMessage[];
}
declare function memoryLogProvider(): MemoryLogProvider;
export = memoryLogProvider;
//# sourceMappingURL=memoryLogProvider.d.ts.map