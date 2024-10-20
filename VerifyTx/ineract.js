import dotenv from "dotenv";
import Web3 from "web3";

dotenv.config({path:"../.env"});
// Loading the contract ABI
// (the results of a previous compilation step)
import fs from "fs";
const { abi } = JSON.parse(fs.readFileSync("Verifier.json"));

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
    "0x" + process.env.SIGNER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(signer);
  // Creating a Contract instance
  const contract = new web3.eth.Contract(
    abi,
    // Replace this with the address of your deployed contract
    process.env.VERIFIER_CONTRACT,
  );
  // Issuing a transaction that calls the `echo` method
  const method_abi = contract.methods.verifyTx(
    [["0x101637f3facd09958ca7b581b6382abd2041c3af12207d0d5ed9b987cf1823a4",
    "0x2b302b45325f3c25595f719b6fc950d7ce94f7f099da71a705ba5dd5126e147e"],
    [["0x14dce954ca68763f84611c16d569210b700409df5ed592ed0b528149914f638d",
    "0x24479df13377fe2edfec7a88b7ec022f3998b7b81d583a26b86eff121f4d61ad"],
    ["0x1e42a81d9e559ee1dfcc4567c323e6acac5d19a1f8692bfc5d0ae74e479dd7df",
    "0x073c6245f275c0d09c3c0d9130182204761a39e45c43c8fb57cafa7688f04dd1"]],
    ["0x2e94485fc7b43491300a680a64353a3f9b9e983116231cf1e7964374e665bf1c",
    "0x020666f74fafef3194df75279f0f021de7cf780bfc5b89891ee3bc3b282091a1"]],     
    [1,1]).encodeABI();
  const tx = {
    from: signer.address,
    to: contract.options.address,
    data: method_abi,
    value: '0',
    gasPrice: '100000000000',
  };
  const gas_estimate = await web3.eth.estimateGas(tx);
  tx.gas = gas_estimate;
  const signedTx = await web3.eth.accounts.signTransaction(tx, signer.privateKey);
  console.log("Raw transaction data: " + ( signedTx).rawTransaction);
  // Sending the transaction to the network
  const receipt = await web3.eth
    .sendSignedTransaction(signedTx.rawTransaction)
    .once("transactionHash", (txhash) => {
      console.log(`Mining transaction ...`);
      console.log(`https://${network}.etherscan.io/tx/${txhash}`);
    });
  // The transaction is now on chain!
  console.log(`Mined in block ${receipt.blockNumber}`);

  const result = await contract.methods.verifyTx([["0x00a7c6a3fee7806a271a3bd85472679eeba6cf794f6e9f701642af2f7c8ed9ee",
    "0x19dee93805e88badd0fbff17cd57718f4aecd1380b20bc446dbe3b181a4b31c6"],
    [["0x1baa105594f463fcd13f166ba88d1eafa8472a055e7f61d5f26078f0e5b3917c",
    "0x0e84af8005f96e9156854834afa3198811e8fdc90fbe3e7324a307690759e90b"],
    ["0x25cb16827771e789690d230cbb293efd0c990be276b4dbca9f1d537f3f7fe35d",
    "0x25dfba9a5d21d6afb4a7ac310aacdc5d8b09d07c08c4be820c2c26192332b847"]],    
    ["0x2e7b4fff40de00f2bd03c1e3de552f253535790900d2dffbec5cd3ee89affd4c",
    "0x2b8f7610050cb84fbc84150da905ca395bc565bae7d4154c6fb689ac5c2269a6"]], [2,1]).call();

console.log("Transaction Verified:", result);
}

main();