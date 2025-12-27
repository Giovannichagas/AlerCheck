import { router } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GREEN = "#4AB625";

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // “Largura de celular” no Web (mantém igual ao mobile)
  const PHONE_MAX = 420;
  const isWide = width > PHONE_MAX + 40;

  return (
    <View style={styles.page}>
      <View style={[styles.phone, isWide && styles.phoneWeb]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 110 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require("../../assets/images/logo.jpeg")}
            style={styles.logo}
          />

          <Text style={styles.title}>Allergen Scanner Privacy Policy</Text>

          <Text style={styles.paragraph}>
            Take a moment to review our privacy policy to ensure a safe and
            personalized experience with the Allergen Scanner.
          </Text>

          <Text style={styles.h2}>Data Collection and Usage</Text>
          <Text style={styles.paragraph}>
            Target’s Allergen Scanner helps you shop smarter by using your
            allergen and dietary preferences to provide tailored product alerts,
            ingredient warnings, and personalized suggestions—ensuring safer,
            more informed shopping decisions every time.
          </Text>

          <View style={styles.bullets}>
            <Text style={styles.bullet}>• Store your allergen and dietary restriction preferences</Text>
            <Text style={styles.bullet}>• Process this data to identify product compatibility</Text>
            <Text style={styles.bullet}>• Associate this data with your Target account</Text>
            <Text style={styles.bullet}>• Use this data to improve Target’s services and product offerings</Text>
          </View>

          <Text style={styles.h2}>Data Security</Text>
          <Text style={styles.paragraph}>
            Your privacy matters to us. Target securely stores your information
            and processes it using advanced data protection practices to ensure
            your safety. We maintain confidentiality and prevent unauthorized
            access, so you can use our services with confidence and peace of
            mind.
          </Text>
        </ScrollView>

        {/* Barra fixa de botões (igual mobile) */}
        <View style={[styles.actions, { paddingBottom: 12 + insets.bottom }]}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.btn,
              styles.btnGhost,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.btnGhostText}>Cancel</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(tabs)/frame3")}
            style={({ pressed }) => [
              styles.btn,
              styles.btnPrimary,
              { opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Text style={styles.btnPrimaryText}>Accept & Continue</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#171A1F",
    alignItems: "center",
  },

  // “Corpo do celular”
  phone: {
    flex: 1,
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#171A1F",
  },

  // No web (tela larga), dá aparência de “telefone”
  phoneWeb: {
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  logo: {
    width: 54,
    height: 54,
    borderRadius: 12,
    alignSelf: "center",
    marginBottom: 12,
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },

  h2: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 14,
    marginBottom: 6,
  },

  paragraph: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12.5,
    lineHeight: 18,
  },

  bullets: {
    marginTop: 8,
    gap: 6,
  },
  bullet: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12.5,
    lineHeight: 18,
  },

  actions: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 10,
    backgroundColor: "171A1F",
    flexDirection: "row",
    gap: 12,
  },

  btn: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  btnGhost: {
    backgroundColor: "#4AB625",
  },
  btnGhostText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },

  btnPrimary: {
    backgroundColor: "#4AB625",
  },
  btnPrimaryText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 13,
  },
});
