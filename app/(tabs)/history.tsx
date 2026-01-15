import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getHistory, type StoredHistoryItem } from "../services/historyStore";

const PLACEHOLDER = require("../../assets/images/logo.jpeg");

type DateFilter = "all" | "today" | "7d" | "30d";

function formatCheckedAtISO(iso: string) {
  const date = new Date(iso);
  const diffDays = Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return "Checked today";
  if (diffDays === 1) return "Checked 1 day ago";
  return `Checked ${diffDays} days ago`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function HistoryScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  const APP_MAX_W = 920;
  const shellW = isWeb ? Math.min(width - 32, APP_MAX_W) : "100%";

  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  const [hoverId, setHoverId] = useState<string | null>(null);

  const [items, setItems] = useState<StoredHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<StoredHistoryItem | null>(null);

  // ✅ carrega histórico (já vem limitado a 10 no historyStore)
  async function load() {
    setLoading(true);
    try {
      const h = await getHistory();
      setItems(h);
    } finally {
      setLoading(false);
    }
  }

  // carrega ao entrar na tela
  useEffect(() => {
    load();
  }, []);

  // também recarrega quando volta pra tela (web/mobile costuma re-render)
  // (se você quiser garantir 100%, depois a gente usa useFocusEffect)
  useEffect(() => {
    if (items.length === 0) return;

    if (id) {
      const hit = items.find((x) => x.id === id);
      if (hit) setSelected(hit);
    } else {
      setSelected((prev) => prev ?? items[0] ?? null);
    }
  }, [id, items]);

  const types = useMemo(() => {
    const set = new Set(items.map((x) => x.type ?? "Scan"));
    return ["All", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const today = new Date();

    return items
      .filter((item) => {
        const dt = new Date(item.checkedAt);

        if (dateFilter === "today") return isSameDay(dt, today);
        if (dateFilter === "7d") return dt.getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (dateFilter === "30d") return dt.getTime() >= Date.now() - 30 * 24 * 60 * 60 * 1000;
        return true;
      })
      .filter((item) => (typeFilter === "All" ? true : (item.type ?? "Scan") === typeFilter))
      .filter((item) => {
        if (!q) return true;
        return (
          (item.title ?? "").toLowerCase().includes(q) ||
          (item.ingredients ?? "").toLowerCase().includes(q) ||
          (item.type ?? "Scan").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime());
  }, [items, query, dateFilter, typeFilter]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const alerts = filtered.filter((x) => x.hasAlert).length;
    const safe = total - alerts;
    return { total, alerts, safe };
  }, [filtered]);

  function openDetails(item: StoredHistoryItem) {
    setSelected(item);
  }

  const Header = (
    <View>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.replace("/(tabs)/scan")} style={styles.backBtn} hitSlop={10}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>History</Text>

        <Pressable onPress={load} hitSlop={10} style={{ width: 40, alignItems: "flex-end", justifyContent: "center" }}>
          <Ionicons name="refresh" size={18} color="rgba(255,255,255,0.75)" />
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Checks</Text>
        </View>
        <View style={[styles.statCard, styles.statAlert]}>
          <Text style={styles.statValue}>{stats.alerts}</Text>
          <Text style={styles.statLabel}>Alerts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.safe}</Text>
          <Text style={styles.statLabel}>Safe</Text>
        </View>
      </View>

      <View style={styles.filtersCard}>
        <Text style={styles.sectionTitle}>Filters</Text>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color="rgba(255,255,255,0.6)" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search (title, ingredients, type...)"
            placeholderTextColor="rgba(255,255,255,0.45)"
            style={styles.searchInput}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.35)" />
            </Pressable>
          )}
        </View>

        <Text style={styles.subTitle}>Date</Text>
        <View style={styles.chipsRow}>
          <Chip label="All" active={dateFilter === "all"} onPress={() => setDateFilter("all")} />
          <Chip label="Today" active={dateFilter === "today"} onPress={() => setDateFilter("today")} />
          <Chip label="7d" active={dateFilter === "7d"} onPress={() => setDateFilter("7d")} />
          <Chip label="30d" active={dateFilter === "30d"} onPress={() => setDateFilter("30d")} />
        </View>

        <Text style={styles.subTitle}>Food type</Text>
        <View style={styles.chipsWrap}>
          {types.map((t) => (
            <Chip key={t} label={t} active={typeFilter === t} onPress={() => setTypeFilter(t)} />
          ))}
        </View>

        <Pressable
          style={styles.clearBtn}
          onPress={() => {
            setQuery("");
            setDateFilter("all");
            setTypeFilter("All");
          }}
        >
          <Text style={styles.clearBtnText}>Clear filters</Text>
        </Pressable>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.detailsHeader}>Selected record</Text>

        {selected ? (
          <>
            <View style={styles.detailsTop}>
              {selected.photoUri ? (
                <Image source={{ uri: selected.photoUri }} style={styles.detailsImg} />
              ) : (
                <View style={styles.noPhotoBox}>
                  <Ionicons name="camera-outline" size={18} color="rgba(255,255,255,0.65)" />
                  <Text style={styles.noPhotoText}>No photo</Text>
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={styles.detailsTitle} numberOfLines={1}>
                  {selected.title || "Scan"}
                </Text>
                <Text style={styles.detailsMeta}>
                  {(selected.type ?? "Scan")} • {formatCheckedAtISO(selected.checkedAt)}
                </Text>
              </View>
            </View>

            <Text style={styles.detailsLabel}>Ingredients</Text>
            <Text style={styles.detailsValue}>{selected.ingredients}</Text>

            <Text style={styles.detailsLabel}>Result</Text>
            <View style={[styles.badge, selected.hasAlert ? styles.badgeDanger : styles.badgeSafe]}>
              <Text style={styles.badgeText}>
                {selected.hasAlert
                  ? `Alert • ${selected.matched?.join(", ") || "Allergen detected"}`
                  : "Safe • No alerts"}
              </Text>
            </View>

            {/* ✅ (opcional) mostra alergias selecionadas */}
            {selected.selectedAllergens?.length ? (
              <>
                <Text style={styles.detailsLabel}>Selected allergens</Text>
                <Text style={styles.detailsValue}>{selected.selectedAllergens.join(", ")}</Text>
              </>
            ) : null}

            {/* ✅ (opcional) mostra explicação IA */}
            {selected.aiExplanation ? (
              <>
                <Text style={styles.detailsLabel}>AI explanation</Text>
                <Text style={styles.detailsValue}>{selected.aiExplanation}</Text>
              </>
            ) : null}

            {selected.warning ? (
              <>
                <Text style={styles.detailsLabel}>Warning</Text>
                <Text style={styles.detailsValue}>⚠️ {selected.warning}</Text>
              </>
            ) : null}
          </>
        ) : loading ? (
          <View style={styles.emptySelected}>
            <Text style={styles.emptySelectedTitle}>Loading...</Text>
            <Text style={styles.emptySelectedSub}>Fetching your last 10 checks.</Text>
          </View>
        ) : (
          <View style={styles.emptySelected}>
            <Text style={styles.emptySelectedTitle}>No history yet</Text>
            <Text style={styles.emptySelectedSub}>Do a scan and your last 10 checks will appear here.</Text>
          </View>
        )}
      </View>

      <View style={styles.listHeaderRow}>
        <Text style={styles.listTitle}>Last 10 checks</Text>
        <Text style={styles.listHint} numberOfLines={2}>
          Tap any row to update details • Hover highlights (web)
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.page, isWeb && styles.pageWeb]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.shell, isWeb && [styles.shellWeb, { width: shellW }]]}>
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={Header}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => {
              const hovered = hoverId === item.id;
              const isSelected = selected?.id === item.id;

              return (
                <Pressable
                  onPress={() => openDetails(item)}
                  onHoverIn={isWeb ? () => setHoverId(item.id) : undefined}
                  onHoverOut={isWeb ? () => setHoverId(null) : undefined}
                  style={({ pressed }) => [
                    styles.row,
                    hovered && styles.rowHover,
                    pressed && { opacity: 0.92 },
                    item.hasAlert && styles.rowAlertBorder,
                    isSelected && styles.rowSelected,
                  ]}
                >
                  <View style={styles.rowLeft}>
                    <Image source={PLACEHOLDER} style={styles.rowIcon} />

                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {item.title || "Scan"}
                      </Text>

                      <Text style={styles.rowSub} numberOfLines={1}>
                        {(item.type ?? "Scan")} • {formatCheckedAtISO(item.checkedAt)}
                      </Text>

                      {item.hasAlert ? (
                        <Text style={styles.rowMatched} numberOfLines={1}>
                          Matched: {item.matched?.join(", ") || "Allergen detected"}
                        </Text>
                      ) : (
                        <Text style={styles.rowOk} numberOfLines={1}>
                          No alerts
                        </Text>
                      )}
                    </View>
                  </View>

                  <Pressable
                    hitSlop={10}
                    onPress={() => openDetails(item)}
                    style={[styles.arrowBtn, (hovered || isSelected) && styles.arrowBtnHover]}
                  >
                    <Ionicons name="chevron-forward" size={18} color="#fff" />
                  </Pressable>
                </Pressable>
              );
            }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            ListFooterComponent={<View style={{ height: 30 }} />}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </View>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
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

  listContainer: { padding: 16, paddingBottom: 24 },

  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  backText: { color: "#fff", fontSize: 28, marginTop: -2 },
  headerTitle: { color: "#4AB625", fontSize: 16, fontWeight: "900" },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  statAlert: { borderColor: "rgba(255,77,77,0.25)" },
  statValue: { color: "#fff", fontWeight: "900", fontSize: 18 },
  statLabel: { color: "rgba(255,255,255,0.55)", marginTop: 4, fontSize: 11 },

  filtersCard: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 12,
  },
  sectionTitle: { color: "#fff", fontWeight: "900", fontSize: 13, marginBottom: 10 },
  subTitle: { color: "rgba(255,255,255,0.75)", fontWeight: "800", fontSize: 12, marginTop: 10, marginBottom: 8 },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#0f151a",
    borderWidth: 1,
    borderColor: "#4AB625",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, color: "#fff", fontSize: 12.5 },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  chip: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  chipActive: { backgroundColor: "rgba(74,182,37,0.20)", borderColor: "rgba(74,182,37,0.35)" },
  chipText: { color: "rgba(255,255,255,0.75)", fontWeight: "800", fontSize: 11.5 },
  chipTextActive: { color: "#fff" },

  clearBtn: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  clearBtnText: { color: "#fff", fontWeight: "900", fontSize: 11.5 },

  detailsCard: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 12,
  },
  detailsHeader: { color: "#fff", fontWeight: "900", fontSize: 13, marginBottom: 10 },
  detailsTop: { flexDirection: "row", gap: 12, alignItems: "center" },

  detailsImg: { width: 54, height: 54, borderRadius: 12, resizeMode: "cover" },
  noPhotoBox: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  noPhotoText: { color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: "800" },

  detailsTitle: { color: "#fff", fontWeight: "900", fontSize: 13 },
  detailsMeta: { color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 3 },

  detailsLabel: { color: "rgba(255,255,255,0.65)", fontWeight: "900", fontSize: 11.5, marginTop: 10 },
  detailsValue: { color: "#fff", fontSize: 12, marginTop: 4, lineHeight: 16 },

  badge: { marginTop: 10, borderRadius: 12, padding: 10, borderWidth: 1 },
  badgeDanger: { backgroundColor: "rgba(255,77,77,0.10)", borderColor: "rgba(255,77,77,0.30)" },
  badgeSafe: { backgroundColor: "rgba(74,182,37,0.10)", borderColor: "rgba(74,182,37,0.30)" },
  badgeText: { color: "#fff", fontWeight: "900", fontSize: 11.5 },

  emptySelected: { paddingVertical: 6 },
  emptySelectedTitle: { color: "#fff", fontWeight: "900" },
  emptySelectedSub: { color: "rgba(255,255,255,0.55)", marginTop: 4, lineHeight: 16 },

  listHeaderRow: { marginTop: 2, marginBottom: 10 },
  listTitle: { color: "#fff", fontWeight: "900", fontSize: 13 },
  listHint: { color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 4 },

  row: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  rowHover: { backgroundColor: "rgba(255,255,255,0.08)" },
  rowSelected: { borderColor: "rgba(74,182,37,0.45)" },
  rowAlertBorder: { borderLeftWidth: 3, borderLeftColor: "rgba(255,77,77,0.70)" },

  rowLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, paddingRight: 10 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, resizeMode: "cover" },
  rowTitle: { color: "#fff", fontWeight: "900", fontSize: 12.5 },
  rowSub: { color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 2 },
  rowMatched: { color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 3 },
  rowOk: { color: "rgba(74,182,37,0.95)", fontSize: 11, marginTop: 3, fontWeight: "900" },

  arrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowBtnHover: { backgroundColor: "rgba(74,182,37,0.25)" },
});
