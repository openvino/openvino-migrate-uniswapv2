require('dotenv').config()
var WETH = require('@uniswap/sdk').WETH


const { verify, getInfuraUrl } = require('./utils');

// Preparing wallet and web3 endpoint (Infura based)
const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');
const provider = new HDWalletProvider(process.env.PRIVATE_KEY, getInfuraUrl());
const web3 = new Web3(provider);
var BigNumber = web3.utils.BN;

var fs = require('fs');
const exchangeABI = JSON.parse(fs.readFileSync('abi/ExchangeV1.abi', 'utf8'));
const routerABI = JSON.parse(fs.readFileSync('abi/Router.abi', 'utf8'));
const tokenABI = JSON.parse(fs.readFileSync('abi/Token.abi', 'utf8'));

(async () => {

    const accounts = await web3.eth.getAccounts();

    const exchange = new web3.eth.Contract(exchangeABI, process.env.EXCHANGE_ADDRESS);
    const token = new web3.eth.Contract(tokenABI, process.env.MTB_ADDRESS);
    const router = new web3.eth.Contract(routerABI, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");

    console.log(`Removing (${process.env.EXCHANGE_ETH_LIQUIDITY} ETH, ${process.env.EXCHANGE_MTB_LIQUIDITY}) liquidity from V1`)

    await exchange.methods.removeLiquidity(
        await exchange.methods.balanceOf(accounts[0]).call(),
        web3.utils.toWei(process.env.EXCHANGE_ETH_LIQUIDITY, 'ether'),
        new BigNumber(10).pow(new BigNumber(18)).mul(new BigNumber(process.env.EXCHANGE_MTB_LIQUIDITY)),
        new Date().getTime() + 900000
    ).send({ from: accounts[0] });

    console.log(`Approving ${process.env.EXCHANGE_MTB_LIQUIDITY} MTB to Router02-V2`)
    await token.methods.approve(
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        new BigNumber(10).pow(new BigNumber(18)).mul(new BigNumber(process.env.EXCHANGE_MTB_LIQUIDITY))
    ).send({ from: accounts[0] });

    console.log(`Adding (${process.env.EXCHANGE_ETH_LIQUIDITY} ETH, ${process.env.EXCHANGE_MTB_LIQUIDITY}) liquidity to V2`)
    await router.methods.addLiquidityETH(
        process.env.MTB_ADDRESS,
        new BigNumber(10).pow(new BigNumber(18)).mul(new BigNumber(process.env.EXCHANGE_MTB_LIQUIDITY)),
        new BigNumber(10).pow(new BigNumber(18)).mul(new BigNumber(process.env.EXCHANGE_MTB_LIQUIDITY)),
        web3.utils.toWei(process.env.EXCHANGE_ETH_LIQUIDITY, 'ether'),
        accounts[0],
        new Date().getTime() + 900000
    ).send({ value: web3.utils.toWei(process.env.EXCHANGE_ETH_LIQUIDITY, 'ether'), from: accounts[0] })

    console.log("end")

    return

})();

