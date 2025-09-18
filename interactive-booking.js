// Interactive Booking System - Node.js CLI Version
// This provides the same functionality as the web app but runs in the terminal

const { ethers } = require("ethers");
const readline = require('readline');
require("dotenv").config();

// Contract configuration (same as web app)
const CONTRACT_ADDRESS = "0x5D8f9b119C2C72779c059b09e65319B69CF96f28";
const CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: false, internalType: "address", name: "paidTo", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "BookingConfirmed",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: false, internalType: "string", name: "equipmentId", type: "string" },
      { indexed: false, internalType: "string", name: "userId", type: "string" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "BookingRequested",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "string", name: "equipmentId", type: "string" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: false, internalType: "address", name: "owner", type: "address" }
    ],
    name: "EquipmentAdded",
    type: "event"
  },
  {
    inputs: [
      { internalType: "string", name: "_equipmentId", type: "string" },
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "uint256", name: "_pricePerDay", type: "uint256" }
    ],
    name: "addEquipment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "_bookingId", type: "uint256" }],
    name: "confirmBooking",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "string", name: "_equipmentId", type: "string" },
      { internalType: "string", name: "_userId", type: "string" },
      { internalType: "uint256", name: "_startTimestamp", type: "uint256" },
      { internalType: "uint256", name: "_endTimestamp", type: "uint256" }
    ],
    name: "requestBooking",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "bookingCounter",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "bookings",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "string", name: "equipmentId", type: "string" },
      { internalType: "string", name: "userId", type: "string" },
      { internalType: "address", name: "user", type: "address" },
      { internalType: "enum EquipmentBooking.BookingStatus", name: "status", type: "uint8" },
      { internalType: "bool", name: "userConfirmed", type: "bool" },
      { internalType: "bool", name: "ownerConfirmed", type: "bool" },
      { internalType: "uint256", name: "bookingTimestamp", type: "uint256" },
      { internalType: "uint256", name: "startTimestamp", type: "uint256" },
      { internalType: "uint256", name: "endTimestamp", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "string", name: "", type: "string" }],
    name: "equipments",
    outputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "address payable", name: "owner", type: "address" },
      { internalType: "bool", name: "exists", type: "bool" },
      { internalType: "uint256", name: "pricePerDay", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "payments",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(q) {
  return new Promise((res) => rl.question(q, res));
}

let provider, signer, contract;

// Initialize connection
async function initializeConnection() {
  try {
    console.log('🔌 Initializing connection to Sepolia...');
    
    // Create provider and signer
    provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
    signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // Test connection
    const network = await provider.getNetwork();
    console.log(`✅ Connected to: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Check balance
    const balance = await provider.getBalance(signer.address);
    const balanceInEth = ethers.formatEther(balance);
    console.log(`💰 Wallet: ${signer.address}`);
    console.log(`💰 Balance: ${balanceInEth} ETH`);
    
    // Create contract instance
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    console.log(`📋 Contract: ${CONTRACT_ADDRESS}`);
    
    // Get current booking count
    const counter = await contract.bookingCounter();
    console.log(`📊 Total bookings: ${counter.toString()}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize connection:', error.message);
    return false;
  }
}

async function init() {
  console.log('🔬 SciQuipShar Equipment Booking System');
  console.log('=======================================');

  // Initialize connection
  const connected = await initializeConnection();
  if (!connected) {
    console.log('❌ Failed to connect. Please check your .env configuration.');
    rl.close();
    return;
  }
}

async function addEquipment() {
  const id = await ask("Equipment ID: ");
  const name = await ask("Equipment Name: ");
  if (!id.trim() || !name.trim()) {
    console.log('❌ Equipment ID and name are required!');
    return;
  }
  const priceEth = await ask("Price per day (in ETH): ");
  let priceWei;
  try {
    priceWei = ethers.parseEther(priceEth);
  } catch (error) {
    console.log("❌ Invalid price format. Please enter a valid ETH value.", "error");
    return;
  }
  try {
    const tx = await contract.addEquipment(id, name, priceWei);

    console.log(`✅ Transaction sent! Hash: ${tx.hash}`);
    console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${tx.hash}`);
    
    // Wait for confirmation
    console.log('⏳ Waiting for confirmation...');
    const receipt = await tx.wait();
    
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
    console.log("✅ Equipment added.");
  } catch (err) {
    const reason = err?.error?.reason || err?.info?.error?.message || err?.message;
    console.error(`❌ Failed to add equipment: ${reason || "Unknown error"}`);
    if (err.code === 'INSUFFICIENT_FUNDS') {
      console.error('💰 Insufficient funds. Get test ETH from: https://sepoliafaucet.com/');
    }
  }
}

const { parse } = require("date-fns");

async function requestBooking() {
  const equipmentId = await ask("Equipment ID: ");
  const userId = await ask("User ID: ");
  if (!equipmentId.trim() || !userId.trim()) {
    console.log('❌ Both Equipment ID and User ID are required!');
    return;
  }
  const startInput = await ask("Start date (YYYY-MM-DD): ");
  const endInput = await ask("End date (YYYY-MM-DD): ");

  // Converte para timestamp no início do dia (meia-noite)
  const startDate = parse(startInput, "yyyy-MM-dd", new Date());
  const endDate = parse(endInput, "yyyy-MM-dd", new Date());

  const start = Math.floor(startDate.getTime() / 1000);
  const end = Math.floor(endDate.getTime() / 1000);

  if (isNaN(start) || isNaN(end) || start >= end) {
    console.log("❌ Invalid date range.");
    return;
  }

  const equipment = await contract.equipments(equipmentId);
  const days = Math.floor((end - start) / (60 * 60 * 24));
  if (days <= 0) {
    console.log("❌ Booking must be at least 1 full day.");
    return;
  }

  const totalPrice = BigInt(equipment.pricePerDay) * BigInt(days);
  console.log(`💰 Price to pay: ${ethers.formatEther(totalPrice)} ETH`);

  const confirm = await ask("Proceed with booking? (yes/no): ");
  if (confirm.toLowerCase() !== "yes") return;

  try {
    const tx = await contract.requestBooking(
      equipmentId,
      userId,
      start,
      end,
      { value: totalPrice }
    );

    console.log(`✅ Transaction sent! Hash: ${tx.hash}`);
    console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${tx.hash}`);
    
    // Wait for confirmation
    console.log('⏳ Waiting for confirmation...');
    const receipt = await tx.wait();
    
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
    console.log('🎉 Booking request successful!');
  } catch (err) {
    const reason = err?.error?.reason || err?.info?.error?.message || err?.message;
    console.error(`❌ Failed to request booking: ${reason || "Unknown error"}`);
    if (err.code === 'INSUFFICIENT_FUNDS') {
      console.error('💰 Insufficient funds. Get test ETH from: https://sepoliafaucet.com/');
    }
  }
}

async function confirmBooking() {
  const bookingId = await ask("Booking ID to confirm: ");
  try {
    const tx = await contract.confirmBooking(bookingId);

    console.log(`✅ Transaction sent! Hash: ${tx.hash}`);
    console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${tx.hash}`);
    
    // Wait for confirmation
    console.log('⏳ Waiting for confirmation...');
    const receipt = await tx.wait();
    
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
    console.log("🎉 Booking confirmed.");
  } catch (err) {
    const reason = err?.error?.reason || err?.info?.error?.message || err?.message;
    console.error(`❌ Failed to confirm booking: ${reason || "Unknown error"}`);
    if (err.code === 'INSUFFICIENT_FUNDS') {
      console.error('💰 Insufficient funds. Get test ETH from: https://sepoliafaucet.com/');
    }
  }
}

async function showTotalBookings() {
  try {
    const total = await contract.bookingCounter();
    console.log(`📊 Total bookings: ${total}`);
  } catch (err) {
    const reason = err?.error?.reason || err?.info?.error?.message || err?.message;
    console.error(`❌ Failed to get total bookings: ${reason || "Unknown error"}`);
  }
}

// View contract status
async function viewStatus() {
  try {
    console.log('\n📊 Contract Status');
    console.log('==================');
    
    const counter = await contract.bookingCounter();
    const balance = await provider.getBalance(signer.address);
    const network = await provider.getNetwork();
    
    console.log(`📋 Contract Address: ${CONTRACT_ADDRESS}`);
    console.log(`🌐 Network: ${network.name} (${network.chainId})`);
    console.log(`📊 Total Bookings: ${counter.toString()}`);
    console.log(`💰 My Wallet Balance: ${ethers.formatEther(balance)} ETH`);
    
  } catch (error) {
    console.error('❌ Failed to get status:', error.message);
  }
}

// View recent bookings
async function viewRecentBookings() {
  try {
    console.log('\n📋 Recent Bookings');
    console.log('==================');

    const counter = await contract.bookingCounter();
    const totalBookings = parseInt(counter.toString());

    if (totalBookings === 0) {
      console.log('No bookings found.');
      return;
    }

    const start = Math.max(0, totalBookings - 5);

    for (let i = start; i < totalBookings; i++) {
      const b = await contract.bookings(i);
      const createdAt = new Date(Number(b.bookingTimestamp) * 1000);
      const startAt = new Date(Number(b.startTimestamp) * 1000);
      const endAt = new Date(Number(b.endTimestamp) * 1000);

      console.log(`\n📝 Booking #${b.id}`);
      console.log(`   Equipment ID: ${b.equipmentId}`);
      console.log(`   User Address: ${b.user}`);
      console.log(`   Status:       ${["Requested", "Confirmed"][b.status]}`);
      console.log(`   Confirmed By User:  ${b.userConfirmed}`);
      console.log(`   Confirmed By Owner: ${b.ownerConfirmed}`);
      console.log(`   Created At:   ${createdAt.toLocaleDateString()}`);
      console.log(`   Start Date:   ${startAt.toLocaleDateString()}`);
      console.log(`   End Date:     ${endAt.toLocaleDateString()}`);
    }

  } catch (err) {
    const reason = err?.error?.reason || err?.info?.error?.message || err?.message;
    console.error('❌ Failed to load bookings:', reason || "Unknown error");
  }
}

async function mainMenu() {
  while (true) {
    console.log("\n📋 MENU");
    console.log("1. Add Equipment");
    console.log("2. Request Booking");
    console.log("3. Confirm Booking");
    console.log("4. Show Total Bookings");
    console.log("5. View contract status");
    console.log("6. View recent bookings");
    console.log("7. Exit");

    const choice = await ask("Select option (1-5): ");
    switch (choice.trim()) {
      case "1": await addEquipment(); break;
      case "2": await requestBooking(); break;
      case "3": await confirmBooking(); break;
      case "4": await showTotalBookings(); break;
      case "5": await viewStatus(); break;
      case "6": await viewRecentBookings(); break;
      case "7": rl.close(); process.exit(0);
      default: console.log("❌ Invalid option");
    }
  }
}

(async () => {
  try {
    await init();
    await mainMenu();
  } catch (err) {
    console.error("❌ Error:", err.message);
    rl.close();
  }
})();