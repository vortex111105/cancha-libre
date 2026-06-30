import { router } from 'expo-router';
import { supabase } from './supabase';

export async function routeByRole(userId: string) {
  try {
    const { data } = await supabase
      .from('cl_users')
      .select('role')
      .eq('id', userId)
      .single();
    if (data?.role === 'cancha_owner') {
      router.replace('/(cancha-portal)/dashboard' as any);
    } else {
      router.replace('/(tabs)/home' as any);
    }
  } catch {
    router.replace('/(tabs)/home' as any);
  }
}
