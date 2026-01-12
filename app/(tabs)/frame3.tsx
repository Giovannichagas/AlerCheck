import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import React from "react";
import {
  Image,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BG = require("../../assets/images/meanImage.jpeg");
const LOGO = require("../../assets/images/logo.jpeg");

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  // ✅ mesmo “tamanho/shell” do Scan/History
  const APP_MAX_W = 920;
  const shellW = isWeb ? Math.min(width - 32, APP_MAX_W) : "100%";

  return (
    <View style={[styles.page, isWeb && styles.pageWeb]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ✅ shell igual Scan/History */}
      <View style={[styles.shell, isWeb && [styles.shellWeb, { width: shellW }]]}>
        <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.92)"]}
            style={StyleSheet.absoluteFillObject}
          />

          <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
            {/* ✅ scroll para telas baixas (continua com card “em baixo”) */}
            <ScrollView
              contentContainerStyle={styles.scroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Top (dots) */}
              <View style={styles.topArea}>
                <View style={styles.dots}>
                  <View style={[styles.dot, styles.dotActive]} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              </View>

              {/* Card inferior (agora ocupa a largura do app como Scan/History) */}
              <View style={styles.card}>
                <Image source={LOGO} style={styles.logo} />

                <Text style={styles.welcome}>Bienvenido(a) a</Text>

                <Text style={styles.title}>
                  Verificación de <Text style={styles.titleAccent}>alérgenos</Text>
                </Text>

                <Text style={styles.subtitle}>
                  Escanea productos al instante para comprobar la presencia de alérgenos y tomar decisiones de compra más conscientes.
                </Text>

                <View style={styles.list}>
                  <Feature text="Lectura rápida de códigos de barras" />
                  <Feature text="Detección de alérgenos." />
                  <Feature text="Preferências personalizadas" />
                  <Feature text="Seguimiento del historial de escaneos" />
                </View>

                <Pressable
                  style={styles.primaryBtn}
                  onPress={() => router.push("/signin")}
                >
                  <Text style={styles.primaryBtnText}>Comienza ahora</Text>
                </Pressable>

                <Pressable
                  style={styles.secondaryBtn}
                  onPress={() => router.push("/signup")}
                >
                  <Text style={styles.secondaryBtnText}>Crear una cuenta</Text>
                </Pressable>

                <Text style={styles.legal}>
                  Al continuar, aceptas nuestros Términos de Servicio
                    y la Política de Privacidad.
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
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

  bg: { flex: 1, width: "100%", height: "100%" },

  // ✅ mantém dots no topo e card em baixo; com scroll se precisar
  scroll: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 24,
    justifyContent: "space-between",
  },

  topArea: {
    alignItems: "center",
    paddingTop: 6,
  },

  dots: {
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

  // ✅ card agora “stretch” igual Scan/History (nada de width 640 / position absolute)
  card: {
    alignSelf: "stretch",
    backgroundColor: "#171A1F",
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 18,
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
  titleAccent: { color: "#4AB625" },

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
