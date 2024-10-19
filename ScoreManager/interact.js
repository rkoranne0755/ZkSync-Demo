import dotenv from "dotenv";
import Web3 from "web3";
import fs from "fs";

// Loading the ScoreManager contract ABI
const { abi: scoreManagerAbi } = JSON.parse(fs.readFileSync("ScoreManager.json"));
// const { abi: verifierAbi } = JSON.parse(fs.readFileSync("Verifier.json"));

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

  // Creating Contract instances
//   const verifierContract = new web3.eth.Contract(
//     verifierAbi,
//     process.env.VERIFIER_CONTRACT // Address of the deployed Verifier contract
//   );

  const scoreManagerContract = new web3.eth.Contract(
    scoreManagerAbi,
    process.env.SCORE_MANAGER_CONTRACT // Address of the deployed ScoreManager contract
  );

  // Prepare the proof and input data for checkAndUpdateScore
  const proof = [
    [
      "0x101637f3facd09958ca7b581b6382abd2041c3af12207d0d5ed9b987cf1823a4",
      "0x2b302b45325f3c25595f719b6fc950d7ce94f7f099da71a705ba5dd5126e147e"
    ],
    [
      [
        "0x14dce954ca68763f84611c16d569210b700409df5ed592ed0b528149914f638d",
        "0x24479df13377fe2edfec7a88b7ec022f3998b7b81d583a26b86eff121f4d61ad"
      ],
      [
        "0x1e42a81d9e559ee1dfcc4567c323e6acac5d19a1f8692bfc5d0ae74e479dd7df",
        "0x073c6245f275c0d09c3c0d9130182204761a39e45c43c8fb57cafa7688f04dd1"
      ]
    ],
    [
      "0x2e94485fc7b43491300a680a64353a3f9b9e983116231cf1e7964374e665bf1c",
      "0x020666f74fafef3194df75279f0f021de7cf780bfc5b89891ee3bc3b282091a1"
    ]
  ];
  const input = [1, 1];

  // Call checkAndUpdateScore method
  const methodAbi = scoreManagerContract.methods.checkAndUpdateScore(proof, input).encodeABI();

  const tx1 = {
    from: signer.address,
    to: scoreManagerContract.options.address,
    data: methodAbi,
    value: '0',
    gasPrice: '100000000000',
  };

  // Estimate gas for the transaction
  const gasEstimate1 = await web3.eth.estimateGas(tx1);
  tx1.gas = gasEstimate1;

  // Sign the transaction
  const signedTx1 = await web3.eth.accounts.signTransaction(tx1, signer.privateKey);

  // Sending the transaction to the network
  const receipt1 = await web3.eth.sendSignedTransaction(signedTx1.rawTransaction).once("transactionHash", (txhash) => {
    console.log(`Mining checkAndUpdateScore transaction ...`);
    console.log(`https://${network}.etherscan.io/tx/${txhash}`);
  });

  console.log(`Mined checkAndUpdateScore transaction in block ${receipt1.blockNumber}`);

  // Now call the listScores method
  const scores = await scoreManagerContract.methods.listScores().call();

  console.log("List of Scores:");
  scores.forEach((score) => {
    console.log(`User: ${score.user}, Score: ${score.score}`);
  });
}

dotenv.config();
main().catch(console.error);
