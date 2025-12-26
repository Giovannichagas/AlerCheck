// app/(tabs)/profile.tsx
import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
    Image,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ✅ Se você já tiver o auth pronto, pode descomentar e usar
// import { auth } from "../services/firebase";

export default function ProfileScreen() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  // “moldura de celular” no web
  const PHONE_MAX_W = 420;
  const PHONE_MAX_H = 920;
  const phoneW = isWeb ? Math.min(width, PHONE_MAX_W) : width;
  const phoneH = isWeb ? Math.min(height, PHONE_MAX_H) : height;

  // 🔸 Dados do usuário (por enquanto mock)
  // Depois você troca para pegar do Firebase:
  // const u = auth.currentUser;
  const user = useMemo(() => {
    return {
      name: "Sara Loupez",
      phone: "+34 612523458",
      email: "sara123@gmail.com",
      photo: "https://i.pravatar.cc/200?img=47", // pode trocar por foto real
    };
  }, []);

  function onEdit() {
    // quando você criar a tela de edição:
    // router.push("/(tabs)/edit-profile");
  }

  function onSecurity() {
    // quando você criar a tela:
    // router.push("/(tabs)/security");
  }

  function onLogout() {
    // quando conectar Firebase:
    // await auth.signOut();
    // router.replace("/(tabs)"); ou "/signin"
  }

  return (
    <View style={styles.page}>
      <View
        style={[
          styles.phoneFrame,
          isWeb && { width: phoneW, height: phoneH, borderRadius: 26 },
        ]}
      >
        <SafeAreaView style={styles.safe} edges={["top"]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Profile</Text>

            <Pressable onPress={onEdit} style={styles.editBtn} hitSlop={10}>
              <Feather name="edit-2" size={18} color="#dce3ea" />
            </Pressable>
          </View>

          {/* Card verde */}
          <View style={styles.profileCard}>
            <View style={styles.avatarWrap}>
              {user.photo ? (
                <Image source={{ uri: user.photo }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarInitial}>
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </Text>
              )}
            </View>

            <Text style={styles.profileName}>{user.name}</Text>
          </View>

          {/* Lista */}
          <View style={styles.list}>
            <RowItem
              icon={<Feather name="phone" size={18} color="#e9eef3" />}
              title="Phone no."
              value={user.phone}
              onPress={() => {}}
            />

            <RowItem
              icon={<Feather name="mail" size={18} color="#e9eef3" />}
              title="E-Email"
              value={user.email}
              onPress={() => {}}
            />

            <RowItem
              icon={<Ionicons name="shield-checkmark-outline" size={20} color="#e9eef3" />}
              title="Security"
              onPress={onSecurity}
            />

            <RowItem
              icon={<Feather name="log-out" size={18} color="#e9eef3" />}
              title="Log Out"
              onPress={onLogout}
            />
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

function RowItem({
  icon,
  title,
  value,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIcon}>{icon}</View>

        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>{title}</Text>
          {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        </View>
      </View>

      {/* seta opcional (se quiser em todas) */}
      {/* <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.35)" /> */}
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
    backgroundColor: "#0b0f12",
    overflow: "hidden",
  },
  safe: { flex: 1, paddingHorizontal: 18 },

  headerRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#151d23",
    alignItems: "center",
    justifyContent: "center",
  },

  profileCard: {
    marginTop: 18,
    backgroundColor: "#39b54a",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  avatarInitial: { color: "#fff", fontWeight: "900", fontSize: 18 },

  profileName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    flex: 1,
  },

  list: { marginTop: 24, gap: 18 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#151d23",
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { color: "#fff", fontWeight: "800", fontSize: 14 },
  rowValue: { color: "rgba(255,255,255,0.6)", marginTop: 2, fontSize: 12 },
});
