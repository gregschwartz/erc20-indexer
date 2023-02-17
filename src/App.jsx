import { Box, Button, Center, Flex, Heading, Image, Input, Link, Spacer, SimpleGrid, Text, GridItem, HStack, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { useState } from 'react';

function App() {
  const [userAddress, setUserAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hideSmallBalances, setHideSmallBalances] = useState(true);
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);

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

  async function getTokenBalance() {
    setError("");
    setIsLoading(true);

    if(userAddress.length==0) {
      showError("Please enter an address");
      return;
    }

    const alchemy = new Alchemy({
      apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
      network: Network.ETH_MAINNET,
    });

    try {
      var data = await alchemy.core.getTokenBalances(userAddress);
      if(!data || data.length == 0) {
        showError("No balances found");
        return;
      }

      setResults(data);
      console.log(data);
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
    console.log(tokenDataObjects);

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
    console.log(str, whole, decimals, "rounded:", rounded, "t.f.", pretty);
    return pretty;
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
        <Tab>ERC-20 Indexer</Tab>
        <Tab className='nftTab'>NFT Indexer</Tab>
      </TabList>
      <TabPanels>
        <TabPanel className='erc20'>
          <Flex w="100%" flexDirection="column" alignItems="center" justifyContent={'center'} mt={5}>
            <HStack mt={2} spacing={3}>
              <Button fontSize={20} onClick={getAddressFromMetamask} bgColor="darkOrange" className='metamask'>
                Get address via MetaMask
              </Button>
              <label htmlFor={"addressInput"}>or enter address:</label>
              <Input onChange={(e) => setUserAddress(e.target.value)} id="addressInput" color="black" w="600px" textAlign="center" p={4} bgColor="white" fontSize={24} value={userAddress} placeholder="0xabc..." />
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

              <SimpleGrid w={'90vw'} columns={4} spacing={12} id="results">
                {results.tokenBalances.map((e, i) => {
                  if(hideSmallBalances && Utils.formatUnits(e.tokenBalance, tokenDataObjects[i].decimals) < minimumValueToShow) { return; }

                  return (
                    <Flex flexDir={'column'} color="black" bg="#aaa" w={'20vw'} key={i} alignItems="center" className='token'>
                      <Box>
                        <b>Symbol:</b> ${tokenDataObjects[i].symbol}&nbsp;
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
nft stuff goes here
        </TabPanel>
      </TabPanels>
    </Tabs>
    </>
  );
}

export default App;
