# NFT & ERC-20 Indexer

This is an skeleton app that uses the Alchemy SDK rigged to Alchemy's Enhanced APIs in order to display all of an address's ERC-20 token balances.

## Set Up

1. Install dependencies by running `npm install`
2. Start application by running `npm run dev`
3. Open http://localhost:5173/
4. Click `Get address via MetaMask` or paste an address in, then click the "Check Balances" button
5. Click `Show small balances` to see any tokens that were hidden because they had a small balance (or 0 balance)
6. Click `NFT Indexer` and do the same to see NFTs

## Challenges Completed

1. ✅ Add Wallet integration so that any user that connects their wallet can check their ERC-20 token balance
2. ✅ There is no indication of a request in progress... that's bad UX! Do you think you can add some sort of indication of loading?
4. ✅ The token balances can sometimes be a little long and break the outline of the page... can you fix that? 🔧
5. ✅ There is no error-checking for wrongly formed requests, or really any error checking of any kind... can you add some in?

## Challenges Remaining
- need to style the nav links at the top
3. ⏭️ Add some styling! 🎨
6. ⏭️ The images and grid display could look better... anything you can do about that?
8. ❓ Can you add ENS support for inputs?
- Retrieve NFTs