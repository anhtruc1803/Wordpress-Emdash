export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export function createLogger(): Logger {
  return {
    info(message) {
      console.log(`[wp2emdash] ${message}`);
    },
    warn(message) {
      console.warn(`[wp2emdash] ${message}`);
    },
    error(message) {
      console.error(`[wp2emdash] ${message}`);
    }
  };
}
