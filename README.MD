# ZkSync Demo Project

This repository demonstrates the use of zkSNARKs for verifying computations on the Ethereum blockchain using ZkSync. Follow the instructions below to set up the project and run the necessary commands.

## Prerequisites

- Node.js and npm installed on your machine.
- Access to an Ethereum wallet with some test ether on the Sepolia network.
- An Infura account to get your API key.

## Setup Instructions

### Clone the Repository

```bash
git clone https://github.com/rkoranne0755/ZkSync-Demo.git
cd ZkSync-Demo
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Open the `.env` file and update the following variables with your keys:

```plaintext
ETHEREUM_NETWORK = "sepolia"
INFURA_API_KEY = "<YOUR_INFURA_KEY>"
SIGNER_PRIVATE_KEY = "<YOUR_PRIVATE_KEY>"
VERIFIER_CONTRACT = "<ADDRESS_AT_WHICH_VERIFIER_CONTRACT_IS_DEPLOYED>"
SCORE_MANAGER_CONTRACT = "<ADDRESS_AT_WHICH_SCORE_MANAGER_CONTRACT_IS_DEPLOYED>"
```

### Zokrates Setup

Navigate to the `/zok` directory:

```bash
cd zok
```

Run the following commands to create required files:

1. **Compile:**
   ```bash
   zokrates compile -i compute_score.zok
   ```

2. **Perform setup phase:**
   ```bash
   zokrates setup
   ```

3. **Execute the program:**
   ```bash
   zokrates compute-witness -a 3 4 2
   ```

4. **Generate a proof of computation:**
   ```bash
   zokrates generate-proof
   ```

5. **Export a Solidity verifier:**
   ```bash
   zokrates export-verifier
   ```

### Verify the Proof

If you see output as "PASSED", it means the required conditions are met:

```bash
zokrates verify
```

### Move Verifier.sol

Move `Verifier.sol` into the `/VerifyTx` directory.

### Compile and Deploy Verifier Contract

Navigate to `/VerifyTx`:

```bash
cd ../VerifyTx
```

Run the following commands:

1. **Compile the contract:**
   ```bash
   node compile.js
   ```

2. **Deploy the contract:**
   ```bash
   node deploy.js
   ```

3. **Interact with the contract:**
   ```bash
   node interact.js
   ```

### Update Environment Variables

Ensure to change the `VERIFIER_CONTRACT` variable in `.env` and pass the generated output from `/zok/proof.json` as arguments in:

```javascript
const method_abi = contract.methods.verifyTx([...]).encodeABI();
```

### Compile and Deploy ScoreManager Contract

Navigate to `/ScoreManager`:

```bash
cd ../ScoreManager
```
Inside the `/ScoreManager` directory, repeat the same process as done for `/VerifyTx`. Interact with the ScoreManager contract multiple times by changing the `SIGNER_PRIVATE_KEY` variable in `.env`.

**Note:** If arguments passed during proof generation do not meet conditions specified in `/zok/compute_score.zok`, transactions will revert.

## Conclusion

This README provides a simple guide to setting up and running the ZkSync demo project. Make sure to replace placeholders with your actual keys and addresses before executing commands.
