import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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

const BG = require("../../assets/images/frame1.jpeg");

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  // “Moldura de celular” no navegador pra ficar igual ao mobile
  const PHONE_MAX_W = 420;
  const PHONE_MAX_H = 900;

  const phoneW = isWeb ? Math.min(width, PHONE_MAX_W) : width;
  const phoneH = isWeb ? Math.min(height, PHONE_MAX_H) : height;

  return (
    <View style={styles.page}>
      <View
        style={[
          styles.phoneFrame,
          isWeb && { width: phoneW, height: phoneH, borderRadius: 26 },
        ]}
      >
        <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
          {/* Escurece embaixo para dar contraste no card */}
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.9)"]}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Dots (indicador de páginas) */}
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
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
            
            <Pressable style={styles.primaryBtn} onPress={() => router.push("/privacy")}>
              <Text style={styles.primaryBtnText}>Get Started</Text>
            </Pressable>

            <Text style={styles.legal}>
              By continuing, you agree to our Terms of Service{"\n"}
              and Privacy Policy
            </Text>
          </View>
        </ImageBackground>
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
  page: {
    flex: 1,
    backgroundColor: "#171A1F",
    alignItems: "center",
    justifyContent: "center",
  },

  phoneFrame: {
    flex: 1,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    backgroundColor: "#171A1F",
  },

  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  dots: {
    position: "absolute",
    top: 210,
    alignSelf: "center",
    flexDirection: "row",
    gap: 8,
    opacity: 0.95,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#4AB625",
  },
  dotActive: {
    backgroundColor: "#4AB625",
  },

  card: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 18,
    backgroundColor: "#171A1F",
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
  },

  welcome: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 6,
  },

  title: {
    color: "#fff",
    fontSize: 26,
    textAlign: "center",
    fontWeight: "900",
    marginBottom: 8,
  },
  titleGreen: {
    color: "#4AB625",
  },

  subtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12.5,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 14,
  },

  list: {
    gap: 10,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  check: {
    color: "#4AB625",
    fontSize: 18,
    fontWeight: "900",
    width: 18,
    textAlign: "center",
  },
  featureText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  primaryBtn: {
    backgroundColor: "#4AB625",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },

  legal: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 10,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 14,
  },
});
