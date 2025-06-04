import { describe, it, expect } from 'vitest';
import {
  calculateQualifyingPositionPoints,
  calculateRacePositionPoints,
  calculateDNFPoints,
  calculateChangedPositionPoints,
  calculateFastestLapPoints,
} from './rules';
import { RaceWeekendResult } from '@fantasy-squad/models';

const createMockRaceWeekendResult = (
  qualifyingStandings: Array<{ driverId: string }>,
  raceStandings: Array<{ driverId: string; isDNF?: boolean }>,
  fastestLap?: { driverId: string; lapTime: number }
): RaceWeekendResult => ({
  id: 'test-id',
  raceId: 'race-id',
  qualifyingStandings: qualifyingStandings.map((standing) => ({
    driverId: standing.driverId,
    lapTime: 90.123,
  })),
  raceStandings: raceStandings.map((standing) => ({
    driverId: standing.driverId,
    laps: [90.123, 89.456],
    isDNF: standing.isDNF ?? false,
  })),
  fastestLap,
});

describe('rules', () => {
  describe('calculateQualifyingPositionPoints', () => {
    it('should return correct points for pole position (P1)', () => {
      const result = createMockRaceWeekendResult(
        [{ driverId: 'driver-1' }, { driverId: 'driver-2' }],
        []
      );

      const points = calculateQualifyingPositionPoints({
        result,
        driverId: 'driver-1',
      });

      expect(points).toBe(13);
    });

    it('should return correct points for P2', () => {
      const result = createMockRaceWeekendResult(
        [{ driverId: 'driver-1' }, { driverId: 'driver-2' }],
        []
      );

      const points = calculateQualifyingPositionPoints({
        result,
        driverId: 'driver-2',
      });

      expect(points).toBe(11);
    });

    it('should return correct points for P10', () => {
      const result = createMockRaceWeekendResult(
        Array.from({ length: 10 }, (_, i) => ({ driverId: `driver-${i + 1}` })),
        []
      );

      const points = calculateQualifyingPositionPoints({
        result,
        driverId: 'driver-10',
      });

      expect(points).toBe(1);
    });

    it('should return 0 points for positions outside top 10', () => {
      const result = createMockRaceWeekendResult(
        Array.from({ length: 15 }, (_, i) => ({ driverId: `driver-${i + 1}` })),
        []
      );

      const points = calculateQualifyingPositionPoints({
        result,
        driverId: 'driver-15',
      });

      expect(points).toBe(0);
    });

    it('should throw error when driver not found in qualifying standings', () => {
      const result = createMockRaceWeekendResult(
        [{ driverId: 'driver-1' }],
        []
      );

      expect(() =>
        calculateQualifyingPositionPoints({
          result,
          driverId: 'non-existent-driver',
        })
      ).toThrow('Driver non-existent-driver not found in qualifying standings');
    });
  });

  describe('calculateRacePositionPoints', () => {
    it('should return correct points for race winner (P1)', () => {
      const result = createMockRaceWeekendResult(
        [],
        [{ driverId: 'driver-1' }, { driverId: 'driver-2' }]
      );

      const points = calculateRacePositionPoints({
        result,
        driverId: 'driver-1',
      });

      expect(points).toBe(42);
    });

    it('should return correct points for P2', () => {
      const result = createMockRaceWeekendResult(
        [],
        [{ driverId: 'driver-1' }, { driverId: 'driver-2' }]
      );

      const points = calculateRacePositionPoints({
        result,
        driverId: 'driver-2',
      });

      expect(points).toBe(35);
    });

    it('should return correct points for P20', () => {
      const result = createMockRaceWeekendResult(
        [],
        Array.from({ length: 20 }, (_, i) => ({ driverId: `driver-${i + 1}` }))
      );

      const points = calculateRacePositionPoints({
        result,
        driverId: 'driver-20',
      });

      expect(points).toBe(1);
    });

    it('should return 0 points for positions outside top 20', () => {
      const result = createMockRaceWeekendResult(
        [],
        Array.from({ length: 22 }, (_, i) => ({ driverId: `driver-${i + 1}` }))
      );

      const points = calculateRacePositionPoints({
        result,
        driverId: 'driver-22',
      });

      expect(points).toBe(0);
    });

    it('should throw error when driver not found in race standings', () => {
      const result = createMockRaceWeekendResult(
        [],
        [{ driverId: 'driver-1' }]
      );

      expect(() =>
        calculateRacePositionPoints({
          result,
          driverId: 'non-existent-driver',
        })
      ).toThrow('Driver non-existent-driver not found in race standings');
    });
  });

  describe('calculateDNFPoints', () => {
    it('should return DNF points when driver did not finish', () => {
      const result = createMockRaceWeekendResult(
        [{ driverId: 'driver-1' }],
        [{ driverId: 'driver-1', isDNF: true }]
      );

      const points = calculateDNFPoints({
        result,
        driverId: 'driver-1',
      });

      expect(points).toBe(-20);
    });

    it('should return 0 when driver finished the race', () => {
      const result = createMockRaceWeekendResult(
        [{ driverId: 'driver-1' }],
        [{ driverId: 'driver-1', isDNF: false }]
      );

      const points = calculateDNFPoints({
        result,
        driverId: 'driver-1',
      });

      expect(points).toBe(0);
    });

    it('should throw error when driver not found in race standings', () => {
      const result = createMockRaceWeekendResult(
        [{ driverId: 'driver-1' }],
        []
      );

      expect(() =>
        calculateDNFPoints({
          result,
          driverId: 'driver-1',
        })
      ).toThrow('Driver driver-1 not found in race standings');
    });
  });

  describe('calculateChangedPositionPoints', () => {
    it('should return positive points for gaining positions', () => {
      // Driver starts P5 in qualifying, finishes P3 in race (gained 2 positions)
      const result = createMockRaceWeekendResult(
        Array.from({ length: 10 }, (_, i) => ({ driverId: `driver-${i + 1}` })),
        [
          { driverId: 'driver-1' },
          { driverId: 'driver-2' },
          { driverId: 'driver-5' }, // Was P5 in qualifying, now P3
          { driverId: 'driver-3' },
          { driverId: 'driver-4' },
          { driverId: 'driver-6' },
          { driverId: 'driver-7' },
          { driverId: 'driver-8' },
          { driverId: 'driver-9' },
          { driverId: 'driver-10' },
        ]
      );

      const points = calculateChangedPositionPoints({
        result,
        driverId: 'driver-5',
      });

      // Qualifying index: 4 (P5), Race index: 2 (P3)
      // Position change: 2 - 4 = -2 (negative means gained positions)
      // Points: -2 * -1 = 2 points
      expect(points).toBe(2);
    });

    it('should return negative points for losing positions', () => {
      // Driver starts P3 in qualifying, finishes P5 in race (lost 2 positions)
      const result = createMockRaceWeekendResult(
        Array.from({ length: 10 }, (_, i) => ({ driverId: `driver-${i + 1}` })),
        [
          { driverId: 'driver-1' },
          { driverId: 'driver-2' },
          { driverId: 'driver-4' },
          { driverId: 'driver-5' },
          { driverId: 'driver-3' }, // Was P3 in qualifying, now P5
          { driverId: 'driver-6' },
          { driverId: 'driver-7' },
          { driverId: 'driver-8' },
          { driverId: 'driver-9' },
          { driverId: 'driver-10' },
        ]
      );

      const points = calculateChangedPositionPoints({
        result,
        driverId: 'driver-3',
      });

      // Qualifying index: 2 (P3), Race index: 4 (P5)
      // Position change: 4 - 2 = 2 (positive means lost positions)
      // Points: 2 * -1 = -2 points
      expect(points).toBe(-2);
    });

    it('should return 0 points for maintaining same position', () => {
      const result = createMockRaceWeekendResult(
        [{ driverId: 'driver-1' }, { driverId: 'driver-2' }],
        [{ driverId: 'driver-1' }, { driverId: 'driver-2' }]
      );

      const points = calculateChangedPositionPoints({
        result,
        driverId: 'driver-1',
      });

      expect(points).toBe(0);
    });

    it('should throw error when driver not found in qualifying standings', () => {
      const result = createMockRaceWeekendResult(
        [{ driverId: 'driver-1' }],
        [{ driverId: 'driver-1' }, { driverId: 'driver-2' }]
      );

      expect(() =>
        calculateChangedPositionPoints({
          result,
          driverId: 'driver-2',
        })
      ).toThrow('Driver driver-2 not found in standings');
    });

    it('should throw error when driver not found in race standings', () => {
      const result = createMockRaceWeekendResult(
        [{ driverId: 'driver-1' }, { driverId: 'driver-2' }],
        [{ driverId: 'driver-1' }]
      );

      expect(() =>
        calculateChangedPositionPoints({
          result,
          driverId: 'driver-2',
        })
      ).toThrow('Driver driver-2 not found in standings');
    });

    it('should handle large position gains correctly', () => {
      // Driver starts P20 in qualifying, finishes P1 in race (gained 19 positions)
      const qualifyingStandings = Array.from({ length: 20 }, (_, i) => ({
        driverId: `driver-${i + 1}`,
      }));
      const raceStandings = [
        { driverId: 'driver-20' }, // Was P20, now P1
        ...Array.from({ length: 19 }, (_, i) => ({
          driverId: `driver-${i + 1}`,
        })),
      ];

      const result = createMockRaceWeekendResult(
        qualifyingStandings,
        raceStandings
      );

      const points = calculateChangedPositionPoints({
        result,
        driverId: 'driver-20',
      });

      // Qualifying index: 19 (P20), Race index: 0 (P1)
      // Position change: 0 - 19 = -19 (negative means gained positions)
      // Points: -19 * -1 = 19 points
      expect(points).toBe(19);
    });

    it('should handle large position losses correctly', () => {
      // Driver starts P1 in qualifying, finishes P20 in race (lost 19 positions)
      const qualifyingStandings = Array.from({ length: 20 }, (_, i) => ({
        driverId: `driver-${i + 1}`,
      }));
      const raceStandings = [
        ...Array.from({ length: 19 }, (_, i) => ({
          driverId: `driver-${i + 2}`,
        })),
        { driverId: 'driver-1' }, // Was P1, now P20
      ];

      const result = createMockRaceWeekendResult(
        qualifyingStandings,
        raceStandings
      );

      const points = calculateChangedPositionPoints({
        result,
        driverId: 'driver-1',
      });

      // Qualifying index: 0 (P1), Race index: 19 (P20)
      // Position change: 19 - 0 = 19 (positive means lost positions)
      // Points: 19 * -1 = -19 points
      expect(points).toBe(-19);
    });
  });

  describe('calculateFastestLapPoints', () => {
    it('should return fastest lap points when driver has fastest lap', () => {
      const result = createMockRaceWeekendResult(
        [{ driverId: 'driver-1' }],
        [{ driverId: 'driver-1' }],
        { driverId: 'driver-1', lapTime: 87.123 }
      );

      const points = calculateFastestLapPoints({
        result,
        driverId: 'driver-1',
      });

      expect(points).toBe(2);
    });

    it('should return 0 when driver does not have fastest lap', () => {
      const result = createMockRaceWeekendResult(
        [{ driverId: 'driver-1' }, { driverId: 'driver-2' }],
        [{ driverId: 'driver-1' }, { driverId: 'driver-2' }],
        { driverId: 'driver-2', lapTime: 87.123 }
      );

      const points = calculateFastestLapPoints({
        result,
        driverId: 'driver-1',
      });

      expect(points).toBe(0);
    });

    it('should return 0 when no fastest lap is recorded', () => {
      const result = createMockRaceWeekendResult(
        [{ driverId: 'driver-1' }],
        [{ driverId: 'driver-1' }]
      );

      const points = calculateFastestLapPoints({
        result,
        driverId: 'driver-1',
      });

      expect(points).toBe(0);
    });
  });
});
