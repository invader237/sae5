import { useState } from 'react';
import { StyleSheet, TextInput, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}> 
      <ThemedText type="title" style={styles.title}>Connexion</ThemedText>

      <View style={styles.form}>
        <View style={styles.field}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Utilisateur</ThemedText>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Nom d'utilisateur"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="default"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Mot de passe</ThemedText>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Mot de passe"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#999"
          />
        </View>

        <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}> 
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>Se connecter</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  title: {
    textAlign: 'justify',
  },
  form: {
    marginTop: 24,
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    opacity: 0.9,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#fff',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#0A84FF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#fff',
  },
});
