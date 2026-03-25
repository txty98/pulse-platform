import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { pulseBrand, pulseColors } from "@pulse/design-system";
import { getSupabaseConfigSnapshot } from "@pulse/supabase";

const config = getSupabaseConfigSnapshot();

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <Text style={styles.eyebrow}>{pulseBrand.productName} Admin</Text>
        <Text style={styles.title}>Support your church from anywhere.</Text>
        <Text style={styles.copy}>
          Staff and key leaders can manage care, activity, and ministry follow-up from a focused
          mobile workspace.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Supabase</Text>
          <Text style={styles.cardCopy}>
            {config.hasUrl && config.hasAnonKey
              ? "Environment is ready for app integration."
              : "Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to connect data."}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: pulseColors.deepTeal
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 28
  },
  eyebrow: {
    color: pulseColors.cream,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 12
  },
  title: {
    color: "#ffffff",
    fontSize: 38,
    lineHeight: 40,
    fontWeight: "700",
    marginBottom: 12
  },
  copy: {
    color: "#d7ece9",
    fontSize: 17,
    lineHeight: 25,
    marginBottom: 24
  },
  card: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: "#ffffff"
  },
  cardTitle: {
    color: "#163129",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8
  },
  cardCopy: {
    color: "#496058",
    lineHeight: 22
  }
});
