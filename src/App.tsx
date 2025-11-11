import React from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { getAuth } from "firebase/auth";
import "./services/database.ts";
import { Login, useCurrentUser } from "./components/auth/Auth.tsx";

export default function App() {
  const { userId, email, loggingIn } = useCurrentUser();
  const isAuthenticated = Boolean(userId);

  function handleSignOut() {
    getAuth().signOut().catch(console.error);
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.content}>
          {loggingIn ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Checking login status...</Text>
            </View>
          ) : isAuthenticated ? (
            <View style={styles.welcomeContainer}>
              <Text style={styles.title}>You are logged in 🎉</Text>
              <Text style={styles.subtitle}>
                Signed in as{" "}
                <Text style={styles.highlight}>{email || "Unknown user"}</Text>
              </Text>
              <View style={styles.button}>
                <Button title="Sign out" onPress={handleSignOut} />
              </View>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Login />
            </View>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#52616b",
  },
  formContainer: {
    width: "100%",
  },
  welcomeContainer: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1f2933",
  },
  subtitle: {
    fontSize: 16,
    color: "#52616b",
    textAlign: "center",
  },
  highlight: {
    fontWeight: "600",
    color: "#2563eb",
  },
  button: {
    marginTop: 16,
    alignSelf: "stretch",
  },
});
