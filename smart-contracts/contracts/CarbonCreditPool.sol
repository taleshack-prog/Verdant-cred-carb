// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CarbonCreditPool
 * @notice Agrega fracoes de credito de multiplos pequenos produtores em lotes comercializaveis.
 *         Distribui receita proporcionalmente. Take Rate retido automaticamente.
 */
contract CarbonCreditPool is Ownable, ReentrancyGuard {
    IERC20 public immutable stablecoin;
    mapping(address => uint256) public contributions;
    uint256 public totalContributions;
    uint256 public totalRevenue;
    bool    public saleCompleted;
    uint256 public takeRateBps;
    uint256 public constant MAX_TAKE_RATE_BPS = 1500;
    uint256 public constant BASIS_POINTS = 10_000;

    event Contributed(address indexed producer, uint256 kg);
    event RevenueDeposited(uint256 amount);
    event SaleCompleted();
    event Claimed(address indexed producer, uint256 net, uint256 fee);

    constructor(address _stablecoin, uint256 _takeRateBps, address initialOwner) Ownable(initialOwner) {
        require(_takeRateBps <= MAX_TAKE_RATE_BPS, "Take Rate excede limite de 15%");
        stablecoin  = IERC20(_stablecoin);
        takeRateBps = _takeRateBps;
    }

    function contribute(uint256 kg) external {
        require(!saleCompleted, "Venda finalizada");
        require(kg > 0, "Kg positivo obrigatorio");
        contributions[msg.sender] += kg;
        totalContributions += kg;
        emit Contributed(msg.sender, kg);
    }

    function depositRevenue(uint256 amount) external onlyOwner {
        require(!saleCompleted, "Venda finalizada");
        require(amount > 0, "Valor positivo obrigatorio");
        require(stablecoin.transferFrom(msg.sender, address(this), amount), "Transfer falhou");
        totalRevenue += amount;
        emit RevenueDeposited(amount);
    }

    function completeSale() external onlyOwner {
        require(!saleCompleted && totalRevenue > 0 && totalContributions > 0, "Estado invalido");
        saleCompleted = true;
        emit SaleCompleted();
    }

    function claim() external nonReentrant {
        require(saleCompleted, "Venda nao finalizada");
        uint256 userKg = contributions[msg.sender];
        require(userKg > 0, "Sem contribuicao");
        uint256 gross = (userKg * totalRevenue) / totalContributions;
        uint256 fee   = (gross * takeRateBps) / BASIS_POINTS;
        uint256 net   = gross - fee;
        contributions[msg.sender] = 0;
        require(stablecoin.transfer(msg.sender, net), "Transfer falhou");
        emit Claimed(msg.sender, net, fee);
    }

    function withdrawPlatformFee(address to) external onlyOwner {
        uint256 bal = stablecoin.balanceOf(address(this));
        require(bal > 0, "Sem saldo");
        require(stablecoin.transfer(to, bal), "Saque falhou");
    }
}
