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

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../app/services/firebase";

// images
const LOGO = require("../../assets/images/logo.jpeg");
const ICON_GOOGLE = require("../../assets/images/google.jpg");
const ICON_APPLE = require("../../assets/images/apple.jpg");
const ICON_FACEBOOK = require("../../assets/images/facebook.jpg");


export default function SignInScreen() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  const PHONE_MAX_W = 420;
  const PHONE_MAX_H = 920;

  const phoneW = isWeb ? Math.min(width, PHONE_MAX_W) : width;
  const phoneH = isWeb ? Math.min(height, PHONE_MAX_H) : height;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔐 LOGIN
  const onSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha email e senha");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      console.log("USER LOGGED:", userCredential.user);

      Alert.alert("Bem-vindo!", userCredential.user.email || "");

      // 👉 home = app/(tabs)/index.tsx
      router.replace("/(tabs)");
    } catch (error: any) {
      console.log("LOGIN ERROR:", error);
      Alert.alert("Erro ao entrar", error.message);
    } finally {
      setLoading(false);
    }
  };

  const onSocial = (provider: string) => {
    Alert.alert("Login social", provider);
  };

  const onForgotPassword = () => {
    Alert.alert("Recuperar senha", "Funcionalidade em breve");
  };

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
            {/* BACK */}
            <View style={styles.topRow}>
              <Pressable onPress={() => router.back()} style={styles.backBtn}>
                <Text style={styles.backText}>‹</Text>
              </Pressable>
            </View>

            {/* LOGO */}
            <View style={styles.header}>
              <Image source={LOGO} style={styles.logo} />
            </View>

            <Text style={styles.title}>Faça login na sua conta</Text>

            {/* FORM */}
            <View style={styles.form}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
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

              {/* BOTTOM */}
              <View style={styles.bottomArea}>
                <Pressable
                  style={[
                    styles.primaryBtn,
                    loading && { opacity: 0.6 },
                  ]}
                  onPress={onSignIn}
                  disabled={loading}
                >
                  <Text style={styles.primaryBtnText}>
                    {loading ? "Entrando..." : "Entrar"}
                  </Text>
                </Pressable>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Entrar com</Text>
                  <View style={styles.dividerLine} />
                </View>

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

// 🎨 STYLES
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
    backgroundColor: "#171A1F",
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 28,
  },
  topRow: { height: 40, justifyContent: "center" },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  backText: { color: "#fff", fontSize: 28 },
  header: { alignItems: "center", marginBottom: 16 },
  logo: { width: 100, height: 92, resizeMode: "contain" },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 18,
  },
  form: { flex: 1 },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1.4,
    borderColor: "#4AB625",
    paddingHorizontal: 14,
    color: "#fff",
    marginBottom: 12,
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  forgotWrap: { alignSelf: "flex-end", marginBottom: 18 },
  forgot: { color: "#4AB625", fontWeight: "700", fontSize: 12 },
  bottomArea: { marginTop: "auto" },
  primaryBtn: {
    backgroundColor: "#4AB625",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "900" },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.18)" },
  dividerText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "700",
  },
  socialRow: { flexDirection: "row", justifyContent: "center", gap: 18 },
  socialBtn: {
    width: 58,
    height: 58,
    borderRadius: 999,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    resizeMode: "cover",
  },
});
