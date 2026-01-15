import AsyncStorage from "@react-native-async-storage/async-storage";

export type StoredHistoryItem = {
  id: string;
  title: string;
  type?: string; // opcional
  ingredients: string;
  checkedAt: string; // ISO string (ex: new Date().toISOString())
  hasAlert: boolean;
  matched?: string[];
  photoUri?: string | null;

  // extras (opcional, mas útil)
  selectedAllergens?: string[];
  aiExplanation?: string;
  warning?: string;
};

const KEY = "@alercheck_history_v1";
const MAX_ITEMS = 10;

export async function getHistory(): Promise<StoredHistoryItem[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredHistoryItem[]) : [];
  } catch {
    return [];
  }
}

export async function saveHistory(items: StoredHistoryItem[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
}

export async function addHistory(item: StoredHistoryItem): Promise<StoredHistoryItem[]> {
  const prev = await getHistory();

  // remove duplicado por id (se existir)
  const dedup = prev.filter((x) => x.id !== item.id);

  // adiciona no topo e corta em 10
  const next = [item, ...dedup].slice(0, MAX_ITEMS);

  await saveHistory(next);
  return next;
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
