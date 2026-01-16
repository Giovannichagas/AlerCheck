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

import {
  onAuthStateChanged,
  signOut,
  updateEmail,
  updatePassword,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../app/services/firebase";

const LOGO = require("../../assets/images/logo.jpeg");
const PROFILE_ROUTE = "/(tabs)/profile";

export default function EditProfileScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  const APP_MAX_W = 920;
  const shellW = isWeb ? Math.min(width - 32, APP_MAX_W) : "100%";

  const [user, setUser] = useState<User | null>(null);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(""); // ✅ não inicia com auth.currentUser
  const [newPass, setNewPass] = useState("");
  const [phone, setPhone] = useState("");

  // ✅ garante user correto (principalmente no WEB)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsub;
  }, []);

  // ✅ carrega Firestore quando o user real existir
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoadingProfile(true);

        if (!user?.uid) {
          // não autenticado
          if (mounted) {
            setFullName("");
            setPhone("");
            setEmail("");
          }
          return;
        }

        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (!mounted) return;

        if (snap.exists()) {
          const data = snap.data() as any;
          setFullName(data.fullName ?? "");
          setPhone(data.phone ?? "");
          setEmail((data.email ?? user.email) ?? "");
        } else {
          // se não existir doc no Firestore, usa o email do auth real
          setFullName("");
          setPhone("");
          setEmail(user.email ?? "");
        }
      } catch (e) {
        console.log("LOAD PROFILE ERROR:", e);
        Alert.alert("Erro", "Falha ao carregar seu perfil.");
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
/////
  async function onSave() {
  if (saving) return;

  if (loadingProfile) {
    Alert.alert("Aguarde", "O perfil ainda está carregando.");
    return;
  }

  if (!user?.uid) {
    Alert.alert("Erro", "Usuário não autenticado.");
    return;
  }

  const fullNameTrim = fullName.trim();
  const emailTrim = email.trim();
  const phoneTrim = phone.trim();
  const passTrim = newPass.trim();

  //if (!fullNameTrim || !emailTrim || !phoneTrim) {
    //Alert.alert("Atenção", "Preencha nome, email e telefone.");
    //return;
  //}

  if (!fullNameTrim || !emailTrim) {
  Alert.alert("Atenção", "Preencha nome e email.");
  return;
  }

  if (passTrim.length > 0 && passTrim.length < 6) {
    Alert.alert("Atenção", "A nova senha precisa ter pelo menos 6 caracteres.");
    return;
  }

  setSaving(true);

  // ✅ flags pra você saber o que salvou
  let firestoreOk = false;
  let authEmailOk = true;
  let authPassOk = true;

  try {
    // 1) Salva Firestore (isso deve funcionar mesmo se Auth falhar)
    const ref = doc(db, "users", user.uid);
    await setDoc(
      ref,
      {
        fullName: fullNameTrim,
        email: emailTrim,
        phone: phoneTrim,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    firestoreOk = true;

    // 2) Auth: email/senha (pode falhar por requires-recent-login)
    const currentEmail = user.email ?? "";

    if (emailTrim !== currentEmail) {
      try {
        await updateEmail(user, emailTrim);
      } catch (e: any) {
        authEmailOk = false;

        // ⚠️ se falhar, volta o email no Firestore para não ficar inconsistente
        // (opcional, mas recomendado)
        await setDoc(
          ref,
          { email: currentEmail, updatedAt: new Date().toISOString() },
          { merge: true }
        );

        if (String(e?.code).includes("requires-recent-login")) {
          Alert.alert(
            "Salvo (parcial)",
            "Nome/telefone foram salvos. Para mudar o EMAIL, o Firebase exige login recente. Faça login novamente e tente trocar o email."
          );
          return;
        }

        Alert.alert(
          "Salvo (parcial)",
          `Nome/telefone foram salvos, mas o email NÃO foi atualizado no Auth.\n\nErro: ${e?.message ?? e}`
        );
        return;
      }
    }

    if (passTrim.length > 0) {
      try {
        await updatePassword(user, passTrim);
      } catch (e: any) {
        authPassOk = false;

        if (String(e?.code).includes("requires-recent-login")) {
          Alert.alert(
            "Salvo (parcial)",
            "Nome/telefone/email foram salvos. Para mudar a SENHA, o Firebase exige login recente. Faça login novamente e tente trocar a senha."
          );
          return;
        }

        Alert.alert(
          "Salvo (parcial)",
          `Dados foram salvos, mas a senha NÃO foi atualizada.\n\nErro: ${e?.message ?? e}`
        );
        return;
      }
    }

    // ✅ Se chegou aqui, salvou Firestore e (se aplicável) Auth
    Alert.alert("Sucesso", "Dados atualizados!");

    // ❗ Não precisa deslogar sempre.
    // Só deslogue se você realmente atualizou email/senha com sucesso.
    if (!authEmailOk || !authPassOk) return;

    // Se você quer manter a exigência de relogar sempre, deixe isso:
    await signOut(auth);
    router.replace("/signin");
  } catch (err: any) {
    console.log("SAVE PROFILE ERROR:", err);
    Alert.alert("Erro", err?.message ?? "Não foi possível salvar.");
  } finally {
    setSaving(false);
  }
}


  ///////

  return (
    <View style={[styles.page, isWeb && styles.pageWeb]}>
      <Stack.Screen options={{ headerShown: false }} />

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
            <Pressable onPress={goBackToProfile} hitSlop={12} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </Pressable>

            <View style={styles.header}>
              <Image source={LOGO} style={styles.logo} />
              <Text style={styles.screenTitle}>Change profile</Text>
            </View>

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

            <View style={styles.bottomArea}>
              <Pressable
                style={[styles.primaryBtn, (saving || loadingProfile) && { opacity: 0.65 }]}
                onPress={onSave}
                disabled={saving || loadingProfile}
              >
                <Text style={styles.primaryBtnText}>
                  {saving ? "Saving..." : loadingProfile ? "Loading..." : "Save changes"}
                </Text>
              </Pressable>

              <Text style={styles.helper}>
                {loadingProfile ? "Loading profile..." : "After saving, you will be redirected to Sign In."}
              </Text>

              {/* debug opcional */}
              <Text style={[styles.helper, { marginTop: 6 }]}>
                {`AUTH EMAIL: ${user?.email ?? "(none)"}`}
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
  pageWeb: { padding: 16, alignItems: "center", justifyContent: "center" },

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

  backBtn: { alignSelf: "flex-start", paddingVertical: 6, paddingHorizontal: 2, marginBottom: 8 },

  header: { alignItems: "center", marginBottom: 18 },
  logo: { width: 64, height: 64, resizeMode: "contain", marginBottom: 10 },
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
