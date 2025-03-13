import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import memorystore from "memorystore";
import bcrypt from "bcryptjs";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const MemoryStore = memorystore(session);

// Utility to validate player starting status updates
const startingPlayerSchema = z.object({
  isStarting: z.boolean(),
  benchPosition: z.number().optional()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "fantasy-ipl-secret",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({
        checkPeriod: 86400000, // Prune expired entries every 24h
      }),
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      },
    })
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid username or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize and deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        username: validatedData.username,
        password: hashedPassword,
      });

      // Create default user team
      await storage.createUserTeam({
        userId: user.id,
        name: `${user.username}'s Team`,
      });

      res.status(201).json({
        id: user.id,
        username: user.username,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    const user = req.user as any;
    res.json({
      id: user.id,
      username: user.username,
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", isAuthenticated, (req, res) => {
    const user = req.user as any;
    res.json({
      id: user.id,
      username: user.username,
    });
  });

  // User points endpoint
  app.get("/api/users/points", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    try {
      const userTeam = await storage.getUserTeamByUserId(user.id);
      res.json({ points: userTeam?.points || 0 });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user points" });
    }
  });

  // Player endpoints
  app.get("/api/players", async (req, res) => {
    try {
      const players = await storage.getAllPlayers();
      res.json(players);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });

  // Team endpoints
  app.get("/api/teams", async (req, res) => {
    try {
      const teams = await storage.getAllTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  // User Team endpoints
  app.get("/api/user-team", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    try {
      const userTeam = await storage.getUserTeamByUserId(user.id);
      if (!userTeam) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.json(userTeam);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user team" });
    }
  });

  app.get("/api/user-team/players", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    try {
      const userTeam = await storage.getUserTeamByUserId(user.id);
      if (!userTeam) {
        return res.status(404).json({ message: "Team not found" });
      }
      const teamPlayers = await storage.getUserTeamPlayers(userTeam.id);
      res.json(teamPlayers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team players" });
    }
  });

  app.post("/api/user-team/players", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({ message: "Player ID is required" });
    }

    try {
      const userTeam = await storage.getUserTeamByUserId(user.id);
      if (!userTeam) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Check if player exists
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      // Check if player is already in the team
      const teamPlayers = await storage.getUserTeamPlayers(userTeam.id);
      if (teamPlayers.some(tp => tp.id === playerId)) {
        return res.status(400).json({ message: "Player already in team" });
      }

      // Check budget constraints
      if ((userTeam.usedBudget || 0) + player.price > (userTeam.totalBudget || 100)) {
        return res.status(400).json({ message: "Not enough budget" });
      }

      // Check team composition limits
      const playersByType = teamPlayers.reduce((acc: any, p) => {
        acc[p.type] = (acc[p.type] || 0) + 1;
        return acc;
      }, {});

      // Updated squad composition for a 15-player squad
      const maxPlayers = {
        "batsman": 3,
        "bowler": 5,
        "all-rounder": 5,
        "wicket-keeper": 2
      };

      // Check if we've reached the total squad size limit of 15 players
      if (teamPlayers.length >= 15) {
        return res.status(400).json({ message: "Maximum squad size of 15 players reached" });
      }

      if ((playersByType[player.type] || 0) >= maxPlayers[player.type as keyof typeof maxPlayers]) {
        return res.status(400).json({ message: `Maximum ${player.type}s reached` });
      }

      // Check transfers remaining, but only if the user is past the initial team creation phase
      // Consider initial team creation until they have 15 players
      const isInitialTeamCreation = teamPlayers.length < 15;
      if (!isInitialTeamCreation && (userTeam.transfersRemaining || 0) <= 0) {
        return res.status(400).json({ message: "No transfers remaining" });
      }

      // Add player to team
      await storage.addPlayerToUserTeam(userTeam.id, playerId);

      // Update team budget and transfers (only decrement transfers if not in initial team selection)
      // Consider initial team creation until they have 15 players
      if (!isInitialTeamCreation) {
        await storage.updateUserTeam(userTeam.id, {
          usedBudget: (userTeam.usedBudget || 0) + player.price,
          transfersRemaining: (userTeam.transfersRemaining || 0) - 1
        });
      } else {
        await storage.updateUserTeam(userTeam.id, {
          usedBudget: (userTeam.usedBudget || 0) + player.price
        });
      }

      res.status(201).json({ message: "Player added to team" });
    } catch (error) {
      res.status(500).json({ message: "Failed to add player to team" });
    }
  });

  app.delete("/api/user-team/players/:playerId", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const playerId = parseInt(req.params.playerId);

    if (isNaN(playerId)) {
      return res.status(400).json({ message: "Invalid player ID" });
    }

    try {
      const userTeam = await storage.getUserTeamByUserId(user.id);
      if (!userTeam) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Check if player is in the team
      const teamPlayers = await storage.getUserTeamPlayers(userTeam.id);
      const playerToRemove = teamPlayers.find(tp => tp.id === playerId);
      
      if (!playerToRemove) {
        return res.status(404).json({ message: "Player not in team" });
      }

      // Remove player from team
      await storage.removePlayerFromUserTeam(userTeam.id, playerId);

      // Update team budget
      await storage.updateUserTeam(userTeam.id, {
        usedBudget: (userTeam.usedBudget || 0) - playerToRemove.price
      });

      res.status(200).json({ message: "Player removed from team" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove player from team" });
    }
  });

  app.patch("/api/user-team/players/:playerId/role", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const playerId = parseInt(req.params.playerId);
    const { role } = req.body;

    if (isNaN(playerId)) {
      return res.status(400).json({ message: "Invalid player ID" });
    }

    if (role && !["captain", "vice-captain"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    try {
      const userTeam = await storage.getUserTeamByUserId(user.id);
      if (!userTeam) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Check if player is in the team
      const teamPlayers = await storage.getUserTeamPlayers(userTeam.id);
      if (!teamPlayers.some(tp => tp.id === playerId)) {
        return res.status(404).json({ message: "Player not in team" });
      }

      // If setting a new captain/vice-captain, clear existing ones
      if (role) {
        for (const player of teamPlayers) {
          if (player.role === role) {
            await storage.updateUserTeamPlayerRole(userTeam.id, player.id, null);
          }
        }
      }

      // Update player role
      await storage.updateUserTeamPlayerRole(userTeam.id, playerId, role);

      res.status(200).json({ message: "Player role updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update player role" });
    }
  });
  
  // Endpoint to set a player as starting XI or bench
  app.patch("/api/user-team/players/:playerId/starting", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const playerId = parseInt(req.params.playerId);
    const { isStarting, benchPosition } = req.body;

    if (isNaN(playerId)) {
      return res.status(400).json({ message: "Invalid player ID" });
    }

    try {
      const userTeam = await storage.getUserTeamByUserId(user.id);
      if (!userTeam) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Check if player is in the team
      const teamPlayers = await storage.getUserTeamPlayers(userTeam.id);
      const playerIndex = teamPlayers.findIndex(tp => tp.id === playerId);
      
      if (playerIndex === -1) {
        return res.status(404).json({ message: "Player not in team" });
      }
      
      const player = teamPlayers[playerIndex];

      // If setting to starting XI, check if we already have 11 starting players
      if (isStarting) {
        const startingPlayers = teamPlayers.filter(p => p.isStarting);
        if (startingPlayers.length >= 11 && !player.isStarting) {
          return res.status(400).json({ message: "Already have 11 players in starting XI" });
        }
        
        // Check starting XI composition rules (1 WK, 3-5 BAT, 3-5 BOW, 1-3 ALL)
        const startingByType = {
          'wicket-keeper': startingPlayers.filter(p => p.type === 'wicket-keeper').length,
          'batsman': startingPlayers.filter(p => p.type === 'batsman').length,
          'bowler': startingPlayers.filter(p => p.type === 'bowler').length,
          'all-rounder': startingPlayers.filter(p => p.type === 'all-rounder').length
        };
        
        // Adjust the counts for the current player being moved
        if (!player.isStarting) {
          startingByType[player.type as keyof typeof startingByType]++;
        }
        
        const validationRules = {
          'wicket-keeper': { min: 1, max: 1 },
          'batsman': { min: 3, max: 5 },
          'bowler': { min: 3, max: 5 },
          'all-rounder': { min: 1, max: 3 }
        };
        
        const playerType = player.type as keyof typeof validationRules;
        const rule = validationRules[playerType];
        
        if (startingByType[playerType] > rule.max) {
          return res.status(400).json({ 
            message: `Maximum ${rule.max} ${playerType}s allowed in starting XI` 
          });
        }
      } else {
        // If setting to bench, check remaining players to ensure we still have valid composition
        const remainingStarters = teamPlayers.filter(p => p.isStarting && p.id !== playerId);
        
        // Starting XI needs: 1 WK, at least 3 BAT, at least 3 BOW, at least 1 ALL
        const startingByType = {
          'wicket-keeper': remainingStarters.filter(p => p.type === 'wicket-keeper').length,
          'batsman': remainingStarters.filter(p => p.type === 'batsman').length,
          'bowler': remainingStarters.filter(p => p.type === 'bowler').length,
          'all-rounder': remainingStarters.filter(p => p.type === 'all-rounder').length
        };
        
        const minRequirements = {
          'wicket-keeper': 1,
          'batsman': 3,
          'bowler': 3,
          'all-rounder': 1
        };
        
        const playerType = player.type as keyof typeof minRequirements;
        
        if (startingByType[playerType] < minRequirements[playerType]) {
          return res.status(400).json({ 
            message: `Need at least ${minRequirements[playerType]} ${playerType}s in starting XI` 
          });
        }
      }
      
      // If moving to bench and providing a bench position, validate it's between 1-4
      if (!isStarting && benchPosition !== undefined) {
        if (benchPosition < 1 || benchPosition > 4) {
          return res.status(400).json({ message: "Bench position must be between 1 and 4" });
        }
        
        // If another player already has this bench position, swap them
        const playerWithSameBenchPosition = teamPlayers.find(
          p => !p.isStarting && p.benchPosition === benchPosition && p.id !== playerId
        );
        
        if (playerWithSameBenchPosition) {
          // Get the current bench position of the player being moved (or 0 if was starting)
          const currentBenchPosition = player.isStarting ? 0 : player.benchPosition;
          
          // Update the other player to this position
          await storage.updateUserTeamPlayerBench(
            userTeam.id, 
            playerWithSameBenchPosition.id, 
            false, 
            currentBenchPosition
          );
        }
      }
      
      // Update player's starting status
      await storage.updateUserTeamPlayerBench(
        userTeam.id, 
        playerId, 
        isStarting, 
        isStarting ? 0 : (benchPosition || 0)
      );

      res.status(200).json({ message: "Player status updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update player status" });
    }
  });

  app.patch("/api/user-team/name", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Team name is required" });
    }

    try {
      const userTeam = await storage.getUserTeamByUserId(user.id);
      if (!userTeam) {
        return res.status(404).json({ message: "Team not found" });
      }

      await storage.updateUserTeam(userTeam.id, { name });

      res.status(200).json({ message: "Team name updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update team name" });
    }
  });

  app.post("/api/user-team/save", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    try {
      const userTeam = await storage.getUserTeamByUserId(user.id);
      if (!userTeam) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Just return success - team is already saved in database
      res.status(200).json({ message: "Team saved successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to save team" });
    }
  });

  app.delete("/api/user-team/reset", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    try {
      const userTeam = await storage.getUserTeamByUserId(user.id);
      if (!userTeam) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Remove all players from team
      await storage.removeAllPlayersFromUserTeam(userTeam.id);

      // Reset team stats
      await storage.updateUserTeam(userTeam.id, {
        usedBudget: 0,
        transfersRemaining: 2 // Reset transfers to default
      });

      res.status(200).json({ message: "Team reset successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset team" });
    }
  });

  app.get("/api/user-team/composition", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    try {
      const userTeam = await storage.getUserTeamByUserId(user.id);
      if (!userTeam) {
        return res.status(404).json({ message: "Team not found" });
      }

      const teamPlayers = await storage.getUserTeamPlayers(userTeam.id);
      
      // Count players by type
      const composition = {
        batsmen: teamPlayers.filter(p => p.type === "batsman").length,
        bowlers: teamPlayers.filter(p => p.type === "bowler").length,
        allRounders: teamPlayers.filter(p => p.type === "all-rounder").length,
        wicketKeepers: teamPlayers.filter(p => p.type === "wicket-keeper").length,
        maxBatsmen: 3,
        maxBowlers: 5,
        maxAllRounders: 5,
        maxWicketKeepers: 2,
        totalPlayers: teamPlayers.length,
        maxTotalPlayers: 15
      };

      res.json(composition);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team composition" });
    }
  });

  app.get("/api/user-team/distribution", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    try {
      const userTeam = await storage.getUserTeamByUserId(user.id);
      if (!userTeam) {
        return res.status(404).json({ message: "Team not found" });
      }

      const teamPlayers = await storage.getUserTeamPlayers(userTeam.id);
      
      // Count players by team
      const distribution = teamPlayers.reduce((acc: Record<string, number>, player) => {
        acc[player.team] = (acc[player.team] || 0) + 1;
        return acc;
      }, {});

      res.json(distribution);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team distribution" });
    }
  });

  // League endpoints
  app.get("/api/leagues/user", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    try {
      const leagues = await storage.getUserLeagues(user.id);
      res.json(leagues);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user leagues" });
    }
  });

  app.get("/api/leagues/global", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    try {
      const globalLeagues = await storage.getGlobalLeagues();
      
      // Mark leagues that user is already in
      const userLeagues = await storage.getUserLeagues(user.id);
      const userLeagueIds = userLeagues.map(l => l.id);
      
      const leagues = globalLeagues.map(league => ({
        ...league,
        joined: userLeagueIds.includes(league.id)
      }));

      res.json(leagues);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch global leagues" });
    }
  });

  app.post("/api/leagues/create", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const { name, isGlobal = false } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "League name is required" });
    }

    try {
      // Generate a unique code for the league
      const code = generateLeagueCode();
      
      // Create league
      const league = await storage.createLeague({
        name,
        creatorId: user.id,
        isGlobal,
        code
      });

      // Add creator as member
      await storage.addLeagueMember(league.id, user.id);

      res.status(201).json(league);
    } catch (error) {
      res.status(500).json({ message: "Failed to create league" });
    }
  });

  app.post("/api/leagues/join", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const { code } = req.body;

    if (!code || code.trim() === "") {
      return res.status(400).json({ message: "League code is required" });
    }

    try {
      // Find league by code
      const league = await storage.getLeagueByCode(code);
      if (!league) {
        return res.status(404).json({ message: "League not found" });
      }

      // Check if user is already a member
      const isMember = await storage.isLeagueMember(league.id, user.id);
      if (isMember) {
        return res.status(400).json({ message: "Already a member of this league" });
      }

      // Add user to league
      await storage.addLeagueMember(league.id, user.id);

      res.status(200).json({ message: "Joined league successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to join league" });
    }
  });

  // Fixture endpoints
  
  // Process automatic substitutions
  app.post("/api/fixtures/:fixtureId/substitutions", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const fixtureId = parseInt(req.params.fixtureId);
    
    if (isNaN(fixtureId)) {
      return res.status(400).json({ message: "Invalid fixture ID" });
    }
    
    try {
      // Get the user's team
      const userTeam = await storage.getUserTeamByUserId(user.id);
      if (!userTeam) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Process automatic substitutions
      await storage.processAutomaticSubstitutions(userTeam.id, fixtureId);
      
      // Get the updated team players
      const updatedPlayers = await storage.getUserTeamPlayers(userTeam.id);
      
      res.json({
        message: "Automatic substitutions processed successfully",
        players: updatedPlayers
      });
    } catch (error) {
      console.error('Error processing automatic substitutions:', error);
      res.status(500).json({ message: "Failed to process automatic substitutions" });
    }
  });
  
  app.get("/api/fixtures", async (req, res) => {
    try {
      const fixtures = await storage.getAllFixtures();
      res.json(fixtures);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fixtures" });
    }
  });

  app.get("/api/fixtures/upcoming", async (req, res) => {
    try {
      const fixtures = await storage.getUpcomingFixtures();
      res.json(fixtures);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming fixtures" });
    }
  });

  // Endpoint to generate random points for players in a fixture for demo purposes
  app.post("/api/fixtures/:fixtureId/generate-points", isAuthenticated, async (req, res) => {
    const fixtureId = parseInt(req.params.fixtureId);
    
    if (isNaN(fixtureId)) {
      return res.status(400).json({ message: "Invalid fixture ID" });
    }
    
    try {
      // Get all players
      const allPlayers = await storage.getAllPlayers();
      
      // Generate random points for each player
      const playerPerformances = [];
      for (const player of allPlayers) {
        // Generate random stats based on player type
        let stats: any = {};
        let points = 0;
        
        switch(player.type) {
          case 'batsman':
            stats.runs = Math.floor(Math.random() * 100);
            stats.fours = Math.floor(Math.random() * 10);
            stats.sixes = Math.floor(Math.random() * 5);
            stats.balls = Math.floor(stats.runs * 1.2) + Math.floor(Math.random() * 10);
            stats.strikeRate = stats.balls > 0 ? Math.round((stats.runs / stats.balls) * 100) : 0;
            points = stats.runs + (stats.fours * 1) + (stats.sixes * 2);
            
            // Bonus for half-century or century
            if (stats.runs >= 100) points += 20;
            else if (stats.runs >= 50) points += 10;
            
            // Bonus for good strike rate (if more than 10 runs scored)
            if (stats.runs > 10 && stats.strikeRate > 150) points += 5;
            break;
            
          case 'bowler':
            stats.overs = Math.floor(Math.random() * 4) + 1;
            stats.maidens = Math.floor(Math.random() * 2);
            stats.wickets = Math.floor(Math.random() * 5);
            stats.runs = Math.floor(Math.random() * 40);
            stats.economy = stats.overs > 0 ? Math.round((stats.runs / stats.overs) * 10) / 10 : 0;
            points = (stats.wickets * 25) + (stats.maidens * 5);
            
            // Bonus for 3+ wickets
            if (stats.wickets >= 5) points += 30;
            else if (stats.wickets >= 3) points += 15;
            
            // Bonus for good economy (if at least 2 overs bowled)
            if (stats.overs >= 2 && stats.economy < 6) points += 5;
            break;
            
          case 'all-rounder':
            // Batting stats
            stats.runs = Math.floor(Math.random() * 60);
            stats.fours = Math.floor(Math.random() * 5);
            stats.sixes = Math.floor(Math.random() * 3);
            stats.balls = Math.floor(stats.runs * 1.2) + Math.floor(Math.random() * 10);
            stats.strikeRate = stats.balls > 0 ? Math.round((stats.runs / stats.balls) * 100) : 0;
            
            // Bowling stats
            stats.overs = Math.floor(Math.random() * 3) + 1;
            stats.maidens = Math.floor(Math.random() * 1);
            stats.wickets = Math.floor(Math.random() * 3);
            stats.runsConceded = Math.floor(Math.random() * 30);
            stats.economy = stats.overs > 0 ? Math.round((stats.runsConceded / stats.overs) * 10) / 10 : 0;
            
            points = stats.runs + (stats.fours * 1) + (stats.sixes * 2) + (stats.wickets * 25) + (stats.maidens * 5);
            
            // Bonus for all-round performance
            if (stats.runs >= 30 && stats.wickets >= 2) points += 10;
            break;
            
          case 'wicket-keeper':
            stats.runs = Math.floor(Math.random() * 70);
            stats.fours = Math.floor(Math.random() * 8);
            stats.sixes = Math.floor(Math.random() * 4);
            stats.balls = Math.floor(stats.runs * 1.2) + Math.floor(Math.random() * 10);
            stats.strikeRate = stats.balls > 0 ? Math.round((stats.runs / stats.balls) * 100) : 0;
            stats.catches = Math.floor(Math.random() * 4);
            stats.stumpings = Math.floor(Math.random() * 2);
            points = stats.runs + (stats.fours * 1) + (stats.sixes * 2) + (stats.catches * 10) + (stats.stumpings * 15);
            
            // Bonus for good wicket-keeping
            if (stats.catches + stats.stumpings >= 4) points += 10;
            break;
        }
        
        // Create random performance record
        const performance = await storage.createPlayerPerformance({
          playerId: player.id,
          fixtureId,
          stats,
          points
        });
        playerPerformances.push(performance);
      }
      
      res.status(201).json({
        message: "Generated points for all players",
        performances: playerPerformances
      });
    } catch (error) {
      console.error('Error generating points:', error);
      res.status(500).json({ message: "Failed to generate points" });
    }
  });
  
  // Endpoint to get player performances for a fixture
  app.get("/api/fixtures/:fixtureId/performances", async (req, res) => {
    const fixtureId = parseInt(req.params.fixtureId);
    
    if (isNaN(fixtureId)) {
      return res.status(400).json({ message: "Invalid fixture ID" });
    }
    
    try {
      const performances = await storage.getPlayerPerformances(fixtureId);
      res.json(performances);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch player performances" });
    }
  });
  
  // Endpoint to apply a power-up (wildcard for unlimited transfers or triple captain)
  app.post("/api/user-team/power-up", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const { type, playerIds } = req.body;
    
    if (!type || !["wildcard", "triple-captain", "bench-boost", "free-hit"].includes(type)) {
      return res.status(400).json({ message: "Invalid power-up type" });
    }
    
    try {
      const userTeam = await storage.getUserTeamByUserId(user.id);
      if (!userTeam) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Handle different power-ups
      switch(type) {
        case "wildcard":
          // Give unlimited transfers for this gameweek
          await storage.updateUserTeam(userTeam.id, {
            transfersRemaining: 999
          });
          break;
          
        case "triple-captain":
          if (!playerIds || !playerIds.length) {
            return res.status(400).json({ message: "Player ID required for triple captain" });
          }
          
          // Check if player is in user's team
          const teamPlayers = await storage.getUserTeamPlayers(userTeam.id);
          const captainPlayer = teamPlayers.find(p => p.id === playerIds[0]);
          
          if (!captainPlayer) {
            return res.status(404).json({ message: "Player not in team" });
          }
          
          // Set as captain with triple points
          await storage.updateUserTeamPlayerRole(userTeam.id, playerIds[0], "triple-captain");
          break;
          
        case "bench-boost":
          // Allow bench players to earn points for this gameweek
          // For demo, we'll just return success
          break;
          
        case "free-hit":
          // Allow temporary unlimited transfers for one gameweek only
          await storage.updateUserTeam(userTeam.id, {
            transfersRemaining: 999,
            freeHitActive: true
          });
          break;
      }
      
      res.status(200).json({ 
        message: `${type} power-up applied successfully`,
        userTeam: await storage.getUserTeamByUserId(user.id)
      });
    } catch (error) {
      console.error('Error applying power-up:', error);
      res.status(500).json({ message: "Failed to apply power-up" });
    }
  });
  
  app.get("/api/fixtures/next", async (req, res) => {
    try {
      const nextFixture = await storage.getNextFixture();
      if (!nextFixture) {
        return res.status(404).json({ message: "No upcoming fixtures" });
      }

      // Calculate time remaining until match
      const now = new Date();
      const matchTime = new Date(nextFixture.startTime);
      const timeDiff = matchTime.getTime() - now.getTime();
      
      // Format as "3h 45m"
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const deadline = `${hours}h ${minutes}m`;

      res.json({
        ...nextFixture,
        deadline
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch next fixture" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

// Helper function to generate a random league code
function generateLeagueCode(length = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
