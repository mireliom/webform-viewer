import { IApiResponse, IBackendResponse } from "@/domain/shared/api-response";

const BILLSHARK_URL =
  process.env.NEXT_PUBLIC_BILLSHARK_API_URL ||
  "https://gateway.billshark.com/apex-admin";
const API_KEY = process.env.NEXT_PUBLIC_BILLSHARK_API_KEY;

// Explicitly export the helper function
export const getApiUrl = () => BILLSHARK_URL;

export async function sendRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<IApiResponse<IBackendResponse<T>>> {
  try {
    const url = path.startsWith("http") ? path : `${BILLSHARK_URL}${path}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY || "",
        ...options.headers,
      },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const rawData = await response.json();

    return {
      success: true,
      data: { data: rawData },
    };
  } catch (error: any) {
    return {
      success: false,
      data: { data: null as any },
      error: error.message,
    };
  }
}
