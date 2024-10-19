import dotenv from "dotenv";
dotenv.config({path:"../.env"});

import Web3 from "web3";
import fs from "fs";

// Loading the contract ABI and Bytecode
const { abi, bytecode } = JSON.parse(fs.readFileSync("Verifier.json"));

async function main() {
  // Configuring the connection to an Ethereum node
  const network = process.env.ETHEREUM_NETWORK;
  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `https://${network}.infura.io/v3/${process.env.INFURA_API_KEY}`,
    ),
  );
  
  // Creating a signing account from a private key
  const signer = web3.eth.accounts.privateKeyToAccount(
    '0x' + process.env.SIGNER_PRIVATE_KEY,
  );
  web3.eth.accounts.wallet.add(signer);

  // Using the signing account to deploy the contract
  const contract = new web3.eth.Contract(abi);
  contract.options.data = bytecode;
  const deployTx = contract.deploy();
  const deployedContract = await deployTx
    .send({
      from: signer.address,
      gas: await deployTx.estimateGas(),
    })
    .once("transactionHash", (txhash) => {
      console.log(`Mining deployment transaction ...`);
      console.log(`https://${network}.etherscan.io/tx/${txhash}`);
    });
  // The contract is now deployed on chain!
  console.log(`Contract deployed at ${deployedContract.options.address}`);
  console.log(
    `Add VERIFIER_CONTRACT to the.env file to store the contract address: ${deployedContract.options.address}`,
  );
}

main();
