export type Level = 1 | 2 | 3 | 4 | 5 | 6;
export interface Logger {
    trace(...args: Array<any>): void;
    debug(...args: Array<any>): void;
    info(...args: Array<any>): void;
    warn(...args: Array<any>): void;
    error(...args: Array<any>): void;
    fatal(...args: Array<any>): void;
    logAtLevel(level: Level, ...args: Array<any>): void;
    levelEnabled(level: Level): boolean;
    inputLogProvider: LogProvider;
}
export type LogProvider = (loggerPath: string, level: Level, ...args: Array<any>) => void;
export type LogFunctionProvider = (level: Level) => (...args: any[]) => any;
export declare const LOG_LEVEL_TRACE = 1;
export declare const LOG_LEVEL_DEBUG = 2;
export declare const LOG_LEVEL_INFO = 3;
export declare const LOG_LEVEL_WARN = 4;
export declare const LOG_LEVEL_ERROR = 5;
export declare const LOG_LEVEL_FATAL = 6;
export declare const logLevelToName: {
    1: 'TRACE';
    2: 'DEBUG';
    3: 'INFO';
    4: 'WARN';
    5: 'ERROR';
    6: 'FATAL';
};
export declare function resetLogLevels(): void;
export declare function setLogLevel(path: string, level: Level): void;
export declare const defaultLogFunctionProvider: LogFunctionProvider;
/**
 * Simple hook to override the logging function. For example, to always log to console.error,
 * call setLogFunctionProvider(() => console.error)
 * @param provider function that returns the log function based on the message's log level
 */
export declare function setLogFunctionProvider(provider: LogFunctionProvider): void;
export declare function createDefaultLogProvider(logFunc: (...args: any[]) => any): LogProvider;
export declare const defaultLogProvider: LogProvider;
/**
 * Hook to provide a complete replacement for the log provider.
 * @param provider
 */
export declare function setLogProvider(provider: LogProvider): void;
export type CreateLoggerOptions = {
    loggerPath: string;
    logProviders?: LogProvider[];
};
export declare function createLogger(options: CreateLoggerOptions): Logger;
export declare function logger(loggerPath?: string): Logger;
export default logger;
//# sourceMappingURL=index.d.mts.map