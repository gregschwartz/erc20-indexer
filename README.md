# NFT & ERC-20 Indexer

## How you achieved the goals of the project

Chakra was surprisingly unhelpful, and not being able to use a layout grid was frustrating. Why do you like it better? I did like the ability to specify sizes by breakpoints though, e.g. 
```js
<Button 
fontSize={{ base: '11px', md: 'md', lg: 'xl' }} 
w={{ base: '33vw', md: '40vw', lg: '28vw' }}
``` 

Like we were supposed to, I used the Alchemy SDK to look up both tokens (`alchemy.core.getTokenBalances()`) and NFTs (`alchemy.nft.getNftsForOwner()`).

Also found animated images [ https://icons8.com/preloaders/en/cryptocurrency_and_money ] and used them for my loading indicators.

## Set Up

1. Install dependencies by running `npm install`
2. Start application by running `npm run dev`
3. Open http://localhost:5173/
4. Leave the sample address (already filled in) or click `Get address via MetaMask` to ask MetaMask for yours
5. Click the `Check Balances` button
5. Click `Show small balances` to see any tokens that were hidden because they had a small (value <= 0.0001) or zero balance
6. Click `NFT Indexer` and then `Check NFTs Owned` to see NFTs owned by the address

## ERC20 Challenges Completed

1. Token balance formatting
1. User wallet integration
1. Progress status
1. Styling
1. Error checking
1. Pretty grid display

## NFTs Challenges Completed

1. Token balance formatting (can't find a way to show value, but showed floor for collection)
1. User wallet integration
1. Progress status
1. Styling
1. Error checking
1. Pretty grid display
