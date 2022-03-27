// Import hooks from React, functionality from ethers
import { useState, useEffect } from 'react';
import { ethers, utils } from "ethers";

// Import abi from Emergency Jar smart contract
import abi from "./contracts/EmergencyJar.json";

function App() {

  // Store and update state of
  //    isWalletConnected, isJarCreator, jarCreatorAddress
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isJarCreator, setIsJarCreator] = useState(false);
  const [jarCreatorAddress, setJarCreatorAddress] = useState(null);

  const [inputValue, setInputValue] = useState({ withdraw: "", deposit: "", jarName: "" , newOwner: "", oldOwner: ""});
  
  const [currentJarName, setCurrentJarName] = useState(null);
  const [jarBalance, setJarBalance] = useState(null);

  const [yourAddress, setYourAddress] = useState(null);

  // Store and update state of
  //    error
  const [error, setError] = useState(null);

  const contractAddress = '0xFE1441d31Df8d4AEC41EC92792e9bD4Cf9db8806';
  const contractABI = abi.abi;

  // Connect Metamask account
  const checkIfWalletIsConnected = async () => {
    try {

      // If ethereum is in window object
      //    Request array of Metamask accounts
      //    Store the account at index 0 in const account
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0];
        setIsWalletConnected(true);
        setYourAddress(account);
        console.log("Account Connected: ", account);

      // If ethereum is not in window object
      //    Error and console message
      } else {
        setError("Install Metamask to access the emergency jar");
        console.log("No Metamask wallet detected");
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Get name of the jar
  const getJarName = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const emergencyJarContract = new ethers.Contract(contractAddress, contractABI, signer);

        let jarName = await emergencyJarContract.jarName();
        jarName = utils.parseBytes32String(jarName);
        setCurrentJarName(jarName.toString());
      } else {
        console.log("No Ethereum object found. Install Metamask");
        setError("Install Metamask to access the emergency jar");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Set name of the jar
  const setJarNameHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const emergencyJarContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await emergencyJarContract.setJarName(utils.formatBytes32String(inputValue.jarName));
        console.log("Setting jar name...");
        await txn.wait();
        console.log("Jar name set.", txn.hash);
        await getJarName();

      } else {
        console.log("No Ethereum object found. Install Metamask");
        setError("Install Metamask to access the emergency jar");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Get address of the jar creator, the deployer of the smart contract
  const getJarCreatorHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const emergencyJarContract = new ethers.Contract(contractAddress, contractABI, signer);

        let owner = await emergencyJarContract.jarCreator();
        setJarCreatorAddress(owner);

        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (owner.toLowerCase() === account.toLowerCase()) {
          setIsJarCreator(true);
        }
      } else {
        console.log("No Ethereum object found. Install Metamask");
        setError("Install Metamask to access the emergency jar");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Get the balance of the jar
  const jarBalanceHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const emergencyJarContract = new ethers.Contract(contractAddress, contractABI, signer);

        let balance = await emergencyJarContract.getJarBalance();
        setJarBalance(utils.formatEther(balance));
        console.log("Retrieved jar balance.", balance);

      } else {
        console.log("No Ethereum object found. Install Metamask");
        setError("Install Metamask to access the emergency jar");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Add a jar owner
  const addOwnerHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const emergencyJarContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await emergencyJarContract.addOwner(inputValue.newOwner);
        console.log("Adding owner...");
        await txn.wait();
        console.log("Owner added.", txn.hash);

      } else {
        console.log("No Ethereum object found. Install Metamask");
        setError("Install Metamask to access the emergency jar");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Remove a jar owner
  const removeOwnerHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const emergencyJarContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await emergencyJarContract.removeOwner(inputValue.oldOwner);
        console.log("Removing owner...");
        await txn.wait();
        console.log("Owner removed.", txn.hash);

      } else {
        console.log("No Ethereum object found. Install Metamask");
        setError("Install Metamask to access the emergency jar");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Deposit change into the jar
  const depositChangeHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const emergencyJarContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await emergencyJarContract.depositChange({ value: ethers.utils.parseEther(inputValue.deposit) });
        console.log("Depositing change...");
        await txn.wait();
        console.log("Change deposited.", txn.hash);

        jarBalanceHandler();

      } else {
        console.log("No Ethereum object found. Install Metamask");
        setError("Install Metamask to access the emergency jar");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Withdraw change from the jar
  const withdrawChangeHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const emergencyJarContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await emergencyJarContract.withdrawChange(yourAddress, ethers.utils.parseEther(inputValue.withdraw));
        console.log("Withdrawing change...");
        await txn.wait();
        console.log("Withdrew change.", txn.hash);

        jarBalanceHandler();

      } else {
        console.log("No Ethereum object found. Install Metamask");
        setError("Install Metamask to access the emergency jar");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getJarName();
    getJarCreatorHandler();
    jarBalanceHandler();
  }, [isWalletConnected])

  return (
    <main>
      <h2><span>Emergency Jar Smart Contract</span></h2>
      <section>
        {error && <p>{error}</p>}
        <div >
          {currentJarName === "" && isJarCreator ?
            <p>"(Nameless jar)" </p> :
            <p>Jar Name: {currentJarName}</p>
          }
        </div>
        <div>
          <form>
            <input
              type="text"
              onChange={handleInputChange}
              name="deposit"
              placeholder="0.0000 ETH"
              value={inputValue.deposit}
            />
            <button
              onClick={depositChangeHandler}>Deposit change (ETH)</button>
          </form>
        </div>
        <div>
          <form>
            <input
              type="text"
              onChange={handleInputChange}
              name="withdraw"
              placeholder="0.0000 ETH"
              value={inputValue.withdraw}
            />
            <button
              onClick={withdrawChangeHandler}>
              Withdraw change (ETH)
            </button>
          </form>
          <div>
          <form>
            <input
              type="text"
              onChange={handleInputChange}
              name="newOwner"
              placeholder="Address"
              value={inputValue.newOwner}
            />
            <button
              onClick={addOwnerHandler}>
              Add owner
            </button>
          </form>
        </div>
        <div>
          <form>
            <input
              type="text"
              onChange={handleInputChange}
              name="oldOwner"
              placeholder="Address"
              value={inputValue.oldOwner}
            />
            <button
              onClick={removeOwnerHandler}>
              Remove owner
            </button>
          </form>
        </div>
        </div>
        <div>
          <p><span><strong>Jar Balance:</strong> </span>{jarBalance}</p>
        </div>
        <div>
          <p><span><strong>Jar Creator Address:</strong> </span>{jarCreatorAddress}</p>
        </div>
        <div >
          {isWalletConnected && <p><span><strong>Your Address:</strong> </span>{yourAddress}</p>}
          <button onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected" : "Connect Wallet"}
          </button>
        </div>
      </section>
      {
        isJarCreator && (
          <section>
            <h2>Jar Creator Privileges</h2>
            <div>
              <form>
                <input
                  type="text"
                  onChange={handleInputChange}
                  name="jarName"
                  placeholder="Enter jar name"
                  value={inputValue.jarName}
                />
                <button
                  onClick={setJarNameHandler}>
                  Set jar name
                </button>
              </form>
            </div>
          </section>
        )
      }
    </main>
  );
}
export default App;