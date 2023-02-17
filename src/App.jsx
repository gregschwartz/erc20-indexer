import { Box, Button, Center, Flex, Heading, Image, Input, Link, Spacer, SimpleGrid, Text, GridItem, HStack, ButtonGroup } from '@chakra-ui/react';
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
        //put up error somewhere
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
    <div className="erc20">
      <nav>
        <Flex>
          <Link href='/erc20'>ERC-20 Indexer</Link>
          <Spacer />
          <Link href='/nft'>NFT Indexer</Link>
        </Flex>
      </nav>
      <Box w="100vw">
        <Center>
          <Flex
            alignItems={'center'}
            justifyContent="center"
            flexDirection={'column'}
          >
            <Heading fontSize={36}>
              ERC-20 Token Indexer
            </Heading>
          </Flex>
        </Center>
        <Flex
          w="100%"
          flexDirection="column"
          alignItems="center"
          justifyContent={'center'}
          mt={5}
        >
          <HStack mt={2} spacing={3}>
            <Button fontSize={20} onClick={getAddressFromMetamask} bgColor="darkOrange">
              Get address via MetaMask
            </Button>
            <label htmlFor={"addressInput"}>or enter address:</label>
            <Input onChange={(e) => setUserAddress(e.target.value)} id="addressInput" color="black" w="600px" textAlign="center" p={4} bgColor="white" fontSize={24} value={userAddress} placeholder="0xabc..." />
          </HStack>

          <Button mt={5} mb={20} fontSize={20} onClick={getTokenBalance} bgColor="blue" color="white">
            Check Balances of ERC-20 Tokens!
          </Button>

          {isLoading && <Image src="/Ethereum gold coin.gif" />}
          {error.length>0 && <Heading>Something went wrong: {error}</Heading>}

          {hasQueried ? (
            <>
            <HStack spacing={30}>
              <Heading>ERC-20 token balances</Heading>
              <Button fontSize={10} onClick={() => {setHideSmallBalances(!hideSmallBalances)}} bgColor="lightBlue" >
                {hideSmallBalances ? "Show" : "Hide"} small balances
              </Button>
            </HStack>

            <SimpleGrid w={'90vw'} columns={4} spacing={24}>
              {results.tokenBalances.map((e, i) => {
                if(hideSmallBalances && Utils.formatUnits(e.tokenBalance, tokenDataObjects[i].decimals) < minimumValueToShow) {
                  return;
                }

                return (
                  <Flex
                    flexDir={'column'}
                    color="white"
                    bg="blue"
                    w={'20vw'}
                    key={i}
                  >
                    <Box>
                      <b>Symbol:</b> ${tokenDataObjects[i].symbol}&nbsp;
                    </Box>
                    <Box>
                      <b>Balance:</b>&nbsp;
                      {prettyBalance(e.tokenBalance, i, 5)}
                    </Box>
                    <Image src={tokenDataObjects[i].logo} />
                  </Flex>
                );
              })}
            </SimpleGrid>
            </>
          ) : ""}
        </Flex>
      </Box>
    </div>
  );
}

export default App;
