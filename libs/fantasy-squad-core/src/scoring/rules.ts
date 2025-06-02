import { ScoringCalculationArgs, PositionPoints } from '../types';
import {
  GAINED_POSITION_POINTS,
  LOST_POSITION_POINTS,
  QUALIFYING_POINTS,
  RACE_POINTS,
} from './points';

/**
 * Calculate points for qualifying position
 */
export function calculateQualifyingPositionPoints({
  result,
  driverId,
}: ScoringCalculationArgs): number {
  const driverIndex = result.qualifyingStandings.findIndex(
    (r) => r.driverId === driverId
  );

  if (driverIndex === -1) {
    throw new Error(`Driver ${driverId} not found in qualifying standings`);
  }
  const position = driverIndex + 1;
  return (QUALIFYING_POINTS as PositionPoints)[position] ?? 0;
}

/**
 * Calculate points for race position
 */
export function calculateRacePositionPoints({
  result,
  driverId,
}: ScoringCalculationArgs): number {
  const driverIndex = result.raceStandings.findIndex(
    (r) => r.driverId === driverId
  );

  if (driverIndex === -1) {
    throw new Error(`Driver ${driverId} not found in race standings`);
  }

  const position = driverIndex + 1;
  return (RACE_POINTS as PositionPoints)[position] ?? 0;
}

export function calculateDNFPoints(): number {
  // TODO: Implement DNF points calculation logic
  return 0;
}

export function calculateChangedPositionPoints({
  result,
  driverId,
}: ScoringCalculationArgs): number {
  const qualifyingIndex = result.qualifyingStandings.findIndex(
    (r) => r.driverId === driverId
  );
  const raceIndex = result.raceStandings.findIndex(
    (r) => r.driverId === driverId
  );

  if (qualifyingIndex === -1 || raceIndex === -1) {
    throw new Error(`Driver ${driverId} not found in standings`);
  }

  const positionChange = raceIndex - qualifyingIndex;

  if (positionChange > 0) {
    return positionChange * LOST_POSITION_POINTS;
  } else if (positionChange < 0) {
    return Math.abs(positionChange) * GAINED_POSITION_POINTS;
  }

  return 0;
}

export function calculateFastestLapPoints(): number {
  // TODO: Implement fastest lap points calculation logic
  return 0;
}
