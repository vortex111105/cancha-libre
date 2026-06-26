import { createClient } from '@supabase/supabase-js';
import { TEAMS } from '../constants/MockData';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('Inserting teams...');
  for (const team of TEAMS) {
    const { id, ...teamData } = team; 
    
    const formattedTeam = {
      name: teamData.name,
      avatar: teamData.avatar,
      sport: teamData.sport,
      level: teamData.level,
      neighborhood: teamData.neighborhood,
      city: teamData.city,
      members: teamData.members,
      wins: teamData.wins,
      losses: teamData.losses,
      draws: teamData.draws,
      distance: teamData.distance || 0,
      color: teamData.color,
      description: teamData.description,
      available_days: teamData.availableDays,
    };

    const { error } = await supabase.from('cl_teams').insert(formattedTeam);
    if (error) {
      console.error('Error inserting team:', error);
    } else {
      console.log(`Inserted ${teamData.name}`);
    }
  }
  console.log('Seeding finished.');
}

seed();
