export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogServiceName = "console" | "sentry" | "rollbar";

/** Minimal contract for application logging. */
export interface LogService {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

interface SentryLike {
  captureMessage(message: string, context?: { level?: string; extra?: Record<string, unknown> }): void;
  captureException(error: unknown, context?: { extra?: Record<string, unknown> }): void;
}

interface RollbarLike {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warning(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

declare global {
  interface Window {
    Sentry?: SentryLike;
    Rollbar?: RollbarLike;
  }
}

/**
 * Resolve the configured log service from environment variables.
 * Defaults to console when unset or unknown.
 *
 * Supported values: console, sentry, rollbar
 * Env vars: VUE_APP_LOG_SERVICE, VITE_LOG_SERVICE
 */
export function resolveLogServiceName(): LogServiceName {
  const raw =
    import.meta.env.VUE_APP_LOG_SERVICE ??
    import.meta.env.VITE_LOG_SERVICE ??
    "console";

  const normalized = String(raw).trim().toLowerCase();

  if (normalized === "sentry" || normalized === "rollbar") {
    return normalized;
  }

  return "console";
}

function findError(args: unknown[]): Error | undefined {
  return args.find((arg): arg is Error => arg instanceof Error);
}

/** Console-backed logger. Default and fallback when external SDKs are unavailable. */
export class ConsoleLogService implements LogService {
  debug(message: string, ...args: unknown[]): void {
    console.debug(message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    console.info(message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(message, ...args);
  }
}

/** Sends logs to Sentry when `window.Sentry` is initialized; otherwise falls back to console. */
export class SentryLogService implements LogService {
  private readonly fallback = new ConsoleLogService();

  private getClient(): SentryLike | null {
    if (typeof window === "undefined") {
      return null;
    }
    return window.Sentry ?? null;
  }

  private capture(level: LogLevel, message: string, ...args: unknown[]): void {
    const client = this.getClient();
    if (!client) {
      this.fallback[level](message, ...args);
      return;
    }

    const error = findError(args);
    const extra = args.length ? { args } : undefined;

    if (error) {
      client.captureException(error, { extra: { message, ...extra } });
      return;
    }

    client.captureMessage(message, { level, extra });
  }

  debug(message: string, ...args: unknown[]): void {
    this.capture("debug", message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.capture("info", message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.capture("warn", message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    this.capture("error", message, ...args);
  }
}

/** Sends logs to Rollbar when `window.Rollbar` is initialized; otherwise falls back to console. */
export class RollbarLogService implements LogService {
  private readonly fallback = new ConsoleLogService();

  private getClient(): RollbarLike | null {
    if (typeof window === "undefined") {
      return null;
    }
    return window.Rollbar ?? null;
  }

  debug(message: string, ...args: unknown[]): void {
    const client = this.getClient();
    if (!client) {
      this.fallback.debug(message, ...args);
      return;
    }
    client.debug(message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    const client = this.getClient();
    if (!client) {
      this.fallback.info(message, ...args);
      return;
    }
    client.info(message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    const client = this.getClient();
    if (!client) {
      this.fallback.warn(message, ...args);
      return;
    }
    client.warning(message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    const client = this.getClient();
    if (!client) {
      this.fallback.error(message, ...args);
      return;
    }
    client.error(message, ...args);
  }
}

/**
 * Create a logger instance for the given service name.
 *
 * @param serviceName - console, sentry, or rollbar
 */
export function createLogger(serviceName: LogServiceName = resolveLogServiceName()): LogService {
  switch (serviceName) {
    case "sentry":
      return new SentryLogService();
    case "rollbar":
      return new RollbarLogService();
    case "console":
    default:
      return new ConsoleLogService();
  }
}

/** Shared application logger selected via environment configuration. */
export const logger = createLogger();
