import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, Stack } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const isFocused = useIsFocused(); // ✅ detecta se a tela está em foco
  const [cameraOn, setCameraOn] = useState(true); // ✅ controla se a camera fica ligada

  const [facing, setFacing] = useState<"back" | "front">("back");
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [taking, setTaking] = useState(false);

  // ✅ liga quando entra / desliga quando sai da tela
  useFocusEffect(
    useCallback(() => {
      setCameraOn(true);
      return () => {
        setCameraOn(false); // ✅ ao sair, desmonta CameraView => desliga camera
      };
    }, [])
  );

  // 1) permissões
  if (!permission) {
    return (
      <View style={styles.page}>
        <Text style={styles.text}>Carregando permissões...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.page}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.text}>Precisamos de permissão para usar a câmera.</Text>

        <Pressable style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>Permitir câmera</Text>
        </Pressable>

        <Pressable
          style={styles.linkBtn}
          onPress={() => {
            setCameraOn(false); // ✅ garante desligar
            router.back();
          }}
        >
          <Text style={styles.linkText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  // 2) tirar foto
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
        setCameraOn(false); // ✅ depois de tirar foto, já desliga a camera
      }
    } catch (e) {
      console.log("CAMERA ERROR:", e);
    } finally {
      setTaking(false);
    }
  }

  // 3) confirmar e enviar para Scan
  function confirmAndSend() {
    if (!capturedUri) return;

    setCameraOn(false); // ✅ garante desligar antes de sair

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
    setCameraOn(true); // ✅ volta a ligar para tirar novamente
  }

  function closeScreen() {
    setCameraOn(false); // ✅ garante desligar ao sair
    router.replace("/(tabs)/scan");
  }

  return (
    <View style={styles.page}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={closeScreen} style={styles.topBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>

        <Text style={styles.topTitle}>Camera</Text>

        <Pressable onPress={flipCamera} style={styles.topBtn} hitSlop={10}>
          <Ionicons name="camera-reverse-outline" size={22} color="#fff" />
        </Pressable>
      </View>

      {/* Preview ou Camera */}
      <View style={styles.cameraWrap}>
        {capturedUri ? (
          <Image source={{ uri: capturedUri }} style={styles.preview} />
        ) : (
          // ✅ CameraView só existe quando:
          // - tela está em foco
          // - cameraOn = true
          // - não tem foto capturada
          (isFocused && cameraOn) ? (
            <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
          ) : (
            // fallback (tela sem câmera ligada)
            <View style={styles.cameraOff}>
              <Ionicons name="camera-off-outline" size={28} color="rgba(255,255,255,0.55)" />
              <Text style={styles.cameraOffText}>Camera off</Text>
            </View>
          )
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
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0b0f12" },

  topBar: {
    height: 56,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

  cameraWrap: { flex: 1, marginHorizontal: 14, borderRadius: 18, overflow: "hidden" },
  camera: { flex: 1 },
  preview: { flex: 1, resizeMode: "cover" },

  cameraOff: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    gap: 8,
  },
  cameraOffText: { color: "rgba(255,255,255,0.6)", fontWeight: "800" },

  bottomBar: {
    padding: 16,
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

  linkBtn: { marginTop: 12 },
  linkText: { color: "#4AB625", fontWeight: "800" },

  text: { color: "#fff", padding: 16, textAlign: "center" },
});
