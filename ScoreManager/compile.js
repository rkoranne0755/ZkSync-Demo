import fs from "fs/promises";
import solc from "solc";

async function main() {
  try {
    // Load the contract source code
    const sourceCode = await fs.readFile("ScoreManager.sol", "utf8");
    const verifierCode = await fs.readFile("IVerifier.sol", "utf8");

    // Compile the source code and retrieve the ABI and Bytecode
    const { abi, bytecode } = compile(sourceCode, verifierCode, "ScoreManager");
    
    // Store the ABI and Bytecode into a JSON file
    const artifact = JSON.stringify({ abi, bytecode }, null, 2);
    await fs.writeFile("ScoreManager.json", artifact);
    
    console.log("Compilation successful! ABI and bytecode saved to ScoreManager.json");
  } catch (error) {
    console.error("Error during compilation:", error);
  }
}

function compile(scoreManagerSource, verifierSource, contractName) {
  // Create the Solidity Compiler Standard Input and Output JSON
  const input = {
    language: "Solidity",
    sources: {
      "ScoreManager.sol": { content: scoreManagerSource },
      "IVerifier.sol": { content: verifierSource }
    },
    settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode"] } } },
  };

  // Parse the compiler output to retrieve the ABI and Bytecode
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  // Check for compilation errors
  if (output.errors) {
    output.errors.forEach((err) => {
      console.error(err.formattedMessage);
    });
    throw new Error("Compilation failed");
  }

  // Extract the contract artifacts
  const artifact = output.contracts["ScoreManager.sol"][contractName];
  return {
    abi: artifact.abi,
    bytecode: artifact.evm.bytecode.object,
  };
}

main();
