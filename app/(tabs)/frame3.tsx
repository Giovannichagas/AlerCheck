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
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  // “Moldura de celular” no web (pra ficar igual ao mobile)
  const PHONE_MAX_W = 420;
  const PHONE_MAX_H = 920;

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
          {/* Escurece a parte de baixo (igual mock) */}
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.92)"]}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Indicadores (bolinhas) */}
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

          {/* Card inferior */}
          <View style={styles.card}>
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
                  // exemplo: ir para a tela de privacidade
                  router.push("/signin");
                }}
              >
                <Text style={styles.primaryBtnText}>Comece agora</Text>
              </Pressable>

              <Pressable
                style={styles.secondaryBtn}
                onPress={() => {
                  router.push("/signup"); // sua rota de cadastro
                }}
              >
                <Text style={styles.secondaryBtnText}>Create an Account</Text>
            </Pressable>

            <Text style={styles.legal}>
              Ao continuar, você concorda com nossos Termos de Serviço{"\n"}e
              Política de Privacidade.
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
  // Fundo do site (web) ou tela (mobile)
  page: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },

  // No mobile, ocupa tudo. No web, vira o “frame do celular”
  phoneFrame: {
    flex: 1,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    backgroundColor: "#000",
  },

  // Imagem precisa ocupar 100% do container
  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
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
    backgroundColor: "rgba(46, 204, 113, 0.35)",
  },
  dotActive: {
    backgroundColor: "rgba(46, 204, 113, 1)",
  },

  card: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 22,
    backgroundColor: "rgba(18, 26, 33, 0.92)",
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 18,
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
    color: "#2ecc71",
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
    color: "#2ecc71",
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
    backgroundColor: "#2ecc71",
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

  legal: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10.5,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 14,
  },
  secondaryBtn: {
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#2ecc71",
    backgroundColor: "transparent",
  },

  secondaryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
});
