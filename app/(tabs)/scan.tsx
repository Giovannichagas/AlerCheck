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
  { id: "cacahuete", label: "Cacahuete", enabled: true },
  { id: "nueces", label: "Nueces", enabled: true },
  { id: "leche", label: "Leche", enabled: false },
  { id: "huevos", label: "Huevos", enabled: false },
  { id: "gluten", label: "Gluten", enabled: true },
  { id: "soja", label: "Soja", enabled: false },
  { id: "pescado", label: "Pescado", enabled: false },
  { id: "marisco", label: "Marisco", enabled: false },
];

type ScanParams = {
  photoUri?: string;
};

function normalizeIngredients(raw: string) {
  // aceita: vírgula, ponto e vírgula e quebra de linha
  // transforma em "item1, item2, item3"
  return raw
    .split(/[,;\n]+/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");
}

export default function ScanScreen() {
  const { photoUri: photoUriParam } = useLocalSearchParams<ScanParams>();

  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  const APP_MAX_W = 920;
  const shellW = isWeb ? Math.min(width - 32, APP_MAX_W) : "100%";

  const [ingredients, setIngredients] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [allergens, setAllergens] = useState<Allergen[]>(INITIAL_ALLERGENS);

  useEffect(() => {
    setIngredients("");
    setPhotoUri(null);
    setSearch("");
    setAllergens(INITIAL_ALLERGENS);
  }, []);

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
    const normalized = normalizeIngredients(ingredients);

    const selectedAllergens = allergens
      .filter((a) => a.enabled)
      .map((a) => a.label);

    if (!normalized && !photoUri) {
      Alert.alert("Aviso", "Introduce los ingredientes o haz una foto antes de enviar.");
      return;
    }

    router.push({
      pathname: "/(tabs)/scanResult",
      params: {
        ingredients: encodeURIComponent(normalized),
        allergens: encodeURIComponent(selectedAllergens.join(",")),
        photoUri: encodeURIComponent(photoUri ?? ""),
      },
    });
  }

  return (
    <View style={[styles.page, isWeb && styles.pageWeb]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.shell, isWeb && [styles.shellWeb, { width: shellW }]]}>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.headerRow}>
              <Image source={LOGO} style={styles.brandLogo} />

              <View style={styles.headerCenter}>
                <Text style={styles.h1}>Escáner de alérgenos seleccionados</Text>
                <Text style={styles.sub}>Protege tu salud escaneando los productos para detectar alérgenos</Text>
              </View>

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

            <View style={styles.scanCard}>
              <View style={styles.scanIconWrap}>
                <Ionicons name="camera-outline" size={22} color="#fff" />
              </View>

              <Text style={styles.scanTitle}>Escanear producto</Text>
              <Text style={styles.scanHint}>Apunta la cámara al código</Text>

              <Pressable style={styles.scanBtn} onPress={() => router.push("/(tabs)/camera")}>
                <Ionicons name="camera-outline" size={16} color="#4AB625" />
                <Text style={styles.scanBtnText}>Comenzar a escanear</Text>
              </Pressable>

              {photoUri ? (
                <View style={styles.photoPreviewBox}>
                  <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.photoLabel}>Foto agregada</Text>
                    <Pressable onPress={() => setPhotoUri(null)} hitSlop={10}>
                      <Text style={styles.photoRemove}>Quitar foto</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Describe los ingredientes para que la IA los procese.</Text>
              <TextInput
                value={ingredients}
                onChangeText={setIngredients}
                placeholder="Ej.: arroz, frijoles; pollo (lee comas, ; y saltos de línea)"
                placeholderTextColor="rgba(255,255,255,0.45)"
                style={styles.textArea}
                multiline
                textAlignVertical="top"
              />

              <Pressable style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={styles.submitBtnText}>Enviar formulario</Text>
              </Pressable>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Allergens</Text>
              <Text style={styles.help}>
                Selecciona los alérgenos para recibir alertas.
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

  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 12 },
  brandLogo: { width: 58, height: 58, borderRadius: 8, resizeMode: "cover" },
  headerCenter: { flex: 1, alignItems: "center" },
  h1: { color: "#ffffff", fontSize: 16, fontWeight: "900", textAlign: "center" },
  sub: { color: "rgba(255,255,255,0.55)", textAlign: "center", marginTop: 4, fontSize: 11.5 },
  headerIcons: { flexDirection: "row", gap: 10, minWidth: 110, justifyContent: "flex-end" },
  smallCircle: { width: 30, height: 30, borderRadius: 999, backgroundColor: "#FFF", alignItems: "center", justifyContent: "center" },

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
  scanIconWrap: { width: 52, height: 52, borderRadius: 999, backgroundColor: "#4AB625", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  scanTitle: { color: "#fff", fontSize: 16, fontWeight: "900", marginBottom: 4 },
  scanHint: { color: "rgba(255,255,255,0.9)", fontSize: 11, marginBottom: 12 },
  scanBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFF", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999 },
  scanBtnText: { color: "#4AB625", fontWeight: "900", fontSize: 12 },

  photoPreviewBox: { marginTop: 14, width: "100%", backgroundColor: "rgba(0,0,0,0.18)", borderRadius: 14, padding: 10, flexDirection: "row", gap: 10, alignItems: "center" },
  photoPreview: { width: 54, height: 54, borderRadius: 12, resizeMode: "cover" },
  photoLabel: { color: "#fff", fontWeight: "900", fontSize: 12, marginBottom: 2 },
  photoRemove: { color: "rgba(255,255,255,0.85)", textDecorationLine: "underline", fontSize: 11, fontWeight: "700" },

  card: { alignSelf: "stretch", borderRadius: 14, padding: 14, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 12 },
  sectionTitle: { color: "#fff", fontWeight: "900", fontSize: 13, marginBottom: 10 },

  textArea: { width: "100%", borderWidth: 1, borderColor: "#4AB625", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: "#fff", backgroundColor: "#0f151a", fontSize: 12.5, minHeight: 110 },

  submitBtn: { marginTop: 12, backgroundColor: "#4AB625", borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  submitBtnText: { color: "#fff", fontWeight: "900", fontSize: 13 },

  help: { color: "rgba(255,255,255,0.55)", fontSize: 11, lineHeight: 16, marginBottom: 10 },

  searchBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#0f151a", borderWidth: 1, borderColor: "#4AB625", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  searchInput: { flex: 1, color: "#fff", fontSize: 12.5 },

  itemRow: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 10 },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", alignItems: "center", justifyContent: "center" },
  itemText: { color: "#fff", fontWeight: "800", fontSize: 12.5 },
});
