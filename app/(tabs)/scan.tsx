import { Feather, Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Image,
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

const LOGO = require("../../assets/images/logo.jpeg");

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

type ScanParams = {
  photoUri?: string; // vem da tela camera (opcional)
};

export default function ScanScreen() {
  const { photoUri: photoUriParam } = useLocalSearchParams<ScanParams>();

  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  // ✅ mesmo “tamanho”/shell do History
  const APP_MAX_W = 920;
  const shellW = isWeb ? Math.min(width - 32, APP_MAX_W) : "100%";

  const [ingredients, setIngredients] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [allergens, setAllergens] = useState<Allergen[]>(INITIAL_ALLERGENS);

  // ✅ reset do estado quando a tela monta
  useEffect(() => {
    setIngredients("");
    setPhotoUri(null);
    setSearch("");
    setAllergens(INITIAL_ALLERGENS);
  }, []);

  // ✅ aplica photoUri vindo da camera
  useEffect(() => {
    if (typeof photoUriParam === "string" && photoUriParam.length > 0) {
      setPhotoUri(photoUriParam);
    }
  }, [photoUriParam]);

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

  function handleSubmit() {
    const text = ingredients.trim();
    const selectedAllergens = allergens
      .filter((a) => a.enabled)
      .map((a) => a.label);

    if (!text && !photoUri) {
      Alert.alert(
        "Atenção",
        "Digite os ingredientes ou tire uma foto antes de enviar."
      );
      return;
    }

    const payload = {
      ingredients: text,
      photoUri: photoUri ?? null,
      selectedAllergens,
    };

    router.push({
      pathname: "../../(tabs)/scanResult",
      params: { payload: encodeURIComponent(JSON.stringify(payload)) },
    });
  }

  return (
    <View style={[styles.page, isWeb && styles.pageWeb]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ✅ shell igual History (centralizado no web, ocupa altura toda) */}
      <View style={[styles.shell, isWeb && [styles.shellWeb, { width: shellW }]]}>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {/* HEADER */}
            <View style={styles.headerRow}>
              <Image source={LOGO} style={styles.brandLogo} />

              <View style={styles.headerCenter}>
                <Text style={styles.h1}>Target Allergen Scanner</Text>
                <Text style={styles.sub}>
                  Stay Safe by Scanning Products for Allergens
                </Text>
              </View>

              <View style={styles.headerIcons}>
                
                  <View style={styles.headerIcons}>
                    <Pressable
                      style={styles.smallCircle}
                      onPress={() => router.push("/(tabs)/profile")}
                      hitSlop={10}
                    >
                      <Ionicons name="person-outline" size={16} color="#000" />
                    </Pressable>
                  </View>

              </View>
            </View>

            {/* SCAN CARD */}
            <View style={styles.scanCard}>
              <View style={styles.scanIconWrap}>
                <Ionicons name="camera-outline" size={22} color="#fff" />
              </View>

              <Text style={styles.scanTitle}>Scan a Product</Text>
              <Text style={styles.scanHint}>Point camera at barcode</Text>

              <Pressable
                style={styles.scanBtn}
                onPress={() => router.push("/(tabs)/camera")}
              >
                <Ionicons name="camera-outline" size={16} color="#4AB625" />
                <Text style={styles.scanBtnText}>Start Scanning</Text>
              </Pressable>

              {photoUri ? (
                <View style={styles.photoPreviewBox}>
                  <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.photoLabel}>Photo added</Text>
                    <Pressable onPress={() => setPhotoUri(null)} hitSlop={10}>
                      <Text style={styles.photoRemove}>Remove photo</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </View>

            {/* INGREDIENTS */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Describe ingredients (for AI)</Text>
              <TextInput
                value={ingredients}
                onChangeText={setIngredients}
                placeholder="Type ingredients here (e.g., peanuts, milk, soy...)"
                placeholderTextColor="rgba(255,255,255,0.45)"
                style={styles.textArea}
                multiline
                textAlignVertical="top"
              />

              <Pressable style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={styles.submitBtnText}>Submit</Text>
              </Pressable>
            </View>

            {/* ALLERGENS */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Allergens</Text>
              <Text style={styles.help}>
                Select the allergens you want to be alerted about when scanning products.
              </Text>

              <View style={styles.searchBox}>
                <Feather
                  name="search"
                  size={16}
                  color="rgba(255,255,255,0.6)"
                />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search for allergens"
                  placeholderTextColor="rgba(255,255,255,0.45)"
                  style={styles.searchInput}
                />
                {search.length > 0 && (
                  <Pressable onPress={() => setSearch("")} hitSlop={10}>
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color="rgba(255,255,255,0.35)"
                    />
                  </Pressable>
                )}
              </View>

              {filtered.map((a) => (
                <AllergenItem
                  key={a.id}
                  label={a.label}
                  enabled={a.enabled}
                  onToggle={() => toggleAllergen(a.id)}
                />
              ))}
            </View>

            <View style={{ height: 20 }} />
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
        thumbColor="#ffffff"
        ios_backgroundColor="#2a333b"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0b0f12" },

  // ✅ mesmo comportamento do History no web
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

  // ✅ mantém responsivo e com padding padrão
  scroll: { padding: 16, paddingBottom: 24 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 12,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8, minWidth: 110 },
  brandBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandBadgeText: { color: "#4AB625", fontWeight: "900" },
  brandText: { color: "#dce3ea", fontWeight: "900", fontSize: 14 },

  headerCenter: { flex: 1, alignItems: "center" },
  h1: { color: "#ffffff", fontSize: 16, fontWeight: "900", textAlign: "center" },
  sub: {
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    marginTop: 4,
    fontSize: 11.5,
  },

  headerIcons: { flexDirection: "row", gap: 10, minWidth: 110, justifyContent: "flex-end" },
  smallCircle: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },

  scanCard: {
    alignSelf: "stretch",
    backgroundColor: "#4AB625",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 12,
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

  photoPreviewBox: {
    marginTop: 14,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  photoPreview: { width: 54, height: 54, borderRadius: 12, resizeMode: "cover" },
  photoLabel: { color: "#fff", fontWeight: "900", fontSize: 12, marginBottom: 2 },
  photoRemove: {
    color: "rgba(255,255,255,0.85)",
    textDecorationLine: "underline",
    fontSize: 11,
    fontWeight: "700",
  },

  card: {
    alignSelf: "stretch",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 12,
  },

  sectionTitle: { color: "#fff", fontWeight: "900", fontSize: 13, marginBottom: 10 },

  textArea: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#4AB625",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#fff",
    backgroundColor: "#0f151a",
    fontSize: 12.5,
    minHeight: 110,
  },

  submitBtn: {
    marginTop: 12,
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
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 10,
  },
  brandLogo: {
    width: 58,
    height: 58,
    borderRadius: 8,
    resizeMode: "cover", // ou "contain" se preferir não cortar
  },


  itemLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: { color: "#fff", fontWeight: "800", fontSize: 12.5 },
});
