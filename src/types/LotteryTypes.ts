/**
 * Interface representing a Lottery Round's information
 */
export interface LotteryRoundInfo {
  roundNumber: number;
  timestamp: number;
  winner: string;
  potSize: bigint;
  ticketsSold: number;
  completed: boolean;
}

/**
 * Type for pagination parameters when fetching lottery rounds
 */
export interface LotteryHistoryParams {
  startIndex?: number;
  limit?: number;
}

/**
 * Custom error for lottery history retrieval
 */
export class LotteryHistoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LotteryHistoryError';
  }
}