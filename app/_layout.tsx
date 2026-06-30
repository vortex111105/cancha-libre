import { useEffect, useState } from 'react';
import { Stack, router, useRootNavigationState, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { routeByRole } from '@/lib/auth';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { 
  useFonts, 
  Inter_400Regular, 
  Inter_500Medium, 
  Inter_600SemiBold, 
  Inter_700Bold, 
  Inter_800ExtraBold 
} from '@expo-google-fonts/inter';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const { expoPushToken } = usePushNotifications();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    if (expoPushToken?.data) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          await supabase.from('cl_users').update({ push_token: expoPushToken.data }).eq('id', session.user.id);
        }
      });
    }
  }, [expoPushToken, ready]);

  const rootNavigationState = useRootNavigationState();
  const segments = useSegments();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      if (event === 'SIGNED_OUT') {
        router.replace('/');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!ready || !rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)' || segments.length === 0 || segments[0] === 'index';
    
    if (session && inAuthGroup) {
      setTimeout(() => routeByRole(session.user.id), 0);
    }
  }, [ready, rootNavigationState?.key, session, segments]);

  if (!ready || !fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: Colors.bg },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(cancha-onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(cancha-portal)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="team/[id]"
          options={{
            title: 'Perfil del equipo',
            headerBackTitle: 'Volver',
          }}
        />
        <Stack.Screen
          name="team/join"
          options={{
            title: 'Unirse a equipo',
            headerBackTitle: 'Volver',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="profile/edit-player"
          options={{
            title: 'Editar perfil',
            headerBackTitle: 'Volver',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="chat/[id]"
          options={{
            title: 'Chat',
            headerBackTitle: 'Volver',
          }}
        />
        <Stack.Screen
          name="challenge/new"
          options={{
            title: 'Nuevo desafío',
            headerBackTitle: 'Volver',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="challenge/rate"
          options={{
            title: 'Calificar partido',
            headerBackTitle: 'Volver',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="tournaments/coming-soon"
          options={{
            title: 'Próximamente',
            headerBackTitle: 'Volver',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="payment/split"
          options={{
            title: 'Asegurar Reserva',
            headerBackTitle: 'Volver',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="payment/success"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="cancha-chat/[id]"
          options={{
            title: 'Consulta con la cancha',
            headerBackTitle: 'Volver',
          }}
        />
      </Stack>
    </>
  );
}
