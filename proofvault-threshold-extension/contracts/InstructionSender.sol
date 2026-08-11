// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface ITeeExtensionRegistry {
    function sendInstructions(
        bytes32 extensionId,
        bytes32[] calldata teeIds,
        bytes32 opType,
        bytes32 opCommand,
        bytes calldata payload
    ) external payable returns (bytes32 instructionId);
}

interface ITeeMachineRegistry {
    function getRandomTeeIds(bytes32 extensionId, uint256 count) external view returns (bytes32[] memory);
}

contract ProofVaultThresholdInstructionSender {
    bytes32 public constant OP_TYPE_PROOFVAULT_RESERVE = bytes32("PROOFVAULT_RESERVE");
    bytes32 public constant OP_COMMAND_VERIFY_RESERVE_THRESHOLD = bytes32("VERIFY_RESERVE_THRESHOLD");

    ITeeExtensionRegistry public immutable teeExtensionRegistry;
    ITeeMachineRegistry public immutable teeMachineRegistry;
    bytes32 public immutable extensionId;

    constructor(
        address _teeExtensionRegistry,
        address _teeMachineRegistry,
        bytes32 _extensionId
    ) {
        teeExtensionRegistry = ITeeExtensionRegistry(_teeExtensionRegistry);
        teeMachineRegistry = ITeeMachineRegistry(_teeMachineRegistry);
        extensionId = _extensionId;
    }

    function verifyReserveThreshold(bytes calldata payload) external payable returns (bytes32 instructionId) {
        bytes32[] memory teeIds = teeMachineRegistry.getRandomTeeIds(extensionId, 1);

        return teeExtensionRegistry.sendInstructions{ value: msg.value }(
            extensionId,
            teeIds,
            OP_TYPE_PROOFVAULT_RESERVE,
            OP_COMMAND_VERIFY_RESERVE_THRESHOLD,
            payload
        );
    }
}
