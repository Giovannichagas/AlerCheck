import { router, Stack } from "expo-router";
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
import { SafeAreaView } from "react-native-safe-area-context";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../app/services/firebase";

const LOGO = require("../../assets/images/logo.jpeg");
const ICON_GOOGLE = require("../../assets/images/google.jpg");
const ICON_APPLE = require("../../assets/images/apple.jpg");
const ICON_FACEBOOK = require("../../assets/images/facebook.jpg");

export default function SignUpScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  // ✅ mesmo “tamanho/shell” do Scan/History
  const APP_MAX_W = 920;
  const shellW = isWeb ? Math.min(width - 32, APP_MAX_W) : "100%";

  // ✅ mantém o formulário legível dentro do shell
  const CONTENT_MAX_W = 520;
  const contentW = isWeb ? Math.min((shellW as number) - 32, CONTENT_MAX_W) : "100%";

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

      // ✅ mantém sua rota
      router.push("../app/(tabs)/index");
    } catch (error: any) {
      Alert.alert("Erro ao criar conta", error.message);
    }
  };

  const onSocial = (provider: string) => {
    Alert.alert("Login social", `Clicou em: ${provider}`);
  };

  return (
    <View style={[styles.page, isWeb && styles.pageWeb]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ✅ shell igual Scan/History (borda discreta no web) */}
      <View style={[styles.shell, isWeb && [styles.shellWeb, { width: shellW }]]}>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <KeyboardAvoidingView
            style={{ flex: 1, width: "100%" }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* ✅ formulário centralizado no web */}
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
        </SafeAreaView>
      </View>
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
  page: { flex: 1, backgroundColor: "#0b0f12" },

  // ✅ igual Scan/History no web
  pageWeb: { padding: 16, alignItems: "center", justifyContent: "center" },

  // ✅ shell igual Scan/History
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
  scroll: { flexGrow: 1, padding: 16, paddingBottom: 24, justifyContent: "center" },

  // ✅ seu card interno (mantido)
  contentWrap: {
    flex: 1,
    backgroundColor: "#171A1F",
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignSelf: "stretch",
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
