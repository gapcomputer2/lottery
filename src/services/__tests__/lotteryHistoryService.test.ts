import { describe, it, expect, vi } from 'vitest';
import { ethers } from 'ethers';
import { fetchLotteryHistory, getLatestRound } from '../lotteryHistoryService';

// Mock provider and contract
const mockProvider = {
  provider: vi.fn()
};

const mockContract = {
  getTotalRounds: vi.fn(),
  getRoundInfo: vi.fn()
};

vi.mock('ethers', () => ({
  ethers: {
    ...vi.importActual('ethers'),
    Contract: vi.fn().mockImplementation(() => mockContract),
    utils: {
      formatEther: vi.fn().mockImplementation((value) => value.toString()),
      constants: {
        AddressZero: '0x0000000000000000000000000000000000000000'
      }
    }
  }
}));

describe('Lottery History Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchLotteryHistory', () => {
    it('should fetch lottery rounds successfully', async () => {
      mockContract.getTotalRounds.mockResolvedValue(3);
      mockContract.getRoundInfo
        .mockResolvedValueOnce({
          timestamp: { toNumber: () => 1000000 },
          potSize: { toString: () => '10' },
          winner: '0x123',
          participants: ['0x456', '0x789']
        })
        .mockResolvedValueOnce({
          timestamp: { toNumber: () => 2000000 },
          potSize: { toString: () => '20' },
          winner: '0x456',
          participants: ['0x123', '0x789']
        });

      const result = await fetchLotteryHistory(mockProvider.provider as any);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({
          roundId: 1,
          timestamp: 1000000,
          winner: '0x123',
          participants: ['0x456', '0x789']
        })
      );
    });

    it('should throw error for invalid max rounds', async () => {
      await expect(fetchLotteryHistory(mockProvider.provider as any, 0))
        .rejects.toThrow('Max rounds must be a positive number');
    });
  });

  describe('getLatestRound', () => {
    it('should return null if no rounds exist', async () => {
      mockContract.getTotalRounds.mockResolvedValue(0);

      const result = await getLatestRound(mockProvider.provider as any);
      expect(result).toBeNull();
    });

    it('should fetch the latest round successfully', async () => {
      mockContract.getTotalRounds.mockResolvedValue(1);
      mockContract.getRoundInfo.mockResolvedValue({
        timestamp: { toNumber: () => 3000000 },
        potSize: { toString: () => '30' },
        winner: '0x789',
        participants: ['0x123', '0x456']
      });

      const result = await getLatestRound(mockProvider.provider as any);

      expect(result).toEqual(
        expect.objectContaining({
          roundId: 0,
          timestamp: 3000000,
          winner: '0x789',
          participants: ['0x123', '0x456']
        })
      );
    });
  });
});