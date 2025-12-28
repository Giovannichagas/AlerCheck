import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const BG = require("../../assets/images/meanImage.jpeg");
const LOGO = require("../../assets/images/logo.jpeg");

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  // ✅ Responsivo: o card não estica infinito no web
  const CARD_MAX_W = 640;
  const cardW = Math.max(280, Math.min(width - 36, CARD_MAX_W));

  return (
    <View style={styles.page}>
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        {/* Escurece a parte de baixo (igual seu mock) */}
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.92)"]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Overlay para posicionar dots e card */}
        <View style={styles.overlay}>
          {/* Indicadores (bolinhas) */}
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

          {/* Card inferior (mesmo layout, agora responsivo) */}
          <View style={[styles.card, { width: cardW, alignSelf: "center" }]}>
            <Image source={LOGO} style={styles.logo} />

            <Text style={styles.welcome}>Bem-vindo(a) ao</Text>

            <Text style={styles.title}>
              Verificação de <Text style={styles.titleAccent}>alérgenos</Text>
            </Text>

            <Text style={styles.subtitle}>
              Escaneie produtos instantaneamente para verificar a presença de
              alérgenos e tomar decisões de compra mais conscientes.
            </Text>

            <View style={styles.list}>
              <Feature text="Leitura rápida de código de barras" />
              <Feature text="Detecção de Alérgenos" />
              <Feature text="Preferências personalizadas" />
              <Feature text="Rastreamento do histórico de varreduras" />
            </View>

            <Pressable
              style={styles.primaryBtn}
              onPress={() => {
                router.push("/signin");
              }}
            >
              <Text style={styles.primaryBtnText}>Comece agora</Text>
            </Pressable>

            <Pressable
              style={styles.secondaryBtn}
              onPress={() => {
                router.push("/signup");
              }}
            >
              <Text style={styles.secondaryBtnText}>Create an Account</Text>
            </Pressable>

            <Text style={styles.legal}>
              Ao continuar, você concorda com nossos Termos de Serviço{"\n"}e
              Política de Privacidade.
            </Text>
          </View>
        </View>
      </ImageBackground>
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
  // ✅ Agora o web usa tela inteira (igual as outras telas)
  page: {
    flex: 1,
    backgroundColor: "#0b0f12",
  },

  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  overlay: {
    flex: 1,
  },

  dots: {
    position: "absolute",
    top: 16,
    alignSelf: "center",
    flexDirection: "row",
    gap: 8,
    opacity: 0.9,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#4AB625",
    opacity: 0.55,
  },
  dotActive: {
    backgroundColor: "#4AB625",
    opacity: 1,
  },

  card: {
    position: "absolute",
    bottom: 22,
    backgroundColor: "#171A1F",
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 18,

    // ✅ ajuda a ficar com “cara” das outras telas no web
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  logo: {
    width: 46,
    height: 46,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 10,
  },

  welcome: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 4,
    fontWeight: "600",
    opacity: 0.95,
  },

  title: {
    color: "#fff",
    fontSize: 26,
    textAlign: "center",
    fontWeight: "800",
    marginBottom: 8,
  },
  titleAccent: {
    color: "#4AB625",
  },

  subtitle: {
    color: "rgba(255,255,255,0.85)",
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
    fontWeight: "600",
  },

  primaryBtn: {
    backgroundColor: "#4AB625",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },

  secondaryBtn: {
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#4AB625",
    backgroundColor: "transparent",
  },
  secondaryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },

  legal: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10.5,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 14,
  },
});
