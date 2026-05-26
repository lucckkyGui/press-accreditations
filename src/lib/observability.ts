type SentryModule = typeof import("@sentry/react");

export interface ObservabilityUserContext {
  id: string;
  email?: string | null;
  roles?: string[];
}

export interface ObservabilityErrorContext {
  action: string;
  route?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

let sentryPromise: Promise<SentryModule | null> | null = null;

const getSentryDsn = () => import.meta.env.VITE_SENTRY_DSN as string | undefined;

const getTracesSampleRate = () => {
  const rawValue = import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE as string | undefined;
  if (!rawValue) return 0.05;

  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) ? parsedValue : 0.05;
};

const getSentry = () => {
  const dsn = getSentryDsn();
  if (!dsn) {
    return Promise.resolve(null);
  }

  if (!sentryPromise) {
    sentryPromise = import("@sentry/react")
      .then((Sentry) => {
        Sentry.init({
          dsn,
          environment: import.meta.env.MODE,
          release: __APP_VERSION__,
          tracesSampleRate: getTracesSampleRate(),
        });

        return Sentry;
      })
      .catch((error) => {
        console.warn("[observability] Failed to initialize Sentry", error);
        return null;
      });
  }

  return sentryPromise;
};

export const initObservability = () => {
  void getSentry();
};

export const setObservabilityRoute = (route: string) => {
  void getSentry().then((Sentry) => {
    if (!Sentry) return;

    Sentry.setTag("route", route);
    Sentry.addBreadcrumb({
      category: "navigation",
      level: "info",
      message: route,
    });
  });
};

export const setObservabilityUser = (user: ObservabilityUserContext | null) => {
  void getSentry().then((Sentry) => {
    if (!Sentry) return;

    if (!user) {
      Sentry.setUser(null);
      return;
    }

    Sentry.setUser({
      id: user.id,
      email: user.email ?? undefined,
    });
    Sentry.setContext("user_roles", {
      roles: user.roles ?? [],
    });
  });
};

export const trackAction = (
  action: string,
  data?: Record<string, string | number | boolean | null | undefined>
) => {
  void getSentry().then((Sentry) => {
    if (!Sentry) return;

    Sentry.addBreadcrumb({
      category: "user-action",
      level: "info",
      message: action,
      data,
    });
  });
};

export const captureError = (error: unknown, context: ObservabilityErrorContext) => {
  const normalizedError = error instanceof Error ? error : new Error(String(error));

  void getSentry().then((Sentry) => {
    if (!Sentry) {
      console.error("[observability]", context.action, normalizedError, context);
      return;
    }

    Sentry.withScope((scope) => {
      scope.setTag("action", context.action);
      if (context.route) {
        scope.setTag("route", context.route);
      }
      if (context.metadata) {
        scope.setContext("metadata", context.metadata);
      }
      Sentry.captureException(normalizedError);
    });
  });
};
