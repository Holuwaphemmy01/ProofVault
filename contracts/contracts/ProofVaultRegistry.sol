// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

contract ProofVaultRegistry {
    struct Project {
        string name;
        string slug;
        bytes32 websiteHash;
        bytes32 metadataHash;
        address owner;
        bool exists;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct ProofResult {
        uint256 id;
        bytes32 projectId;
        bytes32 proofHash;
        bool thresholdMet;
        string status;
        string supportedAssets;
        string metadataUri;
        address submittedBy;
        uint256 timestamp;
    }

    uint256 private proofCount;

    mapping(bytes32 => Project) private projects;
    mapping(string => bytes32) private projectIdsBySlug;
    mapping(uint256 => ProofResult) private proofResults;
    mapping(bytes32 => uint256[]) private projectProofIds;

    event ProjectRegistered(
        bytes32 indexed projectId,
        string name,
        string slug,
        bytes32 websiteHash,
        bytes32 metadataHash,
        address indexed owner,
        uint256 createdAt
    );

    event ProofResultSubmitted(
        uint256 indexed proofId,
        bytes32 indexed projectId,
        bytes32 indexed proofHash,
        bool thresholdMet,
        string status,
        uint256 timestamp
    );

    function registerProject(
        string calldata name,
        string calldata slug,
        bytes32 websiteHash,
        bytes32 metadataHash
    ) external returns (bytes32 projectId) {
        require(bytes(name).length > 0, "Project name required");
        require(bytes(slug).length > 0, "Project slug required");
        require(websiteHash != bytes32(0), "Website hash required");
        require(metadataHash != bytes32(0), "Metadata hash required");

        projectId = _projectIdFromSlug(slug);
        require(!projects[projectId].exists, "Project already exists");

        projects[projectId] = Project({
            name: name,
            slug: slug,
            websiteHash: websiteHash,
            metadataHash: metadataHash,
            owner: msg.sender,
            exists: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        projectIdsBySlug[slug] = projectId;

        emit ProjectRegistered(projectId, name, slug, websiteHash, metadataHash, msg.sender, block.timestamp);
    }

    function submitProofResult(
        string calldata slug,
        bytes32 proofHash,
        bool thresholdMet,
        string calldata status,
        string calldata supportedAssets,
        string calldata metadataUri
    ) external returns (uint256 proofId) {
        bytes32 projectId = projectIdsBySlug[slug];
        Project storage project = projects[projectId];

        require(project.exists, "Project does not exist");
        require(project.owner == msg.sender, "Only project owner can submit proof");
        require(proofHash != bytes32(0), "Proof hash required");
        require(bytes(status).length > 0, "Status required");

        proofId = ++proofCount;

        proofResults[proofId] = ProofResult({
            id: proofId,
            projectId: projectId,
            proofHash: proofHash,
            thresholdMet: thresholdMet,
            status: status,
            supportedAssets: supportedAssets,
            metadataUri: metadataUri,
            submittedBy: msg.sender,
            timestamp: block.timestamp
        });
        projectProofIds[projectId].push(proofId);

        emit ProofResultSubmitted(
            proofId,
            projectId,
            proofHash,
            thresholdMet,
            status,
            block.timestamp
        );
    }

    function getProjectBySlug(string calldata slug) external view returns (Project memory) {
        bytes32 projectId = projectIdsBySlug[slug];
        require(projects[projectId].exists, "Project does not exist");
        return projects[projectId];
    }

    function getProofResult(uint256 proofId) external view returns (ProofResult memory) {
        require(proofId > 0 && proofId <= proofCount, "Proof result does not exist");
        return proofResults[proofId];
    }

    function getProjectProofIds(string calldata slug) external view returns (uint256[] memory) {
        bytes32 projectId = projectIdsBySlug[slug];
        require(projects[projectId].exists, "Project does not exist");
        return projectProofIds[projectId];
    }

    function projectExists(string calldata slug) external view returns (bool) {
        return projects[projectIdsBySlug[slug]].exists;
    }

    function getProofCount() external view returns (uint256) {
        return proofCount;
    }

    function _projectIdFromSlug(string calldata slug) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(slug));
    }
}
