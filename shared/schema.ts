import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar, foreignKey, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// IPL Teams table
export const iplTeams = pgTable("ipl_teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  primaryColor: text("primary_color"),
  secondaryColor: text("secondary_color"),
});

export const insertIplTeamSchema = createInsertSchema(iplTeams).pick({
  name: true,
  code: true,
  primaryColor: true,
  secondaryColor: true,
});

// Players table
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  team: text("team").notNull(),
  type: text("type").notNull(), // batsman, bowler, all-rounder, wicket-keeper
  price: integer("price").notNull(),
  image: text("image"),
  stats: jsonb("stats").notNull(), // Store player statistics
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  name: true,
  team: true,
  type: true,
  price: true,
  image: true,
  stats: true,
});

// User Teams table
export const userTeams = pgTable("user_teams", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  points: integer("points").default(0),
  rank: integer("rank").default(0),
  usedBudget: integer("used_budget").default(0),
  totalBudget: integer("total_budget").default(100),
  transfersRemaining: integer("transfers_remaining").default(2),
  lastWeekPoints: integer("last_week_points").default(0),
  averagePoints: integer("average_points").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserTeamSchema = createInsertSchema(userTeams).pick({
  userId: true,
  name: true,
});

// User Team Players table
export const userTeamPlayers = pgTable("user_team_players", {
  id: serial("id").primaryKey(),
  userTeamId: integer("user_team_id").notNull().references(() => userTeams.id),
  playerId: integer("player_id").notNull().references(() => players.id),
  role: text("role"), // captain, vice-captain, null
  isStarting: boolean("is_starting").default(true), // true if in starting XI, false if on bench
  benchPosition: integer("bench_position").default(0), // Position on bench (1-4) for substitution order
});

export const insertUserTeamPlayerSchema = createInsertSchema(userTeamPlayers).pick({
  userTeamId: true,
  playerId: true,
  role: true,
  isStarting: true,
  benchPosition: true,
});

// Leagues table
export const leagues = pgTable("leagues", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  isGlobal: boolean("is_global").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeagueSchema = createInsertSchema(leagues).pick({
  name: true,
  creatorId: true,
  isGlobal: true,
});

// League Members table
export const leagueMembers = pgTable("league_members", {
  id: serial("id").primaryKey(),
  leagueId: integer("league_id").notNull().references(() => leagues.id),
  userId: integer("user_id").notNull().references(() => users.id),
  rank: integer("rank").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeagueMemberSchema = createInsertSchema(leagueMembers).pick({
  leagueId: true,
  userId: true,
});

// Fixtures table
export const fixtures = pgTable("fixtures", {
  id: serial("id").primaryKey(),
  homeTeam: text("home_team").notNull().references(() => iplTeams.code),
  awayTeam: text("away_team").notNull().references(() => iplTeams.code),
  venue: text("venue").notNull(),
  startTime: timestamp("start_time").notNull(),
  status: text("status").default("upcoming").notNull(), // upcoming, live, completed
  result: text("result"),
  homeScore: text("home_score"),
  awayScore: text("away_score"),
});

export const insertFixtureSchema = createInsertSchema(fixtures).pick({
  homeTeam: true,
  awayTeam: true,
  venue: true,
  startTime: true,
  status: true,
});

// Player Performance in Matches table
export const playerPerformances = pgTable("player_performances", {
  id: serial("id").primaryKey(),
  fixtureId: integer("fixture_id").notNull().references(() => fixtures.id),
  playerId: integer("player_id").notNull().references(() => players.id),
  points: integer("points").default(0).notNull(),
  stats: jsonb("stats").notNull(), // Store performance stats (runs, wickets, etc)
});

export const insertPlayerPerformanceSchema = createInsertSchema(playerPerformances).pick({
  fixtureId: true,
  playerId: true,
  points: true,
  stats: true,
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof insertUserSchema._type;

export type IplTeam = typeof iplTeams.$inferSelect;
export type InsertIplTeam = typeof insertIplTeamSchema._type;

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof insertPlayerSchema._type;

export type UserTeam = typeof userTeams.$inferSelect;
export type InsertUserTeam = typeof insertUserTeamSchema._type;

export type UserTeamPlayer = typeof userTeamPlayers.$inferSelect;
export type InsertUserTeamPlayer = typeof insertUserTeamPlayerSchema._type;

export type League = typeof leagues.$inferSelect;
export type InsertLeague = typeof insertLeagueSchema._type;

export type LeagueMember = typeof leagueMembers.$inferSelect;
export type InsertLeagueMember = typeof insertLeagueMemberSchema._type;

export type Fixture = typeof fixtures.$inferSelect;
export type InsertFixture = typeof insertFixtureSchema._type;

export type PlayerPerformance = typeof playerPerformances.$inferSelect;
export type InsertPlayerPerformance = typeof insertPlayerPerformanceSchema._type;

// Custom types for the application
export type PlayerWithRole = Player & { 
  role?: string | null;
  isStarting?: boolean;
  benchPosition?: number;
};
