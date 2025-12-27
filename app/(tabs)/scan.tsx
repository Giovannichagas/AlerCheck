import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Allergen = {
  id: string;
  label: string;
  enabled: boolean;
};

const INITIAL_ALLERGENS: Allergen[] = [
  { id: "peanuts", label: "Peanuts", enabled: true },
  { id: "tree_nuts", label: "Tree Nuts", enabled: true },
  { id: "milk", label: "Milk", enabled: false },
  { id: "eggs", label: "Eggs", enabled: false },
  { id: "gluten", label: "Gluten", enabled: true },
  { id: "soy", label: "Soy", enabled: false },
  { id: "fish", label: "Fish", enabled: false },
  { id: "shellfish", label: "Shellfish", enabled: false },
];

export default function ScanScreen() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  // Moldura de celular no web
  const PHONE_MAX_W = 420;
  const PHONE_MAX_H = 920;
  const phoneW = isWeb ? Math.min(width, PHONE_MAX_W) : width;
  const phoneH = isWeb ? Math.min(height, PHONE_MAX_H) : height;

  const [barcode, setBarcode] = useState("");
  const [search, setSearch] = useState("");
  const [allergens, setAllergens] = useState<Allergen[]>(INITIAL_ALLERGENS);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return allergens;
    return allergens.filter((a) => a.label.toLowerCase().includes(s));
  }, [search, allergens]);

  function toggleAllergen(id: string) {
    setAllergens((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  }

  return (
    <View style={styles.page}>
      <View style={[styles.phoneFrame, isWeb && { width: phoneW, height: phoneH }]}>
        <SafeAreaView style={styles.safe} edges={["top"]}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* HEADER */}
            <View style={styles.headerRow}>
              <View style={styles.brandRow}>
                <View style={styles.brandBadge}>
                  <Text style={styles.brandBadgeText}>A</Text>
                </View>
                <Text style={styles.brandText}>AlerCheck</Text>
              </View>

              <View style={styles.headerIcons}>
                <View style={styles.smallCircle}>
                  <Ionicons name="notifications-outline" size={16} color="#000" />
                </View>
                <View style={styles.smallCircle}>
                  <Ionicons name="person-outline" size={16} color="#000" />
                </View>
              </View>
            </View>

            <Text style={styles.h1}>Target Allergen Scanner</Text>
            <Text style={styles.sub}>Stay Safe by Scanning Products for Allergens</Text>

            {/* CARD VERDE */}
            <View style={styles.scanCard}>
              <View style={styles.scanIconWrap}>
                <Ionicons name="camera-outline" size={22} color="#fff" />
              </View>

              <Text style={styles.scanTitle}>Scan a Product</Text>
              <Text style={styles.scanHint}>Point camera at barcode</Text>

              <Pressable style={styles.scanBtn} onPress={() => router.push("/(tabs)/camera")}>
                <Ionicons name="camera-outline" size={16} color="#4AB625" />
                <Text style={styles.scanBtnText}>Start Scanning</Text>
              </Pressable>
            </View>

            {/* MANUAL BARCODE */}
            <Text style={styles.sectionTitle}>Or enter barcode manually</Text>

            <TextInput
              value={barcode}
              onChangeText={setBarcode}
              placeholder="Enter barcode number"
              placeholderTextColor="rgba(255,255,255,0.45)"
              style={styles.input}
              keyboardType="number-pad"
            />

            <Pressable style={styles.submitBtn} onPress={() => {}}>
              <Text style={styles.submitBtnText}>Submit Barcode</Text>
            </Pressable>

            {/* ALLERGENS */}
            <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Allergens</Text>
            <Text style={styles.help}>
              Select the allergens you want to be alerted about when scanning products.
            </Text>

            <View style={styles.searchBox}>
              <Feather name="search" size={16} color="rgba(255,255,255,0.6)" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search for allergens"
                placeholderTextColor="rgba(255,255,255,0.45)"
                style={styles.searchInput}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")} hitSlop={10}>
                  <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.35)" />
                </Pressable>
              )}
            </View>

            {/* Lista dinâmica (editável!) */}
            {filtered.map((a) => (
              <AllergenItem
                key={a.id}
                label={a.label}
                enabled={a.enabled}
                onToggle={() => toggleAllergen(a.id)}
              />
            ))}

            <View style={{ height: 30 }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </View>
  );
}

function AllergenItem({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable style={styles.itemRow} onPress={onToggle}>
      <View style={styles.itemLeft}>
        <View style={styles.itemIcon}>
          <Text style={{ color: "#fff", fontWeight: "900" }}>{label[0]}</Text>
        </View>
        <Text style={styles.itemText}>{label}</Text>
      </View>

      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: "#2a333b", true: "#4AB625" }}
        thumbColor={enabled ? "#ffffff" : "#ffffff"}
        ios_backgroundColor="#2a333b"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  phoneFrame: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#171A1F",
    overflow: "hidden",
    borderRadius: 22,
  },
  safe: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 30 },

  headerRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#171A1F",
    alignItems: "center",
    justifyContent: "center",
  },
  brandBadgeText: { color: "#4AB625", fontWeight: "900" },
  brandText: { color: "#dce3ea", fontWeight: "800", fontSize: 14 },
  headerIcons: { flexDirection: "row", gap: 10 },
  smallCircle: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },

  h1: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 12,
  },
  sub: {
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    marginTop: 6,
    fontSize: 11.5,
    marginBottom: 14,
  },

  scanCard: {
    backgroundColor: "#4AB625",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
  },
  scanIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: "#4AB625",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  scanTitle: { color: "#fff", fontSize: 16, fontWeight: "900", marginBottom: 4 },
  scanHint: { color: "rgba(255,255,255,0.9)", fontSize: 11, marginBottom: 12 },
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  scanBtnText: { color: "#4AB625", fontWeight: "900", fontSize: 12 },

  sectionTitle: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 10,
    fontSize: 12.5,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#4AB625",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#fff",
    backgroundColor: "#0f151a",
    fontSize: 12.5,
  },
  submitBtn: {
    marginTop: 10,
    backgroundColor: "#4AB625",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitBtnText: { color: "#fff", fontWeight: "900", fontSize: 13 },

  help: { color: "rgba(255,255,255,0.55)", fontSize: 11, lineHeight: 16, marginBottom: 10 },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#0f151a",
    borderWidth: 1,
    borderColor: "#4AB625",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: { flex: 1, color: "#fff", fontSize: 12.5 },

  itemRow: {
    backgroundColor: "#11181e",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#1b252d",
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: { color: "#fff", fontWeight: "700", fontSize: 12.5 },
});
