import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
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

import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  updateProfile,
} from "firebase/auth";

import { doc, serverTimestamp, setDoc } from "firebase/firestore";

// ✅ IMPORT CORRETO (seu firebase.ts está em /services/firebase.ts)
import { auth, db } from "../services/firebase";

const LOGO = require("../../assets/images/logo.jpeg");
const ICON_GOOGLE = require("../../assets/images/google.jpg");
const ICON_APPLE = require("../../assets/images/apple.jpg");
const ICON_FACEBOOK = require("../../assets/images/facebook.jpg");

// ✅ helper para nunca travar em "Creando..."
async function withTimeout<T>(promise: Promise<T>, ms = 12000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("TIMEOUT")), ms);
    promise
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(t);
        reject(e);
      });
  });
}

export default function SignUpScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  const APP_MAX_W = 920;
  const shellW = isWeb ? Math.min(width - 32, APP_MAX_W) : "100%";

  const CONTENT_MAX_W = 520;
  const contentW = isWeb
    ? Math.min((shellW as number) - 32, CONTENT_MAX_W)
    : "100%";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ retorno do redirect (web)
  useEffect(() => {
    if (Platform.OS !== "web") return;

    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          // Firestore não bloqueia
          try {
            await withTimeout(
              setDoc(
                doc(db, "users", result.user.uid),
                {
                  fullName: result.user.displayName ?? "",
                  email: result.user.email ?? "",
                  phone: result.user.phoneNumber ?? "",
                  provider: "google",
                  createdAt: serverTimestamp(),
                },
                { merge: true },
              ),
              8000,
            );
          } catch (e) {
            console.log("Firestore save (redirect) failed:", e);
          }

          Alert.alert("¡Bienvenido!", result.user.email || "");
          router.replace("/(tabs)/scan");
        }
      })
      .catch((e) => console.log("Redirect error:", e));
  }, []);

  const onCreateAccount = async () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !pass ||
      !confirm
    ) {
      Alert.alert(
        "Atención",
        "Por favor, completa todos los campos obligatorios.",
      );
      return;
    }

    if (pass !== confirm) {
      Alert.alert("Atención", "Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);

      console.log("Creando usuario en Auth...");

      // ✅ timeout para não ficar pendurado
      const userCredential = await withTimeout(
        createUserWithEmailAndPassword(auth, email.trim(), pass),
        12000,
      );

      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      if (auth.currentUser && fullName) {
        await withTimeout(
          updateProfile(auth.currentUser, { displayName: fullName }),
          8000,
        );
      }

      // Firestore: tenta salvar, mas NÃO trava
      try {
        console.log("Guardando en Firestore...");
        await withTimeout(
          setDoc(
            doc(db, "users", userCredential.user.uid),
            {
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              fullName,
              email: email.trim(),
              phone: phone.trim(),
              provider: "password",
              createdAt: serverTimestamp(),
            },
            { merge: true },
          ),
          8000,
        );
      } catch (e) {
        console.log("Firestore save failed (non-blocking):", e);
      }

      Alert.alert(
        "¡Cuenta creada!",
        "Registro completado. Redirigiendo a Scan...",
      );
      router.replace("/(tabs)/scan");
    } catch (error: any) {
      console.log("SIGNUP ERROR:", error);

      if (error?.message === "TIMEOUT") {
        Alert.alert(
          "Error",
          "Tiempo de espera agotado al conectar con Firebase. Revisa tu conexión o configuración.",
        );
        return;
      }

      const code = error?.code;

      if (code === "auth/email-already-in-use") {
        Alert.alert("Error", "Este correo electrónico ya está en uso.");
        return;
      }
      if (code === "auth/invalid-email") {
        Alert.alert("Error", "El correo electrónico no es válido.");
        return;
      }
      if (code === "auth/weak-password") {
        Alert.alert("Error", "Contraseña débil. Usa al menos 6 caracteres.");
        return;
      }

      Alert.alert(
        "Error al crear la cuenta",
        error?.message ?? "Ocurrió un error.",
      );
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignUp = async () => {
    try {
      setLoading(true);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      if (Platform.OS === "web") {
        try {
          const result = await withTimeout(
            signInWithPopup(auth, provider),
            12000,
          );

          // Firestore não bloqueia
          try {
            await withTimeout(
              setDoc(
                doc(db, "users", result.user.uid),
                {
                  fullName: result.user.displayName ?? "",
                  email: result.user.email ?? "",
                  phone: result.user.phoneNumber ?? "",
                  provider: "google",
                  createdAt: serverTimestamp(),
                },
                { merge: true },
              ),
              8000,
            );
          } catch (e) {
            console.log("Firestore save (google) failed:", e);
          }

          Alert.alert("¡Bienvenido!", result.user.email || "");
          router.replace("/(tabs)/scan");
        } catch (e: any) {
          if (
            e?.code === "auth/popup-blocked" ||
            e?.code === "auth/popup-closed-by-user"
          ) {
            await signInWithRedirect(auth, provider);
            return;
          }
          throw e;
        }
        return;
      }

      Alert.alert(
        "Información",
        "En móvil configuraremos Google después (expo-auth-session / google-signin).",
      );
    } catch (error: any) {
      console.log("GOOGLE SIGNUP ERROR:", error);

      if (error?.message === "TIMEOUT") {
        Alert.alert("Error", "Tiempo de espera agotado. Revisa tu conexión.");
        return;
      }

      const code = error?.code;

      if (code === "auth/unauthorized-domain") {
        Alert.alert(
          "Error",
          "Dominio no autorizado. Agrega 'localhost' (y/o '127.0.0.1') en Firebase Auth → Settings → Authorized domains.",
        );
        return;
      }

      if (code === "auth/operation-not-allowed") {
        Alert.alert(
          "Error",
          "El proveedor Google no está habilitado. Actívalo en Firebase Auth → Sign-in method → Google.",
        );
        return;
      }

      Alert.alert(
        "Error",
        error?.message ?? "Error al iniciar sesión con Google.",
      );
    } finally {
      setLoading(false);
    }
  };

  const onSocial = (provider: string) => {
    if (provider === "Google") return onGoogleSignUp();
    Alert.alert("Inicio social", `Has pulsado: ${provider}`);
  };

  return (
    <View style={[styles.page, isWeb && styles.pageWeb]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={[styles.shell, isWeb && [styles.shellWeb, { width: shellW }]]}
      >
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
              <View
                style={[
                  styles.contentWrap,
                  isWeb && { width: contentW, alignSelf: "center" },
                ]}
              >
                <View style={styles.topRow}>
                  <Pressable
                    onPress={() => router.replace("/(tabs)/scan")}
                    style={styles.backBtn}
                  >
                    <Text style={styles.backText}>‹</Text>
                  </Pressable>
                </View>

                <View style={styles.header}>
                  <Image source={LOGO} style={styles.logo} />
                  <Text style={styles.screenTitle}>Crear cuenta</Text>
                </View>

                <View style={styles.form}>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Nombre"
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    style={styles.input}
                  />
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Apellido"
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    style={styles.input}
                  />

                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Teléfono (opcional)"
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    style={styles.input}
                  />

                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Correo electrónico"
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                  />

                  <TextInput
                    value={pass}
                    onChangeText={setPass}
                    placeholder="Contraseña"
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    secureTextEntry
                    style={styles.input}
                  />
                  <TextInput
                    value={confirm}
                    onChangeText={setConfirm}
                    placeholder="Confirmar contraseña"
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    secureTextEntry
                    style={styles.input}
                  />

                  <View style={styles.bottomArea}>
                    <Pressable
                      style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
                      onPress={onCreateAccount}
                      disabled={loading}
                    >
                      <Text style={styles.primaryBtnText}>
                        {loading ? "Creando..." : "Crear una cuenta"}
                      </Text>
                    </Pressable>

                    <View style={styles.dividerRow}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>
                        O iniciar sesión con
                      </Text>
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
  pageWeb: { padding: 16, alignItems: "center", justifyContent: "center" },

  shell: { flex: 1, width: "100%", backgroundColor: "#0b0f12" },
  shellWeb: {
    height: "100%",
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "#0b0f12",
  },

  scroll: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 24,
    justifyContent: "center",
  },

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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  backText: { color: "#fff", fontSize: 28, marginTop: -2 },

  header: { alignItems: "center", marginTop: 8, marginBottom: 18 },
  logo: { width: 92, height: 92, resizeMode: "contain", marginBottom: 10 },
  screenTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 10,
  },

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

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
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
