import { describe, it, expect, vi } from 'vitest';
import { ethers } from 'ethers';
import { LotteryHistoryService } from './LotteryHistoryService';
import { LotteryHistoryError } from '../types/LotteryTypes';

describe('LotteryHistoryService', () => {
  const mockProvider = {
    // Mock provider methods
  } as unknown as ethers.Provider;
  const contractAddress = '0x1234567890123456789012345678901234567890';

  const mockContractRound = {
    roundNumber: 1n,
    timestamp: 1623456789n,
    winner: '0xabcdef',
    potSize: 1000000000000000000n,
    ticketsSold: 100n,
    completed: true
  };

  // Factory method to create mock contract
  const createMockContract = () => ({
    getLotteryRound: vi.fn(),
    getTotalRounds: vi.fn(),
    getRecentRounds: vi.fn()
  });

  vi.mock('ethers', () => {
    return {
      ethers: {
        Contract: vi.fn((address, abi, provider) => createMockContract())
      }
    };
  });

  it('should fetch a specific lottery round', async () => {
    const mockContract = createMockContract();
    vi.spyOn(ethers, 'Contract').mockReturnValue(mockContract);

    mockContract.getLotteryRound.mockResolvedValue(mockContractRound);

    const service = new LotteryHistoryService(mockProvider, contractAddress);
    const round = await service.getLotteryRound(0);
    
    expect(round).toEqual({
      roundNumber: 1,
      timestamp: 1623456789,
      winner: '0xabcdef',
      potSize: 1000000000000000000n,
      ticketsSold: 100,
      completed: true
    });
  });

  it('should handle errors when fetching a round', async () => {
    const mockContract = createMockContract();
    vi.spyOn(ethers, 'Contract').mockReturnValue(mockContract);

    mockContract.getLotteryRound.mockRejectedValue(new Error('Fetch failed'));

    const service = new LotteryHistoryService(mockProvider, contractAddress);
    await expect(service.getLotteryRound(0)).rejects.toThrow(LotteryHistoryError);
  });

  it('should fetch total number of rounds', async () => {
    const mockContract = createMockContract();
    vi.spyOn(ethers, 'Contract').mockReturnValue(mockContract);

    mockContract.getTotalRounds.mockResolvedValue(5n);

    const service = new LotteryHistoryService(mockProvider, contractAddress);
    const totalRounds = await service.getTotalRounds();
    
    expect(totalRounds).toBe(5);
  });

  it('should fetch recent rounds', async () => {
    const mockContract = createMockContract();
    vi.spyOn(ethers, 'Contract').mockReturnValue(mockContract);

    mockContract.getRecentRounds.mockResolvedValue([mockContractRound]);

    const service = new LotteryHistoryService(mockProvider, contractAddress);
    const rounds = await service.getRecentRounds();
    
    expect(rounds).toHaveLength(1);
    expect(rounds[0].roundNumber).toBe(1);
  });
});