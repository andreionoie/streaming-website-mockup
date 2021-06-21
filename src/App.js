import React, { Component } from "react";
import Web3 from "web3";

import './App.css';

import EntityRegistry from "./contracts/EntityRegistry.json";
import EntityOfferRegistry from "./contracts/EntityOfferRegistry.json";

class App extends Component {
  state = {
            isLoaded: false,
            accounts: null
          };

  componentDidMount = async () => {
    // TODO: incremental check for each step (isLoaded = logical AND over all steps)
    window.App = this;
    
    this.web3 = await this.getWeb3Metamask();
    this.handleMetamaskAccountChange();
    await this.updateAccounts();
    
    this.setState({ isLoaded: true });
    console.log(this.state);
  };

  getWeb3Metamask = () => new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener("load", async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // Request account access if needed
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          // Acccounts now exposed
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      } else {
        console.log("No web3 instance injected, using Local web3.");
        reject();
      }
    })
    }
  )

  handleMetamaskAccountChange() {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async () => {
        await this.updateAccounts();
      });
    }
  }

  updateAccounts = async () => {
    try {
      this.setState({ isLoaded: false });
      let accounts = await this.web3.eth.getAccounts();
      this.setState({ accounts });
    
      this.setState({ isLoaded: true });

      console.log("Loaded account: ", this.state.accounts[0]);
    } catch (error) {
      alert(
        `Failed to load accounts. Check console for details.`,
      );
      console.error(error);
    }
  }

  render() {
    if (!this.state.isLoaded) {
      return (
        <div className="App">
          <header className="App-header">
            <p>
              Loading Web3...
            </p>
          </header>
        </div>
      );
    }

    return (
      <div className="App">
        <header className="App-header">
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
