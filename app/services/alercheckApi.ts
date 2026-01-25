/*
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
*/
// services/alercheckApi.ts
import { Platform } from "react-native";

export type SafeAlternative = { item: string; why: string };

export type AllergenCheckResponse = {
  hasRisk: boolean;
  matched: string[];
  explanation: string;
  warning?: string;
  safeAlternatives?: SafeAlternative[];
  error?: string;
  details?: any;
};

export type AllergenCheckRequest = {
  ingredientsText: string;
  allergens: string[];
  locale?: string;
  imageBase64?: string; // base64 puro ou dataURL (o backend já aceita os 2)
};

// ✅ Ajuste conforme seu ambiente:
// - Web: localhost funciona
// - Android Emulator: 10.0.2.2 aponta pro PC
// - Celular físico: precisa IP do PC (ex: http://192.168.0.20:3001)
const API_BASE =
  Platform.OS === "web" ? "http://localhost:3001" : "http://10.0.2.2:3001";

export async function allergenCheck(
  payload: AllergenCheckRequest,
): Promise<AllergenCheckResponse> {
  const url = `${API_BASE}/api/allergen-check`;

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await r.text().catch(() => "");
  if (!r.ok) {
    // tenta devolver erro mais legível
    let details: any = text;
    try {
      details = JSON.parse(text);
    } catch {}
    throw new Error(
      `API ${r.status}: ${typeof details === "string" ? details : JSON.stringify(details)}`,
    );
  }

  try {
    return JSON.parse(text) as AllergenCheckResponse;
  } catch {
    throw new Error("La API devolvió una respuesta inválida (no JSON).");
  }
}
