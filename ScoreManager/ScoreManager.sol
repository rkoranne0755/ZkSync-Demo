// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IVerifier.sol"; // Import the Verifier interface

contract ScoreManager {
    IVerifier public verifier; // Instance of Verifier contract

    struct Score {
        address user;
        uint256 score;
    }

    mapping(address => uint256) public scores; // Mapping to store scores
    address[] public users; // List of users who have called the contract

    constructor(address _verifierAddress) {
        verifier = IVerifier(_verifierAddress); // Set the Verifier contract address
    }

    /// @notice Check verification and update score
    /// @param proof The proof structure containing verification data
    /// @param input The input data for verification
    function checkAndUpdateScore(Proof memory proof, uint[2] memory input) public {
        require(verifier.verifyTx(proof, input), "Verification failed");

        // Update score for the caller
        if (scores[msg.sender] == 0) {
            users.push(msg.sender); // Add user to list if not already present
        }
        scores[msg.sender] += 1; // Increment score for caller
    }

    /// @notice List all users and their scores
    /// @return List of Score structs containing user addresses and their scores
    function listScores() public view returns (Score[] memory) {
        Score[] memory userScores = new Score[](users.length);
        for (uint i = 0; i < users.length; i++) {
            userScores[i] = Score(users[i], scores[users[i]]);
        }
        return userScores;
    }
}