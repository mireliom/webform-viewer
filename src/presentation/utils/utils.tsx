// Shared constants and utility functions
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export const COMMON_BASE_PAYLOAD = {
  id: "sre_0000000000000000exampleID",
  env: "prod",
  provider_name: "",
  username: "dummy_user",
  account_number: "123456789",
  partner: "ExamplePartner",
  first_name: "John",
  last_name: "Doe",
  full_name: "Jhon Doe",
  password: "password123!",
  contact_phone: "5551234567",
  reply_to: "jonhd@myemail.com",
  shark_email: "agent@example.com",
  short_code: "ABC123",
  email: "john.doe@example.com",
  last_4: "0000",
  shark_name: "Jane Agent",
  zip_code: "12345",
  street: "123 Main Street",
  state: "CA",
  city: "Sampletown",
  customer_dob: "1990-01-01",
  cancel_method_order: "1",
};

export function getStatusMeta(response: any) {
  if (!response) return null;
  const status = response?.status ?? response?.statusCode ?? response?.code;
  const s = String(status).toLowerCase();

  if (s === "success" || s === "200" || s === "ok") {
    return {
      icon: <CheckCircle2 className="w-4 h-4" />,
      label: "Success",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    };
  }
  if (s === "error" || s.startsWith("4") || s.startsWith("5")) {
    return {
      icon: <XCircle className="w-4 h-4" />,
      label: "Error",
      color: "text-red-600",
      bg: "bg-red-50",
    };
  }
  return {
    icon: <Clock className="w-4 h-4" />,
    label: "Unknown",
    color: "text-amber-600",
    bg: "bg-amber-50",
  };
}

export function buildFinalPayload(specificConfig: Record<string, unknown>) {
  return {
    ...COMMON_BASE_PAYLOAD,
    provider_name: specificConfig.provider_name || COMMON_BASE_PAYLOAD.provider_name,
    ...specificConfig,
  };
}
