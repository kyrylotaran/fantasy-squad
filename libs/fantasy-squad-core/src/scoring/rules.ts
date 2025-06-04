import { ScoringCalculationArgs, PositionPoints } from '../types';
import {
  GAINED_POSITION_POINTS,
  LOST_POSITION_POINTS,
  QUALIFYING_POINTS,
  RACE_POINTS,
  DNF_POINTS,
  FASTEST_LAP_POINTS,
} from './points';

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

export function calculateDNFPoints({
  result,
  driverId,
}: ScoringCalculationArgs): number {
  const driverStanding = result.raceStandings.find(
    (r) => r.driverId === driverId
  );

  if (!driverStanding) {
    throw new Error(`Driver ${driverId} not found in race standings`);
  }

  return driverStanding.isDNF ? DNF_POINTS : 0;
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

export function calculateFastestLapPoints({
  result,
  driverId,
}: ScoringCalculationArgs): number {
  if (!result.fastestLap) {
    return 0;
  }

  return result.fastestLap.driverId === driverId ? FASTEST_LAP_POINTS : 0;
}
