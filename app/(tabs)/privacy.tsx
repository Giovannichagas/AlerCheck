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
    "Guarda tus preferencias de alergias y restricciones alimentarias.",
    "Procesa tus datos para identificar la compatibilidad de los productos.",
    "Utiliza los alérgenos que hayas seleccionado para generar advertencias sobre los ingredientes.",
    "Mejora los resultados del escaneo y reduce los falsos positivos con el tiempo.",
    "Almacena el historial reciente de escaneos de forma local (el comportamiento del prototipo puede reiniciarse al reiniciar).",
  ];

  const securityBullets = [
    "Aplicamos prácticas de seguridad estándar para proteger la información almacenada.",
    "Ningún sistema es completamente seguro; evita enviar datos personales sensibles.",
    "Si se habilitan servicios de terceros (IA/analítica), los datos podrán procesarse únicamente para la funcionalidad solicitada.",
    "Puedes eliminar una foto antes de enviar un escaneo y modificar tus preferencias en cualquier momento.",
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

              <Text style={styles.title}>Política de privacidad de Allergen Scanner</Text>
              <Text style={styles.subtitle}>
                Tómate un momento para revisar nuestra política de privacidad y garantizar una experiencia segura y confidencial con Allergen Scanner.
              </Text>
            </View>

            {/* ✅ UM ÚNICO CARD (agora ocupa o shell, igual Scan/History) */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Recopilación y uso de datos</Text>
              <Text style={styles.cardText}>
                Target Allergen Scanner te ayuda a comprar de forma más inteligente utilizando tus preferencias de alérgenos y restricciones alimentarias para ofrecer escaneos de productos personalizados, advertencias sobre ingredientes y sugerencias adaptadas, garantizando decisiones de compra más seguras y mejor informadas en todo momento.
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

              <Text style={styles.cardTitle}>Seguridad de los datos</Text>
              <Text style={styles.cardText}>
                Your privacy matters to us. We aim to protect your information and reduce
                Tu privacidad es importante para nosotros. Nuestro objetivo es proteger tu información y reducir el acceso no autorizado, para que puedas utilizar nuestros servicios con confianza y tranquilidad.
En un entorno de producción, esta política debería explicar claramente los plazos de conservación, los procedimientos de eliminación y cualquier procesador externo implicado (IA/analítica)
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
                Si tienes preguntas, añade aquí tu contacto oficial de soporte antes de publicar la aplicación (por ejemplo, una dirección de correo electrónico de soporte o un sitio web).
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
                <Text style={styles.agreeText}>Acepto la Política de privacidad</Text>
              </Pressable>

              <View style={styles.buttonsRow}>
                <Pressable style={[styles.btn, styles.btnCancel]} onPress={goToIndex}>
                  <Text style={styles.btnCancelText}>Cancelar</Text>
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
