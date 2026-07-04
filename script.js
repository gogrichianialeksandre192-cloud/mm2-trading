// Authentic MM2 Database Sample
const mm2Database = [
    { name: "Candleflame", type: "Knife", tier: "godly", value: "240" },
    { name: "Sugar", type: "Gun", tier: "godly", value: "115" },
    { name: "Candy", type: "Knife", tier: "godly", value: "120" },
    { name: "Darksword", type: "Knife", tier: "godly", value: "550" },
    { name: "Darkshot", type: "Gun", tier: "godly", value: "575" },
    { name: "Harvester", type: "Gun", tier: "ancient", value: "650" },
    { name: "Icepiercer", type: "Gun", tier: "ancient", value: "620" },
    { name: "Batwing", type: "Knife", tier: "ancient", value: "65" },
    { name: "Laser", type: "Gun", tier: "vintage", value: "40" },
    { name: "Corrupt", type: "Knife", tier: "unique", value: "950" },
    { name: "Phoenix", type: "Pet", tier: "godly", value: "25" },
    { name: "Electro", type: "Pet", tier: "godly", value: "30" },
    { name: "JD", type: "Knife", tier: "legendary", value: "160" }
];

// Inappropriate words filter list
const bannedUsernames = ["scammer", "admin", "moderator", "hack", "exploit", "robloxstaff"];

// Application State Variables
let currentUser = null;
let activeListings = [];

// App Startup initialization
document.addEventListener("DOMContentLoaded", () => {
    checkActiveSession();
    renderItemDatabase();
    populateSelectMenus();
    loadMockListings();
});

function checkActiveSession() {
    const session = localStorage.getItem("mm2_session");
    if (session) {
        currentUser = session;
        showDashboard();
    }
}

// User Authentication Systems
function toggleAuth(showSignUp) {
    document.getElementById("signup-form").classList.toggle("hidden", !showSignUp);
    document.getElementById("signin-form").classList.toggle("hidden", showSignUp);
}

function handleSignUp() {
    const user = document.getElementById("signup-user").value.trim();
    const pass = document.getElementById("signup-pass").value;

    if (!user || !pass) return alert("Please fill out all fields.");
    if (pass.length < 6) return alert("Password must be at least 6 characters long.");
    
    // Check for overly simple characters variations
    if (/^[abc]+$/i.test(pass)) {
        return alert("Password is too simple. Do not use plain letter series like 'abc'.");
    }

    // Inappropriate filter check
    const containsBanned = bannedUsernames.some(banned => user.toLowerCase().includes(banned));
    if (containsBanned) {
        return alert("Username contains inappropriate or prohibited terms!");
    }

    const users = JSON.parse(localStorage.getItem("mm2_users") || "{}");
    if (users[user]) return alert("Username already registered!");

    users[user] = pass;
    localStorage.setItem("mm2_users", JSON.stringify(users));
    localStorage.setItem("mm2_session", user);
    currentUser = user;
    
    showDashboard();
}

function handleSignIn() {
    const user = document.getElementById("signin-user").value.trim();
    const pass = document.getElementById("signin-pass").value;

    const users = JSON.parse(localStorage.getItem("mm2_users") || "{}");
    if (users[user] && users[user] === pass) {
        localStorage.setItem("mm2_session", user);
        currentUser = user;
        showDashboard();
    } else {
        alert("Invalid Username or Password.");
    }
}

function showDashboard() {
    document.getElementById("auth-container").classList.add("hidden");
    document.getElementById("app-container").classList.remove("hidden");
    document.getElementById("welcome-msg").innerText = `Logged in as: ${currentUser}`;
    document.getElementById("local-trader-name").innerText = currentUser;
}

function handleSignOut() {
    localStorage.removeItem("mm2_session");
    currentUser = null;
    document.getElementById("app-container").classList.add("hidden");
    document.getElementById("auth-container").classList.remove("hidden");
}

// Render Database Items
function renderItemDatabase() {
    const container = document.getElementById("item-grid");
    container.innerHTML = "";
    mm2Database.forEach(item => {
        const card = document.createElement("div");
        card.className = `item-card ${item.tier}`;
        card.innerHTML = `
            <div class="item-type">${item.tier} ${item.type}</div>
            <h4>${item.name}</h4>
            <div class="item-value">Val: ${item.value}</div>
        `;
        container.appendChild(card);
    });
}

function filterItems() {
    const query = document.getElementById("search-bar").value.toLowerCase();
    const cards = document.querySelectorAll(".item-card");
    
    mm2Database.forEach((item, index) => {
        const matches = item.name.toLowerCase().includes(query) || item.type.toLowerCase().includes(query);
        cards[index].style.display = matches ? "block" : "none";
    });
}

// Global Modal Utilities
function openRules() { document.getElementById("rules-modal").classList.remove("hidden"); }
function closeModal(id) { document.getElementById("rules-modal").classList.add("hidden"); document.getElementById(id).classList.add("hidden"); }
function openCreateListing() { document.getElementById("offer-modal").classList.remove("hidden"); }

// Trading Marketplace Systems
function populateSelectMenus() {
    const selects = ["offer-have", "offer-want", "local-select-item", "remote-select-item"];
    selects.forEach(id => {
        const menu = document.getElementById(id);
        mm2Database.forEach(item => {
            const opt = document.createElement("option");
            opt.value = item.name;
            opt.innerText = `${item.name} (${item.type})`;
            menu.appendChild(opt);
        });
    });
}

function loadMockListings() {
    activeListings = [
        { id: 1, user: "RobloxPro99", have: "Candleflame", want: "Sugar" },
        { id: 2, user: "XmasTrader", have: "Harvester", want: "Corrupt" }
    ];
    renderListings();
}

function renderListings() {
    const container = document.getElementById("listings-container");
    container.innerHTML = "";
    activeListings.forEach(list => {
        const row = document.createElement("div");
        row.className = "trade-card";
        row.innerHTML = `
            <div class="trade-details">
                <strong>${list.user}</strong> is trading <span>${list.have}</span> for <span>${list.want}</span>
            </div>
            <button class="nav-trade-btn" onclick="acceptOffer('${list.user}', '${list.have}', '${list.want}')">See Offer / Trade</button>
        `;
        container.appendChild(row);
    });
}

function submitListing() {
    const have = document.getElementById("offer-have").value;
    const want = document.getElementById("offer-want").value;
    
    activeListings.unshift({
        id: Date.now(),
        user: currentUser,
        have: have,
        want: want
    });
    
    renderListings();
    closeModal("offer-modal");
}

// Trading Square Interfaces
function acceptOffer(traderName, targetHave, targetWant) {
    openTradeSquare();
    document.getElementById("remote-trader-name").innerText = traderName;
    
    // Automatically fill slot positions based on open listing offer data
    document.getElementById("local-select-item").value = targetWant;
    document.getElementById("remote-select-item").value = targetHave;
    updateSlot("local");
    updateSlot("remote");
}

function openTradeSquare() {
    document.getElementById("trade-square-modal").classList.remove("hidden");
}

function updateSlot(side) {
    const item = document.getElementById(`${side}-select-item`).value;
    const slot = document.getElementById(`${side}-slot`);
    slot.innerText = item ? item : "Empty Slot";
}

function proceedTrade() {
    const remoteUser = document.getElementById("remote-trader-name").innerText;
    if(remoteUser === "Trader" || remoteUser === currentUser) {
        return alert("Please start a trade with another active listing user first!");
    }
    
    // Copy the target user's Roblox username to the clipboard
    navigator.clipboard.writeText(remoteUser).then(() => {
        alert(`Roblox username "${remoteUser}" copied to clipboard!\nLaunch Roblox, search their profile, and join their game server to finish the MM2 trade!`);
        declineTrade();
    });
}

function declineTrade() {
    document.getElementById("trade-square-modal").classList.add("hidden");
    document.getElementById("local-select-item").value = "";
    document.getElementById("remote-select-item").value = "";
    document.getElementById("remote-trader-name").innerText = "Trader";
    updateSlot("local");
    updateSlot("remote");
}

