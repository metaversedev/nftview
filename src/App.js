import styled from 'styled-components'
import { NFTModal } from './components/NFTModal';
import { NFTCard, NftPhoto } from './components/NFTCard';
import {useState, useEffect} from 'react'
import { ethers, utils } from 'ethers'
import { connect } from './helpers';
//require('dotenv').config();
const axios = require('axios');
const contractAddress = "0x761465991ff8bc386866259D01108b276BcCfdf3"


function App() {

  let initialNfts = [
    { name: "Mario", symbol: "MAV", copies: "10", image: "https://via.placeholder.com/150"},
    { name: "Luigi", symbol: "MAV", copies: "10", image: "https://via.placeholder.com/150"},
    { name: "Yoshi", symbol: "MAV", copies: "10", image: "https://via.placeholder.com/150"},
    { name: "Donkey Kong", symbol: "MAV", copies: "10", image: "https://via.placeholder.com/150"},
    { name: "Mario", symbol: "MAV", copies: "10", image: "https://via.placeholder.com/150"},
    { name: "Luigi", symbol: "MAV", copies: "10", image: "https://via.placeholder.com/150"},
    { name: "Yoshi", symbol: "MAV", copies: "10", image: "https://via.placeholder.com/150"},
    { name: "Donkey Kong", symbol: "MAV", copies: "10", image: "https://via.placeholder.com/150"}
  ] 

  const [showModal, setShowModal] = useState(false)
  const [selectedNft, setSelectedNft] = useState()
  const [nfts, setNfts] = useState(initialNfts)
  const [activeAddress, setActiveAddress] = useState("Connect Wallet")
  const contractABI = require("./Derbie.json");
  const [balance, setBalance] = useState(0);

  useEffect( () => {

    // ( async () => {
    //   const address = await connect()
    // if(address){
    //   setActiveAddress(address)
    //   getNfts(address)
    // }
    // })()
    
  }, [])

  async function openNow(){
    const address = await connect()
    if(address){
      setActiveAddress(address)
      getNfts(address)
      console.log("I was clicked")
  }
}



  function toggleModal(i){
    if (i >= 0){
      setSelectedNft(nfts[i])
    }
    setShowModal(!showModal)
  }

  async function mint (){
    //load smart contract
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    //await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);

    //const message = await contract.getMessage()
    //const bal = await provider.getBalance(contractAddress)
    // const bal = await contract.balance()
    // const ba = ethers.utils.formatEther(bal) 
    // setBalance(ba)
    // console.log(ba)
   

    try {
      const options = {value: ethers.utils.parseEther("0.1")}
      //console.log(ethers.utils.parseEther("0.1"))
      const txHash = await contract.mint(1, options)
      console.log("Succesffuly minted 1 NFTS")
      return {
          success: true,
          status: "✅ Check out your transaction on Etherscan: https://ropsten.etherscan.io/tx/" + txHash,
      }
      } catch (error) {
      return {
          success: false,
          status: "😥 Something went wrong: " + error.message
      }
  }

    




    // const txparams = {
    //   to: contractAddress, // Required except during contract publications.
    //   from: window.ethereum.selectedAddress, // must match user's active address.
    //   'data': contract.mint(4)//make call to NFT smart contract
    // };


   //window.contract = await new web3.eth.Contract(contractABI.abi, contractAddress);//loadContract();

    //set up your Ethereum transaction
  //   const txparams = {
  //       to: contractAddress, // Required except during contract publications.
  //       from: window.ethereum.selectedAddress, // must match user's active address.
  //       'data': window.contract.methods.mint(1).encodeABI() //make call to NFT smart contract
  //   };




  //   //sign transaction via Metamask
  //   try {
  //     const txHash = await window.ethereum
  //         .request({
  //             method: 'eth_sendTransaction',
  //             params: [txparams],
  //         });
  //     return {
  //         success: true,
  //         status: "✅ Check out your transaction on Etherscan: https://ropsten.etherscan.io/tx/" + txHash
  //     }
  //     } catch (error) {
  //     return {
  //         success: false,
  //         status: "😥 Something went wrong: " + error.message
  //     }
  // }


  }

  async function getNfts(address) {
    const rpc = "https://eth-ropsten.alchemyapi.io/v2/YqqmhiG4K2s481G_chTurm9i7ndNWfae"
    const ethersProvider = new ethers.providers.JsonRpcProvider(rpc)

    let abi = [
      "function symbol() public view returns(string memory)",
      "function tokenCount() public view returns (uint256)",
      "function uri(uint256 _tokenId) public view returns (string memory)",
      "function balanceOfBatch(address[] accounts, uint256[] ids) public view returns(uint256[])",
      "function mint"
    ]

    let nftCollection = new ethers.Contract(
      contractAddress,
      contractABI.abi,
      ethersProvider 
    )

    //console.log(JSON.stringify(contract.abi))

    let numberOfNfts = (await nftCollection.tokenCount()).toNumber()
    let collectionSymbol = await nftCollection.symbol()
    let accounts = Array(numberOfNfts).fill(address)
    let ids = Array.from({length: numberOfNfts}, (_, i) => i + 1)
    let copies = await nftCollection.balanceOfBatch(accounts, ids)

    let tempArray = []
    let baseUrl =""
    for (let i =1; i <= numberOfNfts; i++){
      if (i == 1){
        let tokenUri = await nftCollection.uri(i)
        baseUrl = tokenUri.replace(/\d+.json/, "")
        let metadata = await getMetadataFromIpfs(tokenUri)
        metadata.symbol = collectionSymbol
        metadata.copies = copies[i-1]
        tempArray.push(metadata)

      }else{
        let metadata = await getMetadataFromIpfs(baseUrl + `${i}.json`)
        metadata.symbol = collectionSymbol
        metadata.copies = copies[i-1]
        tempArray.push(metadata)

      }
    }
    setNfts(tempArray)
    console.log(tempArray)

  }

  async function getMetadataFromIpfs(tokenUri){
    let metadata = await axios.get(tokenUri)
    return metadata.data
  }

  

  return (
    <div className="App">
      <Container>
        <Title> Mavie World Collection </Title>
        <Subtitle> Probably the best NFT ever released</Subtitle>
        <Subtitle>{balance}</Subtitle>
        <Button onClick={() => openNow()}> {activeAddress}</Button>
        <MintButton onClick={() => mint()}> Mint Now</MintButton>
        <Grid>
          {
            nfts.map((nft, i) =>  
            <NFTCard nft={nft} key={i} toggleModal={ () => toggleModal(i)} />
            )
          }

        </Grid>
        
      </Container>
      {
        showModal &&
        <NFTModal nft={selectedNft} toggleModal={()=> toggleModal()}/>
        
      }
    
    </div>
  );
}

const Button = styled.button`
color: blue;
font-size: 1em;
padding: 0.25em 1em;
border: 2px solid blue;
border-radius: 3px;
white-space: nowrap;
 cursor: pointer;
 outline: none;
 text-shadow: 0.1rem 0.1rem 0.5rem hsla(0, 0%, 0%, 0.5);
 user-select: none;
 margin: 0rem 0rem 1rem 0rem;
 transition: all 0.1s ease-in;


    // padding: 18px 25px;
    // border-radius: 25px;
    // background-color: #ff2271;
    // box-shadow: 1px 1px 3px 0 rgb(0 0 0 / 40%);
    // -webkit-transition: all 200ms cubic-bezier(.455, .03, .515, .955);
    // transition: all 200ms cubic-bezier(.455, .03, .515, .955);
    // font-family: 'Tooncats v1lv', sans-serif;
    // color: #fff;
    // font-size: 16px;
    // line-height: 20px;
    // letter-spacing: 2px;
    // text-decoration: none;
    // text-transform: uppercase;
  

`
const MintButton = styled.button`
color: blue;
font-size: 1em;
padding: 0.25em 1em;
border: 2px solid blue;
border-radius: 3px;
white-space: nowrap;
 cursor: pointer;
 outline: none;
 text-shadow: 0.1rem 0.1rem 0.5rem hsla(0, 0%, 0%, 0.5);
 user-select: none;
 margin: 0rem 0rem 1rem 0rem;
 transition: all 0.1s ease-in;
 display: 0



`


const Title= styled.h1`
margin: 0;
text-align: center;
`
const Subtitle= styled.h4`
color: gray;
margin-top: 0;
text-align: center;
`
const Container = styled.div`
width: 70%;
max-width: 1200px;
margin: auto;
text-align: center;
margin-top: 50px;

`
const Grid = styled.div`
display: grid;
grid-template-columns: 1fr 1fr 1fr 1fr;
row-gap: 100px;

`


export default App;
