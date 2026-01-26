import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function useCurrentUser() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [loggingIn, setLoggingIn] = useState(true);

  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      setUserId(user?.uid ?? "");
      setEmail(user?.email ?? "");
      setLoggingIn(false);
    });

    return unsubscribe;
  }, []);

  return { userId, email, loggingIn };
}

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email.trim(), password).catch(
      console.error,
    );
  }

  function handleRegister() {
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email.trim(), password)
      .then(() => signInWithEmailAndPassword(auth, email.trim(), password))
      .catch(console.error);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Sign in to continue</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          autoCapitalize="none"
          secureTextEntry
          placeholder="Password"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <View style={styles.button}>
          <Button onPress={handleLogin} title="Login" />
        </View>
        <View style={styles.button}>
          <Button onPress={handleRegister} title="Register" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  input: {
    width: "100%",
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
    width: "100%",
  },
});
