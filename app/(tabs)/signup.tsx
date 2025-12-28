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

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../app/services/firebase"; // Firebase config

const LOGO = require("../../assets/images/logo.jpeg");
const ICON_GOOGLE = require("../../assets/images/google.jpg");
const ICON_APPLE = require("../../assets/images/apple.jpg");
const ICON_FACEBOOK = require("../../assets/images/facebook.jpg");

export default function SignUpScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  // ✅ Responsivo: não estica infinito no web
  const CONTENT_MAX_W = 520;
  const contentW = Math.max(320, Math.min(width - 36, CONTENT_MAX_W));

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");

  const onCreateAccount = async () => {
    if (!firstName || !lastName || !email || !pass || !confirm) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }
    if (pass !== confirm) {
      Alert.alert("Atenção", "As senhas não coincidem.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      Alert.alert("Conta criada!", `Bem-vindo ${user.email}`);
      router.push("../app/(tabs)/index"); // ✅ mantém sua rota
    } catch (error: any) {
      Alert.alert("Erro ao criar conta", error.message);
    }
  };

  const onSocial = (provider: string) => {
    Alert.alert("Login social", `Clicou em: ${provider}`);
  };

  return (
    <View style={styles.page}>
      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ✅ Wrapper responsivo (mantém layout; só limita largura no web) */}
          <View style={[styles.contentWrap, isWeb && { width: contentW, alignSelf: "center" }]}>
            <View style={styles.topRow}>
              <Pressable onPress={() => router.replace("/(tabs)/frame3")} style={styles.backBtn}>
                <Text style={styles.backText}>‹</Text>
              </Pressable>
            </View>

            <View style={styles.header}>
              <Image source={LOGO} style={styles.logo} />
              <Text style={styles.screenTitle}>Sign Up</Text>
            </View>

            <View style={styles.form}>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First Name"
                placeholderTextColor="rgba(255,255,255,0.35)"
                style={styles.input}
              />
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last Name"
                placeholderTextColor="rgba(255,255,255,0.35)"
                style={styles.input}
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email ID"
                placeholderTextColor="rgba(255,255,255,0.35)"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
              <TextInput
                value={pass}
                onChangeText={setPass}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.35)"
                secureTextEntry
                style={styles.input}
              />
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Confirm Password"
                placeholderTextColor="rgba(255,255,255,0.35)"
                secureTextEntry
                style={styles.input}
              />

              <View style={styles.bottomArea}>
                <Pressable style={styles.primaryBtn} onPress={onCreateAccount}>
                  <Text style={styles.primaryBtnText}>Create Account</Text>
                </Pressable>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Sign in with</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialRow}>
                  <SocialIcon icon={ICON_GOOGLE} onPress={() => onSocial("Google")} />
                  <SocialIcon icon={ICON_APPLE} onPress={() => onSocial("Apple")} />
                  <SocialIcon icon={ICON_FACEBOOK} onPress={() => onSocial("Facebook")} />
                </View>
              </View>
            </View>
          </View>

          <View style={{ height: 28 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function SocialIcon({ icon, onPress }: { icon: any; onPress: () => void }) {
  return (
    <Pressable style={styles.socialBtn} onPress={onPress}>
      <Image source={icon} style={styles.socialIcon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // ✅ padrão igual às telas responsivas
  page: { flex: 1, backgroundColor: "#0b0f12" },

  scroll: { flexGrow: 1, padding: 16, paddingBottom: 24 },

  // ✅ container interno: mantém layout, só limita largura no web
  contentWrap: {
    flex: 1,
    backgroundColor: "#171A1F",
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  topRow: { height: 40, justifyContent: "center" },
  backBtn: { width: 40, height: 40, borderRadius: 999, justifyContent: "center", alignItems: "center" },
  backText: { color: "#fff", fontSize: 28, marginTop: -2 },

  header: { alignItems: "center", marginTop: 8, marginBottom: 18 },
  logo: { width: 92, height: 92, resizeMode: "contain", marginBottom: 10 },
  screenTitle: { color: "#fff", fontSize: 16, fontWeight: "800", marginTop: 10 },

  form: { flex: 1, marginTop: 6 },

  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1.4,
    borderColor: "#4AB625",
    paddingHorizontal: 14,
    color: "#fff",
    marginBottom: 12,
    backgroundColor: "#171A1F",
  },

  bottomArea: { marginTop: "auto", paddingTop: 8, paddingBottom: 6 },

  primaryBtn: {
    backgroundColor: "#4AB625",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "900" },

  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.18)" },
  dividerText: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "700" },

  socialRow: { flexDirection: "row", justifyContent: "center", gap: 18 },
  socialBtn: {
    width: 58,
    height: 58,
    borderRadius: 999,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: { width: 42, height: 42, borderRadius: 999, resizeMode: "cover" },
});
