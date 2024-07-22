const DiamSdk = require("diamante-sdk-js");
const fetch = require('node-fetch');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

(async function main() {
  try {
    // Step 1: Generate a new keypair and create a new account on the ledger
    const pair = DiamSdk.Keypair.random();
    console.log("Public Key:", pair.publicKey());
    console.log("Secret Key:", pair.secret());

    const friendbotURL = `https://friendbot.diamcircle.io?addr=${encodeURIComponent(pair.publicKey())}`;
    const response = await fetch(friendbotURL);
    const responseJSON = await response.json();
    console.log("Friendbot Response:", responseJSON);

    const server = new DiamSdk.Horizon.Server("https://diamtestnet.diamcircle.io/");
    const account = await server.loadAccount(pair.publicKey());

    // Function to prompt user input
    async function promptUser(query) {
      return new Promise((resolve) => {
        rl.question(query, (answer) => {
          resolve(answer);
        });
      });
    }

    // Function definitions
    async function createAccount() {
      const newPair = DiamSdk.Keypair.random();
      console.log("New Account Public Key:", newPair.publicKey());
      console.log("New Account Secret Key:", newPair.secret());

      const friendbotURL = `https://friendbot.diamcircle.io?addr=${encodeURIComponent(newPair.publicKey())}`;
      const response = await fetch(friendbotURL);
      const responseJSON = await response.json();
      console.log("Friendbot Response:", responseJSON);
    }

    async function checkBalance() {
      const accountToCheck = await promptUser("Enter the public key of the account to check balance: ");
      const account = await server.loadAccount(accountToCheck);
      console.log("Balances for account:", accountToCheck);
      account.balances.forEach((balance) => {
        console.log(`${balance.balance} ${balance.asset_type}`);
      });
    }

    async function listTransactions() {
      const accountToCheck = await promptUser("Enter the public key of the account to list transactions: ");
      const transactions = await server.transactions().forAccount(accountToCheck).call();
      console.log("Transactions for account:", accountToCheck);
      transactions.records.forEach((tx) => {
        console.log(`ID: ${tx.id}, Created At: ${tx.created_at}, Amount: ${tx.source_amount}`);
      });
    }

    async function streamTransactions() {
      const es = new EventSource(`https://diamtestnet.diamcircle.io/accounts/${pair.publicKey()}/transactions`);
      es.onmessage = function (message) {
        const result = message.data ? JSON.parse(message.data) : message;
        console.log("New transaction:");
        console.log(result);
      };
      es.onerror = function (error) {
        console.log("An error occurred!");
      };
    }

    async function signAndSubmitTransaction() {
      const transactionEnvelope = await promptUser("Enter the transaction envelope XDR: ");
      const transaction = new DiamSdk.TransactionBuilder.fromXDR(transactionEnvelope, DiamSdk.Networks.TESTNET);
      transaction.sign(pair);
      const result = await server.submitTransaction(transaction);
      console.log("Transaction Submitted Successfully!", result);
    }

    async function manageData() {
      const key = await promptUser("Enter the data key: ");
      const value = await promptUser("Enter the data value (leave blank to delete): ");
      const operation = value === '' ? DiamSdk.Operation.deleteData : DiamSdk.Operation.manageData;

      const dataTransaction = new DiamSdk.TransactionBuilder(account, {
        fee: DiamSdk.BASE_FEE,
        networkPassphrase: DiamSdk.Networks.TESTNET,
      })
        .addOperation(operation({
          name: key,
          value: value
        }))
        .setTimeout(180)
        .build();

      dataTransaction.sign(pair);
      const dataResult = await server.submitTransaction(dataTransaction);
      console.log("Manage Data Transaction Successful!", dataResult);
    }

    async function fetchLedgerInfo() {
      const ledgerSequence = await promptUser("Enter the ledger sequence number to fetch info: ");
      const ledger = await server.ledgers().ledger(ledgerSequence).call();
      console.log("Ledger Info:", ledger);
    }

    // Main loop to prompt user for operations
    async function userPrompt() {
      let continueLoop = true;
      while (continueLoop) {
        const choice = await promptUser(`Select an operation to perform:
        1: Create a new account
        2: Check account balance
        3: List account transactions
        4: Stream transactions
        5: Sign and submit a transaction
        6: Manage account data
        7: Fetch ledger information
        0: Exit
        Enter your choice: `);
        
        switch (choice) {
          case '1':
            await createAccount();
            break;
          case '2':
            await checkBalance();
            break;
          case '3':
            await listTransactions();
            break;
          case '4':
            streamTransactions();
            break;
          case '5':
            await signAndSubmitTransaction();
            break;
          case '6':
            await manageData();
            break;
          case '7':
            await fetchLedgerInfo();
            break;
          case '0':
            continueLoop = false;
            break;
          default:
            console.log("Invalid choice, please try again.");
        }
      }

      rl.close();
    }

    // Start the user prompt loop
    await userPrompt();

  } catch (error) {
    console.error("Error:", error);
  }
})();
