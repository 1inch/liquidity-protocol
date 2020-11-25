# Mooniswap v2 Tech Spec

- [Funcional](#funcional)
  - [Features](#features)
- [Logical](#logical)
  - [Stacking](#stacking)
  - [Voting (LiquidVoting)](#voting-liquidvoting)
  - [Reward distribution](#reward-distribution)
  - [Fees](#fees)
  - [Governance](#governance)
    - [Pool parameters](#pool-parameters)
    - [Factory parameters](#factory-parameters)
    - [Pool governance](#pool-governance)
    - [Factory Governance](#factory-governance)
- [Technical](#technical)
  - [**GovernanceMothership.sol**](#governancemothershipsol)
- [Code](#code)

## Funcional

The protocol focuses on adjusting the parameters of LiquidityPool (fee, decayPeriod) by stakeholders by voting + in the future; it is possible to add other control modules. 
Users bring liquidity in exchange for what they receive voting tokens `inchToken`.


### Features

- **Modular principle** - the system is built on the separation of the core and modules `GovernanceMothership`, the voting logic is described in the plug-in modules, additional functions can be introduced through the modules in the future.
- To protect against **Front-Running Attacks and FlashLoans**, the `LiquidVoting.sol` library is used in the voting, with a 24-hour delay of `_VOTING_DECAY_PERIOD` - the voting takes effect on an increasing basis.

- The rewards are also issued interpolated in `DECAY_PERIOD`. 

## Logical

![Moonisvap_v2_diagram](./Moonisvap_v2_diagram.png)

- GovernanceMothership has two modules:
- MooniswapFactoryGovernance
- Rewards

- Module managment in current version is resticted to owner, in future versions it will be 3 options avalilable:
- `onlyOwner` (current version)
- Multisig (planned)
- Governance (future releases)

### Stacking

// TBD


### Voting

- Stakeholders vote for `fee` and `decayPeriod` parameters, calling the method is considered a branded voice of all stakeholders.
- The weight of each participant's voice is carried by linear interpolation within 24 hours.


### Reward distribution

TBD:

> #### How do rewards count?

A request for distribution can be initiated by any stakeholder and held for all active holdings at the request's time.

### Fees

In Mooniswap V2 we added several new fees.

First one is slippage fee. Slippage fee is charged on top of basic fee and is equal to some percentage of slippage caused by trade.

Second one is governance fee. Governance fee is charged the same way as referral fee by minting some shares representing percentage of profit the pool made from trade.

### Governance

We also introduced configuration of all the pool parameters via governance. Some parameters are specific to each pool and some are shared over all the pools. Mooniswap V2 uses liquid governance to determine resulting values of parameters. Votes are gradually applied over a fixed period of 1 day.

#### Pool parameters

* fee [0% .. 10%]
* slippageFee [0% .. 100%] (of slippage)
* decayPeriod [15 sec .. 1 hour]

#### Factory parameters

* `defaultFee` [0% .. 10%]
* `defaultSlippageFee` [0% .. 100%] (of slippage)
* `defaultDecayPeriod` [15 sec .. 1 hour]
* `referralFee` [0% .. 25%] (portion of total fee)
* `governanceFee` [0% .. 25%] (portion of total fee)
* `governanceFeeReceiver`


#### Pool governance

LP token holders can vote for fee and decayPeriod. Votes are weighted according to LP balance. For providers who did not vote defaultFee, defaultSlippageFee and defaultDecayPeriod from factory are used.

#### Factory Governance

INCH token holders can lock their tokens in GovernanceMothership which allows to participate in governance and gather fees. Users can vote for 1defaultFee, defaultDecayPeriod, referralFee and governanceFee. Votes are weighted according to locked INCH balance. For users who locked tokens but did not vote the default values are used:
* `fee` = 0
* `slippageFee` = 10%
* `decayPeriod` = 5 min
* `governanceShare` = 0%
* `referralShare` = 5%

## Technical

GovernanceMothership.sol is  is a root contract, that holds `inchToken` (is an ERC20 token voted by stakeholders, responsible for the number of rewards and determining the holder's vote's weight)

It operates by has 2 two core functions:

- Stake / Ununstake `inchToken`
- Add / Remove Modules

## Code

📂 __mooniswap\-v2__

- 📂 __root__
- 📄 [**GovernanceMothership.sol**](contracts/inch/GovernanceMothership.sol)
- 📂 __contracts__
- 📄 [Mooniswap.sol](contracts/Mooniswap.sol)
- 📄 [MooniswapConstants.sol](contracts/MooniswapConstants.sol) // *Base parameters of the governance mechanics.*
- 📄 [**MooniswapFactory.sol**](contracts/MooniswapFactory.sol)
- 📂 __governance__
    - 📄 [**BaseGovernanceModule.sol**](contracts/governance/BaseGovernanceModule.sol)
    // *This is `abstract` class, all the modules have to inherit from this class.*
    - 📄 [GovernanceFeeReceiver.sol](contracts/governance/GovernanceFeeReceiver.sol)
    - 📄 [**MooniswapFactoryGovernance.sol**](contracts/governance/MooniswapFactoryGovernance.sol)
    - 📄 [**MooniswapGovernance.sol**](contracts/governance/MooniswapGovernance.sol)
    - 📄 [**Rewards.sol**](contracts/governance/rewards/Rewards.sol)
- 📂 __libraries__
    - 📄 [**LiquidVoting.sol**](contracts/libraries/LiquidVoting.sol)
