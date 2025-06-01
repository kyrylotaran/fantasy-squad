import { z } from 'zod/v4';

export const ScoringRuleCategoryEnum = z.enum([
  'qualifying',
  'race',
  'bonus',
  'penalty',
]);
