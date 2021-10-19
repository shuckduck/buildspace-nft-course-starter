import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import myEpicNft from './utils/MyEpicNFT.json';

// Constants
const CONTRACT_ADDRESS = "0x066163A2D5Efa5043B3213208Fd0215e9EcccD7c";
const BUILDSPACE_TWITTER_HANDLE = '_buildspace';
const MY_TWITTER_HANDLE = 'tchristensen952';
const BUILDSPACE_TWITTER_LINK = `https://twitter.com/${BUILDSPACE_TWITTER_HANDLE}`;
const MY_TWITTER_LINK = `https://twitter.com/${MY_TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [mintCount, setMintCount] = useState(undefined);
  const [mintInProgress, setMintInProgress] = useState(false);

  const checkIfWalletIsConnected = async () => {

    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)
      eventListeners()
    } else {
      console.log("No authorized account found")
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);

      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      }

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  // Setup our listener.
  const eventListeners = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          setMintInProgress(false)
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take some time to show up. Here's the link: https://rinkeby.rarible.com/token/${CONTRACT_ADDRESS}:${tokenId.toNumber()}`)
        });

        connectedContract.on("CurrentTokenId", (tokenId) => {
          let currentTokenId = tokenId.toNumber()
          console.log("current token id: ", currentTokenId)
          if (currentTokenId) {
            setMintCount(currentTokenId)
          }
        });
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    setMintInProgress(true)
    try {
      const { ethereum } = window;

      if (ethereum) {
        console.log("ethereum", ethereum)
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.")
        await nftTxn.wait();
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

      } else {
        console.log("Ethereum object doesn't exist!");
        setMintInProgress(false)
      }
    } catch (error) {
      console.log(error)
      setMintInProgress(false)
    }
  }

  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintButton = () => (
    <>
      {mintInProgress === false ?
        renderMintNFT()
        :
        renderLoadingMintNFT()
      }
    </>
  );

  const renderMintNFT = () => (
    <button onClick={askContractToMintNft} className="cta-button mint-button">
      Mint NFT
    </button>
  );

  const renderLoadingMintNFT = () => (
    <button disabled className="cta-button mint-button-loading">
      Minting...
    </button>
  );

  const renderMintCount = () => (
    <div className="mint-count-container">
      <p className="mint-count">
        Total NFTs minted by users on the blockchain: {mintCount}
      </p>
    </div>
  );

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ?
            renderNotConnectedContainer()
            :
            renderMintButton()
          }
        </div>
        <div>
          {mintCount !== undefined && renderMintCount()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={BUILDSPACE_TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${BUILDSPACE_TWITTER_HANDLE}`}</a>
          <br/>
          <a
            className="footer-text"
            href={MY_TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`, by @${MY_TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
