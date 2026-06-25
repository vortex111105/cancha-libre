export type Level = 'Principiante' | 'Intermedio' | 'Avanzado';
export type Sport = 'Fútbol 5' | 'Fútbol 7' | 'Fútbol 11';
export type ChallengeStatus = 'pending' | 'accepted' | 'declined';

export interface Team {
  id: string;
  name: string;
  neighborhood: string;
  city: string;
  level: Level;
  sport: Sport;
  members: number;
  wins: number;
  losses: number;
  draws: number;
  distance: number; // km
  avatar: string; // emoji placeholder
  color: string;
  description: string;
  availableDays: string[];
  rating: number;
}

export interface Challenge {
  id: string;
  team: Team;
  type: 'incoming' | 'outgoing';
  status: ChallengeStatus;
  proposedDate: string;
  proposedTime: string;
  field?: string;
  message: string;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  team: Team;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
}

export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
}

export const MY_TEAM: Team = {
  id: 'my-team',
  name: 'Los Pibes del Bajo',
  neighborhood: 'San Telmo',
  city: 'Buenos Aires',
  level: 'Intermedio',
  sport: 'Fútbol 5',
  members: 8,
  wins: 12,
  losses: 4,
  draws: 3,
  distance: 0,
  avatar: '🦁',
  color: '#FACC15',
  description: 'Equipo de amigos del barrio, jugamos hace 3 años. Buscamos partidos amistosos y competitivos.',
  availableDays: ['Martes', 'Jueves', 'Sábado'],
  rating: 4.3,
};

export const TEAMS: Team[] = [
  {
    id: '1',
    name: 'Villa Crespo FC',
    neighborhood: 'Villa Crespo',
    city: 'Buenos Aires',
    level: 'Intermedio',
    sport: 'Fútbol 5',
    members: 9,
    wins: 18,
    losses: 6,
    draws: 2,
    distance: 1.2,
    avatar: '🐺',
    color: '#60A5FA',
    description: 'Equipo con 5 años de historia. Jugamos los fines de semana y buscamos rivales de nivel similar.',
    availableDays: ['Sábado', 'Domingo'],
    rating: 4.6,
  },
  {
    id: '2',
    name: 'Los Compadres',
    neighborhood: 'Palermo',
    city: 'Buenos Aires',
    level: 'Avanzado',
    sport: 'Fútbol 5',
    members: 10,
    wins: 31,
    losses: 5,
    draws: 4,
    distance: 2.4,
    avatar: '🦅',
    color: '#F87171',
    description: 'Equipo competitivo de Palermo. Exigimos buen nivel técnico y ganas de ganar.',
    availableDays: ['Lunes', 'Miércoles', 'Viernes'],
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Barrio Norte United',
    neighborhood: 'Recoleta',
    city: 'Buenos Aires',
    level: 'Principiante',
    sport: 'Fútbol 7',
    members: 12,
    wins: 5,
    losses: 10,
    draws: 3,
    distance: 3.1,
    avatar: '🐻',
    color: '#4ADE80',
    description: 'Equipo nuevo buscando experiencia y diversión. Todos son bienvenidos.',
    availableDays: ['Domingo'],
    rating: 3.9,
  },
  {
    id: '4',
    name: 'El Nido SC',
    neighborhood: 'Núñez',
    city: 'Buenos Aires',
    level: 'Intermedio',
    sport: 'Fútbol 7',
    members: 11,
    wins: 14,
    losses: 8,
    draws: 5,
    distance: 4.7,
    avatar: '🦜',
    color: '#A78BFA',
    description: 'Del norte de la ciudad. Jugamos fútbol 7 con táctica y buen ambiente.',
    availableDays: ['Martes', 'Sábado'],
    rating: 4.2,
  },
  {
    id: '5',
    name: 'Los Cebollitas',
    neighborhood: 'Boedo',
    city: 'Buenos Aires',
    level: 'Principiante',
    sport: 'Fútbol 5',
    members: 7,
    wins: 3,
    losses: 7,
    draws: 2,
    distance: 5.3,
    avatar: '🌿',
    color: '#FB923C',
    description: 'Equipo amateur de Boedo, jugamos por el disfrute y la amistad.',
    availableDays: ['Jueves', 'Domingo'],
    rating: 3.7,
  },
  {
    id: '6',
    name: 'Tigres del Sur',
    neighborhood: 'Parque Patricios',
    city: 'Buenos Aires',
    level: 'Avanzado',
    sport: 'Fútbol 11',
    members: 16,
    wins: 22,
    losses: 7,
    draws: 4,
    distance: 6.8,
    avatar: '🐯',
    color: '#F59E0B',
    description: 'Equipo de fútbol 11 con cancha propia. Buscamos rivales para partidos intensos.',
    availableDays: ['Sábado', 'Domingo'],
    rating: 4.5,
  },
];

export const CHALLENGES: Challenge[] = [
  {
    id: 'c1',
    team: TEAMS[0],
    type: 'incoming',
    status: 'pending',
    proposedDate: 'Sábado 28 Jun',
    proposedTime: '18:00',
    field: 'Complejo Deportivo Palermo',
    message: 'Che, los vimos en la app y nos parece que puede ser un buen partido. ¿Les copa el sábado?',
    createdAt: 'Hace 2 horas',
  },
  {
    id: 'c2',
    team: TEAMS[3],
    type: 'incoming',
    status: 'pending',
    proposedDate: 'Martes 1 Jul',
    proposedTime: '20:00',
    message: 'Buscamos equipo para martes a la noche. ¿Tienen turno o reservamos juntos?',
    createdAt: 'Hace 5 horas',
  },
  {
    id: 'c3',
    team: TEAMS[1],
    type: 'outgoing',
    status: 'pending',
    proposedDate: 'Viernes 27 Jun',
    proposedTime: '19:30',
    field: 'Cancha El Estadio - Palermo',
    message: 'Los desafiamos a un partido amistoso. Ya tenemos la cancha reservada.',
    createdAt: 'Ayer',
  },
  {
    id: 'c4',
    team: TEAMS[4],
    type: 'outgoing',
    status: 'accepted',
    proposedDate: 'Domingo 29 Jun',
    proposedTime: '10:00',
    message: 'Un partido dominical para arrancar bien la semana.',
    createdAt: 'Hace 2 días',
  },
];

export const CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv1',
    team: TEAMS[0],
    lastMessage: 'Perfecto, nos vemos el sábado entonces 👊',
    lastMessageTime: '14:32',
    unread: 2,
  },
  {
    id: 'conv2',
    team: TEAMS[3],
    lastMessage: '¿Pueden jugar en Núñez o prefieren más cerca?',
    lastMessageTime: 'Ayer',
    unread: 0,
  },
  {
    id: 'conv3',
    team: TEAMS[1],
    lastMessage: 'Ok, esperamos confirmación de la cancha',
    lastMessageTime: 'Lun',
    unread: 0,
  },
];

export const MESSAGES: Message[] = [
  { id: 'm1', text: '¡Hola! Vimos que buscan rival para esta semana', sender: 'them', time: '13:45' },
  { id: 'm2', text: 'Sí! Tenemos el sábado libre. ¿Qué nivel manejan?', sender: 'me', time: '13:52' },
  { id: 'm3', text: 'Intermedio, jugamos hace 4 años. Buen ambiente 🙌', sender: 'them', time: '13:55' },
  { id: 'm4', text: 'Perfecto, nosotros también. ¿Ya tienen cancha o buscamos juntos?', sender: 'me', time: '14:01' },
  { id: 'm5', text: 'Podemos reservar en el complejo de Palermo, suelen tener lugar los sábados', sender: 'them', time: '14:15' },
  { id: 'm6', text: 'Dale, hagan la reserva y nos avisan el costo para dividirlo', sender: 'me', time: '14:28' },
  { id: 'm7', text: 'Perfecto, nos vemos el sábado entonces 👊', sender: 'them', time: '14:32' },
];

export const FIELDS = [
  {
    id: 'f1',
    name: 'Complejo Deportivo Palermo',
    address: 'Av. del Libertador 3950, Palermo',
    distance: 1.8,
    price: 8500,
    sports: ['Fútbol 5', 'Fútbol 7'],
    rating: 4.7,
    available: true,
  },
  {
    id: 'f2',
    name: 'Cancha El Estadio',
    address: 'Honduras 5678, Palermo Soho',
    distance: 2.3,
    price: 7200,
    sports: ['Fútbol 5'],
    rating: 4.4,
    available: true,
  },
  {
    id: 'f3',
    name: 'Club Deportivo San Telmo',
    address: 'Defensa 234, San Telmo',
    distance: 0.5,
    price: 6000,
    sports: ['Fútbol 5', 'Fútbol 7', 'Fútbol 11'],
    rating: 4.2,
    available: false,
  },
];
