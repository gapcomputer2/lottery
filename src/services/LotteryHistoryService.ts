import { ethers } from 'ethers';
import { 
  LotteryRoundInfo, 
  LotteryHistoryParams, 
  LotteryHistoryError 
} from '../types/LotteryTypes';
import LotteryRoundABI from '../contracts/LotteryRound.sol/LotteryHistoryTracker.json';

/**
 * Service for interacting with Lottery Round History
 */
export class LotteryHistoryService {
  private contract: ethers.Contract;

  /**
   * Constructor to initialize the lottery history contract
   * @param provider Web3 provider
   * @param contractAddress Address of the deployed contract
   */
  constructor(provider: ethers.Provider, contractAddress: string) {
    this.contract = new ethers.Contract(
      contractAddress, 
      LotteryRoundABI.abi, 
      provider
    );
  }

  /**
   * Fetch a specific lottery round by its index
   * @param roundIndex Index of the lottery round
   * @returns Promise resolving to LotteryRoundInfo
   */
  async getLotteryRound(roundIndex: number): Promise<LotteryRoundInfo> {
    try {
      const round = await this.contract.getLotteryRound(roundIndex);
      return this.mapContractRoundToInfo(round);
    } catch (error) {
      throw new LotteryHistoryError(`Failed to fetch lottery round: ${error}`);
    }
  }

  /**
   * Fetch total number of completed lottery rounds
   * @returns Promise resolving to total number of rounds
   */
  async getTotalRounds(): Promise<number> {
    try {
      return await this.contract.getTotalRounds();
    } catch (error) {
      throw new LotteryHistoryError(`Failed to fetch total rounds: ${error}`);
    }
  }

  /**
   * Fetch recent lottery rounds with pagination
   * @param params Pagination parameters
   * @returns Promise resolving to array of LotteryRoundInfo
   */
  async getRecentRounds({
    startIndex = 0, 
    limit = 10
  }: LotteryHistoryParams = {}): Promise<LotteryRoundInfo[]> {
    try {
      const rounds = await this.contract.getRecentRounds(startIndex, limit);
      return rounds.map(this.mapContractRoundToInfo);
    } catch (error) {
      throw new LotteryHistoryError(`Failed to fetch recent rounds: ${error}`);
    }
  }

  /**
   * Maps contract round data to TypeScript interface
   * @param contractRound Raw round data from contract
   * @returns Mapped LotteryRoundInfo
   */
  private mapContractRoundToInfo(contractRound: any): LotteryRoundInfo {
    return {
      roundNumber: Number(contractRound.roundNumber),
      timestamp: Number(contractRound.timestamp),
      winner: contractRound.winner,
      potSize: contractRound.potSize,
      ticketsSold: Number(contractRound.ticketsSold),
      completed: contractRound.completed
    };
  }
}