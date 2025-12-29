import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LOGO = require("../../assets/images/logo.jpeg");
const CONTENT_MAX_W = 520;

export default function PrivacyScreen() {
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
    // ✅ normalmente abre a tab index dentro do Tabs
    router.replace("/(tabs)");
    // se seu index for fora do Tabs, troque por:
    // router.replace("/");
  }

  function acceptAndContinue() {
    if (!accepted) return;
    router.replace("/(tabs)/frame3");
  }

  return (
    <View style={styles.page}>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Pressable onPress={goToIndex} style={styles.backBtn} hitSlop={10}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </Pressable>
            <View style={{ width: 42 }} />
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

          {/* ✅ UM ÚNICO CARD */}
          <View style={styles.card}>
            {/* Section 1 */}
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

            {/* Divider */}
            <View style={styles.divider} />

            {/* Section 2 */}
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

          {/* Espaço para não esconder pelo footer */}
          <View style={{ height: 170 }} />
        </ScrollView>

        {/* Footer fixo */}
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
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0b0f12" },
  safe: { flex: 1 },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 10,
    alignItems: "center",
  },

  headerRow: {
    width: "100%",
    maxWidth: CONTENT_MAX_W,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  centerWrap: {
    width: "100%",
    maxWidth: CONTENT_MAX_W,
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
    width: "100%",
    maxWidth: CONTENT_MAX_W,
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
    alignItems: "center",
  },
  footerInner: {
    width: "100%",
    maxWidth: CONTENT_MAX_W,
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

  buttonsRow: { flexDirection: "row", justifyContent: "center", gap: 12 },
  btn: {
    height: 46,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    minWidth: 180,
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
