import { Platform } from "react-native";

// ⚠️ Se você usar celular físico, troque pelo IP do seu PC na rede
const LAN_IP = "192.168.0.20";

const API_BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:3001"
    : Platform.OS === "android"
      ? "http://10.0.2.2:3001"
      : `http://${LAN_IP}:3001`;

// ✅ resposta do seu server.ts (Ollama)
export type AllergenCheckResponse = {
  hasRisk: boolean;
  matched: string[];
  explanation: string;
  warning: string;
  safeAlternatives: { item: string; why: string }[];
  _raw?: string; // quando não conseguir parsear
};

export async function allergenCheck(input: {
  ingredientsText: string;
  allergens: string[];
  locale?: string;
  imageBase64?: string; // ✅ foto (base64), opcional
}): Promise<AllergenCheckResponse> {
  const res = await fetch(`${API_BASE_URL}/api/allergen-check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const contentType = res.headers.get("content-type") || "";

  // tenta parsear JSON sempre (quando possível)
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => "");

  if (!res.ok) {
    const msg =
      typeof data === "string"
        ? data
        : data?.error || data?.message || `HTTP ${res.status}`;

    throw new Error(msg);
  }

  // seu server já retorna o objeto final (não usa result), mas deixo seguro:
  const json = typeof data === "string" ? JSON.parse(data) : data;
  return (json?.result ?? json) as AllergenCheckResponse;
}
