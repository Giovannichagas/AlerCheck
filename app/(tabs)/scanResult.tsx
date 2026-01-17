import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { allergenCheck, type AllergenCheckResponse } from "../services/alercheckApi";
import { addHistory, getHistory, type StoredHistoryItem } from "../services/historyStore";

const PLACEHOLDER = require("../../assets/images/logo.jpeg");

// ✅ decode seguro (evita crash se vier string malformada)
function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

// ✅ WEB: converte URI -> DATA URL completo (data:image/...;base64,XXXX)
// Isso aumenta compatibilidade com backend/LLM.
async function uriToDataUrlWeb(uri: string): Promise<string> {
  const resp = await fetch(uri);
  if (!resp.ok) {
    throw new Error(`No se pudo leer la imagen (HTTP ${resp.status}).`);
  }
  const blob = await resp.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(String(reader.result)); // ✅ data:image/...;base64,XXXX
    };
    reader.onerror = () => reject(new Error("Error al convertir la imagen a base64."));
    reader.readAsDataURL(blob);
  });
}

function formatCheckedAtISO(iso: string) {
  const dt = new Date(iso);
  const diffMs = Date.now() - dt.getTime();
  const diffMin = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMin < 1) return "Checked just now";
  if (diffMin < 60) return `Checked ${diffMin} min ago`;
  if (diffHours < 24) return `Checked ${diffHours} h ago`;
  if (diffDays === 1) return "Checked 1 day ago";
  return `Checked ${diffDays} days ago`;
}

// tenta gerar um “título” simples a partir do texto
function makeTitle(ingredients: string) {
  const s = (ingredients || "").trim();
  if (!s) return "Scan (photo only)";
  const first = s.split(",")[0]?.trim();
  if (!first) return "Scan";
  return first.length > 28 ? `${first.slice(0, 28)}…` : first;
}

export default function ScanResultScreen() {
  const params = useLocalSearchParams<{
    ingredients?: string;
    allergens?: string;
    photoUri?: string;
  }>();

  const ingredients = useMemo(() => {
    const raw = (params.ingredients ?? "").toString();
    return safeDecode(raw).trim();
  }, [params.ingredients]);

  const selectedAllergens = useMemo(() => {
    const raw = safeDecode((params.allergens ?? "").toString());
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [params.allergens]);

  const photoUri = useMemo(() => {
    const raw = (params.photoUri ?? "").toString();
    return safeDecode(raw).trim();
  }, [params.photoUri]);

  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  const APP_MAX_W = 920;
  const shellW = isWeb ? Math.min(width - 32, APP_MAX_W) : "100%";

  const [hoverId, setHoverId] = useState<string | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [ai, setAi] = useState<AllergenCheckResponse | null>(null);

  // ✅ histórico real (últimas 10)
  const [history, setHistory] = useState<StoredHistoryItem[]>([]);

  // carrega histórico ao abrir tela
  useEffect(() => {
    (async () => {
      const h = await getHistory();
      setHistory(h);
    })();
  }, []);

  // ✅ debug: confirma o que chegou por rota
  useEffect(() => {
    console.log("[ScanResult] ingredients:", ingredients);
    console.log("[ScanResult] selectedAllergens:", selectedAllergens);
    console.log("[ScanResult] photoUri:", photoUri);
  }, [ingredients, selectedAllergens.join(","), photoUri]);

  useEffect(() => {
    let mounted = true;

    async function run() {
      // ✅ só não chama se NÃO tem texto E NÃO tem foto
      if (!ingredients && !photoUri) {
        setAi(null);
        setAiError("Escriba ingredientes o envíe una foto.");
        setAiLoading(false);
        return;
      }

      // ✅ precisa de alergia selecionada pra cruzar
      if (selectedAllergens.length === 0) {
        setAi(null);
        setAiError("Seleccione al menos 1 alergia para analizar.");
        setAiLoading(false);
        return;
      }

      try {
        setAiLoading(true);
        setAiError(null);

        let imageBase64: string | undefined;

        // ✅ WEB: converte para DATA URL completo e envia para o backend
        if (photoUri && Platform.OS === "web") {
          const dataUrl = await uriToDataUrlWeb(photoUri);
          console.log("[ScanResult] dataUrl length:", dataUrl.length);
          imageBase64 = dataUrl;
        }

        // Se no WEB veio photoUri mas não gerou base64, avisa
        if (Platform.OS === "web" && photoUri && !imageBase64) {
          throw new Error("No se pudo convertir la imagen para analizar.");
        }

        const resp = await allergenCheck({
          ingredientsText: ingredients, // pode ser "" se só foto
          allergens: selectedAllergens,
          locale: "pt-BR",
          imageBase64, // ✅ data URL no WEB
        });

        if (!mounted) return;
        setAi(resp);

        // ✅ salva no histórico (topo) e mantém só 10
        const hasAlertLocal = !!resp?.hasRisk || (resp?.matched?.length ?? 0) > 0;

        const itemToSave: StoredHistoryItem = {
          id: String(Date.now()),
          title: makeTitle(ingredients),
          type: "Scan",
          ingredients: ingredients || "(photo only)",
          checkedAt: new Date().toISOString(),
          hasAlert: hasAlertLocal,
          matched: resp?.matched ?? [],
          photoUri: photoUri || null,
          selectedAllergens,
          aiExplanation: resp?.explanation ?? "",
          warning: resp?.warning,
        };

        const next = await addHistory(itemToSave);
        if (!mounted) return;
        setHistory(next);
      } catch (e: any) {
        if (!mounted) return;
        console.log("[ScanResult] AI ERROR:", e);
        setAiError(e?.message ?? "Error al realizar la consulta a la IA.");
        setAi(null);
      } finally {
        if (!mounted) return;
        setAiLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [ingredients, selectedAllergens.join(","), photoUri]);

  const hasAlert = !!ai?.hasRisk || (ai?.matched?.length ?? 0) > 0;

  function goToHistory(itemId: string) {
    router.push(`/history?id=${itemId}`);
  }

  return (
    <View style={[styles.page, isWeb && styles.pageWeb]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.shell, isWeb && [styles.shellWeb, { width: shellW }]]}>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.headerRow}>
              <Pressable onPress={() => router.replace("/(tabs)/scan")} style={styles.backBtn} hitSlop={10}>
                <Text style={styles.backText}>‹</Text>
              </Pressable>

              <Text style={styles.headerTitle}>Allergens check</Text>
              <View style={{ width: 40 }} />
            </View>

            <View style={styles.productCard}>
              <Image source={photoUri ? { uri: photoUri } : PLACEHOLDER} style={styles.productImg} />
              <View style={{ flex: 1 }}>
                <Text style={styles.productTitle}>Datos recibidos correctamente</Text>
                <Text style={styles.productSub} numberOfLines={2}>
                  {ingredients || "Sin ingredientes introducidos (solo escaneo con foto)"}
                </Text>
                <Text style={styles.productMeta}>
                  Alérgenos verdaderos: {selectedAllergens.length ? selectedAllergens.join(", ") : "None"}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Allergens</Text>

            <View style={[styles.alertCard, hasAlert ? styles.alertDanger : styles.alertSafe]}>
              <Text style={styles.alertTitle}>{hasAlert ? "Alerta de alérgenos" : "Ningún alérgeno detectado"}</Text>

              {aiLoading ? (
                <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                  <ActivityIndicator />
                  <Text style={styles.alertText}>Consultando IA...</Text>
                </View>
              ) : aiError ? (
                <Text style={styles.alertText}>Erro: {aiError}</Text>
              ) : hasAlert ? (
                <Text style={styles.alertText}>Matched: {(ai?.matched ?? []).join(", ") || "-"}</Text>
              ) : (
                <Text style={styles.alertText}>No hay coincidencias según los alérgenos seleccionados.</Text>
              )}

              {!aiLoading && !aiError && ai?.warning ? (
                <Text style={[styles.alertText, { marginTop: 10 }]}>⚠️ {ai.warning}</Text>
              ) : null}

              {!aiLoading && !aiError && ai?.safeAlternatives?.length ? (
                <View style={{ marginTop: 10 }}>
                  <Text style={[styles.alertText, { fontWeight: "900" }]}>Alternativas sugeridas:</Text>
                  {ai.safeAlternatives.map((alt, idx) => (
                    <Text key={idx} style={styles.alertText}>
                      • {alt.item} — {alt.why}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>

            <View style={styles.debugCard}>
              <Text style={styles.debugTitle}>Debug (integración)</Text>

              <Text style={styles.debugLabel}>Ingredientes:</Text>
              <Text style={styles.debugValue}>{ingredients || "-"}</Text>

              <Text style={styles.debugLabel}>Alérgenos seleccionados:</Text>
              <Text style={styles.debugValue}>{selectedAllergens.length ? selectedAllergens.join(", ") : "-"}</Text>

              <Text style={styles.debugLabel}>PhotoUri:</Text>
              <Text style={styles.debugValue}>{photoUri || "-"}</Text>

              <Text style={styles.debugLabel}>Respuesta IA:</Text>
              {aiLoading ? (
                <Text style={styles.debugValue}>Cargando...</Text>
              ) : aiError ? (
                <Text style={styles.debugValue}>Erro: {aiError}</Text>
              ) : ai ? (
                <>
                  <Text style={styles.debugValue}>{ai.explanation || "-"}</Text>
                  {!!ai.matched?.length && <Text style={styles.debugValue}>Matched: {ai.matched.join(", ")}</Text>}
                </>
              ) : (
                <Text style={styles.debugValue}>-</Text>
              )}
            </View>

            <View style={styles.listHeaderRow}>
              <Text style={styles.listTitle}>Comprobaciones recientes (últimas 10)</Text>
              <Text style={styles.listHint}>Pulsa la flecha para abrir el historial</Text>
            </View>

            <View style={styles.listCard}>
              {history.slice(0, 10).map((item, idx) => {
                const hovered = hoverId === item.id;

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => goToHistory(item.id)}
                    onHoverIn={isWeb ? () => setHoverId(item.id) : undefined}
                    onHoverOut={isWeb ? () => setHoverId(null) : undefined}
                    style={[
                      styles.row,
                      idx === 0 && { borderTopWidth: 0 },
                      hovered && styles.rowHover,
                      item.hasAlert && styles.rowAlertBorder,
                    ]}
                  >
                    <View style={styles.rowLeft}>
                      <Image source={PLACEHOLDER} style={styles.rowIcon} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowTitle} numberOfLines={1}>
                          {item.title || "Scan"}
                        </Text>
                        <Text style={styles.rowSub} numberOfLines={1}>
                          {formatCheckedAtISO(item.checkedAt)}
                        </Text>

                        {item.hasAlert && item.matched?.length ? (
                          <Text style={styles.rowMatched} numberOfLines={1}>
                            Matched: {item.matched.join(", ")}
                          </Text>
                        ) : (
                          <Text style={styles.rowOk} numberOfLines={1}>
                            No alerts
                          </Text>
                        )}
                      </View>
                    </View>

                    <Pressable
                      onPress={() => goToHistory(item.id)}
                      hitSlop={10}
                      style={[styles.arrowBtn, hovered && styles.arrowBtnHover]}
                    >
                      <Ionicons name="chevron-forward" size={18} color="#fff" />
                    </Pressable>
                  </Pressable>
                );
              })}

              {!history.length ? (
                <View style={{ padding: 14 }}>
                  <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                    Aún no hay historial. Haz un escaneo para que aparezca aquí.
                  </Text>
                </View>
              ) : null}
            </View>

            <Pressable style={styles.btn} onPress={() => router.replace("/(tabs)/scan")}>
              <Text style={styles.btnText}>Volver a escanear</Text>
            </Pressable>

            <View style={{ height: 30 }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0b0f12" },
  pageWeb: { padding: 16, alignItems: "center", justifyContent: "center" },

  shell: { flex: 1, width: "100%", backgroundColor: "#0b0f12" },
  shellWeb: {
    height: "100%",
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "#0b0f12",
  },

  scroll: { padding: 16, paddingBottom: 24 },

  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  backText: { color: "#fff", fontSize: 28, marginTop: -2 },
  headerTitle: { color: "#4AB625", fontSize: 16, fontWeight: "800" },

  productCard: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 14,
    alignItems: "center",
  },
  productImg: { width: 54, height: 54, borderRadius: 12, note: undefined as any, resizeMode: "cover" } as any,
  productTitle: { color: "#fff", fontWeight: "900", fontSize: 13 },
  productSub: { color: "rgba(255,255,255,0.70)", fontSize: 11.5, marginTop: 3 },
  productMeta: { color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 6 },

  sectionTitle: { color: "#fff", fontWeight: "800", fontSize: 14, marginBottom: 10 },

  alertCard: { borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1 },
  alertDanger: { backgroundColor: "rgba(255,77,77,0.10)", borderColor: "rgba(255,77,77,0.35)" },
  alertSafe: { backgroundColor: "rgba(74,182,37,0.10)", borderColor: "rgba(74,182,37,0.35)" },
  alertTitle: { color: "#fff", fontWeight: "900", fontSize: 13, marginBottom: 6 },
  alertText: { color: "rgba(255,255,255,0.75)", fontSize: 12, lineHeight: 16 },

  debugCard: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 14,
  },
  debugTitle: { color: "#fff", fontWeight: "900", marginBottom: 10 },
  debugLabel: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 8 },
  debugValue: { color: "#fff", fontSize: 12, marginTop: 2 },

  listHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 4, marginBottom: 10 },
  listTitle: { color: "#fff", fontWeight: "900", fontSize: 13 },
  listHint: { color: "rgba(255,255,255,0.45)", fontSize: 11 },

  listCard: {
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    marginBottom: 14,
  },

  row: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  rowHover: { backgroundColor: "rgba(255,255,255,0.08)" },
  rowAlertBorder: { borderLeftWidth: 3, borderLeftColor: "rgba(255,77,77,0.65)" },

  rowLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, paddingRight: 10 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, resizeMode: "cover" },
  rowTitle: { color: "#fff", fontWeight: "900", fontSize: 12.5 },
  rowSub: { color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 2 },
  rowMatched: { color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 3 },
  rowOk: { color: "rgba(74,182,37,0.95)", fontSize: 11, marginTop: 3, fontWeight: "800" },

  arrowBtn: { width: 34, height: 34, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.10)", alignItems: "center", justifyContent: "center" },
  arrowBtnHover: { backgroundColor: "rgba(74,182,37,0.25)" },

  btn: { alignSelf: "center", width: "78%", backgroundColor: "#4AB625", paddingVertical: 12, borderRadius: 999, alignItems: "center", marginTop: 6 },
  btnText: { color: "#fff", fontWeight: "900", fontSize: 13 },
});
