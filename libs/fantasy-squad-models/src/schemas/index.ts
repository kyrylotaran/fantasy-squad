import { z } from 'zod/v4';
import { ScoringRuleCategoryEnum } from '../constants';

export const QualifyingStandingSchema = z.object({
  driverId: z.uuid(),
  lapTime: z.number().optional(),
});

export const RaceStandingSchema = z.object({
  driverId: z.uuid(),
  laps: z.array(z.number()).optional(),
});

export const RaceSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  date: z.date(),
  circuit: z.string(),
});

export const RaceWeekendResultSchema = z.object({
  id: z.uuid(),
  raceId: RaceSchema.shape.id,
  qualifyingStandings: z.array(QualifyingStandingSchema),
  raceStandings: z.array(RaceStandingSchema),
});

export const DriverSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  price: z.number(),
  car: z.string(),
});

export const SquadSchema = z.object({
  id: z.uuid(),
  playerId: z.uuid(),
  driverIds: z.array(DriverSchema.shape.id),
  totalBudget: z.number(),
  totalPoints: z.number(),
});

export const ScoringRuleSchema = z.object({
  name: z.string(),
  pointsDelta: z.number(),
  description: z.string(),
  category: ScoringRuleCategoryEnum,
});
