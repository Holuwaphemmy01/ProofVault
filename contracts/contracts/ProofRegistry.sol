// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ProofRegistry {
    struct ProofRecord {
        string projectName;
        bytes32 proofHash;
        string status;
        uint256 timestamp;
        address creator;
    }

    uint256 public proofCount;
    mapping(uint256 => ProofRecord) private proofs;

    event ProofStored(
        uint256 indexed proofId,
        string projectName,
        bytes32 indexed proofHash,
        string status,
        uint256 timestamp,
        address indexed creator
    );

    function storeProof(
        string calldata projectName,
        bytes32 proofHash,
        string calldata status
    ) external returns (uint256 proofId) {
        proofId = ++proofCount;

        proofs[proofId] = ProofRecord({
            projectName: projectName,
            proofHash: proofHash,
            status: status,
            timestamp: block.timestamp,
            creator: msg.sender
        });

        emit ProofStored(proofId, projectName, proofHash, status, block.timestamp, msg.sender);
    }

    function getProof(uint256 proofId) external view returns (ProofRecord memory) {
        require(proofId > 0 && proofId <= proofCount, "Proof does not exist");
        return proofs[proofId];
    }
}
