# 🔬 SciQuipShar Equipment Booking System

A complete blockchain-based equipment booking system for scientific laboratories. Interact with the deployed smart contract on Ethereum Sepolia testnet through both a **beautiful web interface** and **powerful Node.js CLI tools**.

## ✨ Features

- 🌐 **Modern Web Interface** - Beautiful, responsive UI with MetaMask integration
- 💻 **Node.js CLI Tools** - Command-line interface for advanced users
- 🔒 **Secure** - Uses MetaMask for web or private keys for CLI
- ⚡ **Fast** - Local ethers.js library, no CDN dependencies
- 📊 **Real-time** - Live contract status, transaction tracking

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **MetaMask** browser extension - [Install here](https://metamask.io/)
3. **Sepolia ETH** - [Get free test ETH](https://sepoliafaucet.com/) or [here](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) 
4. **RPC Provider** - Free account at [Infura](https://infura.io) or [Alchemy](https://www.alchemy.com/)

### Installation

1. **Clone/Download** this repository
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up ethers.js for web interface:**
   ```bash
   copy node_modules\ethers\dist\ethers.umd.js ethers.local.js
   ```
   *On Mac/Linux:*
   ```bash
   cp node_modules/ethers/dist/ethers.umd.js ethers.local.js
   ```

## 🔧 Configuration

Create a `.env` file in the project root:

```env
# Get your Sepolia RPC URL from Infura or Alchemy
SEPOLIA_URL="https://sepolia.infura.io/v3/YOUR_PROJECT_ID"

# Get your private key from MetaMask
# ⚠️ WARNING: NEVER share your private key!
PRIVATE_KEY="0xYOUR_PRIVATE_KEY_HERE"
```

### Getting Your Credentials

#### 🌐 Sepolia RPC URL:
1. Sign up at [Infura](https://infura.io) or [Alchemy](https://www.alchemy.com/)
2. Create a new project
3. Select "Sepolia" testnet
4. Copy the endpoint URL
5. Paste it in your `.env` file

#### 🔑 MetaMask Private Key:
1. Open MetaMask
2. Click account menu → Account Details
3. Click "Show private key"
4. Enter your password
5. Copy the private key
6. Paste it in your `.env` file

**⚠️ SECURITY WARNING:** Your private key is like your wallet password. Never share it or commit it to version control!

## 💻 Usage Options

### Option 1: Web Interface (Recommended)

**Start the web server:**
```bash
npm run web
```

**Open your browser:**
```
http://localhost:8000
```

### Option 2: Interactive Node.js CLI

**Start interactive mode:**
```bash
npm run interactive
```


## 🎯 Smart Contract Details

- **Contract Address:** `0x5D8f9b119C2C72779c059b09e65319B69CF96f28`
- **Network:** Ethereum Sepolia Testnet
- **Functions:**
  - `addEquipment(equipmentId, name, pricePerDay)` - Add new equipment with daily rental price
  - `requestBooking(equipmentId, userId, startTimestamp, endTimestamp)` - Create new booking request with payment
  - `confirmBooking(bookingId)` - Confirm booking by user or owner; releases payment when both confirm
  - `bookingCounter()` - Get total number of bookings created
  - `bookings(id)` - Get booking details by booking ID
  - `equipments(equipmentId)` - Get equipment details by equipment ID
  - `payments(bookingId)` - Get payment amount locked for a booking

## 🛠️ Troubleshooting

### Common Issues

#### ❌ "ethers is not defined"
**Solution:** Make sure you copied the ethers.js library:
```bash
copy node_modules\ethers\dist\ethers.umd.js ethers.local.js
```

#### ❌ "MetaMask not detected"
**Solution:** 
1. Install MetaMask browser extension
2. Create or import a wallet
3. Switch to Sepolia testnet

#### ❌ "Insufficient funds"
**Solution:** Get free Sepolia ETH:
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)

#### ❌ "Network error"
**Solution:**
1. Check your RPC URL in `.env`
2. Verify internet connection
3. Try a different RPC provider

#### ❌ "Invalid private key"
**Solution:**
1. Ensure private key starts with `0x`
2. Check for extra spaces or characters
3. Re-export from MetaMask

### Debug Mode

For detailed error information, check browser console (F12) or terminal output.

## 🔐 Security Best Practices

1. **Environment Variables:** Never commit `.env` files to version control
2. **Private Keys:** Keep them secure, never share or screenshot
3. **Test Networks:** Only use Sepolia for development/testing
4. **Regular Updates:** Keep dependencies updated
5. **Code Review:** Verify smart contract addresses before use

## 🌐 Helpful Links

- **Contract on Etherscan:** [View Contract](https://sepolia.etherscan.io/address/0x5D8f9b119C2C72779c059b09e65319B69CF96f28)
- **Get Sepolia ETH:** [Sepolia Faucet](https://sepoliafaucet.com/)
- **Ethers.js Docs:** [Documentation](https://docs.ethers.org/)
- **MetaMask Guide:** [Getting Started](https://metamask.io/getting-started/)
- **Infura Setup:** [Create Account](https://infura.io/)


## 🤝 Contributing

1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

ISC License - Feel free to use and modify as needed.
