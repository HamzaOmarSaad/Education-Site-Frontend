import { toast } from "react-hot-toast";

type ErrorRecord = Record<string, unknown>;

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

export type ApiFieldError = { field: string; message: string };
export type ApiErrorInfo = { message: string; fieldErrors: ApiFieldError[] };

function isRecord(value: unknown): value is ErrorRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatMessage(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (Array.isArray(value)) {
    const messages = value
      .map(formatMessage)
      .filter((message): message is string => Boolean(message));

    return messages.length > 0 ? [...new Set(messages)].join(" · ") : undefined;
  }

  if (isRecord(value)) {
    const messages = Object.entries(value).flatMap(([field, detail]) => {
      const message = formatMessage(detail);
      return message ? [`${field}: ${message}`] : [];
    });

    return messages.length > 0 ? messages.join(" · ") : undefined;
  }

  return undefined;
}

export function getApiErrorInfo(error: unknown): ApiErrorInfo {
  if (!isRecord(error)) return { message: getErrorMessage(error), fieldErrors: [] };
  const response = isRecord(error.response) ? error.response : undefined;
  const data = response && isRecord(response.data) ? response.data : undefined;
  const rawIssues = data?.validationErrors;
  const rawFieldMap = isRecord(data?.fieldErrors) ? data?.fieldErrors : undefined;
  const fieldErrors: ApiFieldError[] = Array.isArray(rawIssues)
    ? rawIssues.map((issue) => {
        if (!isRecord(issue)) return { field: "form", message: formatMessage(issue) ?? "Invalid value" };
        const issuePath = Array.isArray(issue.path) ? issue.path : [];
        const path = issuePath.filter((part) => typeof part === "number" || (typeof part === "string" && !["body", "query", "params"].includes(part)));
        const field = typeof issue.field === "string" ? issue.field : path.length ? path.join(".") : "form";
        return { field, message: typeof issue.message === "string" ? issue.message : "Invalid value" };
      })
    : rawFieldMap
      ? Object.entries(rawFieldMap).map(([field, message]) => ({ field, message: formatMessage(message) ?? "Invalid value" }))
      : [];
  const uniqueErrors = fieldErrors.filter((issue, index) => fieldErrors.findIndex((candidate) => candidate.field === issue.field && candidate.message === issue.message) === index);
  const summary = uniqueErrors.map((issue) => `${issue.field}: ${issue.message}`).join(" · ");
  return {
    message: summary || (data ? formatMessage(data.message) ?? getErrorMessage(error) : getErrorMessage(error)),
    fieldErrors: uniqueErrors,
  };
}

function getStatusMessage(status: unknown): string | undefined {
  if (typeof status !== "number") {
    return undefined;
  }

  switch (status) {
    case 400:
    case 422:
      return "Some of the submitted information is invalid. Please review it and try again.";
    case 401:
      return "Your email or password is incorrect.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "The requested resource could not be found.";
    case 408:
      return "The request timed out. Please try again.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    default:
      return status >= 500
        ? "The server encountered a problem. Please try again later."
        : `The request failed (${status}). Please try again.`;
  }
}

function getErrorMessage(error: unknown): string {
  if (isRecord(error)) {
    const response = isRecord(error.response) ? error.response : undefined;
    const responseData =
      response && isRecord(response.data) ? response.data : undefined;

    if (responseData) {
      for (const key of [
        "message",
        "detail",
        "errors",
        "validationErrors",
        "error",
      ]) {
        const message = formatMessage(responseData[key]);
        if (message) {
          return message;
        }
      }
    } else if (response?.data !== undefined) {
      const message = formatMessage(response.data);
      if (message) {
        return message;
      }
    }

    for (const key of ["detail", "errors", "validationErrors", "error"]) {
      const message = formatMessage(error[key]);
      if (message) {
        return message;
      }
    }

    const statusMessage = getStatusMessage(response?.status ?? error.status);
    if (statusMessage) {
      return statusMessage;
    }

    if (
      error.name === "TypeError" &&
      typeof error.message === "string" &&
      /failed to fetch|fetch failed|network|load failed/i.test(error.message)
    ) {
      return "Unable to connect to the server. Check your connection and try again.";
    }

    const message = formatMessage(error.message);
    if (message) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  const message = formatMessage(error);
  return message ?? FALLBACK_MESSAGE;
}

export function handleApiError(error: unknown): void {
  const message = getApiErrorInfo(error).message;

  if (error instanceof Error) {
    console.error("API request failed:", error.name, message);
  } else {
    console.error("API request failed:", message);
  }

  toast.error(message);
}
