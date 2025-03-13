import { 
  users, type User, type InsertUser,
  iplTeams, type IplTeam, type InsertIplTeam,
  players, type Player, type InsertPlayer,
  userTeams, type UserTeam, type InsertUserTeam,
  userTeamPlayers, type UserTeamPlayer, type InsertUserTeamPlayer,
  leagues, type League, type InsertLeague,
  leagueMembers, type LeagueMember, type InsertLeagueMember,
  fixtures, type Fixture, type InsertFixture,
  playerPerformances, type PlayerPerformance, type InsertPlayerPerformance,
  type PlayerWithRole
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // IPL Teams methods
  getAllTeams(): Promise<IplTeam[]>;
  getTeam(code: string): Promise<IplTeam | undefined>;
  createTeam(team: InsertIplTeam): Promise<IplTeam>;
  
  // Player methods
  getAllPlayers(): Promise<Player[]>;
  getPlayer(id: number): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  
  // User Team methods
  getUserTeamByUserId(userId: number): Promise<UserTeam | undefined>;
  createUserTeam(team: InsertUserTeam): Promise<UserTeam>;
  updateUserTeam(id: number, updates: Partial<UserTeam>): Promise<UserTeam>;
  
  // User Team Players methods
  getUserTeamPlayers(userTeamId: number): Promise<PlayerWithRole[]>;
  addPlayerToUserTeam(userTeamId: number, playerId: number, role?: string): Promise<void>;
  removePlayerFromUserTeam(userTeamId: number, playerId: number): Promise<void>;
  removeAllPlayersFromUserTeam(userTeamId: number): Promise<void>;
  updateUserTeamPlayerRole(userTeamId: number, playerId: number, role: string | null): Promise<void>;
  updateUserTeamPlayerBench(userTeamId: number, playerId: number, isStarting: boolean, benchPosition: number): Promise<void>;
  processAutomaticSubstitutions(userTeamId: number, fixtureId: number): Promise<void>;
  
  // League methods
  getUserLeagues(userId: number): Promise<(League & { memberCount: number, userRank: number })[]>;
  getGlobalLeagues(): Promise<(League & { memberCount: number, averagePoints: number })[]>;
  getLeagueByCode(code: string): Promise<League | undefined>;
  createLeague(league: InsertLeague & { code: string }): Promise<League>;
  addLeagueMember(leagueId: number, userId: number): Promise<void>;
  isLeagueMember(leagueId: number, userId: number): Promise<boolean>;
  
  // Fixture methods
  getAllFixtures(): Promise<Fixture[]>;
  getUpcomingFixtures(limit?: number): Promise<Fixture[]>;
  getNextFixture(): Promise<Fixture | undefined>;
  
  // Player Performance methods
  getPlayerPerformances(fixtureId: number): Promise<PlayerPerformance[]>;
  createPlayerPerformance(performance: InsertPlayerPerformance): Promise<PlayerPerformance>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private iplTeams: Map<string, IplTeam>;
  private players: Map<number, Player>;
  private userTeams: Map<number, UserTeam>;
  private userTeamPlayers: Map<number, { userTeamId: number, playerId: number, role: string | null, isStarting?: boolean, benchPosition?: number }[]>;
  private leagues: Map<number, League>;
  private leagueMembers: Map<number, { leagueId: number, userId: number, rank: number }[]>;
  private fixtures: Map<number, Fixture>;
  private playerPerformances: Map<number, PlayerPerformance[]>;
  
  private currentIds: {
    users: number;
    iplTeams: number;
    players: number;
    userTeams: number;
    leagues: number;
    fixtures: number;
    playerPerformances: number;
  };

  constructor() {
    this.users = new Map();
    this.iplTeams = new Map();
    this.players = new Map();
    this.userTeams = new Map();
    this.userTeamPlayers = new Map();
    this.leagues = new Map();
    this.leagueMembers = new Map();
    this.fixtures = new Map();
    this.playerPerformances = new Map();
    
    this.currentIds = {
      users: 1,
      iplTeams: 1,
      players: 1,
      userTeams: 1,
      leagues: 1,
      fixtures: 1,
      playerPerformances: 1,
    };
    
    // Initialize with sample data
    this.initializeData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  // IPL Teams methods
  async getAllTeams(): Promise<IplTeam[]> {
    return Array.from(this.iplTeams.values());
  }

  async getTeam(code: string): Promise<IplTeam | undefined> {
    return this.iplTeams.get(code);
  }

  async createTeam(team: InsertIplTeam): Promise<IplTeam> {
    const id = this.currentIds.iplTeams++;
    const newTeam: IplTeam = { ...team, id };
    this.iplTeams.set(team.code, newTeam);
    return newTeam;
  }

  // Player methods
  async getAllPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async createPlayer(player: InsertPlayer): Promise<Player> {
    const id = this.currentIds.players++;
    const newPlayer: Player = { ...player, id };
    this.players.set(id, newPlayer);
    return newPlayer;
  }

  // User Team methods
  async getUserTeamByUserId(userId: number): Promise<UserTeam | undefined> {
    return Array.from(this.userTeams.values()).find(
      (team) => team.userId === userId
    );
  }

  async createUserTeam(team: InsertUserTeam): Promise<UserTeam> {
    const id = this.currentIds.userTeams++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const newTeam: UserTeam = { 
      ...team, 
      id, 
      createdAt, 
      updatedAt,
      points: 0,
      rank: 0,
      usedBudget: 0,
      totalBudget: 100,
      transfersRemaining: 2,
      lastWeekPoints: 0,
      averagePoints: 0
    };
    this.userTeams.set(id, newTeam);
    this.userTeamPlayers.set(id, []);
    return newTeam;
  }

  async updateUserTeam(id: number, updates: Partial<UserTeam>): Promise<UserTeam> {
    const team = this.userTeams.get(id);
    if (!team) {
      throw new Error("Team not found");
    }
    
    const updatedTeam = { ...team, ...updates, updatedAt: new Date() };
    this.userTeams.set(id, updatedTeam);
    return updatedTeam;
  }

  // User Team Players methods
  async getUserTeamPlayers(userTeamId: number): Promise<PlayerWithRole[]> {
    const teamPlayerEntries = this.userTeamPlayers.get(userTeamId) || [];
    return teamPlayerEntries.map(entry => {
      const player = this.players.get(entry.playerId);
      if (!player) throw new Error(`Player ${entry.playerId} not found`);
      return {
        ...player,
        role: entry.role,
        isStarting: entry.isStarting !== undefined ? entry.isStarting : true, // Default to starting
        benchPosition: entry.benchPosition || 0
      };
    });
  }

  async addPlayerToUserTeam(userTeamId: number, playerId: number, role: string | null = null): Promise<void> {
    const teamPlayers = this.userTeamPlayers.get(userTeamId) || [];
    
    // Check if player is already in team
    if (teamPlayers.some(tp => tp.playerId === playerId)) {
      throw new Error("Player already in team");
    }
    
    // Get count of players by position
    const playersCount = teamPlayers.length;
    
    // Default to starting XI if there are fewer than 11 players, otherwise bench
    const isStarting = playersCount < 11;
    const benchPosition = isStarting ? 0 : playersCount - 10;
    
    teamPlayers.push({
      userTeamId,
      playerId,
      role,
      isStarting,
      benchPosition
    });
    
    this.userTeamPlayers.set(userTeamId, teamPlayers);
  }

  async removePlayerFromUserTeam(userTeamId: number, playerId: number): Promise<void> {
    const teamPlayers = this.userTeamPlayers.get(userTeamId) || [];
    const filteredPlayers = teamPlayers.filter(tp => tp.playerId !== playerId);
    this.userTeamPlayers.set(userTeamId, filteredPlayers);
  }

  async removeAllPlayersFromUserTeam(userTeamId: number): Promise<void> {
    this.userTeamPlayers.set(userTeamId, []);
  }

  async updateUserTeamPlayerRole(userTeamId: number, playerId: number, role: string | null): Promise<void> {
    const teamPlayers = this.userTeamPlayers.get(userTeamId) || [];
    const updatedPlayers = teamPlayers.map(tp => {
      if (tp.playerId === playerId) {
        return { ...tp, role };
      }
      return tp;
    });
    
    this.userTeamPlayers.set(userTeamId, updatedPlayers);
  }
  
  async updateUserTeamPlayerBench(userTeamId: number, playerId: number, isStarting: boolean, benchPosition: number): Promise<void> {
    const teamPlayers = this.userTeamPlayers.get(userTeamId) || [];
    const updatedPlayers = teamPlayers.map(tp => {
      if (tp.playerId === playerId) {
        return { ...tp, isStarting, benchPosition };
      }
      return tp;
    });
    
    this.userTeamPlayers.set(userTeamId, updatedPlayers);
  }
  
  async processAutomaticSubstitutions(userTeamId: number, fixtureId: number): Promise<void> {
    // Get the team players
    const teamPlayers = this.userTeamPlayers.get(userTeamId) || [];
    
    // Get player performances for this fixture
    const performances = await this.getPlayerPerformances(fixtureId);
    const participatingPlayerIds = performances.map(perf => perf.playerId);
    
    // Find starting XI players who aren't participating
    const missingStarters = teamPlayers.filter(tp => 
      tp.isStarting && !participatingPlayerIds.includes(tp.playerId)
    );
    
    if (missingStarters.length === 0) {
      // All starters are playing, no substitutions needed
      return;
    }
    
    // Get bench players sorted by bench position
    const benchPlayers = teamPlayers
      .filter(tp => !tp.isStarting)
      .sort((a, b) => (a.benchPosition || 0) - (b.benchPosition || 0));
    
    // Track substitutions made
    const substitutions: Array<{out: number, in: number}> = [];
    
    // Try to make substitutions according to position rules
    for (const missingPlayer of missingStarters) {
      const player = this.players.get(missingPlayer.playerId);
      if (!player) continue;
      
      // Find suitable bench replacement with same type (position)
      const replacementIndex = benchPlayers.findIndex(bp => {
        if (substitutions.some(sub => sub.in === bp.playerId)) {
          // This bench player is already used as a substitute
          return false;
        }
        
        const benchPlayer = this.players.get(bp.playerId);
        if (!benchPlayer) return false;
        
        return benchPlayer.type === player.type && participatingPlayerIds.includes(bp.playerId);
      });
      
      if (replacementIndex >= 0) {
        const replacement = benchPlayers[replacementIndex];
        
        // Swap positions
        const updatedPlayers = teamPlayers.map(tp => {
          if (tp.playerId === missingPlayer.playerId) {
            return { ...tp, isStarting: false, benchPosition: replacement.benchPosition || 0 };
          }
          if (tp.playerId === replacement.playerId) {
            return { ...tp, isStarting: true, benchPosition: 0 };
          }
          return tp;
        });
        
        this.userTeamPlayers.set(userTeamId, updatedPlayers);
        
        // Record this substitution
        substitutions.push({ out: missingPlayer.playerId, in: replacement.playerId });
        
        // Remove the used bench player from consideration
        benchPlayers.splice(replacementIndex, 1);
      }
    }
    
    // If we still have missing starters and eligible bench players, 
    // make substitutions even if positions don't match
    const remainingMissingStarters = teamPlayers.filter(tp => 
      tp.isStarting && 
      !participatingPlayerIds.includes(tp.playerId) && 
      !substitutions.some(sub => sub.out === tp.playerId)
    );
    
    const remainingBenchPlayers = benchPlayers.filter(bp =>
      participatingPlayerIds.includes(bp.playerId) &&
      !substitutions.some(sub => sub.in === bp.playerId)
    );
    
    // Match them up in order of bench position
    for (let i = 0; i < Math.min(remainingMissingStarters.length, remainingBenchPlayers.length); i++) {
      const missingPlayer = remainingMissingStarters[i];
      const benchPlayer = remainingBenchPlayers[i];
      
      // Swap positions
      const updatedPlayers = teamPlayers.map(tp => {
        if (tp.playerId === missingPlayer.playerId) {
          return { ...tp, isStarting: false, benchPosition: benchPlayer.benchPosition || 0 };
        }
        if (tp.playerId === benchPlayer.playerId) {
          return { ...tp, isStarting: true, benchPosition: 0 };
        }
        return tp;
      });
      
      this.userTeamPlayers.set(userTeamId, updatedPlayers);
    }
  }

  // League methods
  async getUserLeagues(userId: number): Promise<(League & { memberCount: number, userRank: number })[]> {
    const allLeagueMembers = Array.from(this.leagueMembers.values()).flat();
    const userLeagueIds = allLeagueMembers
      .filter(member => member.userId === userId)
      .map(member => member.leagueId);
    
    return userLeagueIds.map(leagueId => {
      const league = this.leagues.get(leagueId);
      if (!league) throw new Error(`League ${leagueId} not found`);
      
      const members = allLeagueMembers.filter(member => member.leagueId === leagueId);
      const userMember = members.find(member => member.userId === userId);
      
      return {
        ...league,
        memberCount: members.length,
        userRank: userMember?.rank || 0
      };
    });
  }

  async getGlobalLeagues(): Promise<(League & { memberCount: number, averagePoints: number })[]> {
    const globalLeagues = Array.from(this.leagues.values()).filter(league => league.isGlobal);
    
    return globalLeagues.map(league => {
      const members = Array.from(this.leagueMembers.values())
        .flat()
        .filter(member => member.leagueId === league.id);
      
      return {
        ...league,
        memberCount: members.length,
        averagePoints: Math.floor(Math.random() * 1000) // Mock average points for now
      };
    });
  }

  async getLeagueByCode(code: string): Promise<League | undefined> {
    return Array.from(this.leagues.values()).find(
      (league) => league.code === code
    );
  }

  async createLeague(league: InsertLeague & { code: string }): Promise<League> {
    const id = this.currentIds.leagues++;
    const createdAt = new Date();
    const newLeague: League = { ...league, id, createdAt };
    this.leagues.set(id, newLeague);
    this.leagueMembers.set(id, []);
    return newLeague;
  }

  async addLeagueMember(leagueId: number, userId: number): Promise<void> {
    const members = this.leagueMembers.get(leagueId) || [];
    
    // Check if user is already a member
    if (members.some(member => member.userId === userId)) {
      throw new Error("User is already a member of this league");
    }
    
    members.push({
      leagueId,
      userId,
      rank: members.length + 1 // Default rank at the bottom
    });
    
    this.leagueMembers.set(leagueId, members);
  }

  async isLeagueMember(leagueId: number, userId: number): Promise<boolean> {
    const members = this.leagueMembers.get(leagueId) || [];
    return members.some(member => member.userId === userId);
  }

  // Fixture methods
  async getAllFixtures(): Promise<Fixture[]> {
    return Array.from(this.fixtures.values());
  }

  async getUpcomingFixtures(limit: number = 10): Promise<Fixture[]> {
    const now = new Date();
    
    return Array.from(this.fixtures.values())
      .filter(fixture => new Date(fixture.startTime) > now || fixture.status === 'upcoming')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, limit);
  }

  async getNextFixture(): Promise<Fixture | undefined> {
    const now = new Date();
    
    return Array.from(this.fixtures.values())
      .filter(fixture => new Date(fixture.startTime) > now || fixture.status === 'upcoming')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];
  }

  // Player Performance methods
  async getPlayerPerformances(fixtureId: number): Promise<PlayerPerformance[]> {
    return this.playerPerformances.get(fixtureId) || [];
  }

  async createPlayerPerformance(performance: InsertPlayerPerformance): Promise<PlayerPerformance> {
    const id = this.currentIds.playerPerformances++;
    const newPerformance: PlayerPerformance = { ...performance, id };
    
    const fixturePerformances = this.playerPerformances.get(performance.fixtureId) || [];
    fixturePerformances.push(newPerformance);
    
    this.playerPerformances.set(performance.fixtureId, fixturePerformances);
    return newPerformance;
  }

  // Initialize with sample data
  private initializeData() {
    // Add IPL teams
    const teamsData: InsertIplTeam[] = [
      { name: 'Mumbai Indians', code: 'MI', primaryColor: '#004BA0', secondaryColor: '#D1AB3E' },
      { name: 'Chennai Super Kings', code: 'CSK', primaryColor: '#F9CD05', secondaryColor: '#0F80F4' },
      { name: 'Royal Challengers Bangalore', code: 'RCB', primaryColor: '#EC1C24', secondaryColor: '#000000' },
      { name: 'Kolkata Knight Riders', code: 'KKR', primaryColor: '#3A225D', secondaryColor: '#FDB713' },
      { name: 'Delhi Capitals', code: 'DC', primaryColor: '#0078BC', secondaryColor: '#EF1C25' },
      { name: 'Punjab Kings', code: 'PBKS', primaryColor: '#ED1B24', secondaryColor: '#A7A9AC' },
      { name: 'Rajasthan Royals', code: 'RR', primaryColor: '#254AA5', secondaryColor: '#FF69B4' },
      { name: 'Sunrisers Hyderabad', code: 'SRH', primaryColor: '#FF822A', secondaryColor: '#000000' }
    ];
    
    teamsData.forEach(team => {
      const id = this.currentIds.iplTeams++;
      const newTeam: IplTeam = { ...team, id };
      this.iplTeams.set(team.code, newTeam);
    });

    // Add players for the transfer market
    const playersData: InsertPlayer[] = [
      // Batsmen
      { 
        name: 'Virat Kohli', 
        team: 'RCB', 
        type: 'batsman', 
        price: 12, 
        image: '', 
        stats: { average: 40.5, strikeRate: 129.4, points: 875 } 
      },
      { 
        name: 'Rohit Sharma', 
        team: 'MI', 
        type: 'batsman', 
        price: 11, 
        image: '', 
        stats: { average: 38.2, strikeRate: 130.2, points: 850 } 
      },
      { 
        name: 'KL Rahul', 
        team: 'PBKS', 
        type: 'batsman', 
        price: 11, 
        image: '', 
        stats: { average: 44.2, strikeRate: 134.5, points: 880 } 
      },
      { 
        name: 'Shikhar Dhawan', 
        team: 'PBKS', 
        type: 'batsman', 
        price: 9, 
        image: '', 
        stats: { average: 36.3, strikeRate: 126.5, points: 865 } 
      },
      { 
        name: 'Suryakumar Yadav', 
        team: 'MI', 
        type: 'batsman', 
        price: 9, 
        image: '', 
        stats: { average: 35.8, strikeRate: 137.4, points: 870 } 
      },
      { 
        name: 'Faf du Plessis', 
        team: 'RCB', 
        type: 'batsman', 
        price: 9, 
        image: '', 
        stats: { average: 37.5, strikeRate: 132.5, points: 885 } 
      },
      { 
        name: 'David Warner', 
        team: 'DC', 
        type: 'batsman', 
        price: 10, 
        image: '', 
        stats: { average: 41.5, strikeRate: 139.2, points: 930 } 
      },
      { 
        name: 'Kane Williamson', 
        team: 'SRH', 
        type: 'batsman', 
        price: 9.5, 
        image: '', 
        stats: { average: 38.7, strikeRate: 127.8, points: 875 } 
      },
      { 
        name: 'Shreyas Iyer', 
        team: 'KKR', 
        type: 'batsman', 
        price: 9, 
        image: '', 
        stats: { average: 36.2, strikeRate: 131.5, points: 860 } 
      },
      {
        name: 'Sanju Samson',
        team: 'RR',
        type: 'batsman',
        price: 9,
        image: '',
        stats: { average: 33.5, strikeRate: 140.5, points: 855 }
      },
      
      // Wicket-keepers
      { 
        name: 'MS Dhoni', 
        team: 'CSK', 
        type: 'wicket-keeper', 
        price: 10, 
        image: '', 
        stats: { average: 35.6, strikeRate: 140.8, stumpings: 39, points: 920 } 
      },
      { 
        name: 'Rishabh Pant', 
        team: 'DC', 
        type: 'wicket-keeper', 
        price: 10, 
        image: '', 
        stats: { average: 36.5, strikeRate: 146.8, stumpings: 25, points: 905 } 
      },
      { 
        name: 'Jos Buttler', 
        team: 'RR', 
        type: 'wicket-keeper', 
        price: 10, 
        image: '', 
        stats: { average: 42.1, strikeRate: 148.5, stumpings: 15, points: 900 } 
      },
      { 
        name: 'Dinesh Karthik', 
        team: 'RCB', 
        type: 'wicket-keeper', 
        price: 8.5, 
        image: '', 
        stats: { average: 34.2, strikeRate: 143.7, stumpings: 21, points: 870 } 
      },
      { 
        name: 'Ishan Kishan', 
        team: 'MI', 
        type: 'wicket-keeper', 
        price: 9, 
        image: '', 
        stats: { average: 35.8, strikeRate: 145.2, stumpings: 18, points: 885 } 
      },
      {
        name: 'Quinton de Kock',
        team: 'LSG',
        type: 'wicket-keeper',
        price: 9.5,
        image: '',
        stats: { average: 39.2, strikeRate: 142.6, stumpings: 19, points: 890 }
      },
      
      // Bowlers
      { 
        name: 'Jasprit Bumrah', 
        team: 'MI', 
        type: 'bowler', 
        price: 11, 
        image: '', 
        stats: { economy: 6.7, wickets: 130, points: 930 } 
      },
      { 
        name: 'Yuzvendra Chahal', 
        team: 'RR', 
        type: 'bowler', 
        price: 9, 
        image: '', 
        stats: { economy: 7.2, wickets: 121, points: 910 } 
      },
      { 
        name: 'Rashid Khan', 
        team: 'SRH', 
        type: 'bowler', 
        price: 10, 
        image: '', 
        stats: { economy: 6.3, wickets: 93, points: 945 } 
      },
      { 
        name: 'Kagiso Rabada', 
        team: 'DC', 
        type: 'bowler', 
        price: 9, 
        image: '', 
        stats: { economy: 7.5, wickets: 97, points: 915 } 
      },
      { 
        name: 'Trent Boult', 
        team: 'MI', 
        type: 'bowler', 
        price: 8, 
        image: '', 
        stats: { economy: 7.8, wickets: 78, points: 890 } 
      },
      { 
        name: 'Bhuvneshwar Kumar', 
        team: 'SRH', 
        type: 'bowler', 
        price: 8, 
        image: '', 
        stats: { economy: 7.4, wickets: 142, points: 895 } 
      },
      { 
        name: 'Mohammed Shami', 
        team: 'GT', 
        type: 'bowler', 
        price: 8.5, 
        image: '', 
        stats: { economy: 7.9, wickets: 99, points: 880 } 
      },
      { 
        name: 'Harshal Patel', 
        team: 'RCB', 
        type: 'bowler', 
        price: 8.5, 
        image: '', 
        stats: { economy: 8.1, wickets: 87, points: 885 } 
      },
      { 
        name: 'Avesh Khan', 
        team: 'LSG', 
        type: 'bowler', 
        price: 8, 
        image: '', 
        stats: { economy: 7.8, wickets: 67, points: 865 } 
      },
      { 
        name: 'T Natarajan', 
        team: 'SRH', 
        type: 'bowler', 
        price: 7.5, 
        image: '', 
        stats: { economy: 8.2, wickets: 70, points: 860 } 
      },
      { 
        name: 'Kuldeep Yadav', 
        team: 'DC', 
        type: 'bowler', 
        price: 8, 
        image: '', 
        stats: { economy: 7.5, wickets: 74, points: 870 } 
      },
      {
        name: 'Arshdeep Singh',
        team: 'PBKS',
        type: 'bowler',
        price: 7.5,
        image: '',
        stats: { economy: 7.6, wickets: 65, points: 855 }
      },
      
      // All-rounders
      { 
        name: 'Ravindra Jadeja', 
        team: 'CSK', 
        type: 'all-rounder', 
        price: 10, 
        image: '', 
        stats: { average: 28.5, strikeRate: 135.2, economy: 7.8, wickets: 110, points: 940 } 
      },
      { 
        name: 'Hardik Pandya', 
        team: 'MI', 
        type: 'all-rounder', 
        price: 10, 
        image: '', 
        stats: { average: 30.1, strikeRate: 151.2, economy: 8.5, wickets: 60, points: 925 } 
      },
      { 
        name: 'Andre Russell', 
        team: 'KKR', 
        type: 'all-rounder', 
        price: 10, 
        image: '', 
        stats: { average: 28.7, strikeRate: 172.3, economy: 9.1, wickets: 82, points: 935 } 
      },
      { 
        name: 'Glenn Maxwell', 
        team: 'RCB', 
        type: 'all-rounder', 
        price: 10, 
        image: '', 
        stats: { average: 33.2, strikeRate: 158.4, economy: 8.3, wickets: 26, points: 920 } 
      },
      { 
        name: 'Krunal Pandya', 
        team: 'LSG', 
        type: 'all-rounder', 
        price: 8.5, 
        image: '', 
        stats: { average: 26.8, strikeRate: 132.5, economy: 7.6, wickets: 61, points: 890 } 
      },
      { 
        name: 'Washington Sundar', 
        team: 'SRH', 
        type: 'all-rounder', 
        price: 8, 
        image: '', 
        stats: { average: 24.3, strikeRate: 128.7, economy: 7.2, wickets: 55, points: 875 } 
      },
      { 
        name: 'Axar Patel', 
        team: 'DC', 
        type: 'all-rounder', 
        price: 8.5, 
        image: '', 
        stats: { average: 25.6, strikeRate: 135.8, economy: 7.4, wickets: 69, points: 880 } 
      },
      { 
        name: 'Moeen Ali', 
        team: 'CSK', 
        type: 'all-rounder', 
        price: 9, 
        image: '', 
        stats: { average: 29.4, strikeRate: 142.3, economy: 7.8, wickets: 43, points: 900 } 
      },
      { 
        name: 'Marcus Stoinis', 
        team: 'LSG', 
        type: 'all-rounder', 
        price: 9, 
        image: '', 
        stats: { average: 31.2, strikeRate: 146.7, economy: 8.7, wickets: 34, points: 895 } 
      },
      { 
        name: 'Venkatesh Iyer', 
        team: 'KKR', 
        type: 'all-rounder', 
        price: 8, 
        image: '', 
        stats: { average: 30.4, strikeRate: 136.8, economy: 8.2, wickets: 18, points: 865 } 
      },
      {
        name: 'Shardul Thakur',
        team: 'CSK',
        type: 'all-rounder',
        price: 8,
        image: '',
        stats: { average: 22.3, strikeRate: 140.5, economy: 8.4, wickets: 57, points: 870 }
      }
    ];
    
    playersData.forEach(player => {
      const id = this.currentIds.players++;
      const newPlayer: Player = { ...player, id };
      this.players.set(id, newPlayer);
    });

    // Add fixtures
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(now);
    dayAfter.setDate(dayAfter.getDate() + 2);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const fixturesData: InsertFixture[] = [
      {
        homeTeam: 'MI',
        awayTeam: 'CSK',
        venue: 'Wankhede Stadium, Mumbai',
        startTime: now,
        status: 'live'
      },
      {
        homeTeam: 'RCB',
        awayTeam: 'KKR',
        venue: 'M. Chinnaswamy Stadium, Bengaluru',
        startTime: tomorrow,
        status: 'upcoming'
      },
      {
        homeTeam: 'DC',
        awayTeam: 'SRH',
        venue: 'Arun Jaitley Stadium, Delhi',
        startTime: dayAfter,
        status: 'upcoming'
      },
      {
        homeTeam: 'PBKS',
        awayTeam: 'RR',
        venue: 'Punjab Cricket Association Stadium, Mohali',
        startTime: nextWeek,
        status: 'upcoming'
      }
    ];
    
    fixturesData.forEach(fixture => {
      const id = this.currentIds.fixtures++;
      const newFixture: Fixture = { ...fixture, id };
      
      // Add some extra details for the live match
      if (fixture.status === 'live') {
        newFixture.homeScore = '156/4 (16.2 ov)';
        newFixture.awayScore = '';
      }
      
      this.fixtures.set(id, newFixture);
    });

    // Add global leagues
    const leaguesData = [
      { name: 'IPL Fantasy Global', code: 'IPLFG123', creatorId: 1, isGlobal: true },
      { name: 'Super Cricket League', code: 'SCL456', creatorId: 1, isGlobal: true },
      { name: 'Fantasy IPL Champions', code: 'FIC789', creatorId: 1, isGlobal: true }
    ];
    
    leaguesData.forEach(league => {
      const id = this.currentIds.leagues++;
      const createdAt = new Date();
      const newLeague: League = { ...league, id, createdAt };
      this.leagues.set(id, newLeague);
      
      // Add some random members
      const memberCount = Math.floor(Math.random() * 50) + 10;
      const members = Array.from({ length: memberCount }, (_, i) => ({
        leagueId: id,
        userId: 1000 + i, // Use high IDs to avoid conflicts
        rank: i + 1
      }));
      
      this.leagueMembers.set(id, members);
    });
  }
}

export const storage = new MemStorage();
