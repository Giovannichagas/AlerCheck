import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";

export default function CameraScreen() {
  const isFocused = useIsFocused(); // ✅ (NOVO) controla se a tela está visível
  const cameraRef = useRef<CameraView>(null); // ✅ (NOVO) ref para tirar foto

  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions(); // ✅ (NOVO)

  const [facing, setFacing] = useState<"back" | "front">("back");
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission]);

  // ✅ (NOVO) garante permissão da galeria quando necessário
  async function ensureMediaPermission() {
    if (Platform.OS === "web") return true; // no web, salvar em galeria não é igual
    if (mediaPermission?.granted) return true;

    const res = await requestMediaPermission();
    return !!res.granted;
  }

  // ✅ (NOVO) botão para FECHAR e voltar para a tela do scanner
  function handleClose() {
    // troca "/(tabs)/scan" pelo caminho real da sua tela de scanner, se for diferente
    router.replace("/(tabs)/scan");
  }

  // ✅ (NOVO) tirar foto, salvar no dispositivo e fechar câmera
  async function handleTakePhoto() {
    try {
      if (locked) return;
      setLocked(true);

      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.85,
        skipProcessing: true,
      });

      if (!photo?.uri) {
        setLocked(false);
        return;
      }

      // Salvar no dispositivo (galeria)
      const ok = await ensureMediaPermission();
      if (!ok) {
        Alert.alert(
          "Permissão necessária",
          "Precisamos de permissão para salvar a foto na galeria."
        );
        setLocked(false);
        return;
      }

      if (Platform.OS !== "web") {
        await MediaLibrary.createAssetAsync(photo.uri);
      } else {
        // no web: não salva na “galeria”; você pode só usar a uri ou implementar download
        console.log("Foto (web) uri:", photo.uri);
      }

      // Fecha câmera e volta para o scanner
      router.replace("/(tabs)/scan");
    } catch (e: any) {
      console.log(e);
      Alert.alert("Erro", "Não foi possível tirar a foto.");
    } finally {
      setLocked(false);
    }
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Carregando permissões...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Precisamos de acesso à câmera.</Text>

        <Pressable style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Permitir câmera</Text>
        </Pressable>

        <Pressable style={[styles.btn, styles.btnOutline]} onPress={handleClose}>
          <Text style={styles.btnText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ (NOVO) se não estiver focado, a CameraView NÃO renderiza → câmera desliga */}
      {isFocused ? (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "qr"],
          }}
          onBarcodeScanned={(result) => {
            if (locked) return;
            setLocked(true);

            console.log("Barcode:", result.type, result.data);

            // se quiser voltar ao scanner ao ler um código:
            router.replace("/(tabs)/scan");

            setTimeout(() => setLocked(false), 1200);
          }}
        />
      ) : null}

      {/* TOP BAR */}
      <View style={styles.topBar}>
        <Pressable onPress={handleClose} style={styles.smallBtn}>
          <Text style={styles.smallBtnText}>←</Text>
        </Pressable>

        <Pressable
          onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
          style={styles.smallBtn}
        >
          <Text style={styles.smallBtnText}>Trocar</Text>
        </Pressable>
      </View>

      {/* OVERLAY */}
      <View style={styles.overlay}>
        <View style={styles.scanBox} />
        <Text style={styles.hint}>Aponte para o código de barras</Text>
      </View>

      {/* ✅ (NOVO) BOTÕES INFERIORES: tirar foto + fechar */}
      <View style={styles.bottomBar}>
        <Pressable onPress={handleClose} style={styles.bottomBtn}>
          <Ionicons name="close" size={22} color="#fff" />
          <Text style={styles.bottomBtnText}>Fechar</Text>
        </Pressable>

        <Pressable onPress={handleTakePhoto} style={styles.captureBtn}>
          <View style={styles.captureInner} />
        </Pressable>

        <View style={{ width: 92 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#000",
  },
  text: { color: "#fff", textAlign: "center", marginBottom: 14 },
  btn: {
    backgroundColor: "#2ecc71",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginTop: 10,
  },
  btnOutline: { backgroundColor: "rgba(255,255,255,0.12)" },
  btnText: { color: "#fff", fontWeight: "800" },

  topBar: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  smallBtn: {
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  smallBtnText: { color: "#fff", fontWeight: "800" },

  overlay: { flex: 1, alignItems: "center", justifyContent: "center" },
  scanBox: {
    width: 260,
    height: 160,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(46,204,113,0.9)",
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  hint: { color: "rgba(255,255,255,0.8)", marginTop: 14, fontWeight: "700" },

  // ✅ (NOVO) bottom bar
  bottomBar: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomBtn: {
    width: 92,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  bottomBtnText: { color: "#fff", fontSize: 11, fontWeight: "800" },

  captureBtn: {
    width: 74,
    height: 74,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: "#2ecc71",
  },
});
