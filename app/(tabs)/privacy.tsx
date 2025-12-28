import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Section = {
  title: string;
  content: string[];
};

const SECTIONS: Section[] = [
  {
    title: "Privacy Policy (Preview)",
    content: [
      "This is a UI placeholder policy screen for your app prototype.",
      "When you go live, replace this text with your final legal/privacy content.",
    ],
  },
  {
    title: "What we may collect",
    content: [
      "Ingredients text you type to check allergens.",
      "A photo of a meal/product (only if you choose to take or upload one).",
      "Selected allergens (your preferences).",
      "Basic app diagnostics (crashes/performance), if enabled.",
    ],
  },
  {
    title: "AI processing (future integration)",
    content: [
      "In future versions, your typed ingredients and (optionally) your photo may be sent to an AI service to identify potential allergens.",
      "We’ll only send what is needed to generate the result.",
      "You will be able to use the app without AI features if you prefer (optional).",
    ],
  },
  {
    title: "Sharing & third parties",
    content: [
      "We do not sell your personal data.",
      "If AI is enabled, data may be processed by an external AI provider solely to generate the allergen-check response.",
      "If you later add analytics or crash reporting, you should disclose providers here.",
    ],
  },
  {
    title: "Your choices & rights",
    content: [
      "You can clear app data by restarting the app (in this prototype) or via a future “Reset” button.",
      "You can remove a photo before submitting a scan.",
      "You can change your selected allergens at any time.",
    ],
  },
  {
    title: "Security",
    content: [
      "We aim to protect your data using standard security practices.",
      "No system is 100% secure, but we work to reduce risks.",
    ],
  },
  {
    title: "Contact",
    content: [
      "Add your support email or website here when you publish.",
      "Example: support@yourapp.com",
    ],
  },
];

export default function PrivacyScreen() {
  return (
    <View style={styles.page}>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
              <Text style={styles.backText}>‹</Text>
            </Pressable>

            <Text style={styles.headerTitle}>Privacy</Text>

            <View style={{ width: 40 }} />
          </View>

          {/* Card topo */}
          <View style={styles.topCard}>
            <View style={styles.cardTop}>
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#fff" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Privacy & Terms</Text>
                <Text style={styles.cardSub}>
                  Review how data is used in the prototype (and later with AI).
                </Text>
              </View>
            </View>
          </View>

          {/* Texto completo (tudo na tela) */}
          <View style={styles.sectionCard}>
            {SECTIONS.map((section, sIndex) => (
              <View key={sIndex} style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>{section.title}</Text>

                {section.content.map((p, idx) => (
                  <View key={idx} style={styles.paragraphRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.paragraph}>{p}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* CTA */}
          <Pressable style={styles.primaryBtn} onPress={() => router.replace("/(tabs)/frame3")}>
            <Text style={styles.primaryBtnText}>Continue</Text>
          </Pressable>

          <Text style={styles.legal}>
            Replace this text with your official Privacy Policy before publishing.
          </Text>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0b0f12" },
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
  headerTitle: { color: "#4AB625", fontSize: 16, fontWeight: "900" },

  topCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    marginBottom: 12,
  },
  cardTop: { flexDirection: "row", gap: 12, alignItems: "center" },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(74,182,37,0.25)",
    borderWidth: 1,
    borderColor: "rgba(74,182,37,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { color: "#fff", fontWeight: "900", fontSize: 14 },
  cardSub: { color: "rgba(255,255,255,0.70)", fontSize: 11.5, marginTop: 4, lineHeight: 16 },

  sectionCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    marginBottom: 14,
  },

  sectionBlock: {
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  sectionTitle: { color: "#fff", fontWeight: "900", fontSize: 13, marginBottom: 10 },

  paragraphRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  bullet: { color: "#4AB625", fontWeight: "900", marginTop: 1 },
  paragraph: { color: "rgba(255,255,255,0.78)", fontSize: 12, lineHeight: 18, flex: 1 },

  primaryBtn: {
    backgroundColor: "#4AB625",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
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
