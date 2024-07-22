## This script provides developer-focused utilities for interacting with the Diamante blockchain:

### Initialization:

- Imports necessary libraries.
- Sets up readline for user input.


### Main Function:

- Generates a new keypair and funds the account using the Diamante testnet friendbot.
- Connects to the Diamante testnet Horizon server.
- Loads the account details.


### User Input Function:

- Helper function to prompt the user for input.
- Developer Utilities:
- Create Account:
    - Generates and funds a new Diamante account.
- Check Balance:
    - Checks the balance of a specified account.
- List Transactions:
    - Lists transactions for a specified account.
- Stream Transactions:
    - Streams real-time transactions for the account.
- Sign and Submit Transaction:
    - Prompts for a transaction envelope XDR, signs, and submits it.
- Manage Data:
    - Adds, updates, or deletes data on the account.
- Fetch Ledger Info:
    - Fetches information for a specified ledger sequence number.
- User Prompt Loop:

    - Continuously prompts the user to choose an operation until they choose to exit.
- Error Handling:

    - Catches and logs any errors during execution.