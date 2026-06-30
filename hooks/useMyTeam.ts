import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { mapTeam, mapUser } from '@/lib/mappers';
import type { Team, User } from '@/constants/MockData';

type UseMyTeamResult = {
  team: Team | null;
  userProfile: User | null;
  teamId: string | null;
  userId: string | null;
  displayName: string;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useMyTeam(): UseMyTeamResult {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);

      // Nombre desde auth metadata (siempre disponible, sin necesitar columna name)
      const metaName = (user.user_metadata?.full_name as string | undefined) ?? user.email?.split('@')[0] ?? '';
      setDisplayName(metaName.split(' ')[0] || 'Jugador');

      const { data: userRecord, error: userErr } = await supabase
        .from('cl_users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (userErr) throw userErr;
      if (userRecord) {
        // Si cl_users.name existe, prefiere ese; si no, usa auth metadata
        if (userRecord.name) {
          setDisplayName((userRecord.name as string).split(' ')[0]);
        }
        setUserProfile(mapUser(userRecord));
      }

      if (!userRecord?.team_id) {
        setLoading(false);
        return;
      }

      setTeamId(userRecord.team_id);

      const { data: teamData, error: teamErr } = await supabase
        .from('cl_teams')
        .select('*')
        .eq('id', userRecord.team_id)
        .single();

      if (teamErr) throw teamErr;
      setTeam(mapTeam(teamData));
    } catch (err: any) {
      setError(err.message ?? 'Error al cargar el equipo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { team, userProfile, teamId, userId, displayName, loading, error, refetch: fetch };
}
