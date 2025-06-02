import { Driver, RaceWeekendResult } from '@fantasy-squad/models';

export type ScoringCalculationArgs = {
  result: RaceWeekendResult;
  driverId: Driver['id'];
};

export type PositionPoints = Record<number, number>;
