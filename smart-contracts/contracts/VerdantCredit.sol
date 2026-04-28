// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title VerdantCredit (VCC)
 * @notice Token ERC-20 representando 1 tonelada de CO2 equivalente (tCO2e).
 *         Emissao controlada pela Verdant apos validacao dMRV.
 *         Conforme Parecer 40 CVM - ativo ambiental digital, nao valor mobiliario.
 */
contract VerdantCredit is ERC20, Ownable, Pausable {
    mapping(address => bool) public minters;

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event CreditMinted(address indexed to, uint256 amount, bytes32 auditHash);
    event CreditRetired(address indexed from, uint256 amount, string reason);

    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Somente minter autorizado");
        _;
    }

    constructor(address initialOwner) ERC20("Verdant Carbon Credit", "VCC") Ownable(initialOwner) {}

    function addMinter(address minter) external onlyOwner { minters[minter] = true; emit MinterAdded(minter); }
    function removeMinter(address minter) external onlyOwner { minters[minter] = false; emit MinterRemoved(minter); }

    /**
     * @notice Emite creditos apos validacao dMRV.
     * @param to Carteira do produtor.
     * @param amount Em wei (18 decimais = 1 tCO2e).
     * @param auditHash Hash SHA-256 dos dados brutos do sensor.
     */
    function mint(address to, uint256 amount, bytes32 auditHash) external onlyMinter whenNotPaused {
        require(to != address(0), "Endereco invalido");
        require(amount > 0, "Quantidade positiva obrigatoria");
        _mint(to, amount);
        emit CreditMinted(to, amount, auditHash);
    }

    /**
     * @notice Queima creditos para compensacao/aposentadoria ambiental.
     */
    function retire(uint256 amount, string calldata reason) external {
        _burn(msg.sender, amount);
        emit CreditRetired(msg.sender, amount, reason);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        super._update(from, to, value);
    }
}
