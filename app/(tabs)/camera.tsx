import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"back" | "front">("back");

  // Se você for usar barcode, isso ajuda a evitar leituras repetidas
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission]);

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
        <Pressable style={[styles.btn, styles.btnOutline]} onPress={() => router.back()}>
          <Text style={styles.btnText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing={facing}
        // Se o seu objetivo é ler código de barras, ative isso:
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "qr"],
        }}
        onBarcodeScanned={(result) => {
          if (locked) return;
          setLocked(true);

          // Aqui você recebe o código lido:
          // result.data -> o valor do barcode
          // result.type -> tipo do barcode
          console.log("Barcode:", result.type, result.data);

          // Exemplo: voltar pra tela anterior passando o código
          router.back();

          // (opcional) se quiser liberar de novo depois de um tempo:
          setTimeout(() => setLocked(false), 1500);
        }}
      />

      {/* Header simples com botão voltar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.smallBtn}>
          <Text style={styles.smallBtnText}>←</Text>
        </Pressable>

        <Pressable
          onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
          style={styles.smallBtn}
        >
          <Text style={styles.smallBtnText}>Trocar</Text>
        </Pressable>
      </View>

      {/* “Mira”/overlay simples */}
      <View style={styles.overlay}>
        <View style={styles.scanBox} />
        <Text style={styles.hint}>Aponte para o código de barras</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: "#000" },
  text: { color: "#fff", textAlign: "center", marginBottom: 14 },
  btn: { backgroundColor: "#2ecc71", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, marginTop: 10 },
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

  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scanBox: {
    width: 260,
    height: 160,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(46,204,113,0.9)",
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  hint: { color: "rgba(255,255,255,0.8)", marginTop: 14, fontWeight: "700" },
});
