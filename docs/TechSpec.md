# Mooniswap v2 Tech Spec

## Funcional structure
The protocol focuses on adjusting the parameters of LiquidityPool (fee, decayPeriod) by stackholders by voting + in the future it is possible to add other control modules. 
Users bring liquidity in exchange for what they receive voting tokens `inchToken`.

### Features:
- Modular principle - the system is built on the separation of the core and modules `GovernanceMothership`, the voting logic is described in the plug-in modules, additional functions can be introduced through the modules in the future.
- To protect against Front-Running Attacks and FlashLoans, the `LiquidVoting` library is used in the voting, with a 24-hour delay of `_VOTING_DECAY_PERIOD` - the voting takes effect on an increasing basis.

- The rewards are also issued interpolated in ``DECAY_PERIOD`. 

## Logical structure

- GovernanceMothership
    - has 2 modules:
        - MooniswapFactoryGovernance .
        - Rewards

    - Module managment in current version is resticted to owner, in future versions it will be 3 options avalilable:
        - `onlyOwner` (current version)
        - Multisig (planned)
        - Governance (future releases)

### Stacking
// TBD


### Voting (LiquidVoting)
- Stakeholeders vote for `fee` and `decayPeriod` parameters, calling the method is considered a branded voice of all stakeholders.
- The weight of each participant's voice is carried by linear interpolation within 24 hours.


### Reward distribution

TBD:
> #### How do rewards count?

A request for distribution can be initiated by any stakeholder and is held for all active holdings at the time of the request.

## Technical structure

#### Root contract: **GovernanceMothership.sol**
This is root contract, has 2 two main functions:
- `inchToken` is an ERC20 token voted by stakeholders, responsible for the number of rewards and determine the weight of the holder's vote.
- Staking / Unstaking 
- Add / Remove Modules

## Code structure:


----

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
 
