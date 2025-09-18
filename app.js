// Contract configuration
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


// Global variables
let provider;
let signer;
let contract;
let userAccount;

// DOM elements
const connectWalletBtn = document.getElementById("connectWallet");
const walletStatus = document.getElementById("walletStatus");
const walletAddress = document.getElementById("walletAddress");
const networkName = document.getElementById("networkName");
const bookingCounter = document.getElementById("bookingCounter");
const walletBalance = document.getElementById("walletBalance");
const bookingForm = document.getElementById("bookingForm");
const submitBooking = document.getElementById("submitBooking");
const transactionLog = document.getElementById("transactionLog");
const addEquipmentForm = document.getElementById("addEquipmentForm");
const addEquipmentBtn = document.getElementById("addEquipmentBtn");
const confirmBookingForm = document.getElementById("confirmBookingForm");
const confirmBookingBtn = document.getElementById("confirmBookingBtn");

// Handler para adicionar equipamento
async function addEquipmentHandler(event) {
  event.preventDefault();
  if (!contract) {
    log("Please connect your wallet", "error");
    return;
  }

  const equipmentId = document.getElementById("newEquipmentId").value.trim();
  const name = document.getElementById("newEquipmentName").value.trim();
  const priceEthStr = document.getElementById("newEquipmentPrice").value.trim();

  if (!equipmentId || !name || !priceEthStr) {
    log("Please fill in all fields (ID, Name, and Price)", "error");
    return;
  }

  let pricePerDay;
  try {
    pricePerDay = ethers.parseEther(priceEthStr); // Converte de ETH para wei
  } catch (error) {
    log("Invalid price format. Please enter a valid ETH value.", "error");
    return;
  }

  try {
    log(`Adding equipment ${equipmentId}...`);
    addEquipmentBtn.disabled = true;

    // Submit transaction
    const tx = await contract.addEquipment(equipmentId, name, pricePerDay);

    log(`Transaction submitted! Hash: ${tx.hash}`, "success");
    log(`View on Etherscan: https://sepolia.etherscan.io/tx/${tx.hash}`);

    // Wait for confirmation
    log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();

    log(`Transaction confirmed in block ${receipt.blockNumber}`, "success");
    log(`Gas used: ${receipt.gasUsed.toString()}`);

    log(`Equipment ${equipmentId} added with price ${priceEthStr} Sepolia ETH/day`, "success");
  } catch (error) {
    log("Failed to add equipment: " + extractReason(error), "error");
  } finally {
    addEquipmentBtn.disabled = false;
  }
}


// Handler para confirmar reserva
async function confirmBookingHandler(event) {
  event.preventDefault();
  if (!contract) {
    log("Please connect your wallet", "error");
    return;
  }

  const bookingId = parseInt(document.getElementById("confirmBookingId").value);

  try {
    log(`Confirming booking #${bookingId}...`);
    confirmBookingBtn.disabled = true;
    const tx = await contract.confirmBooking(bookingId);
    log(`Transaction submitted! Hash: ${tx.hash}`, "success");
    log(`View on Etherscan: https://sepolia.etherscan.io/tx/${tx.hash}`);

    // Wait for confirmation
    log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();

    log(`Transaction confirmed in block ${receipt.blockNumber}`, "success");
    log(`Gas used: ${receipt.gasUsed.toString()}`);
    log(`✅ Booking #${bookingId} confirmed`, "success");
  } catch (error) {
    log("Failed to confirm booking: " + extractReason(error), "error");
  } finally {
    confirmBookingBtn.disabled = false;
  }
}

// Utility functions
function log(message, type = "info") {
  const timestamp = new Date().toLocaleTimeString();
  const logElement = document.getElementById("transactionLog");

  let prefix = "";
  switch (type) {
    case "success":
      prefix = "✅ ";
      break;
    case "error":
      prefix = "❌ ";
      break;
    case "warning":
      prefix = "⚠️  ";
      break;
    case "info":
    default:
      prefix = "ℹ️  ";
      break;
  }

  logElement.textContent += `\n[${timestamp}] ${prefix}${message}`;
  logElement.scrollTop = logElement.scrollHeight;
}

function clearLog() {
  document.getElementById("transactionLog").textContent = "";
}

function formatAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatEther(wei) {
  return parseFloat(ethers.formatEther(wei)).toFixed(4);
}

function extractReason(error) {
  if (error?.reason) {
    return error.reason;
  }
  if (error?.error?.reason) {
    return error.error.reason;
  }
  if (typeof error?.message === "string") {
    // Tenta capturar "execution reverted: <motivo>"
    const match = error.message.match(/execution reverted: (.*?)($|(?= \(|,))/);
    if (match) {
      return match[1];
    }
  }
  return `${error.message}`;
}


// Check if MetaMask is installed
function checkMetaMask() {
  if (typeof window.ethereum !== "undefined") {
    log("MetaMask detected!", "success");
    return true;
  } else {
    log(
      "MetaMask not found. Please install MetaMask browser extension.",
      "error"
    );
    alert(
      "Please install MetaMask to use this application.\n\nVisit: https://metamask.io/"
    );
    return false;
  }
}

// Connect to MetaMask wallet
async function connectWallet() {
  if (!checkMetaMask()) return;

  try {
    log("Connecting to MetaMask...");
    connectWalletBtn.innerHTML = '<div class="loading"></div> Connecting...';
    connectWalletBtn.disabled = true;

    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    userAccount = accounts[0];

    // Create provider and signer (ethers v6 syntax)
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    // Create contract instance
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // Update UI
    walletStatus.innerHTML =
      '<i class="fas fa-check-circle"></i> Wallet: Connected';
    walletStatus.classList.add("success");
    walletAddress.textContent = `${formatAddress(
      userAccount
    )} (${userAccount})`;
    walletAddress.style.display = "block";

    connectWalletBtn.innerHTML = '<i class="fas fa-check"></i> Connected';
    connectWalletBtn.style.background = "#4CAF50";

    submitBooking.disabled = false;

    log(`Connected to wallet: ${formatAddress(userAccount)}`, "success");

    // Load network and contract info
    await loadNetworkInfo();
    await loadContractInfo();
  } catch (error) {
    log(`Failed to connect wallet: ${error.message}`, "error");
    connectWalletBtn.innerHTML = '<i class="fas fa-link"></i> Connect MetaMask';
    connectWalletBtn.disabled = false;
  }
}

// Load network information
async function loadNetworkInfo() {
  try {
    const network = await provider.getNetwork();
    networkName.textContent = `${network.name} (ID: ${network.chainId})`;

    if (network.chainId !== 11155111) {
      // Sepolia chainId
      networkName.style.color = "#ff9800";

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xAA36A7" }], // Sepolia chainId in hex
        });
      } catch (switchError) {
        log("Failed to switch to Sepolia network", "error");
      }
    } else {
      log("Connected to Sepolia testnet", "success");
      networkName.style.color = "#4CAF50";
    }

    // Get wallet balance
    const balance = await provider.getBalance(userAccount);
    walletBalance.textContent = `${formatEther(balance)} ETH`;

    if (balance === 0n) {
      log(
        "Warning: Your wallet has 0 ETH. Get test ETH from https://sepoliafaucet.com/",
        "warning"
      );
    }
  } catch (error) {
    log(`Failed to load network info: ${error.message}`, "error");
  }
}

// Load contract information
async function loadContractInfo() {
  try {
    const counter = await contract.bookingCounter();
    bookingCounter.textContent = counter.toString();
    log(`Total bookings: ${counter.toString()}`, "info");
  } catch (error) {
    log(`Failed to load contract info: ${error.message}`, "error");
    bookingCounter.textContent = "Error";
  }
}

// Submit booking request
async function submitBookingRequest(event) {
  event.preventDefault();

  if (!contract) {
    log("Please connect your wallet first", "error");
    return;
  }

  const equipmentId = document.getElementById("equipmentId").value.trim();
  const userId = document.getElementById("userId").value.trim();
  const startDateStr = document.getElementById("startDate").value.trim();
  const endDateStr = document.getElementById("endDate").value.trim();

  if (!equipmentId || !userId || !startDateStr || !endDateStr) {
    log("Please fill in all required fields", "error");
    return;
  }

  const startTimestamp = Math.floor(new Date(startDateStr).getTime() / 1000);
  const endTimestamp = Math.floor(new Date(endDateStr).getTime() / 1000);

  if (startTimestamp >= endTimestamp) {
    log("Start date must be before end date", "error");
    return;
  }

  try {
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const days = Math.ceil((end - start) / MS_PER_DAY);

    // Obtém preço por dia (em wei) do contrato
    const equipment = await contract.equipments(equipmentId);
    const pricePerDay = equipment.pricePerDay;

    if (!equipment.exists) {
      log("Equipment does not exist", "error");
      return;
    }

    // Valor total = pricePerDay * número de dias
    const totalPrice = pricePerDay * BigInt(days);

    log(`Submitting booking request for ${days} day(s) at ${ethers.formatEther(pricePerDay)} ETH/day`);

    submitBooking.innerHTML = '<div class="loading"></div> Submitting...';
    submitBooking.disabled = true;

    // Submit transaction
        const tx = await contract.requestBooking(
      equipmentId,
      userId,
      startTimestamp,
      endTimestamp,
      { value: totalPrice }
    );

    log(`Transaction submitted! Hash: ${tx.hash}`, "success");
    log(`View on Etherscan: https://sepolia.etherscan.io/tx/${tx.hash}`);

    submitBooking.innerHTML = '<div class="loading"></div> Confirming...';

    // Wait for confirmation
    log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();

    log(`Transaction confirmed in block ${receipt.blockNumber}`, "success");
    log(`Gas used: ${receipt.gasUsed.toString()}`);
    log("🎉 Booking request successful!", "success");

    // Refresh contract info
    await loadContractInfo();
    await loadNetworkInfo();

    // Reset form
    document.getElementById("equipmentId").value = "";
    document.getElementById("userId").value = "";
    document.getElementById("startDate").value = "";
    document.getElementById("endDate").value = "";
  } catch (error) {
    // Handle specific error types
    if (error.code === "INSUFFICIENT_FUNDS") {
      log(
        "Insufficient funds. Get test ETH from https://sepoliafaucet.com/",
        "error"
      );
    } else if (error.message.includes("user rejected")) {
      log("Transaction was cancelled by user", "warning");
    } else if (error.message.includes("gas")) {
      log("Gas estimation failed. Try increasing gas limit.", "error");
    } else {
      log("Booking failed: " + extractReason(error), "error");
    }
  } finally {
    submitBooking.innerHTML =
      '<i class="fas fa-paper-plane"></i> Submit Booking Request';
    submitBooking.disabled = false;
  }
}

// Handle account changes
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // User disconnected wallet
    log("Wallet disconnected", "warning");
    location.reload();
  } else if (accounts[0] !== userAccount) {
    // User switched accounts
    log("Account changed, reloading...", "info");
    location.reload();
  }
}

// Handle chain changes
function handleChainChanged(chainId) {
  log("Network changed, reloading...", "info");
  location.reload();
}

// Initialize the application
function init() {
  log("Welcome to SciQuipShar Equipment Booking Platform");
  log("=====================================");

  // Check if MetaMask is available
  if (!checkMetaMask()) {
    return;
  }

  // Set up event listeners
  connectWalletBtn.addEventListener("click", connectWallet);
  bookingForm.addEventListener("submit", submitBookingRequest);
  addEquipmentForm.addEventListener("submit", addEquipmentHandler);
  confirmBookingForm.addEventListener("submit", confirmBookingHandler);
  
  // Listen for account and network changes
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
  }

  log("Please connect your MetaMask wallet to get started.");
  log("Make sure you are on the Sepolia testnet and have some test ETH.");
  log("Get free Sepolia ETH from: https://sepoliafaucet.com/");
}

// Start the application when the page loads
document.addEventListener("DOMContentLoaded", init);
