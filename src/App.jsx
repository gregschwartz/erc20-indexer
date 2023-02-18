import { Box, Button, Center, Flex, Heading, Image, Input, Link, Spacer, SimpleGrid, Text, GridItem, HStack, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { useState } from 'react';

function App() {
  const [userAddress, setUserAddress] = useState('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasQueried, setHasQueried] = useState(false);
  const [hideSmallBalances, setHideSmallBalances] = useState(true);
  const [tokenResults, setTokenResults] = useState([]);
  const [nftResults, setNftResults] = useState([]);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);

  const alchemy = new Alchemy({
    apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
  });

  //configuration
  const minimumValueToShow = 0.0001;

  async function getAddressFromMetamask() {
    const addressArray = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if(addressArray.length==0) {
      showError("MetaMask didn't return any addresses");
      return;
    }
    setUserAddress(addressArray[0]);
  }

  async function getNftsOwned() {
    setError("");
    setIsLoading(true);
    setHasQueried(false);
    setNftResults([]);

    if(userAddress.length==0) {
      showError("Please enter an address");
      return;
    }

    try {
      var data = await alchemy.nft.getNftsForOwner(userAddress);
      if(!data || data.length == 0) {
        showError("No NFTs found");
        return;
      }

      setNftResults(data.ownedNfts);
      // console.log(data);
    } catch(exception) {
      console.log("Error getting NFTs", exception);
      showError(exception.message);
      return;
    }

    setHasQueried(true);
    setIsLoading(false);
  }

  async function getTokenBalance() {
    setError("");
    setIsLoading(true);
    setHasQueried(false);
    setTokenResults([]);

    if(userAddress.length==0) {
      showError("Please enter an address");
      return;
    }

    try {
      var data = await alchemy.core.getTokenBalances(userAddress);
      if(!data || data.length == 0) {
        showError("No balances found");
        return;
      }

      setTokenResults(data.tokenBalances);
      // console.log(data);
    } catch(exception) {
      console.log("Error getting balances", exception);
      showError(exception.message);
      return;
    }

    const tokenDataPromises = [];
    for (let i = 0; i < data.tokenBalances.length; i++) {
      const tokenData = alchemy.core.getTokenMetadata(
        data.tokenBalances[i].contractAddress
      );
      tokenDataPromises.push(tokenData);
    }
    setTokenDataObjects(await Promise.all(tokenDataPromises));
    // console.log(tokenDataObjects);

    setHasQueried(true);
    setIsLoading(false);
  }

  //use formatUnits(), then cut the number of decimal places down
  function prettyBalance(numberAsString, index, decimalPlaces) {
    const str = Utils.formatUnits(numberAsString, (tokenDataObjects[index] ? tokenDataObjects[index].decimals : 18));
    const decimalAt = str.indexOf(".");

    if(decimalAt < 0) { return str + ".0"; }

    const whole = str.substring(0, decimalAt);
    var decimals = "0." + str.substring(decimalAt + 1, decimalAt + 1 + decimalPlaces + 1);
    if (decimals==0) { return whole + ".0"; }
    
    const rounded  = (+decimals).toFixed(decimalPlaces);
    const pretty = whole + rounded.toString().substring(1);
    return pretty;
  }

  function onEnterKeyPressRun(event, nextFunction) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      nextFunction();
    }
  }

  function showError(text) {
    console.log("Show error", text);
    setError(text);
    setHasQueried(false);
    setIsLoading(false);
  }
  return (
    <>
    {error.length>0 && <Heading mt={5} mb={10} textAlign="center">🙈 Uh-oh: {error}</Heading>}
    <Tabs align='center' size="lg" isFitted variant='line' w="100vw" h="100vh">
      <TabList>
        <Tab className='tokenTab'>ERC-20 Indexer</Tab>
        <Tab className='nftTab'>NFT Indexer</Tab>
      </TabList>
      <TabPanels>
        <TabPanel className='erc20'>
          <Flex w="100%" flexDirection="column" alignItems="center" justifyContent={'center'} mt={5}>
            <HStack mt={2} spacing={{ base: 0, md: 1, lg: 3 }}>
              <Button fontSize={{ base: '11px', md: 'md', lg: 'xl' }} w={{ base: '33vw', md: '40vw', lg: '28vw' }} onClick={getAddressFromMetamask} className='metamask'>
                Get address via MetaMask
              </Button>
              <label htmlFor={"addressInput"}>or enter address:</label>
              <Input onChange={(e) => setUserAddress(e.target.value)} onKeyDown={(event) => {onEnterKeyPressRun(event, getTokenBalance)}} id="addressInput" color="black" w={{ base: '54vw', md: '50vw', lg: '50vw' }} fontSize={{ base: '14px', md: 'md', lg: 'xl' }} textAlign="center" p={4} bgColor="white" value={userAddress} placeholder="0xabc..." />
            </HStack>

            <Button className="primary" mt={5} mb={20} fontSize={20} onClick={getTokenBalance}>
              Check Balances of ERC-20 Tokens!
            </Button>

            {isLoading && <Image src="/Ethereum gold coin.gif" borderRadius={30} />}

            {hasQueried ? (
              <>
              <HStack spacing={30} mb={5}>
                <Heading>ERC-20 token balances</Heading>
                <Button className="secondary" fontSize={10} onClick={() => {setHideSmallBalances(!hideSmallBalances)}}>
                  {hideSmallBalances ? "Show" : "Hide"} small balances
                </Button>
              </HStack>

              <SimpleGrid w={'90vw'} columns={4} spacing={12} id="tokenResults">
                {tokenResults.map((e, i) => {
                  if(tokenDataObjects[i]==undefined || (hideSmallBalances && Utils.formatUnits(e.tokenBalance, tokenDataObjects[i].decimals) < minimumValueToShow)) { return; }

                  return (
                    <Flex flexDir={'column'} color="black" bg="#aaa" w={'20vw'} key={i} alignItems="center" className='token'>
                      <Box>
                        <b>Symbol:</b> {tokenDataObjects[i].symbol}&nbsp;
                      </Box>
                      <Box className='balance'>
                        <b>Balance:</b>&nbsp;
                        {prettyBalance(e.tokenBalance, i, 5)}
                      </Box>
                      <Image src={tokenDataObjects[i].logo ? tokenDataObjects[i].logo : "/defaultLogoToken.png"} />
                    </Flex>
                  );
                })}
              </SimpleGrid>
              </>
            ) : ""}
          </Flex>
        </TabPanel>
        <TabPanel className='nft'>
          <Flex w="100%" flexDirection="column" alignItems="center" justifyContent={'center'} mt={5}>
            <HStack mt={2} spacing={{ base: 0, md: 1, lg: 3 }}>
              <Button fontSize={{ base: '11px', md: 'md', lg: 'xl' }} w={{ base: '33vw', md: '40vw', lg: '28vw' }} onClick={getAddressFromMetamask} bgColor="darkOrange" className='metamask'>
                Get address via MetaMask
              </Button>
              <label htmlFor={"addressInput"}>or enter address:</label>
              <Input onChange={(e) => setUserAddress(e.target.value)} onKeyDown={(event) => {onEnterKeyPressRun(event, getNftsOwned)}} id="addressInput" color="black" w={{ base: '54vw', md: '50vw', lg: '50vw' }} fontSize={{ base: '14px', md: 'md', lg: 'xl' }} textAlign="center" p={4} bgColor="white" value={userAddress} placeholder="0xabc..." />
            </HStack>

            <Button className="primary" mt={5} mb={20} fontSize={20} onClick={getNftsOwned}>
              Check NFTs owned!
            </Button>

            {isLoading && <Image src="/Ethereum logo revolving.gif" borderRadius={30} />}

            {hasQueried ? (
              <>
              <HStack spacing={30} mb={5}>
                <Heading>NFTs owned</Heading>
              </HStack>

              <SimpleGrid w={'90vw'} columns={3} spacing={12} id="nftResults">
                {nftResults.map((e, i) => {
                  if(e.title.length == 0 && e.media.length==0) { return; }

                  return (
                    <Flex flexDir={'column'} key={i} alignItems="center" className='token'>
                      <Box><Link href={e.tokenUri.gateway} target="_blank">{e.title}</Link></Box>
                      <Link href={e.media[0].gateway} target="_blank"><Image src={e.media[0].gateway} /></Link>
                      <Box fontSize="xs">
                        Balance: {e.balance}
                      </Box>
                      <Box>
                        Collection: <Link href={e.contract.openSea.externalUrl} target="_blank">{e.contract.openSea.collectionName}</Link>
                      </Box>
                      <Box>
                        {e.contract.openSea.floorPrice >0 && "Floor: " + e.contract.openSea.floorPrice +" ETH"}
                      </Box>
                    </Flex>
                  );
                })}
              </SimpleGrid>
              </>
            ) : ""}
          </Flex>
        </TabPanel>
      </TabPanels>
    </Tabs>
    </>
  );
}

export default App;
