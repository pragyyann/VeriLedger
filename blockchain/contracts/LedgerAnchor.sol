// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title LedgerAnchor
 * @dev Stores the latest SHA-256 hash of the VeriLedger transaction system.
 *      Allows for external auditing of the system's integrity.
 */
contract LedgerAnchor {

    address public owner;
    
    // Store the most recent hash of the overall ledger
    string public latestLedgerHash;
    uint256 public lastUpdatedTimestamp;

    // Event emitted when a new hash is anchored
    event HashAnchored(string newHash, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can anchor new hashes");
        _;
    }

    constructor() {
        owner = msg.sender;
        latestLedgerHash = "GENESIS";
        lastUpdatedTimestamp = block.timestamp;
    }

    /**
     * @dev Anchors a new ledger hash onto the blockchain.
     * @param _newHash The SHA-256 hash of the transaction ledger.
     */
    function anchorLedgerHash(string memory _newHash) public onlyOwner {
        latestLedgerHash = _newHash;
        lastUpdatedTimestamp = block.timestamp;

        emit HashAnchored(_newHash, block.timestamp);
    }

    /**
     * @dev Retrieves the latest anchored hash.
     * @return The latest SHA-256 hash string.
     */
    function getLatestLedgerHash() public view returns (string memory) {
        return latestLedgerHash;
    }
}
