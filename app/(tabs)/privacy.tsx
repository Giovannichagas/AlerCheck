import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
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

const LOGO = require("../../assets/images/logo.jpeg");

export default function PrivacyScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  // ✅ mesmo “tamanho/shell” do Scan/History
  const APP_MAX_W = 920;
  const shellW = isWeb ? Math.min(width - 32, APP_MAX_W) : "100%";

  const [accepted, setAccepted] = useState(false);

  const usageBullets = [
    "Save your allergy and dietary restriction preferences.",
    "Process your data to identify product compatibility.",
    "Use your selected allergens to generate ingredient warnings.",
    "Improve scan results and reduce false positives over time.",
    "Store recent scan history locally (prototype behavior may reset on restart).",
  ];

  const securityBullets = [
    "We apply standard security practices to protect stored information.",
    "No system is completely secure — avoid submitting sensitive personal data.",
    "If third-party services are enabled (AI/analytics), data may be processed only for the requested functionality.",
    "You can remove a photo before submitting a scan and edit your preferences anytime.",
  ];

  function goToIndex() {
    router.replace("/(tabs)");
    // se preferir index explícito:
    // router.replace("/(tabs)/index");
  }

  function acceptAndContinue() {
    if (!accepted) return;
    router.replace("/(tabs)/frame3");
  }

  return (
    <View style={[styles.page, isWeb && styles.pageWeb]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ✅ shell igual Scan/History */}
      <View style={[styles.shell, isWeb && [styles.shellWeb, { width: shellW }]]}>
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.headerRow}>
              {/* ✅ seta discreta (sem círculo) */}
              <Pressable onPress={goToIndex} style={styles.backBtn} hitSlop={10}>
                <Ionicons name="chevron-back" size={22} color="#fff" />
              </Pressable>
              <View style={{ width: 40 }} />
            </View>

            {/* Centro */}
            <View style={styles.centerWrap}>
              <Image source={LOGO} style={styles.logo} />
              <Text style={styles.brand}>AlerCheck</Text>

              <Text style={styles.title}>Allergen Scanner Privacy Policy</Text>
              <Text style={styles.subtitle}>
                Take a moment to review our privacy policy to ensure a safe and confidential
                experience with the Allergen Scanner.
              </Text>
            </View>

            {/* ✅ UM ÚNICO CARD (agora ocupa o shell, igual Scan/History) */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Data Collection and Usage</Text>
              <Text style={styles.cardText}>
                Target Allergen Scanner helps you shop smarter by using your allergen and dietary
                preferences to provide tailored product scans, ingredient warnings, and personalized
                suggestions—ensuring safer, more informed shopping decisions every time.
              </Text>

              <View style={styles.bullets}>
                {usageBullets.map((t, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <View style={styles.dot} />
                    <Text style={styles.bulletText}>{t}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.divider} />

              <Text style={styles.cardTitle}>Data Security</Text>
              <Text style={styles.cardText}>
                Your privacy matters to us. We aim to protect your information and reduce
                unauthorized access, so you can use our services with confidence and peace of mind.
                In production, this policy should clearly explain retention, deletion, and any
                external processors (AI/analytics).
              </Text>

              <View style={styles.bullets}>
                {securityBullets.map((t, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <View style={styles.dot} />
                    <Text style={styles.bulletText}>{t}</Text>
                  </View>
                ))}
              </View>

              <Text style={[styles.cardText, { marginTop: 12 }]}>
                If you have questions, add your official support contact here before going live
                (for example, a support email address or website).
              </Text>
            </View>

            {/* Espaço para não esconder atrás do footer fixo */}
            <View style={{ height: 190 }} />
          </ScrollView>

          {/* Footer fixo (dentro do shell) */}
          <View style={styles.footer}>
            <View style={styles.footerInner}>
              <Pressable
                onPress={() => setAccepted((v) => !v)}
                style={styles.agreeRow}
                hitSlop={10}
              >
                <View style={[styles.checkbox, accepted && styles.checkboxOn]}>
                  {accepted ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
                </View>
                <Text style={styles.agreeText}>I agree to the Privacy Policy</Text>
              </Pressable>

              <View style={styles.buttonsRow}>
                <Pressable style={[styles.btn, styles.btnCancel]} onPress={goToIndex}>
                  <Text style={styles.btnCancelText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={[styles.btn, styles.btnPrimary, !accepted && styles.btnDisabled]}
                  onPress={acceptAndContinue}
                  disabled={!accepted}
                >
                  <Text style={styles.btnPrimaryText}>Accept &amp; Continue</Text>
                </Pressable>
              </View>
            </View>
          </View>
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
    marginBottom: 6,
  },

  // ✅ seta discreta (sem bolinha)
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  centerWrap: {
    alignItems: "center",
    paddingTop: 6,
    paddingBottom: 10,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 12,
    resizeMode: "cover",
    marginBottom: 8,
  },
  brand: { color: "#4AB625", fontWeight: "900", marginBottom: 8 },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 11.5,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 8,
  },

  card: {
    alignSelf: "stretch",
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    marginTop: 12,
  },
  cardTitle: { color: "#fff", fontWeight: "900", fontSize: 13, marginBottom: 8 },
  cardText: { color: "rgba(255,255,255,0.75)", fontSize: 12, lineHeight: 18 },

  bullets: { marginTop: 12, gap: 10 },
  bulletRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },

  // ✅ bullets neutros (cinza)
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.30)",
    marginTop: 6,
  },
  bulletText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 14,
  },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 16,
    paddingHorizontal: 16,
  },
  footerInner: {
    width: "100%",
    gap: 10,
  },

  agreeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: {
    backgroundColor: "rgba(74,182,37,0.45)",
    borderColor: "rgba(74,182,37,0.85)",
  },
  agreeText: { color: "rgba(255,255,255,0.82)", fontSize: 12, fontWeight: "800" },

  // ✅ botões mais responsivos
  buttonsRow: { flexDirection: "row", gap: 12 },
  btn: {
    height: 46,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    flex: 1,
    minWidth: 0,
  },
  btnCancel: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  btnCancelText: { color: "#fff", fontWeight: "900" },

  btnPrimary: { backgroundColor: "#4AB625" },
  btnPrimaryText: { color: "#fff", fontWeight: "900" },
  btnDisabled: { opacity: 0.45 },
});
