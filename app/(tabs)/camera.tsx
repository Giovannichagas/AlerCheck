import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, Stack } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
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

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const isFocused = useIsFocused();
  const [cameraOn, setCameraOn] = useState(true);

  const [facing, setFacing] = useState<"back" | "front">("back");
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [taking, setTaking] = useState(false);

  // ✅ shell igual Scan/History
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const APP_MAX_W = 920;
  const shellW = isWeb ? Math.min(width - 32, APP_MAX_W) : "100%";

  useFocusEffect(
    useCallback(() => {
      setCameraOn(true);
      return () => {
        setCameraOn(false); // ✅ ao sair, desmonta CameraView => desliga camera
      };
    }, [])
  );

  async function takePhoto() {
    try {
      if (!cameraRef.current || taking) return;

      setTaking(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo?.uri) {
        setCapturedUri(photo.uri);
        setCameraOn(false); // ✅ depois de tirar foto, desliga
      }
    } catch (e) {
      console.log("CAMERA ERROR:", e);
    } finally {
      setTaking(false);
    }
  }

  function confirmAndSend() {
    if (!capturedUri) return;

    setCameraOn(false);
    router.replace({
      pathname: "/(tabs)/scan",
      params: { photoUri: capturedUri },
    });
  }

  function flipCamera() {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  }

  function retake() {
    setCapturedUri(null);
    setCameraOn(true);
  }

  function closeScreen() {
    setCameraOn(false);
    router.replace("/(tabs)/scan");
  }

  return (
    <View style={[styles.page, isWeb && styles.pageWeb]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ✅ shell igual Scan/History */}
      <View style={[styles.shell, isWeb && [styles.shellWeb, { width: shellW }]]}>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          {/* 1) permissões */}
          {!permission ? (
            <View style={styles.permissionWrap}>
              <Text style={styles.text}>Carregando permissões...</Text>
            </View>
          ) : !permission.granted ? (
            <View style={styles.permissionWrap}>
              <Text style={styles.text}>
                Precisamos de permissão para usar a câmera.
              </Text>

              <Pressable style={styles.primaryBtn} onPress={requestPermission}>
                <Text style={styles.primaryBtnText}>Permitir câmera</Text>
              </Pressable>

              <Pressable
                style={styles.linkBtn}
                onPress={() => {
                  setCameraOn(false);
                  router.replace("/(tabs)/scan"); // ✅ volta padrão para scan
                }}
              >
                <Text style={styles.linkText}>Voltar</Text>
              </Pressable>
            </View>
          ) : (
            // ✅ 2) tela principal (camera)
            <View style={styles.inner}>
              {/* Top bar */}
              <View style={styles.topBar}>
                <Pressable onPress={closeScreen} hitSlop={10} style={styles.topBtn}>
                  <Ionicons name="chevron-back" size={22} color="#fff" />
                </Pressable>

                <Text style={styles.topTitle}>Camera</Text>

                <Pressable onPress={flipCamera} hitSlop={10} style={styles.topBtn}>
                  <Ionicons name="camera-reverse-outline" size={22} color="#fff" />
                </Pressable>
              </View>

              {/* Preview ou Camera */}
              <View style={styles.cameraWrap}>
                {capturedUri ? (
                  <Image source={{ uri: capturedUri }} style={styles.preview} />
                ) : (isFocused && cameraOn) ? (
                  <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
                ) : (
                  <View style={styles.cameraOff}>
                    <Ionicons
                      name="camera-off-outline"
                      size={28}
                      color="rgba(255,255,255,0.55)"
                    />
                    <Text style={styles.cameraOffText}>Camera off</Text>
                  </View>
                )}
              </View>

              {/* Bottom controls */}
              <View style={styles.bottomBar}>
                {capturedUri ? (
                  <>
                    <Pressable style={styles.secondaryBtn} onPress={retake}>
                      <Text style={styles.secondaryBtnText}>Tirar novamente</Text>
                    </Pressable>

                    <Pressable style={styles.primaryBtn} onPress={confirmAndSend}>
                      <Text style={styles.primaryBtnText}>Usar esta foto</Text>
                    </Pressable>
                  </>
                ) : (
                  <Pressable
                    style={[styles.captureBtn, taking && { opacity: 0.6 }]}
                    onPress={takePhoto}
                    disabled={taking}
                  >
                    <View style={styles.captureInner} />
                  </Pressable>
                )}
              </View>
            </View>
          )}
        </SafeAreaView>
      </View>
    </View>
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

  // conteúdo interno com padding padrão
  inner: { flex: 1, padding: 16 },

  // permission state centralizado (dentro do shell)
  permissionWrap: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  topBar: {
    height: 56,
    paddingHorizontal: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  topBtn: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : null),
  },
  topTitle: { color: "#fff", fontWeight: "900", fontSize: 14 },

  cameraWrap: {
    flex: 1,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  camera: { flex: 1 },
  preview: { flex: 1, resizeMode: "cover" },

  cameraOff: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cameraOffText: { color: "rgba(255,255,255,0.6)", fontWeight: "800" },

  bottomBar: {
    paddingTop: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  captureBtn: {
    width: 74,
    height: 74,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: "#4AB625",
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: "#4AB625",
  },

  primaryBtn: {
    width: "100%",
    backgroundColor: "#4AB625",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "900" },

  secondaryBtn: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  secondaryBtnText: { color: "#fff", fontWeight: "800" },

  linkBtn: { marginTop: 6 },
  linkText: { color: "#4AB625", fontWeight: "800" },

  text: { color: "#fff", textAlign: "center" },
});
