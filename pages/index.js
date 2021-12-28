import Head from 'next/head'
import { useEffect, useState } from "react";
import Image from 'next/image'
import styles from '../styles/Home.module.scss'
import ReactTypingEffect from 'react-typing-effect';
import Countdown from 'react-countdown';
import ContractData from '../config/Contract.json';
const Web3 = require('web3');
import detectEthereumProvider from '@metamask/detect-provider'

export default function Home() {
  const [userAddress, setUserAddress] = useState('CONNECT');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [heroIndex, setHeroIndex] = useState(1);
  const [mintAmount, setMintAmount] = useState(1);
  const [heroTab, setHeroTab] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [faqtab, setFaqtab] = useState(1);

  const _chainIdToCompare = 1; //Ethereum
  //const _chainIdToCompare = 1; //Rinkeby
  const sleep = async( ms) => {
	  return new Promise(resolve => setTimeout(resolve, ms));
	}

      // Renderer callback with condition
  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a completed state
      return <div ><div class="number">
                <p className={styles.main_mint_s} onClick={() => { 
                    setMintAmount(mintAmount == 20 ? 20 : mintAmount+1) ;

                }}>+</p>
                <input type="text" value={`${mintAmount}`}/>
                <p className={styles.main_mint_s} onClick={() => { 
                    setMintAmount(mintAmount == 0 ? 0 : mintAmount-1) ;

                }}>-</p>
            </div>
            <button className={styles.mint_button} onClick={()=>mint(mintAmount)}> Mint {mintAmount}</button>
</div>;
    } else {
      // Render a countdown
      return <p className={styles.cd}>{days} days {hours} hs {minutes} min {seconds} sec</p>;
    }
  };

  const galleryCount = async (thisHI) => {
  	const _ = setTimeout(() => {
		
			  	setHeroIndex(thisHI + 1)

			  	galleryCount(thisHI == 5 ? 1 : thisHI + 1)
	  	}, 800);
	  }

	  useEffect(async()=>{
	  	galleryCount(1);
	}, [])

      useEffect(async () => {
    loadIndependentData();
  }, []);

  const loadIndependentData = async() => {
    var currentProvider = new Web3.providers.HttpProvider(`https://${_chainIdToCompare == 1 ? 'mainnet' : 'rinkeby'}.infura.io/v3/be634454ce5d4bf5b7f279daf860a825`);
    const web3 = new Web3(currentProvider);
    const contract = new web3.eth.Contract(ContractData.abi, ContractData.address);


      const maxSupply = await contract.methods.maxSupply().call();
      const totalSupply = await contract.methods.totalSupply().call();
  }

      const requestAccountMetamask = async() => {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      
      if(accounts.length > 0) {
        setUserAddress(accounts[0]);

        const chainId = await ethereum.request({ method: 'eth_chainId' });
        handleChainChanged(chainId);

        ethereum.on('chainChanged', handleChainChanged);

        function handleChainChanged(_chainId) {
          if(_chainId != _chainIdToCompare) {
            window.location.reload();
          }
        }

        ethereum.on('accountsChanged', handleAccountsChanged);

        async function handleAccountsChanged(accounts) {
          if (accounts.length === 0) {
            setUserAddress('');
            
            // loadDataAfterAccountDetected();
          } else if (accounts[0] !== userAddress) {
            const chainId = await ethereum.request({ method: 'eth_chainId' });
            setUserAddress(chainId == _chainIdToCompare ? accounts[0] : 'CONNECT');
            
            
          }
        }
      }
    }

  const connectMetamaskPressed = async () => {
    try { 
      await window.ethereum.enable();
      requestAccountMetamask();
   } catch(e) {
      // User has denied account access to DApp...
   }
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x'+_chainIdToCompare }],
      });
      requestAccountMetamask();
    } catch (error) {
      
      // This error code indicates that the chain has not been added to MetaMask.
      if (error.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{ chainId: '0x'+_chainIdToCompare, rpcUrl: 'https://...' /* ... */ }],
          });
          requestAccountMetamask();
        } catch (addError) {
        }
      }
    }
  }

  const mint = async(mintValue) => {
    if(userAddress == 'CONNECT') {
      return alert('User is not connected');
    }
    
    if(mintValue == 0) { return; }
    setIsLoading(true);
    const provider = await detectEthereumProvider()
  
    if (provider && userAddress!='CONNECT') {
      const web3 = new Web3(provider);
      const contract = new web3.eth.Contract(ContractData.abi, ContractData.address);

      const _priceWei = await contract.methods.getCurrentPrice().call();
      
      try{
        var block = await web3.eth.getBlock("latest");
      var gasLimit = block.gasLimit/block.transactions.length;
      const gasPrice = await contract.methods.mint(
        mintValue
      ).estimateGas({from: userAddress, value: (mintValue*_priceWei)});

      await contract.methods.mint(
        mintValue
      ).send({
        from: userAddress,
        value: (mintValue*_priceWei),
        gas: gasPrice,
        gasLimit: gasLimit
      });
      alert('Minted successfuly!');
      setIsLoading(false);
      window.location.reload();
    }catch(e){
      alert('An error has happened, connect your wallet with enough funds')
    }
    }
  }



  return (
    <div className={styles.page}>
        <Head>
          <title>Wacky Wassies NFT</title>
          <meta name="description" content="Wacky Wassies NFT is a 3,333 Generative collection of NFTs." />
          <link rel="icon" href="/nft-1.png" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </Head>
        <nav className={styles.navbar}>
            <img className={styles.was_flipped} src='/nft-1.png'/>
            <ul>
                <li><a href='#about'>About</a></li>
                <li><a href='#roadmap'>Roadmap</a></li>
                <li><a href='#faq'>FAQ</a></li>
                <li><a href='#team'>Team</a></li>
                <li className={styles.social}>
                    <a href='https://twitter.com/ispeakwassie' target="_blank"><img src='/icons8-twitter.svg'/></a>
                    <a href='https://discord.gg/2DQEu2NQ' target="_blank"><img src='/icons8-discord (1).svg'/></a>
                  </li>
            </ul>
            <button onClick={ () => {
            connectMetamaskPressed();
          }} className={styles.connect_button}>{userAddress=='CONNECT' ? 'Connect':`${userAddress.substring(0,3)}...${userAddress.substr(-3)}`}</button>
        </nav>
        <div style={{display:'none'}} className={styles.hero}>
            <img  src={`/Group 1.svg`}/>
            <img  src={`/Group 1 (1).svg`}/>
            <p>
{heroTab ? 
            <ReactTypingEffect speed={100} eraseSpeed={30} eraseDelay={1500}  text={["Hey there traveler, want to learn about gamers guild?"]}/>
            :
            <ReactTypingEffect speed={100} eraseSpeed={30} text={["Mint will commence soon!"]}/>

}
              </p>
            
            <p style={{Cursor:'pointer'}} onClick={() => { setHeroTab(!heroTab)}}>{heroTab ? '--- PRESS TO CONTINUE ---':''}

            </p>
        </div>
        <div id='about' className={styles.main}>
            <div className={styles.main_wrapper}>
                <h1>Wacky Wassies NFT</h1>
                <p>Wacky Wassies NFT is a 3,333 Generative collection of NFTs.</p><p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec imperdiet convallis nibh a ullamcorper. Donec sagittis turpis et iaculis mattis. Donec placerat sapien massa, sit amet euismod felis imperdiet imperdiet. Nam iaculis interdum leo, quis cursus odio elementum sed.</p>
            </div>
        </div>
        <div className={styles.main_gallery}>
        	<img src={`/nft-447.png`}/>
        	<img src={`/nft-448.png`}/>
        	<img src={`/nft-449.png`}/>
            <img src={`/nft-450.png`}/>
            <img src={`/nft-451.png`}/>
            <img src={`/nft-452.png`}/>
        </div>
        <div className={styles.main_mint}>
        	<h1>MINT YOUR OWN</h1>
            <span>3,333 Remaining</span><br/><br/><br/>
        	<p className={styles.main_mint_p}>After countdown ends, all 3,333 Wacky Wassies will be available to mint right away</p>
        	
            <Countdown date={1642752737000} renderer={renderer}/>
            

        </div>
        <div id='rarity' className={styles.intro}>
        	
            <div className={styles.traits_wrapper}>
                <div>
                    <img style={{width:'75vh'}} src='/hero.jpeg'/>
                </div>
                <div styles={{textAlign:'initial'}}>
                    <h1>Traits</h1>
                    <p className={styles.intro_text} >Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec imperdiet convallis nibh a ullamcorper. Donec sagittis turpis et iaculis mattis.</p>
                    <p className={styles.intro_text} >Lorem ipsum dolor sit amet, consectetur adipiscing elit. </p>
                </div>
            </div>
        </div>

        <div style={{display:'none'}} id='roadmap' className={styles.roadmap}>
        	<img src='/Roadmap_GE.png'/>
        </div>

        <div className={styles.main}>
            <div className={styles.main_wrapper2}>
                <h3>About</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec imperdiet convallis nibh a ullamcorper. Donec sagittis turpis et iaculis mattis. Donec placerat sapien massa.</p><br/><br/>
                <p><b>Roadmap</b></p>
                <div className={styles.stats}>
                    <div className={styles.stats_item}>
                        <p>25%</p>
                        <span>Lorem Ipsum</span>
                    </div>
                    <div className={styles.stats_item}>
                        <p>50%</p>
                        <span>Lorem Ipsum</span>
                    </div>
                    <div className={styles.stats_item}>
                        <p>75%</p>
                        <span>Lorem Ipsum</span>
                    </div>
                    <div className={styles.stats_item}>
                        <p>100%</p>
                        <span>Lorem Ipsum</span>
                    </div>
                </div>
            </div>
        </div>
          <div id='faq' className={styles.faq}>
            <h1>FAQ</h1>
            <div className={styles.faq_box}>
                <div onClick={() => {if(faqtab!=1){setFaqtab(1)}else{setFaqtab(0)}}} className={styles.faq_wrapper}>
                  <h4>What is an NFT?<span>{faqtab!=1 ? '+':'-'}</span></h4>
                  {faqtab==1 ?
                  <p>An NFT, or non-fungible token, is a unique, identifiable digital asset stored on the blockchain. An NFT could be a piece of digital artwork, a collectible, or even a digital representation of a real-life physical asset. Ownership of an NFT is easily and uniquely verifiable due to its public listing on the blockchain. </p>
                  :''}
                </div>
                <div onClick={() => {if(faqtab!=2){setFaqtab(2)}else{setFaqtab(0)}}} className={styles.faq_wrapper}>
                  <h4>What does it mean to mint an NFT?<span>{faqtab!=2 ? '+':'-'}</span></h4>
                  {faqtab==2 ?
                  <p>Minting refers to the process of tokenizing a digital file, or a digital piece of art, and publishing it on the blockchain. Once an NFT is minted, you can verify ownership and buy, sell, and trade the NFT. </p>
                  :''}
                </div>
                <div onClick={() => {if(faqtab!=3){setFaqtab(3)}else{setFaqtab(0)}}} className={styles.faq_wrapper}>
                  <h4>How much does it cost to mint a wassie?<span>{faqtab!=3 ? '+':'-'}</span></h4>
                  {faqtab==3 ?
                  <p>Price will be the same for everyone, 0.03 + gas fees per mint</p>
                  :''}
                </div>
                <div onClick={() => {if(faqtab!=4){setFaqtab(4)}else{setFaqtab(0)}}} className={styles.faq_wrapper}>
                  <h4>How do I mint?<span>{faqtab!=4 ? '+':'-'}</span></h4>
                  {faqtab==4 ?
                  <p>After countdown has run out in the "Mint" section of the website, a mint button will pop up letting users mint up to 20x NFTs at once. Remember you must have enough ETH in your wallet otherwise the button will not work</p>
                  :''}
                </div>
                <div onClick={() => {if(faqtab!=5){setFaqtab(5)}else{setFaqtab(0)}}} className={styles.faq_wrapper}>
                  <h4>What can I do with my newly minted NFTs?<span>{faqtab!=5 ? '+':'-'}</span></h4>
                  {faqtab==5 ?
                  <p>You will become one of us and take part of all the reards we've got planned for holders, so stay tuned for more info! You can also sell your sad wassie in the secondary markets of OpenSea.</p>
                  :''}
                </div>
                <div onClick={() => {if(faqtab!=6){setFaqtab(6)}else{setFaqtab(0)}}} className={styles.faq_wrapper}>
                  <h4>When will the NFTs be revealed?<span>{faqtab!=6 ? '+':'-'}</span></h4>
                  {faqtab==6 ?
                  <p>We will be revealing each and everyone of the NFTs at the time of mint so waiting times should be max 5 min. Remember to refresh your metadata on the OpenSea page of your item!</p>
                  :''}
                </div>
                
            </div>
          </div>



          <div id='team' className={styles.team}>
            <h1>Team</h1>
            <div className={styles.race_wrapper}>
                <div className={styles.race_item}>
                    <img className={styles.team_img} src='/nft-43.png'/>
                    <span style={{marginTop:'1em'}}>@ispeakwassie</span>
                    <span style={{marginTop:'1em'}}>Owner</span>
                </div>
                <div className={styles.race_item}>
                    <img className={styles.team_img} src='/nft-42.png'/>
                    <span style={{marginTop:'1em'}}>@Juan</span>
                    <span style={{marginTop:'1em'}}>Lead Developer</span>
                </div>
                <div className={styles.race_item}>
                    <img className={styles.team_img} src='/nico.jpg'/>
                    <span style={{marginTop:'1em'}}>@NicoC</span>
                    <span style={{marginTop:'1em'}}>FrontEnd Developer</span>
                </div>
            </div>
          </div>


        <footer className={styles.footer}>
            <img  src='/nft-1.png'/><br/>
            <div>
                    <a href='https://twitter.com/ispeakwassie'><img src='/icons8-twitter.svg'/></a>
                    <a href='https://discord.gg/2DQEu2NQ'><img src='/icons8-discord (1).svg'/></a>
                   </div><br/>
            <p>@2021 WackyWassies</p>
        </footer>
    </div>
  )
}
