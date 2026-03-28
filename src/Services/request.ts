import { soxa } from "../../deps.ts";
import {
  EServiceKindError,
  GithubError,
  GithubErrorResponse,
  GithubExceedError,
  QueryDefaultResponse,
  ServiceError,
} from "../Types/index.ts";

export async function requestGithubData<T = unknown>(
  query: string,
  variables: { [key: string]: string },
  token = "",
) {
  const headers: { [key: string]: string } = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
  if (token && token.trim()) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const githubApiUrl = Deno.env.get("GITHUB_API") || "https://api.github.com/graphql";
  
  const response = await fetch(githubApiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const responseData = await response.json();

  if (responseData?.data?.user) {
    return responseData.data.user;
  }

  console.error("DEBUG: Response Error Data:", JSON.stringify(responseData, null, 2));
  throw handleError(responseData);
}

function handleError(
  responseData: {
    data?: unknown;
    errors?: GithubError[];
    message?: string;
    documentation_url?: string;
  },
): ServiceError {
  let isRateLimitExceeded = false;
  let isScopeError = false;
  const arrayErrors = responseData?.errors || [];

  if (Array.isArray(arrayErrors) && arrayErrors.length > 0) {
    isRateLimitExceeded = arrayErrors.some((error) =>
      error?.type && error.type.includes(EServiceKindError.RATE_LIMIT)
    );
    isScopeError = arrayErrors.some((error) =>
      error?.type && error.type.includes("INSUFFICIENT_SCOPES")
    );
  }

  if (responseData?.message) {
    const lowerMessage = responseData.message.toLowerCase();
    isRateLimitExceeded = isRateLimitExceeded || lowerMessage.includes("rate limit");
    isScopeError = isScopeError || lowerMessage.includes("insufficient scopes") || lowerMessage.includes("scope");
  }

  if (isRateLimitExceeded) {
    return new ServiceError(
      "Rate limit exceeded",
      EServiceKindError.RATE_LIMIT,
    );
  }

  if (isScopeError) {
    const scopeMsg = arrayErrors[0]?.message || "Insufficient token scopes";
    return new ServiceError(
      scopeMsg,
      EServiceKindError.NOT_FOUND,
    );
  }

  return new ServiceError(
    "unknown error",
    EServiceKindError.NOT_FOUND,
  );
}
