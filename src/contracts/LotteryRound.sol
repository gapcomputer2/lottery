// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

struct LotteryRoundInfo {
    uint256 roundNumber;
    uint256 timestamp;
    address winner;
    uint256 potSize;
    uint256 ticketsSold;
    bool completed;
}

contract LotteryHistoryTracker {
    // Array to store historical lottery rounds
    LotteryRoundInfo[] private lotteryRounds;

    // Event for when a new lottery round is recorded
    event LotteryRoundRecorded(
        uint256 indexed roundNumber, 
        uint256 timestamp, 
        address winner, 
        uint256 potSize
    );

    /**
     * @dev Records a completed lottery round
     * @param _winner Address of the lottery winner
     * @param _potSize Total pot size for the round
     * @param _ticketsSold Number of tickets sold in the round
     */
    function recordLotteryRound(
        address _winner, 
        uint256 _potSize, 
        uint256 _ticketsSold
    ) internal {
        require(_winner != address(0), "Invalid winner address");
        
        LotteryRoundInfo memory newRound = LotteryRoundInfo({
            roundNumber: lotteryRounds.length + 1,
            timestamp: block.timestamp,
            winner: _winner,
            potSize: _potSize,
            ticketsSold: _ticketsSold,
            completed: true
        });

        lotteryRounds.push(newRound);

        emit LotteryRoundRecorded(
            newRound.roundNumber, 
            newRound.timestamp, 
            newRound.winner, 
            newRound.potSize
        );
    }

    /**
     * @dev Retrieves a specific lottery round by its index
     * @param _roundIndex Index of the lottery round
     * @return LotteryRoundInfo details of the specified round
     */
    function getLotteryRound(uint256 _roundIndex) 
        public 
        view 
        returns (LotteryRoundInfo memory) 
    {
        require(_roundIndex < lotteryRounds.length, "Round does not exist");
        return lotteryRounds[_roundIndex];
    }

    /**
     * @dev Retrieves the total number of completed lottery rounds
     * @return Total number of rounds
     */
    function getTotalRounds() public view returns (uint256) {
        return lotteryRounds.length;
    }

    /**
     * @dev Retrieves recent lottery rounds with pagination
     * @param _startIndex Starting index for pagination
     * @param _limit Maximum number of rounds to retrieve
     * @return Array of recent LotteryRoundInfo
     */
    function getRecentRounds(uint256 _startIndex, uint256 _limit) 
        public 
        view 
        returns (LotteryRoundInfo[] memory) 
    {
        require(_startIndex < lotteryRounds.length, "Invalid start index");
        
        uint256 endIndex = _startIndex + _limit;
        if (endIndex > lotteryRounds.length) {
            endIndex = lotteryRounds.length;
        }
        
        uint256 resultLength = endIndex - _startIndex;
        LotteryRoundInfo[] memory recentRounds = new LotteryRoundInfo[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            recentRounds[i] = lotteryRounds[_startIndex + i];
        }
        
        return recentRounds;
    }
}