import { useAuthStore } from '@/stores/authStore'

export interface ApiResponse<T, E = unknown> {
  success: boolean;
  data?: T;
  errorCode?: string;
  errorData?: E;
}

/**
 * Determines if the response should be parsed as JSON
 * @param response The fetch response object
 * @returns Boolean indicating if the response should be parsed as JSON
 */
function shouldParseAsJson(response: Response): boolean {
  const contentType = response.headers.get('content-type');
  return contentType?.includes('application/json') || false;
}

/**
 * Parses the response based on content type
 * @param response The fetch response object
 * @returns The parsed response data
 */
async function parseResponse<T>(response: Response): Promise<T> {
  if (shouldParseAsJson(response)) {
    return await response.json();
  }

  // For non-JSON responses, return the response object itself
  // This allows the caller to handle text, blob, etc. as needed
  return response as unknown as T;
}

/**
 * Handles API response with standardized error handling
 * @param response The fetch response object
 * @returns A standardized response object
 */
export async function handleApiResponse<T, E = unknown>(
  response: Response
): Promise<ApiResponse<T, E>> {
  if (!response.ok) {
    let errorCode = 'unknown_error';
    let errorData: unknown = undefined;

    // Check for specific HTTP status codes
    if (response.status === 400) {
      errorCode = 'bad_request';
    } else if (response.status === 401) {
      errorCode = 'unauthorized';
    } else if (response.status === 403) {
      errorCode = 'forbidden';
    } else if (response.status === 404) {
      errorCode = 'not_found';
    } else if (response.status >= 500) {
      errorCode = 'server_error';
    }

    // Try to get more detailed error information from the response if it's JSON
    if (shouldParseAsJson(response)) {
      try {
        errorData = await response.json();
        if (errorData && typeof errorData === 'object' && 'code' in errorData) {
          errorCode = (errorData as { code?: string }).code || errorCode;
        }
      } catch (parseError) {
        // If we can't parse the error response, use the default error code
        console.error("Error parsing error response", parseError);
      }
    }

    return { success: false, errorCode, errorData: errorData as E };
  }

  // Parse the successful response based on content type
  const data = await parseResponse<T>(response);
  return { success: true, data };
}

/**
 * Performs an authenticated API request with standardized error handling
 * @param url The API endpoint URL
 * @param options Fetch options
 * @returns A standardized response object
 */
export async function fetchWithAuth<T, E = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T, E>> {
  const authStore = useAuthStore();

  // Add authorization header if token exists and headers object doesn't already have Authorization
  if (authStore.token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${authStore.token}`
    };
  }

  try {
    const response = await fetch(url, options);

    // Handle 401 unauthorized errors specially for authenticated requests
    if (response.status === 401) {
      await authStore.logout();
    }

    return await handleApiResponse<T, E>(response);
  } catch (e) {
    console.error(`Error while making API request to ${url}`, e);

    return { 
      success: false, 
      errorCode: 'network_error'
    };
  }
}

/**
 * Performs a non-authenticated API request with standardized error handling
 * @param url The API endpoint URL
 * @param options Fetch options
 * @returns A standardized response object
 */
export async function fetchWithoutAuth<T, E = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T, E>> {
  try {
    const response = await fetch(url, options);
    return await handleApiResponse<T, E>(response);
  } catch (e) {
    console.error(`Error while making API request to ${url}`, e);

    return { 
      success: false, 
      errorCode: 'network_error'
    };
  }
}

/**
 * Performs an authenticated API request with FormData
 * @param url The API endpoint URL
 * @param formData The FormData object to send
 * @param method The HTTP method to use (default: 'POST')
 * @returns A standardized response object
 */
export async function fetchWithFormData<T, E = unknown>(
  url: string,
  formData: FormData,
  method: string = 'POST'
): Promise<ApiResponse<T, E>> {
  return fetchWithAuth<T, E>(url, {
    method,
    body: formData,
    // Don't set the Content-Type header as the browser will set it with the boundary parameter
  });
}
