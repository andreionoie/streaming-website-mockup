import React, { Component } from "react";
import Web3 from "web3";
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

import './App.css';
import logo from './YouTube_Premium_logo.svg'
import googlePayIcon from './google_pay.png'
import ethIcon from './ethereum.svg'

import EntityOfferRegistry from "./contracts/EntityOfferRegistry.json";

const useStyles = (theme) => ({
  root: {
    width: '100%',
    maxWidth: 500,
  },
  logo: {
    padding: theme.spacing(3, 1, 1),
    backgroundColor: "#FFFFFF",

  },
  section1: {
    padding: theme.spacing(2),
    backgroundColor: "#444",
    color: "#FFFFFF",
    display:'flex'
  },
  section1_green: {
    padding: theme.spacing(2),
    backgroundColor: "#4caf50",
    color: "#FFFFFF",
    display:'flex'
  },
  section2: {
    padding: theme.spacing(2),
    backgroundColor: "#F2F2F2",
    color: "#000000",
  },
  section3: {
    padding: theme.spacing(2),
  },
  section4: {
    padding: theme.spacing(2),
    backgroundColor: "#444",
  },
});

class App extends Component {
  offerRegistryContractAddress = '0x03Ec0Eb65c2ADA82331F6Bf2cf0eDd1eAe64e02F';
  offerIndex = 0;
  subscriptionDuration = 30 * 24 * 3600;

  state = {
            isLoaded: false,
            accounts: null,
            subscriptionIsActive: false,
            validUntil: null
          };

  componentDidMount = async () => {
    // TODO: incremental check for each step (isLoaded = logical AND over all steps)
    window.App = this;
    
    this.web3 = await this.getWeb3Metamask();
    await this.getContract();

    this.handleMetamaskAccountChange();
    await this.updateAccounts();

    await this.checkActiveSubscription();

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
        await this.checkActiveSubscription();
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

  getContract = async () => {
    this.offerRegistryContract = new this.web3.eth.Contract(EntityOfferRegistry.abi, this.offerRegistryContractAddress);
  }

  checkActiveSubscription = async () => {
    let isActiveSubscription = false;
    try {
      let isActive = await this.offerRegistryContract.methods.isSubscriptionActive(this.state.accounts[0], this.offerIndex).call();
      console.log(isActive);
      if (isActive) {
        isActiveSubscription = true;
        let expirationTimestamp = await this.offerRegistryContract.methods.subscribers(this.state.accounts[0], this.offerIndex).call();
        let expirationString = (new Date(expirationTimestamp*1000)).toLocaleString();
        this.setState( { validUntil: expirationString } )
      }
    } catch (err) {
      console.log(err);
    }

    this.setState( { subscriptionIsActive: isActiveSubscription } );
  }

  sendSubscriptionTransaction = async () => {
    try {
      let amount = await this.offerRegistryContract.methods.computeFee(this.offerIndex, this.subscriptionDuration).call();
      
      let emitter = this.offerRegistryContract.events.SubscriptionAdded({ filter: { offerIndex: this.offerIndex, newSubscriptionOwner: this.state.accounts[0] } })
        .on("data", async (evt) => {
          // evt.returnValues = {offerIndex, newSubscriptionOwner, expirationTimestamp, duration}
          console.log("Subscription valid until ", (new Date(evt.returnValues.expirationTimestamp*1000)).toLocaleString());
          await this.checkActiveSubscription();
        });

      await this.offerRegistryContract.methods.newSubscription(this.offerIndex, this.subscriptionDuration).send({ from: this.state.accounts[0], gasLimit: 8000000, value: amount });
    } catch(err) {
      console.log(err);
    }
  }


  render() {
    const { classes } = this.props;

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
          <div className={classes.root} >
          <Box border={1} borderColor="grey.500">
            <div className={classes.logo}>
              <Grid container justify="center">
                <Grid item align="center">
                  <img src={logo} alt="Youtube Premium"/>
                </Grid>
              </Grid>
            </div>

            <div className={ this.state.subscriptionIsActive ? classes.section1_green : classes.section1 }>
              <Grid container>
                <Grid item xs>
                  <Typography variant="h6">
                    <strong>Youtube Premium</strong>
                  </Typography>

                  <Typography>
                    Membership
                  </Typography>
                </Grid>
                <Grid item >
                  <Typography gutterBottom variant="h6">
                  { this.state.subscriptionIsActive ? 'Subscription Active' : 'Free trial' }
                  </Typography>
                  { this.state.subscriptionIsActive && 
                    <Typography variant="body2">
                      Valid until {this.state.validUntil}
                    </Typography>
                  }
                </Grid>
              </Grid>
            </div>

            <Divider variant="middle" />

            <div className={classes.section2}>
              <Grid container>
                  <Grid item xs>
                    <Typography gutterBottom variant="body2">
                      Monthly charge
                      <br/>
                      Billing starts: {(new Date()).toLocaleString()}
                    </Typography>
                  </Grid>
                  <br/><br/><br/>
                  <Grid item >
                    <Typography gutterBottom variant="body2">
                      RON 26.00/mo
                    </Typography>
                  </Grid>
              </Grid>

              <div>
                <Chip className={classes.chip} label="Bronze" />
                <Chip className={classes.chip} color="secondary" label="Silver" />
                <Chip className={classes.chip} label="Gold" />
                <Chip className={classes.chip} label="Platinum" />
              </div>
            </div>

            <div className={classes.section3}>
              <Typography gutterBottom variant="body2">
                YouTube and YouTube Music ad-free, offline, and in the background.
                <br/>
              </Typography>

              <Divider />
              
              <br/>
              <FormControl component="fieldset">
                <FormLabel component="legend">Payment method</FormLabel>
                <RadioGroup aria-label="gender" name="gender1">
                  <FormControlLabel disabled control={<Radio />}
                    label={
                      <div>
                        <img src={googlePayIcon} alt="googlePayIcon" height="20" style={{ verticalAlign: 'middle' }}/>
                        &nbsp;&nbsp;Add credit or debit card
                      </div>
                    }
                  />
                  <FormControlLabel control={<Radio />}
                    label={
                      <div>
                        <img src={ethIcon} alt="ethIcon" height="40" style={{ verticalAlign: 'middle' }} />
                        &nbsp;&nbsp;Pay with ETH
                      </div>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </div>

            <div className={classes.section4}>
              <Grid container justify="flex-end">
                <Button color="secondary" variant="contained" disabled={this.state.subscriptionIsActive} onClick={this.sendSubscriptionTransaction}>Buy</Button>
              </Grid>
            </div></Box>
          </div>
        </header>
      </div>
    );
  }
}

export default withStyles(useStyles)(App);
