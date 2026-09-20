import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { isMockMode } from '../../src/lib/env';

// Login: Supabase Auth (email). En modo mock, entrada directa demo.
export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');

  const signIn = async () => {
    setErr('');
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setErr(error.message);
    else router.replace('/(organizer)/dashboard' as any);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>EventOps</Text>
      {isMockMode() ? (
        <Button title="Entrar en modo demo (sin backend)" onPress={() => router.replace('/(organizer)/dashboard' as any)} />
      ) : (
        <View>
          <TextInput placeholder="tu@email.com" value={email} onChangeText={setEmail} autoCapitalize="none" style={{ borderWidth: 1, padding: 10, marginVertical: 12 }} />
          <Button title="Enviar link mágico" onPress={signIn} />
          {err ? <Text>{err}</Text> : null}
        </View>
      )}
      <View style={{ marginTop: 16 }}>
        <Button title="Soy invitado → Kiosk" onPress={() => router.replace('/(guest)/kiosk' as any)} />
      </View>
    </View>
  );
}
