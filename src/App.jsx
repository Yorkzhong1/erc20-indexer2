import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { useEffect, useState } from 'react';
import {ethers} from 'ethers'

async function connectMetaMask() {
  console.log('connecting MetaMask')
  // 检查是否存在 MetaMask
  if (typeof window.ethereum !== 'undefined') {
      try {
          // 请求用户授权连接钱包
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          // 创建 Ethers.js 提供者
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          // 获取用户账户
          const signer = provider.getSigner();
          const userAddress = await signer.getAddress();

          console.log('Connected address:', userAddress);
          return userAddress;
      } catch (error) {
          console.error('User denied account access', error);
      }
  } else {
      console.alert('MetaMask is not installed');
  }
}


function App() {
  const [userAddress, setUserAddress] = useState('');
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);
  
  useEffect(()=>{
    setUserAddress(connectMetaMask())
  },[])
  

  async function getTokenBalance() {
    const config = {
      apiKey: "OnvrtKZIFNpa3h9xdW5h2OEyeZl7J5BS",
      network: Network.ETH_MAINNET,
    };

  
    const alchemy = new Alchemy(config);
    const data = await alchemy.core.getTokenBalances(userAddress);

    setResults(data);
    console.log('data from inquiry',data)

    const tokenDataPromises = [];

    for (let i = 0; i < data.tokenBalances.length; i++) {
      const tokenData = alchemy.core.getTokenMetadata(
        data.tokenBalances[i].contractAddress
      );
      console.log('tokendata',tokenData)
      tokenDataPromises.push(tokenData);
    }

    setTokenDataObjects(await Promise.all(tokenDataPromises));
    setHasQueried(true);
    
  }

  return (
    <Box w="100vw">
      <Center>
        <Flex
          alignItems={'center'}
          justifyContent="center"
          flexDirection={'column'}
        >
          <Heading mb={0} fontSize={36}>
            ERC-20 Token Indexer
          </Heading>
          <Text>
            Plug in an address and this website will return all of its ERC-20
            token balances!
          </Text>
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={'center'}
      >
        <Heading mt={42}>
          Get all the ERC-20 token balances of this address:
        </Heading>
        <Input
          onChange={(e) => setUserAddress(e.target.value)}
          color="black"
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
          id="userAddress"
        />
        <Button fontSize={20} onClick={getTokenBalance} mt={36} bgColor="lightblue">
          Check ERC-20 Token Balances
        </Button>

        <Text>{hasQueried?'':'Inquring'}</Text>

        <Heading my={36}>ERC-20 token balances:</Heading>

        {hasQueried ? (
          <SimpleGrid w={'90vw'} columns={4} spacing={24}>
            {results.tokenBalances.map((e, i) => {
              return (
                <Flex
                  flexDir={'column'}
                  color="black"
                  bg="lightGray"
                  w={'20vw'}
                  key={e.id}
                >
                  <Box>
                    <b>Symbol:</b> ${tokenDataObjects[i].symbol}&nbsp;
                  </Box>
                  <Box>
                    <b>Balance:</b>&nbsp;
                    {Utils.formatUnits(
                      e.tokenBalance,
                      tokenDataObjects[i].decimals
                    )}
                  </Box>
                  <Image src={tokenDataObjects[i].logo } />
                </Flex>
              );
            })}
          </SimpleGrid>
        ) : (
          'Please make a query! This may take a few seconds...'
        )}
      </Flex>
    </Box>
  );
}

export default App;
