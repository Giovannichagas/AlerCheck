import { Platform } from "react-native";

const LAN_IP = "192.168.0.20"; // troque pelo IP do seu PC

const API_BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:3001"
    : Platform.OS === "android"
      ? "http://10.0.2.2:3001"
      : `http://${LAN_IP}:3001`;

export type AllergenCheckResponse = {
  hasRisk: boolean;
  matched: string[];
  message: string;
  alternatives: string[];
  notes?: string[];
};

export async function allergenCheck(input: {
  ingredientsText: string;
  allergens: string[];
  locale?: string;
}): Promise<AllergenCheckResponse> {
  const res = await fetch(`${API_BASE_URL}/api/allergen-check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await res.json().catch(() => null)
      : await res.text().catch(() => "");

    const msg =
      typeof data === "string"
        ? data
        : data?.error || data?.message || `HTTP ${res.status}`;

    throw new Error(msg);
  }

  const json = await res.json();
  return (json?.result ?? json) as AllergenCheckResponse;
}
