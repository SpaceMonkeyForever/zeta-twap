import {
    Connection,
    Keypair,
} from '@solana/web3.js';
import {assets, CrossClient, Exchange, Network, types, utils, Wallet} from "@zetamarkets/sdk";

async function createTwap(assetName: string, side: string, size: number, numMinutes: number) {
    console.log(`Creating TWAP of ${size} ${assetName} ${side} orders over ${numMinutes} minutes`)
    // Load environment variables
    const url = process.env.URL as string;
    const privateKey = process.env.WALLET as string;

    // Create keypair from the private key
    const keypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(privateKey)));

    // Create a new wallet
    const wallet = new Wallet(keypair);

    // Create a connection to Solana
    const connection = new Connection(url);

    // Load the SDK exchange singleton
    await Exchange.load({
        network: Network.MAINNET,
        connection: connection,
        opts: {
            skipPreflight: true,
            preflightCommitment: "processed",
            commitment: "processed",
        },
        throttleMs: 0,
        loadFromStore: true,
    });

    // Create a CrossClient
    const client = await CrossClient.load(
        connection,
        wallet,
        {
            skipPreflight: true,
            preflightCommitment: "processed",
            commitment: "processed",
        }
    );

    // Get the asset
    const asset = assets.nameToAsset(assetName);

    // Calculate the number of orders and delay between them
    const numOrders = numMinutes;  // Assuming one order per minute
    const delaySeconds = 60;  // One minute delay

    // Calculate the size of each order
    const orderSize = utils.convertDecimalToNativeLotSize(size / numOrders);

    // Set the order side
    const orderSide = side.toUpperCase() === 'BUY' ? types.Side.BID : types.Side.ASK;

    // Set a very high or low price depending on the order side to emulate a market order
    const orderPrice = utils.convertDecimalToNativeInteger(orderSide === types.Side.BID ? 100_000 : 0.001);

    // Iterate over the number of orders
    for (let i = 0; i < numOrders; i++) {
        // Send the transaction
        const sig = await client.placeOrder(asset, orderPrice, orderSize, orderSide, {
            orderType: types.OrderType.IMMEDIATEORCANCEL,
            tifOptions: { expiryTs: undefined }
        });

        console.log(`Order ${i + 1} sent with txid: ${sig}`);

        // Delay the next order
        await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
    }
}

const assetName = process.env.ASSET_NAME as string;
const side = process.env.SIDE as string;
const size = parseFloat(process.env.SIZE as string);
const numMinutes = parseInt(process.env.MINUTES as string);

createTwap(assetName, side, size, numMinutes).catch(err => console.log(err));