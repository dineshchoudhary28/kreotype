/**
 * Error Logging Utility
 * 
 * Centralized error logging for production debugging.
 * TODO: Integrate with Sentry, LogRocket, or similar service
 */

interface ErrorContext {
    userId?: string;
    endpoint?: string;
    action?: string;
    metadata?: Record<string, unknown>;
}

export function logError(error: Error | unknown, context?: ErrorContext) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    if (process.env.NODE_ENV === "development") {
        // Full details in development
        console.error("[ERROR]", {
            message: errorMessage,
            stack: errorStack,
            context,
            timestamp: new Date().toISOString(),
        });
    } else {
        // Sanitized logging in production — no stack traces
        console.error("[ERROR]", {
            message: errorMessage,
            context,
            timestamp: new Date().toISOString(),
        });
    }

    // TODO: Send to error tracking service (Sentry, etc.)
    // if (process.env.SENTRY_DSN) {
    //   Sentry.captureException(error, { contexts: { custom: context } });
    // }
}

export function logWarning(message: string, context?: ErrorContext) {
    console.warn("[WARNING]", {
        message,
        context,
        timestamp: new Date().toISOString(),
    });

    // TODO: Send to monitoring service
}

export function logInfo(message: string, context?: ErrorContext) {
    if (process.env.NODE_ENV === "development") {
        console.log("[INFO]", {
            message,
            context,
            timestamp: new Date().toISOString(),
        });
    }
}
