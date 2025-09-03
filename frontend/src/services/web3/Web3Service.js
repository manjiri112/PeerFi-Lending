import { getWeb3 } from './getWeb3'

export const Web3Service = {
  web3Active: async () => {
    const web3 = await getWeb3.get()
    return !!web3
  },

  getCurrentNetwork: async () => {
    const web3 = await getWeb3.get()
    if (!web3) return null
    return await web3.eth.net.getId()
  },

  getNetworkName: (networkId) => {
    const NETWORKS = {
      1: 'MainNet',
      2: 'Deprecated Morden',
      3: 'Ropsten',
      4: 'Rinkeby',
      5: 'Goerli',
      42: 'Kovan',
      1337: 'Ganache/Hardhat',
      5777: 'Ganache Local',
      31337: 'Hardhat Local'
    };
    return NETWORKS[networkId] || `Network ${networkId}`;
  },

  getUser: async () => {
    const web3 = await getWeb3.get()
    if (!web3) return null;
    const accounts = await web3.eth.getAccounts();
    return accounts[0] || null;
  },

  isValidAddress: async (address) => {
    const web3 = await getWeb3.get()
    if (!web3) return false;
    return web3.utils.isAddress(address);
  },

  initializeContract: async (abi, address) => {
    const web3 = await getWeb3.get()
    if (!web3) return null;
    return new web3.eth.Contract(abi, address);
  },

  convertToWei: async (amount, from) => {
    const web3 = await getWeb3.get();
    if (!web3) return null;
    return web3.utils.toWei(String(amount), from);
  },

  convertFromWei: async (amount, to) => {
    const web3 = await getWeb3.get();
    if (!web3) return null;
    return parseFloat(web3.utils.fromWei(String(amount), to));
  }
};