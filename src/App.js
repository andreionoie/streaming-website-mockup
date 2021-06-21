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

import EntityRegistry from "./contracts/EntityRegistry.json";
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
                  <img src={logo} />
                </Grid>
              </Grid>
            </div>

            <div className={classes.section1}>
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
                    Free trial
                  </Typography>
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
                      <a>
                        <img src={googlePayIcon} height="20" style={{ verticalAlign: 'middle' }}/>
                        &nbsp;&nbsp;Add credit or debit card
                      </a>
                    }
                  />
                  <FormControlLabel control={<Radio />}
                    label={
                      <a>
                        <img src={ethIcon} height="40" style={{ verticalAlign: 'middle' }} />
                        &nbsp;&nbsp;Pay with ETH
                      </a>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </div>

            <div className={classes.section4}>
              <Grid container justify="flex-end">
                <Button color="secondary" variant="contained">Buy</Button>
              </Grid>
            </div></Box>
          </div>
        </header>
      </div>
    );
  }
}

export default withStyles(useStyles)(App);
