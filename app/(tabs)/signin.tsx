import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";

const LOGO = require("../../assets/images/logo.jpeg");

// seus ícones .jpg
const ICON_GOOGLE = require("../../assets/images/google.jpg");
const ICON_APPLE = require("../../assets/images/apple.jpg");
const ICON_FACEBOOK = require("../../assets/images/facebook.jpg");
const ICON_INSTAGRAM = require("../../assets/images/instagram.jpg");

export default function SignInScreen() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  // moldura para simular celular no navegador
  const PHONE_MAX_W = 420;
  const PHONE_MAX_H = 920;

  const phoneW = isWeb ? Math.min(width, PHONE_MAX_W) : width;
  const phoneH = isWeb ? Math.min(height, PHONE_MAX_H) : height;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function onSignIn() {
    Alert.alert("Entrar", `Email: ${email}`);
  }

  function onSocial(provider: string) {
    Alert.alert("Login social", `Clicou em: ${provider}`);
  }

  function onForgotPassword() {
    Alert.alert("Esqueceu a senha", "Depois criamos a tela de recuperação.");
  }

  return (
    <View style={styles.page}>
      <View
        style={[
          styles.phoneFrame,
          isWeb && { width: phoneW, height: phoneH, borderRadius: 26 },
        ]}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            {/* Voltar */}
            <View style={styles.topRow}>
              <Pressable onPress={() => router.back()} style={styles.backBtn}>
                <Text style={styles.backText}>‹</Text>
              </Pressable>
            </View>

            {/* Logo */}
            <View style={styles.header}>
              <Image source={LOGO} style={styles.logo} />
              <Text style={styles.brand}>AlerCheck</Text>
              <Text style={styles.subtitleHeader}>Alerta</Text>
            </View>

            {/* Título */}
            <Text style={styles.title}>Faça login na sua conta.</Text>

            {/* Inputs */}
            <View style={styles.form}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Endereço de e-mail"
                placeholderTextColor="rgba(255,255,255,0.35)"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Senha"
                placeholderTextColor="rgba(255,255,255,0.35)"
                secureTextEntry
                style={styles.input}
              />

              <Pressable onPress={onForgotPassword} style={styles.forgotWrap}>
                <Text style={styles.forgot}>Esqueceu sua senha?</Text>
              </Pressable>

              {/* Área inferior com botão e redes sociais */}
              <View style={styles.bottomArea}>
                <Pressable style={styles.primaryBtn} onPress={onSignIn}>
                  <Text style={styles.primaryBtnText}>Entrar</Text>
                </Pressable>

                {/* divisor */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Entrar com</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* ícones sociais */}
                <View style={styles.socialRow}>
                  <SocialIcon
                    icon={ICON_GOOGLE}
                    onPress={() => onSocial("Google")}
                  />
                  <SocialIcon
                    icon={ICON_APPLE}
                    onPress={() => onSocial("Apple")}
                  />
                  <SocialIcon
                    icon={ICON_FACEBOOK}
                    onPress={() => onSocial("Facebook")}
                  />
                  <SocialIcon
                    icon={ICON_INSTAGRAM}
                    onPress={() => onSocial("Instagram")}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

function SocialIcon({
  icon,
  onPress,
}: {
  icon: any;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.socialBtn} onPress={onPress}>
      <Image source={icon} style={styles.socialIcon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  phoneFrame: {
    flex: 1,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    backgroundColor: "#0b0f12",
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 28,
  },

  topRow: {
    height: 40,
    justifyContent: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  backText: {
    color: "#fff",
    fontSize: 28,
    marginTop: -2,
  },

  header: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  logo: {
    width: 92,
    height: 92,
    resizeMode: "contain",
    marginBottom: 10,
  },
  brand: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.4,
    opacity: 0.95,
  },
  subtitleHeader: {
    color: "#2ecc71",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 18,
  },

  form: {
    flex: 1,
    marginTop: 6,
  },

  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1.4,
    borderColor: "rgba(46, 204, 113, 0.65)",
    paddingHorizontal: 14,
    color: "#fff",
    marginBottom: 12,
    backgroundColor: "rgba(0,0,0,0.22)",
  },

  forgotWrap: {
    alignSelf: "flex-end",
    marginBottom: 18,
    marginTop: 2,
  },
  forgot: {
    color: "#2ecc71",
    fontWeight: "700",
    fontSize: 12,
  },

  bottomArea: {
    marginTop: "auto",
    paddingBottom: 24,
  },

  primaryBtn: {
    backgroundColor: "#2ecc71",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  dividerText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "700",
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
  },
  socialBtn: {
    width: 58,
    height: 58,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 999, // total redondo
    resizeMode: "cover",
  },
});
