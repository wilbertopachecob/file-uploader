import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  ConsoleLogService,
  RollbarLogService,
  SentryLogService,
  createLogger,
  resolveLogServiceName,
} from "@/utils/logger";

describe("logger", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("resolveLogServiceName", () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("defaults to console", () => {
      vi.stubEnv("VUE_APP_LOG_SERVICE", "");
      vi.stubEnv("VITE_LOG_SERVICE", "");
      expect(resolveLogServiceName()).toBe("console");
    });

    it("reads VUE_APP_LOG_SERVICE", () => {
      vi.stubEnv("VUE_APP_LOG_SERVICE", "sentry");
      expect(resolveLogServiceName()).toBe("sentry");
    });

    it("falls back to console for unknown values", () => {
      vi.stubEnv("VUE_APP_LOG_SERVICE", "datadog");
      expect(resolveLogServiceName()).toBe("console");
    });
  });

  describe("ConsoleLogService", () => {
    it("delegates to console methods", () => {
      const service = new ConsoleLogService();
      const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
      const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      service.debug("debug message");
      service.info("info message");
      service.warn("warn message", new Error("warn error"));
      service.error("error message");

      expect(debugSpy).toHaveBeenCalledWith("debug message");
      expect(infoSpy).toHaveBeenCalledWith("info message");
      expect(warnSpy).toHaveBeenCalledWith("warn message", expect.any(Error));
      expect(errorSpy).toHaveBeenCalledWith("error message");
    });
  });

  describe("SentryLogService", () => {
    it("falls back to console when Sentry is unavailable", () => {
      const service = new SentryLogService();
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      service.warn("thumbnail failed", new Error("boom"));

      expect(warnSpy).toHaveBeenCalledWith("thumbnail failed", expect.any(Error));
    });

    it("uses Sentry when initialized on window", () => {
      const captureException = vi.fn();
      window.Sentry = { captureMessage: vi.fn(), captureException };

      const service = new SentryLogService();
      const error = new Error("boom");
      service.warn("thumbnail failed", error);

      expect(captureException).toHaveBeenCalledWith(error, {
        extra: { message: "thumbnail failed", args: [error] },
      });

      delete window.Sentry;
    });
  });

  describe("RollbarLogService", () => {
    it("falls back to console when Rollbar is unavailable", () => {
      const service = new RollbarLogService();
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      service.error("player failed", { error: "x" });

      expect(errorSpy).toHaveBeenCalledWith("player failed", { error: "x" });
    });

    it("uses Rollbar when initialized on window", () => {
      const warning = vi.fn();
      window.Rollbar = {
        debug: vi.fn(),
        info: vi.fn(),
        warning,
        error: vi.fn(),
      };

      const service = new RollbarLogService();
      service.warn("player not ready", { id: "videoPlayer_1" });

      expect(warning).toHaveBeenCalledWith("player not ready", { id: "videoPlayer_1" });

      delete window.Rollbar;
    });
  });

  describe("createLogger", () => {
    it("returns the requested implementation", () => {
      expect(createLogger("console")).toBeInstanceOf(ConsoleLogService);
      expect(createLogger("sentry")).toBeInstanceOf(SentryLogService);
      expect(createLogger("rollbar")).toBeInstanceOf(RollbarLogService);
    });
  });
});
