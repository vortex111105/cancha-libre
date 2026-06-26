import type { Team } from '@/constants/MockData';

export function mapTeam(row: Record<string, any>): Team {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar ?? '⚽',
    sport: row.sport,
    level: row.level,
    neighborhood: row.neighborhood ?? '',
    city: row.city ?? 'Buenos Aires',
    wins: row.wins ?? 0,
    losses: row.losses ?? 0,
    draws: row.draws ?? 0,
    rating: row.rating ?? 0,
    distance: 0,
    members: row.members ?? 1,
    availableDays: row.available_days ?? [],
    description: row.description ?? '',
    color: row.color ?? '#4ADE80',
    inviteCode: row.invite_code,
  };
}

export function mapUser(row: Record<string, any>): import('@/constants/MockData').User {
  return {
    id: row.id,
    email: row.email,
    name: row.name ?? 'Jugador',
    avatar: row.avatar ?? '🏃',
    sportPreference: row.sport_preference ?? '',
    position: row.position ?? '',
    lookingForTeam: row.looking_for_team ?? false,
    bio: row.bio ?? '',
    teamId: row.team_id,
  };
}
