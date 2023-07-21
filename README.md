### install

- make sure you have node installed
- install dependencies with: `npm install`

### Run
Example buy 2 SOL over 2 minute (buy 1 a minute)
Make sure to replace [] with your wallet
```
WALLET="[]" URL="https://api.mngo.cloud/lite-rpc/v1/" ASSET_NAME="SOL" SIDE="BUY" SIZE="1" MINUTES="1" npx ts-node twap.ts
```