import React from "react";
import {
  Container,
  Navbar,
  NavLink,
  Button,
  Spinner
} from "reactstrap";
import logo from '../images/hedgehog_fat_filled_transparent_white.png';

class AppNavbar extends React.Component {
  setMax (setter) {
    this.props.sendmax(setter)
  }
  render() {
    let button;
    let pending_text;
    let account = this.props.account.substring(0, 6)+"..."+this.props.account.substring(38, 42);
    if (!window.ethereum) {
      button = 
      <Button className="text-light text-right"  color="warning" type="button-link" href="https://metamask.io"> Install Metamask </Button> ;
    } else {
      let networkname = ""
      if (this.props.chainID === "0x03" || this.props.chainID === "0x3"){networkname = "ropsten."}
      if (this.props.chainID === "0x04" || this.props.chainID === "0x4"){networkname = "rinkeby."}
      if (this.props.chainID === "0x05" || this.props.chainID === "0x5"){networkname = "goerli."}
      if (this.props.chainID === "0x2a" ){networkname = "kovan."}
      button = 
      (<>
      <div className="btn-group" role="group">
        <button 
          type="button" 
          className="btn btn-outline-primary"
          onClick={() => this.setMax(true)}
        >
          {this.props.asset_balance.toFixed(2)+" "+this.props.asset_symbol}
        </button>
        <button 
          type="button" 
          className="btn btn-outline-primary"
          onClick={() => this.setMax(false)}
        >
          {this.props.token_balance.toFixed(2)+" "+this.props.token_symbol}
        </button>
      </div>
      <Button 
        className="text-light text-right" 
        color="primary" 
        type="button-link" 
        href={"https://"+networkname+"etherscan.io/address/"+this.props.account.toString()}
        target="_blank"
      > 
      {account} 
      </Button>  
      </>
      )
      if (this.props.texthash !== "") {
        pending_text =
          <Button 
          className="text-light text-right" 
          color="primary" 
          type="button-link" 
          href={"https://"+networkname+"etherscan.io/tx/"+this.props.texthash}
          target="_blank"
          > 
            <Spinner size="sm" /> pending txn
          </Button>
      }
    }
    let alert
    if (window.ethereum) {
      if (this.props.chainID === "0x539" ) {
        alert = <div className="alert alert-warning text-center">
                  <b>GANACHE</b> private test network
                </div>
      } else if (this.props.chainID === "0x03" || this.props.chainID === "0x3"){
        alert = <div className="alert alert-warning text-center">
                  <b>Ropsten</b> network
                </div>
      } else if (this.props.chainID === "0x04" || this.props.chainID === "0x4"){
        alert = <div className="alert alert-warning text-center">
                  <b>Rinkeby</b> network
                </div>
      } else if (this.props.chainID === "0x05" || this.props.chainID === "0x5"){
        alert = <div className="alert alert-warning text-center">
                  <b>Goerli</b> network
                </div>
      } else if (this.props.chainID === "0x2a"){
        alert = <div className="alert alert-warning text-center">
                  <b>Kovan</b> network
                </div>
      } else if (this.props.chainID !== "0x01" 
                  && this.props.chainID !== "0x1"
                  && this.props.chainID !== 1
                ) {
        alert = <div className="alert alert-danger text-center">
                  Unsupported network, please connect to <b>Ethereum</b>
                </div>
      } 
    } 
    return (
      <div >
        {alert}
        <Navbar
          className="navbar-top navbar-horizontal"
          expand="md"
        >
          <img src={logo} alt="logo" height={45} width={60}/>
          <NavLink className="text-light text-left" >
            <span>Hedgehog</span>
          </NavLink>
          <Container className="px-4"></Container>
          {button} {pending_text}
        </Navbar>
      </div>
    );
  }
}

export default AppNavbar;
