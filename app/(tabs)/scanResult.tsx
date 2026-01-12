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

import { allergenCheck } from "../services/alercheckApi";

const PLACEHOLDER = require("../../assets/images/logo.jpeg");

type HistoryItem = {
  id: string;
  title: string;
  ingredients: string;
  checkedAt: string;
  hasAlert: boolean;
  matched?: string[];
};

// WEB: converte URI -> base64
async function uriToBase64Web(uri: string): Promise<string> {
  const resp = await fetch(uri);
  const blob = await resp.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = String(reader.result);
      const base64 = dataUrl.split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function ScanResultScreen() {
  const params = useLocalSearchParams<{
    ingredients?: string;
    allergens?: string;
    photoUri?: string;
  }>();

  const ingredients = useMemo(
    () => decodeURIComponent((params.ingredients ?? "").toString()).trim(),
    [params.ingredients]
  );

  const selectedAllergens = useMemo(() => {
    const raw = decodeURIComponent((params.allergens ?? "").toString());
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }, [params.allergens]);

  const photoUri = useMemo(
    () => decodeURIComponent((params.photoUri ?? "").toString()).trim(),
    [params.photoUri]
  );

  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  const APP_MAX_W = 920;
  const shellW = isWeb ? Math.min(width - 32, APP_MAX_W) : "100%";

  const [hoverId, setHoverId] = useState<string | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [ai, setAi] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    async function run() {
      if (!ingredients || selectedAllergens.length === 0) {
        setAi(null);
        setAiError(null);
        setAiLoading(false);
        return;
      }

      try {
        setAiLoading(true);
        setAiError(null);

        let imageBase64: string | undefined = undefined;

        // Só converte imagem se existir
        if (photoUri) {
          if (Platform.OS === "web") {
            imageBase64 = await uriToBase64Web(photoUri);
          } else {
            // mobile: depois podemos usar expo-file-system
            // por enquanto não envia imagem no mobile
            imageBase64 = undefined;
          }
        }

        const resp = await allergenCheck({
          ingredientsText: ingredients,
          allergens: selectedAllergens,
          locale: "pt-BR",
          imageBase64,
        });

        if (!mounted) return;
        setAi(resp);
      } catch (e: any) {
        if (!mounted) return;
        setAiError(e?.message ?? "Erro ao consultar IA");
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

  const mockHistory = useMemo<HistoryItem[]>(() => {
    const items: HistoryItem[] = [
      { id: "h1", title: "Organic Peanut Butter", ingredients: "peanuts, salt", checkedAt: "Checked 1 day ago", hasAlert: true, matched: ["Peanuts"] },
      { id: "h2", title: "Almond Milk", ingredients: "almonds, water, salt", checkedAt: "Checked 2 days ago", hasAlert: true, matched: ["Tree Nuts"] },
    ];

    items.unshift({
      id: "latest",
      title: "Latest Scan (current)",
      ingredients: ingredients || "(no ingredients)",
      checkedAt: "Checked just now",
      hasAlert,
      matched: hasAlert ? (ai?.matched ?? []) : [],
    });

    return items.slice(0, 15);
  }, [ingredients, hasAlert, ai]);

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
                <Text style={styles.productTitle}>Received data</Text>
                <Text style={styles.productSub} numberOfLines={2}>
                  {ingredients || "No ingredients typed"}
                </Text>
                <Text style={styles.productMeta}>
                  TRUE Allergens: {selectedAllergens.length ? selectedAllergens.join(", ") : "None"}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Allergens</Text>

            <View style={[styles.alertCard, hasAlert ? styles.alertDanger : styles.alertSafe]}>
              <Text style={styles.alertTitle}>
                {hasAlert ? "Allergen Alert" : "No allergen detected"}
              </Text>

              {aiLoading ? (
                <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                  <ActivityIndicator />
                  <Text style={styles.alertText}>Consultando IA...</Text>
                </View>
              ) : aiError ? (
                <Text style={styles.alertText}>Erro: {aiError}</Text>
              ) : hasAlert ? (
                <Text style={styles.alertText}>
                  Matched: {(ai?.matched ?? []).join(", ") || "-"}
                </Text>
              ) : (
                <Text style={styles.alertText}>No matches based on your selected allergens.</Text>
              )}

              {!aiLoading && !aiError && ai?.warning ? (
                <Text style={[styles.alertText, { marginTop: 10 }]}>⚠️ {ai.warning}</Text>
              ) : null}

              {!aiLoading && !aiError && ai?.safeAlternatives?.length ? (
                <View style={{ marginTop: 10 }}>
                  <Text style={[styles.alertText, { fontWeight: "900" }]}>Alternativas sugeridas:</Text>
                  {ai.safeAlternatives.map((alt: any, idx: number) => (
                    <Text key={idx} style={styles.alertText}>
                      • {alt.item} — {alt.why}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>

            <View style={styles.debugCard}>
              <Text style={styles.debugTitle}>Debug (integration)</Text>

              <Text style={styles.debugLabel}>Ingredients:</Text>
              <Text style={styles.debugValue}>{ingredients || "-"}</Text>

              <Text style={styles.debugLabel}>Selected TRUE Allergens:</Text>
              <Text style={styles.debugValue}>
                {selectedAllergens.length ? selectedAllergens.join(", ") : "-"}
              </Text>

              <Text style={styles.debugLabel}>AI response:</Text>
              {aiLoading ? (
                <Text style={styles.debugValue}>Loading...</Text>
              ) : aiError ? (
                <Text style={styles.debugValue}>Erro: {aiError}</Text>
              ) : ai ? (
                <>
                  <Text style={styles.debugValue}>{ai.explanation || "-"}</Text>
                  {!!ai.matched?.length && (
                    <Text style={styles.debugValue}>Matched: {ai.matched.join(", ")}</Text>
                  )}
                </>
              ) : (
                <Text style={styles.debugValue}>-</Text>
              )}
            </View>

            <View style={styles.listHeaderRow}>
              <Text style={styles.listTitle}>Recent checks (last 15)</Text>
              <Text style={styles.listHint}>Click the arrow to open History</Text>
            </View>

            <View style={styles.listCard}>
              {mockHistory.map((item) => {
                const hovered = hoverId === item.id;

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => goToHistory(item.id)}
                    onHoverIn={isWeb ? () => setHoverId(item.id) : undefined}
                    onHoverOut={isWeb ? () => setHoverId(null) : undefined}
                    style={[
                      styles.row,
                      hovered && styles.rowHover,
                      item.hasAlert && styles.rowAlertBorder,
                    ]}
                  >
                    <View style={styles.rowLeft}>
                      <Image source={PLACEHOLDER} style={styles.rowIcon} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.rowSub} numberOfLines={1}>{item.checkedAt}</Text>
                        {item.hasAlert && item.matched?.length ? (
                          <Text style={styles.rowMatched} numberOfLines={1}>
                            Matched: {item.matched.join(", ")}
                          </Text>
                        ) : (
                          <Text style={styles.rowOk} numberOfLines={1}>No alerts</Text>
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
            </View>

            <Pressable style={styles.btn} onPress={() => router.replace("/(tabs)/scan")}>
              <Text style={styles.btnText}>Back to Scan</Text>
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
  productImg: { width: 54, height: 54, borderRadius: 12, resizeMode: "cover" },
  productTitle: { color: "#fff", fontWeight: "900", fontSize: 13 },
  productSub: { color: "rgba(255,255,255,0.70)", fontSize: 11.5, marginTop: 3 },
  productMeta: { color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 6 },

  sectionTitle: { color: "#fff", fontWeight: "800", fontSize: 14, marginBottom: 10 },

  alertCard: { borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1 },
  alertDanger: { backgroundColor: "rgba(255,77,77,0.10)", borderColor: "rgba(255,77,77,0.35)" },
  alertSafe: { backgroundColor: "rgba(74,182,37,0.10)", borderColor: "rgba(74,182,37,0.35)" },
  alertTitle: { color: "#fff", fontWeight: "900", fontSize: 13, marginBottom: 6 },
  alertText: { color: "rgba(255,255,255,0.75)", fontSize: 12, lineHeight: 16 },

  debugCard: { borderRadius: 14, padding: 14, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 14 },
  debugTitle: { color: "#fff", fontWeight: "900", marginBottom: 10 },
  debugLabel: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 8 },
  debugValue: { color: "#fff", fontSize: 12, marginTop: 2 },

  listHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 4, marginBottom: 10 },
  listTitle: { color: "#fff", fontWeight: "900", fontSize: 13 },
  listHint: { color: "rgba(255,255,255,0.45)", fontSize: 11 },

  listCard: { borderRadius: 14, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 14 },

  row: { paddingHorizontal: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
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
