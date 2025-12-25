import React from 'react';
import { StyleSheet } from 'react-native';
import { Link } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function NovaTela() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Nova Tela
      </ThemedText>
      <ThemedText style={styles.body}>Esta é uma tela de exemplo criada automaticamente.</ThemedText>
      <Link href="/" asChild>
        <ThemedText type="link" style={styles.link}>Voltar</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  title: {
    marginTop: 8,
  },
  body: {
    fontSize: 16,
  },
  link: {
    marginTop: 12,
  },
});
