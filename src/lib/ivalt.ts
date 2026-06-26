// iVALT API client — only called in non-demo mode.

const IVALT_BASE_URL = process.env.IVALT_API_BASE_URL || "https://api.ivalt.com";
const IVALT_API_KEY = process.env.IVALT_API_KEY || "";

export type BiometricAuthStatus = "pending" | "authenticated" | "failed" | "not_found" | "timeout";

export interface BiometricAuthRequestResponse {
  success: boolean;
  message?: string;
  statusCode: number;
}

export interface BiometricResultResponse {
  status: BiometricAuthStatus;
  statusCode: number;
  name?: string;       // from data.data.details.name
  email?: string;      // from data.data.details.email
  data?: Record<string, unknown>;
}

export async function sendBiometricAuthRequest(
  mobileNumber: string,
): Promise<BiometricAuthRequestResponse> {
  try {
    const response = await fetch(`${IVALT_BASE_URL}/biometric-auth-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": IVALT_API_KEY },
      body: JSON.stringify({ mobile: mobileNumber, requestFrom: "iVALT Api Portal" }),
    });

    if (response.status === 404) {
      return { success: false, message: "User not found in iVALT system", statusCode: 404 };
    }
    if (!response.ok) {
      return {
        success: false,
        message: "Failed to send auth request",
        statusCode: response.status,
      };
    }
    return { success: true, statusCode: response.status };
  } catch {
    return { success: false, message: "Network error contacting iVALT", statusCode: 0 };
  }
}

export async function getBiometricResult(mobileNumber: string): Promise<BiometricResultResponse> {
  try {
    const response = await fetch(`${IVALT_BASE_URL}/biometric-auth-result`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": IVALT_API_KEY },
      body: JSON.stringify({ mobile: mobileNumber, requestFrom: "iVALT Api Portal" }),
    });

    switch (response.status) {
      case 200: {
        const body = await response.json().catch(() => ({}));
        const details = (body as any)?.data?.details ?? {};
        return {
          status: "authenticated",
          statusCode: 200,
          name: details.name ?? undefined,
          email: details.email ?? undefined,
          data: body,
        };
      }
      case 422:
        return { status: "pending", statusCode: 422 };
      case 403:
        return { status: "failed", statusCode: 403 };
      case 404:
        return { status: "not_found", statusCode: 404 };
      default:
        return { status: "failed", statusCode: response.status };
    }
  } catch {
    return { status: "failed", statusCode: 0 };
  }
}
