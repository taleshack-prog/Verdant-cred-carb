// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AssetRegistry
 * @notice Livro-razao imutavel vinculando tokens de carbono aos dados brutos dos sensores.
 */
contract AssetRegistry is Ownable {
    struct AuditRecord {
        bytes32 dataHash;
        string  deviceId;
        uint256 energyKwhX1000;
        uint256 co2Grams;
        uint256 timestamp;
        address registeredBy;
    }

    mapping(uint256 => AuditRecord) public records;
    uint256 public recordCount;

    event AuditRegistered(uint256 indexed recordId, string deviceId, bytes32 dataHash, uint256 co2Grams);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function registerAudit(bytes32 dataHash, string calldata deviceId, uint256 energyKwhX1000, uint256 co2Grams)
        external onlyOwner returns (uint256 recordId)
    {
        recordId = recordCount++;
        records[recordId] = AuditRecord({ dataHash: dataHash, deviceId: deviceId, energyKwhX1000: energyKwhX1000, co2Grams: co2Grams, timestamp: block.timestamp, registeredBy: msg.sender });
        emit AuditRegistered(recordId, deviceId, dataHash, co2Grams);
    }

    function getRecord(uint256 recordId) external view returns (AuditRecord memory) {
        require(recordId < recordCount, "Record nao encontrado");
        return records[recordId];
    }
}
