import { StyleSheet } from "react-native";

const COLORS = {
  background: "#f2f2f2",
  primary: "#2563eb",
  textDark: "#1f2933",
  textMuted: "#52616b",
};

export const HOME_COPY = {
  loading: "Loading...",
  empty: "No packing lists yet.",
};

export const homeStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  loading: { alignItems: "center", gap: 12 },
  loadingText: { fontSize: 16, color: COLORS.textMuted },
  home: { gap: 16, width: "100%", maxWidth: 420, alignSelf: "center" },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textDark,
    textAlign: "center",
  },
  subtitle: { fontSize: 16, color: COLORS.textMuted, textAlign: "center" },
  highlight: { fontWeight: "600", color: COLORS.primary },
  button: { marginTop: 16, alignSelf: "center", width: "100%" },
  listContainer: { gap: 8, paddingVertical: 8 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.textDark,
    textAlign: "center",
    marginBottom: 4,
  },
  listItem: { fontSize: 16, color: COLORS.textDark, paddingVertical: 4 },
  empty: { alignItems: "center" },
  emptyText: { fontSize: 16, color: COLORS.textMuted },
});
