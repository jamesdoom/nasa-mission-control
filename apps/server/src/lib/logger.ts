type LogLevel = "info" | "error";
type LogValue = string | number | boolean | null | undefined;
type LogContext = Record<string, LogValue>;

function write(level: LogLevel, event: string, context: LogContext): void {
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...context,
  });
  if (level === "error") console.error(entry);
  else console.info(entry);
}

export const logger = {
  info: (event: string, context: LogContext = {}) =>
    write("info", event, context),
  error: (event: string, context: LogContext = {}) =>
    write("error", event, context),
};
