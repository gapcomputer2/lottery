import { ethers } from 'ethers';
import LotteryABI from '../utils/Lottery.json';
import { LOTTERY_CONTRACT_ADDRESS } from '../utils/constants';

export interface LotteryRound {
  roundId: number;
  timestamp: number;
  potSize: string;
  winner: string | null;
  participants: string[];
}

export async function fetchLotteryHistory(
  provider: ethers.providers.Provider, 
  maxRounds: number = 10
): Promise<LotteryRound[]> {
  try {
    // Validate inputs
    if (maxRounds <= 0) {
      throw new Error('Max rounds must be a positive number');
    }

    // Create contract instance
    const contract = new ethers.Contract(
      LOTTERY_CONTRACT_ADDRESS, 
      LotteryABI.abi, 
      provider
    );

    // Fetch total number of rounds
    const totalRounds = await contract.getTotalRounds();
    const startRound = Math.max(0, totalRounds - maxRounds);

    // Fetch rounds in parallel
    const roundPromises = Array.from(
      { length: Math.min(maxRounds, totalRounds) }, 
      (_, index) => contract.getRoundInfo(startRound + index)
    );

    const roundsData = await Promise.all(roundPromises);

    // Transform raw data into structured LotteryRound objects
    return roundsData.map((round, index) => ({
      roundId: startRound + index,
      timestamp: round.timestamp.toNumber(),
      potSize: ethers.utils.formatEther(round.potSize),
      winner: round.winner === ethers.constants.AddressZero ? null : round.winner,
      participants: round.participants
    }));
  } catch (error) {
    console.error('Error fetching lottery history:', error);
    throw new Error('Failed to retrieve lottery history');
  }
}

export async function getLatestRound(
  provider: ethers.providers.Provider
): Promise<LotteryRound | null> {
  try {
    const contract = new ethers.Contract(
      LOTTERY_CONTRACT_ADDRESS, 
      LotteryABI.abi, 
      provider
    );

    const totalRounds = await contract.getTotalRounds();
    
    if (totalRounds === 0) {
      return null;
    }

    const latestRound = await contract.getRoundInfo(totalRounds - 1);

    return {
      roundId: totalRounds - 1,
      timestamp: latestRound.timestamp.toNumber(),
      potSize: ethers.utils.formatEther(latestRound.potSize),
      winner: latestRound.winner === ethers.constants.AddressZero 
        ? null 
        : latestRound.winner,
      participants: latestRound.participants
    };
  } catch (error) {
    console.error('Error fetching latest round:', error);
    return null;
  }
}