export interface Player {
  id: number;
  name: string;
  team: string;
  type: string; // 'wicket-keeper' | 'batsman' | 'bowler' | 'all-rounder'
  price: number;
  image: string | null;
  stats: any;
}

export interface PlayerWithRole extends Player {
  role?: string | null;
  isStarting?: boolean;
  benchPosition?: number;
}

// These types represent the composition rules for a valid team
export const PlayerTypeRules = {
  'wicket-keeper': { min: 1, max: 1 },
  'batsman': { min: 3, max: 5 },
  'bowler': { min: 3, max: 5 },
  'all-rounder': { min: 1, max: 3 }
};

// These represent the total squad size rules
export const SquadRules = {
  total: 15,
  starting: 11,
  bench: 4,
  types: {
    'wicket-keeper': 2,
    'batsman': 3,
    'bowler': 5,
    'all-rounder': 5,
  }
};