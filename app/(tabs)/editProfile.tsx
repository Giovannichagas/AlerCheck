import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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

import { signOut, updateEmail, updatePassword } from "firebase/auth";
import { auth, db } from "../../app/services/firebase";

// Firestore
import { doc, getDoc, setDoc } from "firebase/firestore";


const LOGO = require("../../assets/images/logo.jpeg");

// ✅ ajuste para sua rota real
const PROFILE_ROUTE = "/(tabs)/profile";

export default function EditProfileScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const user = auth.currentUser;

  // ✅ mesmo “tamanho”/shell do Scan/History
  const APP_MAX_W = 920;
  const shellW = isWeb ? Math.min(width - 32, APP_MAX_W) : "100%";

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [newPass, setNewPass] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        if (!user?.uid) return;

        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (!mounted) return;

        if (snap.exists()) {
          const data = snap.data() as any;
          setFullName(data.fullName ?? "");
          setPhone(data.phone ?? "");
          setEmail((data.email ?? user.email) ?? "");
        } else {
          setEmail(user.email ?? "");
        }
      } catch (e) {
        console.log("LOAD PROFILE ERROR:", e);
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [user?.uid]);

  const initials = useMemo(() => {
    const n = fullName.trim();
    if (!n) return "U";
    const parts = n.split(" ").filter(Boolean);
    const a = parts[0]?.[0] ?? "U";
    const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (a + b).toUpperCase();
  }, [fullName]);

  function goBackToProfile() {
    router.replace(PROFILE_ROUTE);
  }

  async function onSave() {
    if (!user?.uid) {
      Alert.alert("Erro", "Usuário não autenticado.");
      return;
    }

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      Alert.alert("Atenção", "Preencha nome, email e telefone.");
      return;
    }

    setSaving(true);

    try {
      // 1) Firestore
      const ref = doc(db, "users", user.uid);
      await setDoc(
        ref,
        {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // 2) Auth (email/senha)
      const currentEmail = user.email ?? "";
      const nextEmail = email.trim();

      if (nextEmail && nextEmail !== currentEmail) {
        await updateEmail(user, nextEmail);
      }

      if (newPass.trim().length > 0) {
        if (newPass.trim().length < 6) {
          Alert.alert("Atenção", "A nova senha precisa ter pelo menos 6 caracteres.");
          setSaving(false);
          return;
        }
        await updatePassword(user, newPass.trim());
      }

      Alert.alert("Sucesso", "Dados atualizados! Faça login novamente.");

      // 3) Desloga e manda para SignIn
      await signOut(auth);
      router.replace("/signin");
    } catch (err: any) {
      console.log("SAVE PROFILE ERROR:", err);

      if (String(err?.code).includes("requires-recent-login")) {
        Alert.alert(
          "Atenção",
          "Para atualizar email/senha, o Firebase exige login recente. Faça login novamente."
        );
        await signOut(auth);
        router.replace("/signin");
        return;
      }

      Alert.alert("Erro", err?.message ?? "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.page, isWeb && styles.pageWeb]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ✅ shell igual Scan/History */}
      <View style={[styles.shell, isWeb && [styles.shellWeb, { width: shellW }]]}>
        <KeyboardAvoidingView
          style={{ flex: 1, width: "100%" }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* seta discreta (sem círculo) */}
            <Pressable onPress={goBackToProfile} hitSlop={12} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </Pressable>

            {/* Header */}
            <View style={styles.header}>
              <Image source={LOGO} style={styles.logo} />
              <Text style={styles.appName}>
                Aler<Text style={styles.appNameAccent}>Check</Text>
              </Text>
              <Text style={styles.screenTitle}>Change profile</Text>
            </View>

            {/* Card verde */}
            <View style={styles.greenCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.greenName} numberOfLines={1}>
                  {fullName.trim() || "Your name"}
                </Text>
                <Text style={styles.greenSub} numberOfLines={1}>
                  {email.trim() || "your@email.com"}
                </Text>
              </View>
            </View>

            {/* Inputs */}
            <View style={styles.form}>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full name"
                placeholderTextColor="rgba(255,255,255,0.35)"
                style={styles.input}
              />

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
                value={newPass}
                onChangeText={setNewPass}
                placeholder="New password (optional)"
                placeholderTextColor="rgba(255,255,255,0.35)"
                secureTextEntry
                style={styles.input}
              />

              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone"
                placeholderTextColor="rgba(255,255,255,0.35)"
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>

            {/* Bottom */}
            <View style={styles.bottomArea}>
              <Pressable
                style={[
                  styles.primaryBtn,
                  (saving || loadingProfile) && { opacity: 0.65 },
                ]}
                onPress={onSave}
                disabled={saving || loadingProfile}
              >
                <Text style={styles.primaryBtnText}>
                  {saving ? "Saving..." : "Save changes"}
                </Text>
              </Pressable>

              <Text style={styles.helper}>
                {loadingProfile
                  ? "Loading profile..."
                  : "After saving, you will be redirected to Sign In."}
              </Text>
            </View>

            <View style={{ height: 16 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0b0f12" },

  // ✅ mesmo comportamento do Scan/History no web
  pageWeb: { padding: 16, alignItems: "center", justifyContent: "center" },

  // ✅ shell igual Scan/History
  shell: { flex: 1, width: "100%", backgroundColor: "#171A1F" },
  shellWeb: {
    height: "100%",
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "#171A1F",
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 26,
  },

  backBtn: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 2,
    marginBottom: 8,
  },

  header: { alignItems: "center", marginBottom: 18 },
  logo: { width: 64, height: 64, resizeMode: "contain", marginBottom: 10 },

  appName: { color: "#fff", fontWeight: "900", fontSize: 14, marginBottom: 10 },
  appNameAccent: { color: "#4AB625" },
  screenTitle: { color: "#fff", fontSize: 16, fontWeight: "900" },

  greenCard: {
    backgroundColor: "#4AB625",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 74,
    height: 74,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "900", fontSize: 22 },
  greenName: { color: "#fff", fontWeight: "900", fontSize: 16 },
  greenSub: { color: "rgba(255,255,255,0.92)", marginTop: 4, fontSize: 12 },

  form: { gap: 12 },

  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1.4,
    borderColor: "#4AB625",
    paddingHorizontal: 14,
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.18)",
  },

  bottomArea: { marginTop: 18 },

  primaryBtn: {
    backgroundColor: "#4AB625",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "900" },

  helper: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 10.5,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 14,
  },
});
