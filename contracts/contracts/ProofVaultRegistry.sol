// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract ProofVaultRegistry {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    address public contractOwner;

    enum ProofRequestStatus {
        Created,
        Verifying,
        Completed,
        Cancelled
    }

    enum ProofOutcome {
        PASS,
        FAIL
    }

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
        uint256 requestId;
        bytes32 projectId;
        bytes32 proofHash;
        ProofOutcome outcome;
        bool thresholdMet;
        bytes32 resultMetadataHash;
        address submittedBy;
        address relayedBy;
        uint256 workerSignedAt;
        uint256 submittedAt;
        bool exists;
    }

    struct ProofRequest {
        uint256 id;
        bytes32 projectId;
        bytes32 thresholdCommitment;
        bytes32 selectedAssetsHash;
        string selectedAssets;
        bytes32 metadataHash;
        address createdBy;
        uint256 createdAt;
        ProofRequestStatus status;
        bool exists;
    }

    uint256 private proofRequestCounter;
    uint256 private proofResultCounter;

    mapping(bytes32 => Project) private projects;
    mapping(string => bytes32) private projectIdsBySlug;
    mapping(uint256 => ProofRequest) private proofRequests;
    mapping(bytes32 => uint256[]) private projectProofRequestIds;
    mapping(address => bool) private authorizedWorkerSigners;
    mapping(uint256 => ProofResult) private proofResults;
    mapping(uint256 => uint256) private proofRequestToResultId;
    mapping(bytes32 => uint256[]) private projectProofResultIds;
    mapping(bytes32 => uint256) private latestProofResultIdByProject;

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
        uint256 indexed resultId,
        uint256 indexed requestId,
        bytes32 indexed projectId,
        bytes32 proofHash,
        ProofOutcome outcome,
        bool thresholdMet,
        bytes32 resultMetadataHash,
        address submittedBy,
        uint256 submittedAt
    );

    event ProofRequestCreated(
        uint256 indexed requestId,
        bytes32 indexed projectId,
        bytes32 thresholdCommitment,
        bytes32 selectedAssetsHash,
        string selectedAssets,
        bytes32 metadataHash,
        address indexed createdBy,
        uint256 createdAt
    );

    event WorkerSignerUpdated(
        address indexed signer,
        bool authorized,
        uint256 updatedAt
    );

    modifier onlyContractOwner() {
        require(msg.sender == contractOwner, "Only contract owner");
        _;
    }

    modifier onlyAuthorizedWorkerSigner() {
        require(authorizedWorkerSigners[msg.sender], "Only authorized worker signer");
        _;
    }

    constructor() {
        contractOwner = msg.sender;
    }

    function setWorkerSigner(address signer, bool authorized) external onlyContractOwner {
        require(signer != address(0), "Worker signer required");

        authorizedWorkerSigners[signer] = authorized;

        emit WorkerSignerUpdated(signer, authorized, block.timestamp);
    }

    function isAuthorizedWorkerSigner(address signer) external view returns (bool) {
        return authorizedWorkerSigners[signer];
    }

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

    function createProofRequest(
        string calldata slug,
        bytes32 thresholdCommitment,
        string calldata selectedAssets,
        bytes32 selectedAssetsHash,
        bytes32 metadataHash
    ) external returns (uint256 requestId) {
        require(bytes(slug).length > 0, "Project slug required");
        require(thresholdCommitment != bytes32(0), "Threshold commitment required");
        require(bytes(selectedAssets).length > 0, "Selected assets required");
        require(selectedAssetsHash != bytes32(0), "Selected assets hash required");
        require(metadataHash != bytes32(0), "Metadata hash required");
        require(selectedAssetsHash == keccak256(bytes(selectedAssets)), "Selected assets hash mismatch");

        bytes32 projectId = _projectIdFromSlug(slug);
        Project storage project = projects[projectId];

        require(project.exists, "Project does not exist");
        require(project.owner == msg.sender, "Only project owner can create request");

        requestId = ++proofRequestCounter;

        proofRequests[requestId] = ProofRequest({
            id: requestId,
            projectId: projectId,
            thresholdCommitment: thresholdCommitment,
            selectedAssetsHash: selectedAssetsHash,
            selectedAssets: selectedAssets,
            metadataHash: metadataHash,
            createdBy: msg.sender,
            createdAt: block.timestamp,
            status: ProofRequestStatus.Created,
            exists: true
        });
        projectProofRequestIds[projectId].push(requestId);

        emit ProofRequestCreated(
            requestId,
            projectId,
            thresholdCommitment,
            selectedAssetsHash,
            selectedAssets,
            metadataHash,
            msg.sender,
            block.timestamp
        );
    }

    function getProofResultMessageHash(
        uint256 requestId,
        bytes32 proofHash,
        ProofOutcome outcome,
        uint256 workerSignedAt,
        bytes32 resultMetadataHash
    ) public view returns (bytes32) {
        return keccak256(
            abi.encode(
                address(this),
                block.chainid,
                requestId,
                proofHash,
                outcome,
                workerSignedAt,
                resultMetadataHash
            )
        );
    }

    function recoverProofResultSigner(
        uint256 requestId,
        bytes32 proofHash,
        ProofOutcome outcome,
        uint256 workerSignedAt,
        bytes32 resultMetadataHash,
        bytes calldata signature
    ) public view returns (address) {
        bytes32 messageHash = getProofResultMessageHash(
            requestId,
            proofHash,
            outcome,
            workerSignedAt,
            resultMetadataHash
        );

        return messageHash.toEthSignedMessageHash().recover(signature);
    }

    function submitProofResult(
        uint256 requestId,
        bytes32 proofHash,
        ProofOutcome outcome,
        bytes32 resultMetadataHash,
        uint256 workerSignedAt,
        bytes calldata signature
    ) external returns (uint256 resultId) {
        ProofRequest storage proofRequest = proofRequests[requestId];

        require(proofRequest.exists, "Proof request does not exist");
        require(proofHash != bytes32(0), "Proof hash required");
        require(resultMetadataHash != bytes32(0), "Result metadata hash required");
        require(workerSignedAt != 0, "Worker signature timestamp required");
        require(signature.length > 0, "Signature required");
        require(proofRequestToResultId[requestId] == 0, "Proof result already submitted");
        require(proofRequest.status != ProofRequestStatus.Cancelled, "Proof request cancelled");

        address recoveredSigner = recoverProofResultSigner(
            requestId,
            proofHash,
            outcome,
            workerSignedAt,
            resultMetadataHash,
            signature
        );
        require(authorizedWorkerSigners[recoveredSigner], "Unauthorized worker signer");

        bool thresholdMet = outcome == ProofOutcome.PASS;
        resultId = ++proofResultCounter;

        proofResults[resultId] = ProofResult({
            id: resultId,
            requestId: requestId,
            projectId: proofRequest.projectId,
            proofHash: proofHash,
            outcome: outcome,
            thresholdMet: thresholdMet,
            resultMetadataHash: resultMetadataHash,
            submittedBy: recoveredSigner,
            relayedBy: msg.sender,
            workerSignedAt: workerSignedAt,
            submittedAt: block.timestamp,
            exists: true
        });
        proofRequestToResultId[requestId] = resultId;
        projectProofResultIds[proofRequest.projectId].push(resultId);
        latestProofResultIdByProject[proofRequest.projectId] = resultId;
        proofRequest.status = ProofRequestStatus.Completed;

        emit ProofResultSubmitted(
            resultId,
            requestId,
            proofRequest.projectId,
            proofHash,
            outcome,
            thresholdMet,
            resultMetadataHash,
            recoveredSigner,
            block.timestamp
        );
    }

    function getProjectBySlug(string calldata slug) external view returns (Project memory) {
        bytes32 projectId = projectIdsBySlug[slug];
        require(projects[projectId].exists, "Project does not exist");
        return projects[projectId];
    }

    function getProofResult(uint256 proofId) external view returns (ProofResult memory) {
        require(proofResults[proofId].exists, "Proof result does not exist");
        return proofResults[proofId];
    }

    function getProofResultByRequestId(uint256 requestId) external view returns (ProofResult memory) {
        uint256 resultId = proofRequestToResultId[requestId];
        require(resultId != 0, "Proof result does not exist");
        return proofResults[resultId];
    }

    function getLatestProofResultBySlug(
        string calldata slug
    ) external view returns (ProofResult memory) {
        bytes32 projectId = _projectIdFromSlug(slug);
        require(projects[projectId].exists, "Project does not exist");

        uint256 latestResultId = latestProofResultIdByProject[projectId];
        require(latestResultId != 0, "Proof result does not exist");

        return proofResults[latestResultId];
    }

    function getProofRequest(uint256 requestId) external view returns (ProofRequest memory) {
        require(proofRequests[requestId].exists, "Proof request does not exist");
        return proofRequests[requestId];
    }

    function getProjectProofRequestIds(string calldata slug) external view returns (uint256[] memory) {
        bytes32 projectId = _projectIdFromSlug(slug);
        require(projects[projectId].exists, "Project does not exist");
        return projectProofRequestIds[projectId];
    }

    function getProjectProofResultIds(string calldata slug) external view returns (uint256[] memory) {
        bytes32 projectId = _projectIdFromSlug(slug);
        require(projects[projectId].exists, "Project does not exist");
        return projectProofResultIds[projectId];
    }

    function getProjectProofResultCount(string calldata slug) external view returns (uint256) {
        bytes32 projectId = _projectIdFromSlug(slug);
        require(projects[projectId].exists, "Project does not exist");
        return projectProofResultIds[projectId].length;
    }

    function getProjectProofResultIdAt(
        string calldata slug,
        uint256 index
    ) external view returns (uint256) {
        bytes32 projectId = _projectIdFromSlug(slug);
        require(projects[projectId].exists, "Project does not exist");
        require(index < projectProofResultIds[projectId].length, "Proof result index out of bounds");
        return projectProofResultIds[projectId][index];
    }

    function projectExists(string calldata slug) external view returns (bool) {
        return projects[projectIdsBySlug[slug]].exists;
    }

    function getProofRequestCount() external view returns (uint256) {
        return proofRequestCounter;
    }

    function getProofResultCount() external view returns (uint256) {
        return proofResultCounter;
    }

    function _projectIdFromSlug(string calldata slug) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(slug));
    }
}
