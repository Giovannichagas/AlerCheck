import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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

import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../app/services/firebase";

const LOGO = require("../../assets/images/logo.jpeg");

const FRAME3_ROUTE = "/(tabs)/frame3";
const HISTORY_ROUTE = "/(tabs)/history";
const EDIT_PROFILE_ROUTE = "/(tabs)/editProfile";

type UserDoc = {
  fullName?: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
};

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  const APP_MAX_W = 920;
  const shellW = isWeb ? Math.min(width - 32, APP_MAX_W) : "100%";

  // ✅ user real (web/mobile)
  const [user, setUser] = useState<User | null>(auth.currentUser);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserDoc>({
    fullName: "",
    phone: "",
    email: auth.currentUser?.email ?? "",
    photoUrl: auth.currentUser?.photoURL ?? "",
  });

  // ✅ mantém o user sincronizado
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  // ✅ carrega perfil sempre que a tela ganhar foco (voltar do edit)
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      async function load() {
        try {
          setLoading(true);

          if (!user?.uid) {
            if (mounted) {
              setProfile({
                fullName: "",
                phone: "",
                email: "",
                photoUrl: "",
              });
            }
            return;
          }

          const ref = doc(db, "users", user.uid);
          const snap = await getDoc(ref);

          if (!mounted) return;

          if (snap.exists()) {
            const data = snap.data() as UserDoc;
            setProfile({
              fullName: data.fullName ?? "",
              phone: data.phone ?? "",
              email: data.email ?? user.email ?? "",
              photoUrl: data.photoUrl ?? user.photoURL ?? "",
            });
          } else {
            // sem doc no Firestore: usa dados do auth
            setProfile({
              fullName: "",
              phone: "",
              email: user.email ?? "",
              photoUrl: user.photoURL ?? "",
            });
          }
        } catch (e) {
          console.log("LOAD PROFILE ERROR:", e);
        } finally {
          if (mounted) setLoading(false);
        }
      }

      load();
      return () => {
        mounted = false;
      };
    }, [user?.uid])
  );

  const initials = useMemo(() => {
    const name = (profile.fullName ?? "").trim();
    if (!name) return "U";
    const parts = name.split(" ").filter(Boolean);
    const a = parts[0]?.[0] ?? "U";
    const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (a + b).toUpperCase();
  }, [profile.fullName]);

  function goBack() {
    router.replace(FRAME3_ROUTE);
  }

  function goEdit() {
    router.push(EDIT_PROFILE_ROUTE);
  }

  function goHistory() {
    router.push(HISTORY_ROUTE);
  }

  async function onLogout() {
    try {
      await signOut(auth);
      router.replace("/signin");
    } catch (e) {
      console.log("LOGOUT ERROR:", e);
    }
  }

  return (
    <View style={[styles.page, isWeb && styles.pageWeb]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.shell, isWeb && [styles.shellWeb, { width: shellW }]]}>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.headerRow}>
              <Pressable onPress={goBack} hitSlop={12} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </Pressable>

              <Text style={styles.headerTitle}>Profile</Text>

              <Pressable onPress={goEdit} hitSlop={12} style={styles.editBtn}>
                <Ionicons name="pencil" size={18} color="#fff" />
              </Pressable>
            </View>

            <View style={styles.greenCard}>
              <View style={styles.avatarWrap}>
                {profile.photoUrl ? (
                  <Image source={{ uri: profile.photoUrl }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.nameText} numberOfLines={1}>
                  {loading ? "Loading..." : profile.fullName?.trim() || "Your name"}
                </Text>
              </View>

              <Image source={LOGO} style={styles.miniLogo} />
            </View>

            <InfoItem icon="call-outline" title="Phone no." value={profile.phone?.trim() || "—"} />
            <InfoItem icon="mail-outline" title="E-Mail" value={profile.email?.trim() || "—"} />

            <ActionItem icon="time-outline" title="History" onPress={goHistory} />
            <ActionItem icon="log-out-outline" title="Log Out" onPress={onLogout} />

            <View style={{ height: 18 }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </View>
  );
}

function InfoItem({ icon, title, value }: { icon: any; title: string; value: string }) {
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemIconBox}>
        <Ionicons name={icon} size={18} color="#fff" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemValue}>{value}</Text>
      </View>
    </View>
  );
}

function ActionItem({ icon, title, onPress }: { icon: any; title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.actionRow}>
      <View style={styles.itemIconBox}>
        <Ionicons name={icon} size={18} color="#fff" />
      </View>

      <Text style={styles.actionTitle}>{title}</Text>

      <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.45)" />
    </Pressable>
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

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  backBtn: { paddingVertical: 6, paddingHorizontal: 2 },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "900" },

  editBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  greenCard: {
    backgroundColor: "#4AB625",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
    minHeight: 92,
  },

  avatarWrap: {
    width: 68,
    height: 68,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.20)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.30)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: { width: "100%", height: "100%", resizeMode: "cover" },
  avatarFallback: { flex: 1, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "900", fontSize: 20 },

  nameText: { color: "#fff", fontWeight: "900", fontSize: 16 },

  miniLogo: { width: 26, height: 26, resizeMode: "contain", opacity: 0.95 },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },

  itemIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  itemTitle: { color: "#fff", fontWeight: "900", fontSize: 13, marginBottom: 3 },
  itemValue: { color: "rgba(255,255,255,0.70)", fontSize: 12, lineHeight: 16 },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  actionTitle: { flex: 1, color: "#fff", fontWeight: "900", fontSize: 13 },
});
