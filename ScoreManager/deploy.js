import Web3 from "web3";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Loading the ScoreManager contract ABI and Bytecode
const { abi, bytecode } = JSON.parse(fs.readFileSync("ScoreManager.json"));

async function main() {
  // Configuring the connection to an Ethereum node
  const network = process.env.ETHEREUM_NETWORK;
  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `https://${network}.infura.io/v3/${process.env.INFURA_API_KEY}`
    )
  );

  // Creating a signing account from a private key
  const signer = web3.eth.accounts.privateKeyToAccount(
    "0x" + process.env.SIGNER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(signer);

  // Using the signing account to deploy the ScoreManager contract
  const verifierContractAddress = process.env.VERIFIER_CONTRACT; // Address of the deployed Verifier contract
  const contract = new web3.eth.Contract(abi);
  contract.options.data = bytecode;

  // Create the deployment transaction with constructor parameters if necessary
  const deployTx = contract.deploy({
    arguments: ["0x49F3818102b9F6c78A22107399dbF039DD9c79Cc"], // Pass the Verifier contract address as an argument
  });

  // Estimate gas for the deployment
  const gasEstimate = await deployTx.estimateGas();

  // Send the deployment transaction
  const deployedContract = await deployTx
    .send({
      from: signer.address,
      gas: gasEstimate,
    })
    .once("transactionHash", (txhash) => {
      console.log(`Mining deployment transaction ...`);
      console.log(`https://${network}.etherscan.io/tx/${txhash}`);
    });

  // The contract is now deployed on-chain!
  console.log(`Contract deployed at ${deployedContract.options.address}`);
  console.log(
    `Add SCORE_MANAGER_CONTRACT to the .env file to store the contract address: ${deployedContract.options.address}`
  );
}

main().catch(console.error);
