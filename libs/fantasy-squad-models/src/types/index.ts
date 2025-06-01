import { z } from 'zod/v4';
import {
  RaceWeekendResultSchema,
  QualifyingStandingSchema,
  RaceStandingSchema,
  DriverSchema,
  SquadSchema,
  RaceSchema,
  ScoringRuleSchema,
} from '../schemas';
import { ScoringRuleCategoryEnum } from '../constants';

export type RaceWeekendResult = z.infer<typeof RaceWeekendResultSchema>;
export type QualifyingStanding = z.infer<typeof QualifyingStandingSchema>;
export type RaceStanding = z.infer<typeof RaceStandingSchema>;
export type Driver = z.infer<typeof DriverSchema>;
export type Squad = z.infer<typeof SquadSchema>;
export type Race = z.infer<typeof RaceSchema>;
export type ScoringRule = z.infer<typeof ScoringRuleSchema>;
export type ScoringRuleCategory = z.infer<typeof ScoringRuleCategoryEnum>;
