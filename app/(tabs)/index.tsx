import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import React from "react";
import {
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BG = require("../../assets/images/frame1.jpeg");

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  // ✅ mesmo “tamanho”/shell do Scan
  const APP_MAX_W = 920;
  const shellW = isWeb ? Math.min(width - 32, APP_MAX_W) : "100%";

  return (
    <View style={[styles.page, isWeb && styles.pageWeb]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ✅ shell igual Scan/History */}
      <View style={[styles.shell, isWeb && [styles.shellWeb, { width: shellW }]]}>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
            {/* Overlay para contraste */}
            <LinearGradient
              colors={[
                "rgba(0,0,0,0.25)",
                "rgba(0,0,0,0.35)",
                "rgba(0,0,0,0.92)",
              ]}
              style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.scrollLike}>
              {/* Top area (dots + título) */}
              <View style={styles.topArea}>
                <View style={styles.dots}>
                  <View style={[styles.dot, styles.dotActive]} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>

                <Text style={styles.heroTitle}>
                  Allergens <Text style={styles.heroGreen}>check</Text>
                </Text>

                <Text style={styles.heroSub}>
                  Scan products instantly to check for allergens{"\n"}
                  and make informed shopping decisions.
                </Text>
              </View>

              {/* Card inferior */}
              <View style={styles.card}>
                <Text style={styles.welcome}>Welcome to</Text>

                <Text style={styles.title}>
                  Allergens <Text style={styles.titleGreen}>check</Text>
                </Text>

                <Text style={styles.subtitle}>
                  Scan products instantly to check for allergens{"\n"}
                  and make informed shopping decisions.
                </Text>

                <View style={styles.list}>
                  <Feature text="Quick Barcode Scanning" />
                  <Feature text="Allergen Detection" />
                  <Feature text="Personalized Preferences" />
                  <Feature text="Scan History Tracking" />
                </View>

                <Pressable
                  style={styles.primaryBtn}
                  onPress={() => router.push("/privacy")}
                >
                  <Text style={styles.primaryBtnText}>Get Started</Text>
                </Pressable>

                <Text style={styles.legal}>
                  By continuing, you agree to our Terms of Service{"\n"}
                  and Privacy Policy
                </Text>
              </View>
            </View>
          </ImageBackground>
        </SafeAreaView>
      </View>
    </View>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.check}>✓</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0b0f12" },

  // ✅ mesmo comportamento do Scan no web
  pageWeb: { padding: 16, alignItems: "center", justifyContent: "center" },

  // ✅ shell/container do app (igual Scan)
  shell: { flex: 1, width: "100%", backgroundColor: "#0b0f12" },
  shellWeb: {
    height: "100%",
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "#0b0f12",
  },

  bg: { flex: 1, width: "100%", height: "100%" },

  // ✅ container com padding igual padrão
  scrollLike: {
    flex: 1,
    padding: 16,
    paddingBottom: 24,
    justifyContent: "space-between",
  },

  topArea: { paddingTop: 8, alignItems: "center" },

  dots: {
    flexDirection: "row",
    gap: 8,
    opacity: 0.95,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  dotActive: { backgroundColor: "#4AB625" },

  heroTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 2,
  },
  heroGreen: { color: "#4AB625" },

  heroSub: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 12.5,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
  },

  card: {
    alignSelf: "stretch",
    backgroundColor: "rgba(11,15,18,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
  },

  welcome: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "800",
    marginBottom: 6,
  },

  title: {
    color: "#fff",
    fontSize: 26,
    textAlign: "center",
    fontWeight: "900",
    marginBottom: 8,
  },
  titleGreen: { color: "#4AB625" },

  subtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12.5,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 14,
  },

  list: { gap: 10, marginBottom: 16, paddingHorizontal: 8 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  check: {
    color: "#4AB625",
    fontSize: 18,
    fontWeight: "900",
    width: 18,
    textAlign: "center",
  },
  featureText: { color: "#fff", fontSize: 13, fontWeight: "800" },

  primaryBtn: {
    backgroundColor: "#4AB625",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  primaryBtnText: { color: "#fff", fontSize: 14, fontWeight: "900" },

  legal: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 10,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 14,
  },
});
