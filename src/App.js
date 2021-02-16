import React from "react";
import { Line } from "react-chartjs-2";
import 'chartjs-plugin-annotation';
import Web3 from "web3";
import { 
  Button,
  Card,
  CardHeader,
  CardBody,
  Col,
  Container,
  Form,
  FormGroup,
  InputGroup,
  Input,
  Row,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

import AppNavbar from "./navbar/Navbar";
import AppFooter from "./footer/Footer";
import BN from "bn.js";

let web3;
const WETH = require("./web3/WETH.json");
const HedgehogFactory = require("./web3/HedgehogFactory.json");
const Hedgehog = require("./web3/Hedgehog.json");
const IERC20 = require("./web3/IERC20.json");
class App extends React.Component {
  constructor(props) {    
    super(props)
    this.handleChangeAmountTokens = this.handleChangeAmountTokens.bind(this)
    this.handleChangeAmountAssets = this.handleChangeAmountAssets.bind(this)
    this.handleChangeAssets = this.handleChangeAssets.bind(this)
    this.handleChangeAmountETH = this.handleChangeAmountETH.bind(this)
    this.sendmax = this.sendmax.bind(this)
    this.adjust_slip = this.adjust_slip.bind(this)
    this.state = {
      web3Available: false,
      addressHedgehogFactory: "",
      networkID: 1,
      weth: "",
      asset: "",
      assetLabel: "",
      asset_enabled: "",
      account: "",
      carddeposit: true,
      asset_symbol: "",
      token_symbol: "",
      asset_balance: "",
      token_balance: "",
      token_precision: 5,
      asset_precision: 18,
      amountTokensLabel: "",
      amountAssetsLabel: "",
      amountTokens: "",
      amountAssets: "",
      currentTokens: 0,
      currentAssets: 0,
      currentPrice: 0,
      newPrice: 0,
      slippage: 0.1,
      valid: "is-valid",
      visible: true,
      createnewAsset: false,
      modal: false,
      eth_balance: "",
      txhash: "",
      chart: {
        data: canvas => {
          let maxtokens = 0;
          let ctx = canvas.getContext("2d");
          let gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);
          gradientStroke.addColorStop(1, "rgba(29,140,248,0.2)");
          gradientStroke.addColorStop(0.4, "rgba(29,140,248,0.0)");
          gradientStroke.addColorStop(0, "rgba(29,140,248,0)"); //blue colors
          return {
            labels: [0, maxtokens/4, maxtokens/2, maxtokens/2+maxtokens/4, maxtokens],
            datasets: [
              {
                label: "Assets",
                fill: true,
                backgroundColor: gradientStroke,
                borderColor: "#1f8ef1",
                borderWidth: 2,
                borderDash: [],
                borderDashOffset: 0.0,
                pointBackgroundColor: "#1f8ef1",
                pointBorderColor: "rgba(255,255,255,0)",
                pointHoverBackgroundColor: "#1f8ef1",
                pointBorderWidth: 20,
                pointRadius: 1,
                data: [0, (maxtokens/4)**2,(maxtokens/2)**2,(maxtokens/2+maxtokens/4)**2,maxtokens**2]
              },
            ],
          };
        },
      },
      chart_options: {
        maintainAspectRatio: false,
        hover: false,
        tooltips: false,
        legend: {
          display: false,
        },
        responsive: true,
        title: {
          display: true,
          text: "Bonding curve"
        },
        scales: {
          yAxes: [
            {
              barPercentage: 1.6,
              gridLines: {
                display: false,
              },
              ticks: {
                display: false,
              },
              scaleLabel: {
                  display: true,
                  labelString: 'Total Assets'
              }
            }
          ],
          xAxes: [
            {
              barPercentage: 1.6,
              gridLines: {
                display: false,
              },
              ticks: {
                display: false,
              },
              scaleLabel: {
                display: true,
                labelString: 'Total Tokens'
              }
            }
          ]
        },
        annotation: {
          annotations: [
            {
              type: 'line',
              mode: 'vertical',
              scaleID: 'x-axis-0',
              value: 0,
              borderColor: 'green',
              borderWidth: 1,
              label: {
                enabled: false,
                position: "top",
                backgroundColor: 'green',
                content: "New price"
              }
            },
            {
              type: 'line',
              mode: 'vertical',
              scaleID: 'x-axis-0',
              value: 0,
              borderColor: 'black',
              borderWidth: 1,
              label: {
                enabled: true,
                position: "bottom",
                backgroundColor: 'rgba(29,140,248,1)',
                content: "Current price"
              },
            },
          ],
        },
      },
    }
  }
  componentDidMount() {
    this.startEth();
    try{
      if (window.ethereum) {
        window.ethereum.on("accountsChanged", () => {
          this.startEth();
        })
        window.ethereum.on("chainChanged", () => {
          this.startEth();
        })
      }
    } catch(e) {console.log("no window.ethereum")}
  }
  async startEth () {
    if (window.ethereum) {
      window.ethereum.autoRefreshOnNetworkChange = false
      web3 = new Web3(window.ethereum);
      try {
        let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        this.setState({ account: accounts[0] })
        let chainId = await window.ethereum.request({ method: 'eth_chainId' })
        await this.setState({networkID: chainId})
        await this.setState({web3Available: true})
        this.initialETHdata()
      } catch(e) {
        try {
          let accounts = await web3.eth.getAccounts()
          this.setState({ account: accounts[0] })
          let chainId = await web3.eth.getChainId()
          await this.setState({networkID: chainId})
          await this.setState({web3Available: true})
          this.initialETHdata()
        } catch (e) {
          console.log("No web3 injected")
        } 
      } 
    }
    // Legacy DApp Browsers
    else if (window.web3) {
      web3 = new Web3(window.web3.currentProvider);
      let chainId = await window.web3.request({ method: 'eth_chainId' })
      await window.web3.request({ method: 'eth_requestAccounts' })
      await this.setState({networkID: chainId})
      await this.setState({web3Available: true})
      this.initialETHdata()
      }
    // Non-DApp Browsers
    else {
      console.log("No web3")
    }
  }
  async initialETHdata () {
    if (this.state.networkID === "0x539" ) {
      await this.setState({addressHedgehogFactory: "0x6Cb749e08832edEDf77cFB34fF362e011cB1cDa3"})
      await this.setState({asset: "0xA6731e8A3174daBc92FbDAe2cD7c7148051eab64"})
      await this.setState({weth: "0xA6731e8A3174daBc92FbDAe2cD7c7148051eab64"})
    } else if (this.state.networkID === "0x03" || this.state.networkID === "0x3" || this.state.networkID === "3" || this.state.networkID === 3){
      await this.setState({addressHedgehogFactory: "0x8C98C789ACda3e5331afa582DF06d788D94c28FB"})
      await this.setState({asset: "0xf5E86AB8aa8dCD5AC331d3a8Cb9894Aa924b2947"})
      await this.setState({weth: "0xf5E86AB8aa8dCD5AC331d3a8Cb9894Aa924b2947"})
    } else if (this.state.networkID === "0x04" || this.state.networkID === "0x4" || this.state.networkID === "4" || this.state.networkID === 4){
      await this.setState({addressHedgehogFactory: "0xC20d30Cee8a6C03c110F4B8837560EC35034b3b0"})
      await this.setState({asset: "0x9612ebF2955066388b8B2c8Ec54f9129a6dEC99E"})
      await this.setState({weth: "0x9612ebF2955066388b8B2c8Ec54f9129a6dEC99E"})
    } else if (this.state.networkID === "0x05" || this.state.networkID === "0x5" || this.state.networkID === "5" || this.state.networkID === 5){
      await this.setState({addressHedgehogFactory: "0x93698B94A950aa9668d9b584908C2399dfB1183d"})
      await this.setState({asset: "0x2bBa9Ec08e2CC38670C434a94962FF71ffF7b563"})
      await this.setState({weth: "0x2bBa9Ec08e2CC38670C434a94962FF71ffF7b563"})
    } else if (this.state.networkID === "0x2a" || this.state.networkID === "42" || this.state.networkID === 42){
      await this.setState({addressHedgehogFactory: "0x3F28Aac00BfE9b9d848bf48A8994795dA9F6228B"})
      await this.setState({asset: "0xCb7759495C888771be8F1EbbC625a44b5Ae11380"})
      await this.setState({weth: "0xCb7759495C888771be8F1EbbC625a44b5Ae11380"})
    } else {
      await this.setState({addressHedgehogFactory: "0x0D266eCaA06C555028Bb975C52D71002CAD30EbA"})
      await this.setState({asset: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"})
      await this.setState({weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"})
    }
    this.gethETHdata()
  }
  async gethETHdata () {
      try {  
        let factory = await new web3.eth.Contract(HedgehogFactory.abi, this.state.addressHedgehogFactory)
        let hedgehog_address = await factory.methods.hedgehog(this.state.asset).call()        
        let hedgehog = await new web3.eth.Contract(Hedgehog.abi, hedgehog_address) 
        let asset = await new web3.eth.Contract(IERC20.abi, this.state.asset)
        let asset_symbol = await asset.methods.symbol().call()
        let token_symbol = await hedgehog.methods.symbol().call()
        await this.setState({asset_symbol: asset_symbol})
        await this.setState({token_symbol: token_symbol})    
        let asset_balance = await asset.methods.balanceOf(this.state.account).call()
        let token_balance = await hedgehog.methods.balanceOf(this.state.account).call() 
        await this.setState({asset_balance: asset_balance})
        await this.setState({token_balance: token_balance})
        let asset_enabled = await asset.methods.allowance(this.state.account, hedgehog_address).call()  
        await this.setState({asset_enabled: asset_enabled})
        let total_tokens = await hedgehog.methods.totalSupply().call()
        await this.setState({currentTokens: total_tokens})
        let total_assets = await asset.methods.balanceOf(hedgehog_address).call()
        await this.setState({currentAssets: total_assets})
        let currentPrice = await hedgehog.methods.price().call()
        let asstprec = this.state.asset_precision;
        await this.setState({currentPrice: currentPrice/ (10**asstprec)})
        let balance = await web3.eth.getBalance(this.state.account)
        await this.setState({eth_balance: balance}) 
        this.setgraph(true, 0) 
      } catch {
      }
  }
  toggle () {
    this.setState({modal: !this.state.modal})
  }
  handleChangeAmountETH(e) {
    if(isNaN(Number(e.target.value))){
      return
    }
    this.changeETH(e.target.value)
  }
  async changeETH(input) {
    this.setState({amount_label_eth: input})
    let amount = input * 10**18
    this.setState({amount_eth: amount})
  }
  async convert () {
    let weth = await new web3.eth.Contract(WETH.abi, this.state.asset)
    let amount = this.state.amount_eth.toLocaleString('fullwide', {useGrouping:false})
    await weth.methods.deposit().send({from: this.state.account, value: amount}, function(error, hash){
      this.setState({txhash: hash})
    }.bind(this))
    this.setState({txhash: ""})
    this.setState({modal: !this.state.modal})
    this.gethETHdata()
  }
  async setCard (front) {
    await this.setState({carddeposit: front})
    await this.changeTokens(this.state.amountTokensLabel)
  }
  handleChangeAmountTokens(e) {
    if(isNaN(Number(e.target.value))){
      return
    }
    this.changeTokens(e.target.value)
  }
  changeTokens(input) {
    this.setState({amountTokensLabel: input});
    let tokenprec = this.state.token_precision;
    let assetprec = this.state.asset_precision;
    let precision = 10**tokenprec;
    let add = parseFloat(input) * precision;
    let BNadd = new BN(add)
    this.setState({amountTokens: add});
    let totalTokens = new BN(this.state.currentTokens);
    let totalAssets = new BN(this.state.currentAssets);
    let newTokens;
    let newAssets;
    let changeAssets;
    let newprice;
    if (this.state.carddeposit) {
      newTokens = totalTokens.add(BNadd)
      newAssets = newTokens**2
      changeAssets = newAssets - totalAssets
      this.setgraph(true, add)
      let slip = 100+(parseFloat(this.state.slippage))
      changeAssets = parseInt(changeAssets * slip / 100)

      let BNprecision = new BN(precision)
      let newtoken = newTokens.add(BNprecision)
      let newasset = newtoken**2
      newprice = (newasset - newAssets) / 10**assetprec
    } else {
      BNadd = BN.min(BNadd, totalTokens)
      newTokens = totalTokens.sub(BNadd)
      newAssets = newTokens**2;
      changeAssets = totalAssets - newAssets
      this.setgraph(false, add)
      let slip = 100-(parseFloat(this.state.slippage))
      changeAssets = parseInt(changeAssets * slip / 100)

      let BNprecision = new BN(precision)
      let newtoken = newTokens.add(BNprecision)
      let newasset = newtoken**2
      newprice = (newasset - newAssets) / 10**assetprec
    }
    let assetreturn = +parseFloat(changeAssets/ 10**assetprec).toFixed(5)
    this.setState({amountAssetsLabel: assetreturn});
    if (changeAssets === 0) {
      this.setState({amountAssetsLabel: ""});
    }
    this.setState({amountAssets: changeAssets});
    this.setState({newPrice: newprice})
  }
  handleChangeAmountAssets(e) {
    if(isNaN(Number(e.target.value))){
      return
    }
    this.changeAssets(e.target.value)
  }
  changeAssets(amount) {
    let _assets
    if (amount !== "") {
      _assets = amount
    } else {
      _assets = ""
    }
    this.setState({amountAssetsLabel: _assets});
    let base = new BN(10)
    let assetprec = new BN(this.state.asset_precision);
    let tokenprec = this.state.token_precision;
    let precision = 10**tokenprec;
    let input = parseFloat(amount)
    let prep = input * 10**8
    let inputBN = new BN(prep)
    let add = inputBN.mul(base.pow(assetprec));
    let addnoBN = input * (10 ** assetprec)
    this.setState({amountAssets: addnoBN});
    let totalTokens = new BN(this.state.currentTokens);
    let totalAssets = new BN(this.state.currentAssets);
    let newTokens;
    let newAssets;
    let changeTokens;
    let newprice;
    let pres = new BN(10**8)
    if (this.state.carddeposit) {
      base = new BN(100)
      let slip = (100+(parseFloat(this.state.slippage)))
      let slipBN = new BN(slip)

      newAssets = totalAssets.add(add.div(slipBN).div(pres).mul(base))
      newTokens = newAssets ** (1/2) 
      let newTokensBN = new BN(newTokens)
      changeTokens = newTokensBN.sub(totalTokens)
      this.setgraph(true, changeTokens)

      let BNprecision = new BN(precision)
      let newtoken = newTokensBN.add(BNprecision)
      let newasset = newtoken**2
      newprice = (newasset - newAssets) / 10**assetprec
    } else {
      base = new BN(100)
      let slip = (100-(parseFloat(this.state.slippage)))
      let slipBN = new BN(slip)

      newAssets = totalAssets.sub(add.div(slipBN).div(pres).mul(base))
      newTokens = newAssets ** (1/2)
      let newTokensBN = new BN(newTokens)
      changeTokens = totalTokens.sub(newTokensBN)
      this.setgraph(false, changeTokens)
      
      let BNprecision = new BN(precision)
      let newtoken = newTokensBN.add(BNprecision)
      let newasset = newtoken**2
      newprice = (newasset - newAssets) / 10**assetprec
    }
    this.setState({amountTokensLabel: changeTokens / 10**tokenprec});
    if (changeTokens.toString() === "0") {
      this.setState({amountTokensLabel: ""});
    }
    this.setState({amountTokens: changeTokens});
    this.setState({newPrice: newprice})
  }
  updateAsset (old, change, deposit) {
    if (deposit === true) {
      let old_ = 100 + parseFloat(old)
      let change_ = 100 + parseFloat(change)
      let current = this.state.amountAssets
      let currentLabel = this.state.amountAssetsLabel
      let changed = (current / old_ * change_)
      let changedLabel = +parseFloat(currentLabel / old_ * change_).toFixed(5)
      this.setState({amountAssets: changed})
      this.setState({amountAssetsLabel: changedLabel})
    } else {
      let old_ = 100 - parseFloat(old)
      let change_ = 100 - parseFloat(change)
      let current = this.state.amountAssets
      let currentLabel = this.state.amountAssetsLabel
      let changed = (current / old_ * change_)
      let changedLabel = +parseFloat(currentLabel / old_ * change_).toFixed(5)
      this.setState({amountAssets: changed})
      this.setState({amountAssetsLabel: changedLabel})
    }
  }
  async handleChangeAssets (e) {
    if (e.target.value === ""){
      this.setState({assetLabel: ""})
      this.setState({valid: "is-valid"})
      this.setState({createnewAsset: false})
    } else {
      this.setState({assetLabel: e.target.value})
      let factory = await new web3.eth.Contract(HedgehogFactory.abi, this.state.addressHedgehogFactory)
      let hedgehog_address
      try {
        hedgehog_address = await factory.methods.hedgehog(this.state.assetLabel).call()
        if (hedgehog_address.toString() !== "0x0000000000000000000000000000000000000000"){
          this.setState({asset: this.state.assetLabel})
          this.setState({valid: "is-valid"})
          this.setState({createnewAsset: false})
          this.gethETHdata()
        } else {
          this.setState({createnewAsset: true})
          this.setState({valid: "is-invalid"})
        }
      } catch {
        this.setState({valid: "is-invalid"})
        this.setState({createnewAsset: false})
      } 
    }
  }
  async sendmessage (input){
    let factory = await new web3.eth.Contract(HedgehogFactory.abi, this.state.addressHedgehogFactory)
    let hedgehog_address = await factory.methods.hedgehog(this.state.asset).call()
    let hedgehog = await new web3.eth.Contract(Hedgehog.abi, hedgehog_address) 
    let asset = await new web3.eth.Contract(IERC20.abi, this.state.asset)
    if (input === "Approve") {
      let base = new BN(2)
      let exp = new BN(256)
      let sub = new BN(1)
      let max = base.pow(exp).sub(sub)
      await asset.methods.approve(hedgehog_address, max.toString()).send({from: this.state.account}, function(error, hash){
        this.setState({txhash: hash})
      }.bind(this))
      this.setState({txhash: ""})
      console.log("approve")
    } else if (input === "Deposit") {
      let tkn = new BN(this.state.amountTokens)
      let asst = new BN(this.state.amountAssets.toString())
      await hedgehog.methods.deposit(tkn, asst).send({from: this.state.account}, function(error, hash){
        this.setState({txhash: hash})
      }.bind(this))
      this.setState({txhash: ""})
      console.log("deposit")
      this.setgraph(true, this.state.currentTokens)
    } else if (input === "Withdraw") {
      let tkn = new BN(this.state.amountTokens)
      let asst = new BN(this.state.amountAssets.toString())
      await hedgehog.methods.withdraw(tkn, asst).send({from: this.state.account}, function(error, hash){
        this.setState({txhash: hash})
      }.bind(this))
      this.setState({txhash: ""})
      console.log("withdraw")
      this.setgraph(false, this.state.currentTokens)
    }
    this.gethETHdata()
  }
  async sendmax (setter) {
    if (setter) {
      this.changeAssets(+parseFloat(this.state.asset_balance / 10**this.state.asset_precision).toFixed(5))
    } else {
      this.changeTokens(this.state.token_balance / 10**this.state.token_precision)
    }  
  }
  async adjust_slip (e) {
    if (this.state.carddeposit) {
      this.updateAsset(this.state.slippage, e.target.value, true)
    } else {
      this.updateAsset(this.state.slippage, e.target.value, false)
    }
    this.setState({slippage: e.target.value})
  }
  Dismiss = () => {
    this.setState({visible: false})
  }
  async createNew () {
    let factory = await new web3.eth.Contract(HedgehogFactory.abi, this.state.addressHedgehogFactory) 
    let newasset = this.state.assetLabel.toString()
    await factory.methods.createHedgehog(newasset).send({from: this.state.account}, function(error, hash){
      this.setState({txhash: hash})
    }.bind(this))
    this.setState({txhash: ""})
    this.gethETHdata()
    this.setState({createnewAsset: false})
  }
  async setgraph(deposit, added) {        
    let maxtokens = this.state.currentTokens * 4;
    let currentTokens = new BN(this.state.currentTokens);
    let newTokens = new BN(currentTokens);
    let addBN = new BN(added)
    let show;
    if (added > 0) {show = true } else {show = false}
    if (deposit === true) {
      newTokens = currentTokens.add(addBN);
    } else {
      newTokens = currentTokens.sub(addBN);
    } 
    if (newTokens > maxtokens / 2) {maxtokens = maxtokens * (newTokens/maxtokens * 2)}
    let update = {data: canvas => {
      let ctx = canvas.getContext("2d");
      let gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);
      gradientStroke.addColorStop(1, "rgba(29,140,248,0.2)");
      gradientStroke.addColorStop(0.4, "rgba(29,140,248,0.0)");
      gradientStroke.addColorStop(0, "rgba(29,140,248,0)"); //blue colors
      return {
        labels: [0, maxtokens/4, maxtokens/2, maxtokens/2+maxtokens/4, maxtokens],
        datasets: [
          {
            label: "Assets",
            fill: true,
            backgroundColor: gradientStroke,
            borderColor: "#1f8ef1",
            borderWidth: 2,
            borderDash: [],
            borderDashOffset: 0.0,
            pointBackgroundColor: "#1f8ef1",
            pointBorderColor: "rgba(255,255,255,0)",
            pointHoverBackgroundColor: "#1f8ef1",
            pointBorderWidth: 20,
            pointRadius: 1,
            data: [0, (maxtokens/4)**2,(maxtokens/2)**2,(maxtokens/2+maxtokens/4)**2,maxtokens**2]
          },
        ],
      }
    }
  }
  let options = {
      maintainAspectRatio: false,
      hover: false,
      tooltips: false,
      legend: {
        display: false,
      },
      responsive: true,
      title: {
        display: true,
        text: "Bonding curve"
      },
      scales: {
        yAxes: [
          {
            barPercentage: 1.6,
            gridLines: {
              display: false,
            },
            ticks: {
              display: false,
            },
            scaleLabel: {
                display: true,
                labelString: 'Total Assets'
            }
          }
        ],
        xAxes: [
          {
            barPercentage: 1.6,
            gridLines: {
              display: false,
            },
            ticks: {
              display: false,
            },
            scaleLabel: {
              display: true,
              labelString: 'Total Tokens'
            }
          }
        ]
      },
      annotation: {
        annotations: [
          {
            type: 'line',
            mode: 'vertical',
            scaleID: 'x-axis-0',
            value: 4*(newTokens/maxtokens),
            borderColor: 'green',
            borderWidth: 1,
            label: {
              enabled: show,
              position: "top",
              backgroundColor: 'green',
              content: "New price"
            }
          },
          {
            type: 'line',
            mode: 'vertical',
            scaleID: 'x-axis-0',
            value: 4*(currentTokens/maxtokens),
            borderColor: 'rgba(29,140,248,1)',
            borderWidth: 1,
            label: {
              enabled: true,
              position: "middle",
              backgroundColor: 'rgba(29,140,248,1)',
              content: "Current price"
            },
          },
        ],
      },
    }
    this.setState({chart: update});
    this.setState({chart_options: options});
  }
  render() {
    let color;
    let disabled;
    let name;
    let token_name;
    let asset_name;
    let newprice;
    if (!window.ethereum) {
      disabled = true
      color = "dark"
      name = "no connection"
    } else {
      disabled = false
      if (this.state.asset_enabled > 10**30){
        color = "success"
        if (this.state.carddeposit) {
          name = "Deposit"   
        } else {
          name = "Withdraw"
        }
      } else {
        color = "primary"
        name = "Approve"
      }  
    }
    if (this.state.carddeposit) {
      token_name = this.state.token_symbol+" to mint"
      asset_name = "max "+this.state.asset_symbol+" to deposit"
    } else {
      token_name = this.state.token_symbol+" to burn"
      asset_name = "min "+this.state.asset_symbol+" to withdraw"
    }
    if (this.state.newPrice !== 0 && this.state.newPrice.toFixed(5) !== this.state.currentPrice.toFixed(5)) {
      newprice =
        <InputGroup className="input-group-alternative mb-3">
          <span className="input-group-text" >New price</span>
          <Input 
            readOnly
            className="text-right"
            value={this.state.newPrice.toFixed(5)+" "+this.state.asset_symbol+" / "+this.state.token_symbol}
            type="text"
            />
        </InputGroup>
    }
    let warning
    if (this.state.visible === true) {
      warning = <CardBody >
                  <div className="alert alert-primary">
                    Hedgehog is in <b>beta</b> and <b>unaudited</b>, please use at your own risk
                    <button type="button" className="close" onClick={() => this.Dismiss()}>
                      <span className="text-dark-blue" aria-hidden="true">&times;</span>
                    </button>
                  </div>
                </CardBody>
    } else {
       warning = <div/>
    }
    let button_createnewAsset
    if (this.state.createnewAsset === true) {
      button_createnewAsset=    <Col lg="2" md="1">
                                  <InputGroup className="input-group-alternative justify-content-center mb-3">
                                    <Button className="btn text-white" color="primary" onClick={() => this.createNew()}>Create asset</Button>
                                  </InputGroup> 
                                </Col>
    }
    let convert_button
    if (this.state.weth === this.state.asset) {
      convert_button =  <div>
                        <Col lg="3" md="3">
                        <button 
                          type="button" 
                          className="btn btn-primary mb-3"
                          onClick={() => this.toggle()}
                        >
                          Convert ETH to {this.state.asset_symbol}
                        </button>
                        </Col>
                        <Modal isOpen={this.state.modal}>
                        <ModalHeader>Convert ETH to {this.state.asset_symbol}</ModalHeader>
                        <Row>
                          <ModalBody>
                            <Col>
                            <InputGroup className="input-group-alternative mb-3">
                              <span className="input-group-text">Balance ETH</span>
                              <Input 
                                className="text-right"
                                value={(this.state.eth_balance / 10**18).toFixed(5)} 
                                type="text"
                                readOnly
                              />
                            </InputGroup>
                            </Col>
                          </ModalBody>
                        </Row>
                        <Row>
                          <ModalBody>
                            <Col>
                              <InputGroup className="input-group-alternative mb-3">
                                <span className="input-group-text">ETH to convert</span>
                                <Input 
                                  className="text-right"
                                  placeholder="0.00"
                                  value={(this.state.amount_label)} 
                                  type="text"
                                  onChange={this.handleChangeAmountETH}
                                />
                              </InputGroup>
                            </Col>
                          </ModalBody>
                        </Row>
                        <ModalFooter>
                          <Button color="primary" onClick={() => this.convert()}>Convert</Button>{' '}
                          <Button color="secondary" onClick={() => this.toggle()}>Cancel</Button>
                        </ModalFooter>
                      </Modal>
                      </div> 
    } else {
      convert_button = <div />
    }
    return (
      <div className="bg-gradient-dark-green h-100vh">
        <AppNavbar 
          chainID={this.state.networkID}
          web3_available={this.state.web3Available}
          account={this.state.account}
          asset_symbol={this.state.asset_symbol}
          token_symbol={this.state.token_symbol}
          asset_balance={this.state.asset_balance / (10**this.state.asset_precision)}
          token_balance={this.state.token_balance / (10**this.state.token_precision)}
          texthash={this.state.txhash}
          sendmax={this.sendmax}
        />
        {/* Page content */}
        <Container className="py-7 py-lg-8">
          <Row className="justify-content-center"> 
            {convert_button} {button_createnewAsset}
            <Col lg="8" md="12">
              <InputGroup className="input-group-alternative mb-3">
                  <span className="input-group-text bg-primary text-white">Asset address</span>
                  <Input 
                    className={"text-right " + this.state.valid}
                    placeholder={this.state.asset}
                    value={this.state.assetLabel}
                    type="text"
                    onChange={this.handleChangeAssets}
                  /> 
              </InputGroup> 
            </Col>
            <Col lg="5" md="12">
              <Card className="bg-secondary shadow border-0 mb-3">
                <CardHeader className="bg-transparent pb-3">
                  <Row className="text-center">
                    <Col className="mycontent-left">
                      <Button className="btn disabled text-dark" onClick={() => this.setCard(true)}>Deposit</Button>
                    </Col>
                    <Col>
                    <Button className="btn disabled text-dark" onClick={() => this.setCard(false)}>Withdraw</Button>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody className="px-lg-5 py-lg-5">
                  <Form role="form">  
                    <FormGroup>
                      <InputGroup className="input-group-alternative mb-3">
                        <span className="input-group-text">{token_name}</span>
                        <Input 
                          className="text-right"
                          placeholder="0.0"
                          value={(this.state.amountTokensLabel)} 
                          type="text"
                          onChange={this.handleChangeAmountTokens}
                        />
                      </InputGroup>
                    </FormGroup>
                    <FormGroup>
                      <InputGroup className="input-group-alternative mb-3">
                        <span className="input-group-text" >{asset_name}</span>
                        <Input 
                          className="text-right"
                          placeholder="0.0"
                          value={(this.state.amountAssetsLabel)}  
                          type="text"
                          onChange={this.handleChangeAmountAssets}
                        />
                      </InputGroup>
                    </FormGroup>
                    <FormGroup>
                      <Label for="slippage">Slippage {this.state.slippage} %</Label>
                      <Input 
                        type="range" 
                        name="range" 
                        id={"slippage"}
                        step="0.1"
                        value={this.state.slippage}
                        onChange={this.adjust_slip}
                      />
                    </FormGroup>
                    <div className="text-center">
                      <Button 
                        disabled={disabled}
                        className="mt-4" 
                        color={color} 
                        type="button"
                        onClick={() => this.sendmessage(name)}
                      >
                        {name}
                      </Button>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </Col>
            <Col lg="6" md="12">
              <Card className="bg-secondary shadow border-0">
                {warning}
                <CardBody className="px-lg-5 py-lg-5">
                  <Line 
                    data={this.state.chart["data"]}
                    options={this.state.chart_options}
                  />
                </CardBody>
                <CardHeader className="bg-transparent">
                    <FormGroup>
                      <InputGroup className="input-group-alternative mb-3">
                        <span className="input-group-text" >Current price</span>
                        <Input 
                          readOnly
                          className="text-right"
                          value={this.state.currentPrice.toFixed(5)+" "+this.state.asset_symbol+" / "+this.state.token_symbol}
                          type="text"
                        />
                      </InputGroup>
                      {newprice}
                    </FormGroup>
                </CardHeader>
              </Card>
            </Col>
          </Row>
        </Container>
        <AppFooter/>
      </div>
    );
  }
}

export default App;
