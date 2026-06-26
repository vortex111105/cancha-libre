import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { mapTeam } from '@/lib/mappers';
import type { Team } from '@/constants/MockData';

type UseMyTeamResult = {
  team: Team | null;
  teamId: string | null;
  userId: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useMyTeam(): UseMyTeamResult {
  const [team, setTeam] = useState<Team | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
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

      const { data: userRecord, error: userErr } = await supabase
        .from('cl_users')
        .select('team_id')
        .eq('id', user.id)
        .maybeSingle();

      if (userErr) throw userErr;
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

  return { team, teamId, userId, loading, error, refetch: fetch };
}
