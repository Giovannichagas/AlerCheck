import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
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

const PLACEHOLDER = require("../../assets/images/logo.jpeg");

type Payload = {
  ingredients?: string;
  photoUri?: string | null;
  selectedAllergens?: string[];
};

type HistoryItem = {
  id: string;
  title: string;
  ingredients: string;
  checkedAt: string;
  hasAlert: boolean;
  matched?: string[];
};

function decodePayload(raw?: string): Payload {
  try {
    if (!raw) return {};
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return {};
  }
}

export default function ScanResultScreen() {
  const { payload } = useLocalSearchParams<{ payload?: string }>();
  const data = useMemo(() => decodePayload(payload), [payload]);

  const ingredients = data.ingredients ?? "";
  const photoUri = data.photoUri ?? null;
  const selectedAllergens = data.selectedAllergens ?? [];

  const [hoverId, setHoverId] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  // ✅ mesmo “tamanho/shell” do Scan/History
  const APP_MAX_W = 920;
  const shellW = isWeb ? Math.min(width - 32, APP_MAX_W) : "100%";

  const found = useMemo(() => {
    const text = ingredients.toLowerCase();

    const synonyms: Record<string, string[]> = {
      Peanuts: ["peanut", "peanuts", "amendoim", "amendoins"],
      "Tree Nuts": ["nuts", "nozes", "castanha", "castanhas", "almond", "amêndoa", "amendoa"],
      Milk: ["milk", "leite", "lactose", "whey"],
      Eggs: ["egg", "eggs", "ovo", "ovos"],
      Gluten: ["gluten", "wheat", "trigo", "barley", "cevada", "rye", "centeio"],
      Soy: ["soy", "soja"],
      Fish: ["fish", "peixe"],
      Shellfish: ["shrimp", "prawn", "crab", "lobster", "marisco", "camarão", "camarao"],
    };

    return selectedAllergens.filter((a) => {
      const keys = synonyms[a] ?? [a.toLowerCase()];
      return keys.some((k) => text.includes(k.toLowerCase()));
    });
  }, [ingredients, selectedAllergens]);

  const hasAlert = found.length > 0;

  const mockHistory = useMemo<HistoryItem[]>(() => {
    const items: HistoryItem[] = [
      { id: "h1", title: "Organic Peanut Butter", ingredients: "peanuts, salt", checkedAt: "Checked 1 day ago", hasAlert: true, matched: ["Peanuts"] },
      { id: "h2", title: "Almond Milk", ingredients: "almonds, water, salt", checkedAt: "Checked 2 days ago", hasAlert: true, matched: ["Tree Nuts"] },
      { id: "h3", title: "Gluten-free Bread", ingredients: "rice flour, yeast, salt", checkedAt: "Checked 3 days ago", hasAlert: false },
      { id: "h4", title: "Chocolate Cookies", ingredients: "wheat, milk, soy lecithin", checkedAt: "Checked 4 days ago", hasAlert: true, matched: ["Gluten", "Milk", "Soy"] },
      { id: "h5", title: "Yogurt", ingredients: "milk, cultures", checkedAt: "Checked 5 days ago", hasAlert: true, matched: ["Milk"] },
      { id: "h6", title: "Pasta", ingredients: "wheat semolina", checkedAt: "Checked 6 days ago", hasAlert: true, matched: ["Gluten"] },
      { id: "h7", title: "Soy Sauce", ingredients: "soy, wheat, salt", checkedAt: "Checked 1 week ago", hasAlert: true, matched: ["Soy", "Gluten"] },
      { id: "h8", title: "Egg Omelette", ingredients: "eggs, butter, salt", checkedAt: "Checked 8 days ago", hasAlert: true, matched: ["Eggs"] },
      { id: "h9", title: "Fish Sticks", ingredients: "fish, wheat, oil", checkedAt: "Checked 9 days ago", hasAlert: true, matched: ["Fish", "Gluten"] },
      { id: "h10", title: "Shrimp Salad", ingredients: "shrimp, mayo, lemon", checkedAt: "Checked 10 days ago", hasAlert: true, matched: ["Shellfish"] },
      { id: "h11", title: "Granola Bar", ingredients: "nuts, oats, honey", checkedAt: "Checked 11 days ago", hasAlert: true, matched: ["Tree Nuts"] },
      { id: "h12", title: "Rice Bowl", ingredients: "rice, chicken, veggies", checkedAt: "Checked 12 days ago", hasAlert: false },
      { id: "h13", title: "Cheese", ingredients: "milk, salt", checkedAt: "Checked 13 days ago", hasAlert: true, matched: ["Milk"] },
      { id: "h14", title: "Hummus", ingredients: "chickpeas, tahini, lemon", checkedAt: "Checked 14 days ago", hasAlert: false },
      { id: "h15", title: "Pancakes", ingredients: "wheat, milk, eggs", checkedAt: "Checked 15 days ago", hasAlert: true, matched: ["Gluten", "Milk", "Eggs"] },
    ];

    if (ingredients.trim() || photoUri) {
      items.unshift({
        id: "latest",
        title: "Latest Scan (current)",
        ingredients: ingredients.trim() || "(no ingredients)",
        checkedAt: "Checked just now",
        hasAlert,
        matched: hasAlert ? found : [],
      });
      return items.slice(0, 15);
    }

    return items.slice(0, 15);
  }, [ingredients, photoUri, hasAlert, found]);

  function goToHistory(itemId: string) {
    router.push({ pathname: "/(tabs)/history", params: { id: itemId } });
  }

  return (
    <View style={[styles.page, isWeb && styles.pageWeb]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ✅ shell igual Scan/History */}
      <View style={[styles.shell, isWeb && [styles.shellWeb, { width: shellW }]]}>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.headerRow}>
              <Pressable
                onPress={() => router.replace("/(tabs)/scan")}
                style={styles.backBtn}
                hitSlop={10}
              >
                <Text style={styles.backText}>‹</Text>
              </Pressable>

              <Text style={styles.headerTitle}>Allergens check</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Foto + resumo */}
            <View style={styles.productCard}>
              <Image
                source={photoUri ? { uri: photoUri } : PLACEHOLDER}
                style={styles.productImg}
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.productTitle}>Received payload</Text>
                <Text style={styles.productSub} numberOfLines={2}>
                  {ingredients || "No ingredients typed"}
                </Text>
                <Text style={styles.productMeta}>
                  TRUE Allergens:{" "}
                  {selectedAllergens.length ? selectedAllergens.join(", ") : "None"}
                </Text>
              </View>
            </View>

            {/* Alerta */}
            <Text style={styles.sectionTitle}>Allergens</Text>

            <View style={[styles.alertCard, hasAlert ? styles.alertDanger : styles.alertSafe]}>
              <Text style={styles.alertTitle}>
                {hasAlert ? "Allergen Alert" : "No allergen detected"}
              </Text>
              <Text style={styles.alertText}>
                {hasAlert
                  ? `Matched: ${found.join(", ")}`
                  : "No matches based on your selected allergens (placeholder check)."}
              </Text>
            </View>

            {/* Debug */}
            <View style={styles.debugCard}>
              <Text style={styles.debugTitle}>Debug (integration)</Text>

              <Text style={styles.debugLabel}>Ingredients:</Text>
              <Text style={styles.debugValue}>{ingredients || "-"}</Text>

              <Text style={styles.debugLabel}>Selected TRUE Allergens:</Text>
              <Text style={styles.debugValue}>
                {selectedAllergens.length ? selectedAllergens.join(", ") : "-"}
              </Text>

              <Text style={styles.debugLabel}>AI response (placeholder):</Text>
              <Text style={styles.debugValue}>-</Text>
            </View>

            {/* Lista */}
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
                        <Text style={styles.rowTitle} numberOfLines={1}>
                          {item.title}
                        </Text>

                        <Text style={styles.rowSub} numberOfLines={1}>
                          {item.checkedAt}
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

  // ✅ mesmo comportamento do Scan/History no web
  pageWeb: { padding: 16, alignItems: "center", justifyContent: "center" },

  // ✅ shell/container do app
  shell: { flex: 1, width: "100%", backgroundColor: "#0b0f12" },
  shellWeb: {
    height: "100%",
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "#0b0f12",
  },

  // ✅ padding padrão
  scroll: { padding: 16, paddingBottom: 24 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
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
  alertDanger: {
    backgroundColor: "rgba(255,77,77,0.10)",
    borderColor: "rgba(255,77,77,0.35)",
  },
  alertSafe: {
    backgroundColor: "rgba(74,182,37,0.10)",
    borderColor: "rgba(74,182,37,0.35)",
  },
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

  listHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 4,
    marginBottom: 10,
  },
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

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },
  rowIcon: { width: 34, height: 34, borderRadius: 10, resizeMode: "cover" },
  rowTitle: { color: "#fff", fontWeight: "900", fontSize: 12.5 },
  rowSub: { color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 2 },
  rowMatched: { color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 3 },
  rowOk: {
    color: "rgba(74,182,37,0.95)",
    fontSize: 11,
    marginTop: 3,
    fontWeight: "800",
  },

  arrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowBtnHover: { backgroundColor: "rgba(74,182,37,0.25)" },

  btn: {
    alignSelf: "center",
    width: "78%",
    backgroundColor: "#4AB625",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 6,
  },
  btnText: { color: "#fff", fontWeight: "900", fontSize: 13 },
});
