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
      alert("MetaMask didn't return any addresses");
      return;
    }
    setUserAddress(addressArray[0]);
    getTokenBalance();
  }

  async function getTokenBalance() {
    setIsLoading(true);

    if(!userAddress || userAddress.length==0) {
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
        setHasQueried(false);
        setIsLoading(false);
        return;
      }

      setError("");
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

  function showError(text) {
    console.log("ready to show error");
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
          <Button fontSize={20} onClick={getAddressFromMetamask} bgColor="darkOrange" mb={1}>
            Get my address via MetaMask
          </Button>
          Or
          <HStack mt={2} mb={20} spacing={0}>
            <label htmlFor={"addressInput"}>Address&nbsp;</label>
            <Input onChange={(e) => setUserAddress(e.target.value)} id="addressInput" color="black" w="600px" textAlign="center" p={4} bgColor="white" fontSize={24} value={userAddress} placeholder="0xabc..." borderTopRightRadius={0} borderBottomRightRadius={0} />
            <Button fontSize={20} onClick={getTokenBalance} bgColor="blue" color="white" borderTopLeftRadius={0} borderBottomLeftRadius={0}>
              Check Balances
            </Button>
          </HStack>

          {isLoading && <Image  src="/public/Ethereum gold coin.gif" />}
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
                      {Utils.formatUnits(
                        e.tokenBalance,
                        tokenDataObjects[i].decimals
                      )}<br />Decimals: 
                      {tokenDataObjects[i].decimals}
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
