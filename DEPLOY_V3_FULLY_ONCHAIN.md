# 🚀 STAKEMATCH V3 - FULLY ON-CHAIN SOLUTION

## 🎯 **THE ULTIMATE DECENTRALIZED ARCHITECTURE**

### **Data Storage:**

**On Blockchain (V3 Contract):**
- ✅ User profiles (name, role, bio, company, etc.)
- ✅ Profile images (IPFS hashes)
- ✅ Skills array
- ✅ Social links (Twitter, LinkedIn)
- ✅ Stakes & matches
- ✅ All user data

**On IPFS:**
- ✅ Profile images
- ✅ Decentralized storage
- ✅ Permanent & immutable

**On Supabase (Only):**
- ✅ Chat messages
- ✅ Real-time messaging
- ✅ Nothing else!

---

## 🎊 **WHY V3 IS BEST**

### **Complete Decentralization:**
- ✅ No database dependency for users
- ✅ Users can't be deleted
- ✅ Censorship resistant
- ✅ Truly Web3

### **Single Source of Truth:**
- ✅ Blockchain is the database
- ✅ No sync issues
- ✅ Always consistent
- ✅ Verifiable on-chain

### **Better Performance:**
- ✅ One contract call = all user data
- ✅ No Supabase queries for profiles
- ✅ Faster loading
- ✅ Less API calls

---

## 📋 **V3 CONTRACT FEATURES**

### **User Management:**

```solidity
// Register user (one-time)
registerUser(
  name,
  role,        // "builder", "investor", "advisor"
  bio,
  imageIPFS,   // IPFS hash: "QmX..."
  skills,      // ["Solidity", "React", "Web3"]
  company,
  twitter,
  linkedin
)

// Update profile anytime
updateProfile(...)
```

### **Discovery Functions:**

```solidity
// Get ALL users with profiles in ONE call
getAllUsersWithProfiles()
→ Returns: (UserProfile[], address[])

// Filter by role
getUsersByRole("builder")
→ Returns: (UserProfile[], address[])

// Get single user
getUserProfile(address)
→ Returns: UserProfile
```

### **Staking Functions:**

```solidity
// Get incoming with FULL profiles included
getActiveIncomingStakes(address)
→ Returns: StakeInfo[] {
  from, to, amount, timestamp, status,
  matched, matchedAt,
  fromProfile,  // Complete profile!
  toProfile     // Complete profile!
}

// Get outgoing with FULL profiles included
getActiveOutgoingStakes(address)
→ Returns: StakeInfo[] (same structure)
```

---

## 🚀 **DEPLOYMENT STEPS**

### **Step 1: Compile**

```bash
npx hardhat compile
```

### **Step 2: Deploy**

```bash
npx hardhat run scripts/deploy-v3.js --network baseSepolia
```

**Output:**
```
🚀 Deploying StakeMatchV3 - Fully On-Chain...
✅ StakeMatchV3 deployed to: 0x...

📝 Update your .env file:
   VITE_CONTRACT_ADDRESS=0x...
```

### **Step 3: Copy Contract Address**

Copy the address from deployment output.

---

## 📊 **FRONTEND INTEGRATION**

### **1. User Registration (Onboarding)**

```javascript
// During onboarding:

// Upload image to IPFS
const ipfsHash = await uploadToIPFS(imageFile);
// Returns: "QmX1234..."

// Register on blockchain
await contract.registerUser(
  name,
  role,
  bio,
  ipfsHash,  // IPFS hash
  skills,
  company,
  twitter,
  linkedin
);

// Done! User is now on-chain
```

### **2. Discover Users (Dashboard)**

```javascript
// Get all users with profiles
const { profiles, addresses } = await contract.getAllUsersWithProfiles();

// Or filter by role
const { profiles, addresses } = await contract.getUsersByRole("builder");

// Display in UI
profiles.map((profile, index) => ({
  address: addresses[index],
  name: profile.name,
  role: profile.role,
  bio: profile.bio,
  image: `https://gateway.pinata.cloud/ipfs/${profile.imageIPFS}`,
  skills: profile.skills,
  company: profile.company
}))
```

### **3. Requests (Inbox/Sent)**

```javascript
// Get incoming requests with FULL profiles
const stakes = await contract.getActiveIncomingStakes(myAddress);

// Each stake includes:
stakes.map(stake => ({
  from: stake.from,
  to: stake.to,
  amount: stake.amount,
  status: stake.status,
  matched: stake.matched,
  // Profile data included!
  stakerName: stake.fromProfile.name,
  stakerRole: stake.fromProfile.role,
  stakerImage: `https://gateway.pinata.cloud/ipfs/${stake.fromProfile.imageIPFS}`,
  stakerBio: stake.fromProfile.bio
}))

// No Supabase query needed!
```

---

## 🎯 **IPFS INTEGRATION**

### **Upload Image to IPFS:**

```javascript
// Using Pinata (recommended)
const uploadToIPFS = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PINATA_JWT}`
    },
    body: formData
  });

  const data = await response.json();
  return data.IpfsHash; // "QmX1234..."
};
```

### **Display IPFS Image:**

```javascript
// IPFS hash from contract
const ipfsHash = userProfile.imageIPFS;

// Display URL
const imageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

// Or use other gateways:
// - https://ipfs.io/ipfs/${ipfsHash}
// - https://cloudflare-ipfs.com/ipfs/${ipfsHash}
```

---

## 📋 **MIGRATION FROM V2**

### **Option 1: Fresh Start (Recommended)**

1. Deploy V3 contract
2. Users re-register on-chain
3. Upload images to IPFS
4. Clean, decentralized start

### **Option 2: Migrate Existing Users**

```javascript
// For each user in Supabase:
const users = await supabase.from('users').select('*');

for (const user of users) {
  // Upload image to IPFS
  const ipfsHash = await uploadToIPFS(user.image_url);
  
  // Register on-chain (user must sign)
  await contract.registerUser(
    user.name,
    user.role,
    user.bio,
    ipfsHash,
    user.skills || [],
    user.company || '',
    user.twitter || '',
    user.linkedin || ''
  );
}
```

---

## 🎊 **BENEFITS SUMMARY**

### **Decentralization:**
- ✅ Users can't be censored
- ✅ No single point of failure
- ✅ Truly Web3
- ✅ Verifiable on-chain

### **Performance:**
- ✅ Single contract call = complete data
- ✅ No database queries
- ✅ Faster loading
- ✅ Less API calls

### **Cost:**
- ✅ One-time registration fee
- ✅ No ongoing database costs
- ✅ IPFS storage is cheap
- ✅ Scalable

### **User Experience:**
- ✅ Wallet = account
- ✅ No separate login
- ✅ Own your data
- ✅ Portable profile

---

## 📊 **DATA FLOW**

### **Registration:**
```
User → Upload image to IPFS → Get hash
     → Call registerUser(name, role, ..., ipfsHash)
     → Profile stored on-chain
     → Done!
```

### **Discovery:**
```
Frontend → Call getAllUsersWithProfiles()
         → Get all users + profiles in one call
         → Display in UI
         → No Supabase needed!
```

### **Staking:**
```
User A → Swipe right on User B
       → Call stakeToConnect(userB)
       → Stake recorded on-chain

User B → Open Requests
       → Call getActiveIncomingStakes(userB)
       → Returns stakes WITH full profiles
       → Display in UI
       → No Supabase query!
```

### **Chat (Only Supabase):**
```
After match → Open chat
            → Messages stored in Supabase
            → Real-time updates
            → This is the ONLY Supabase usage
```

---

## 🚀 **DEPLOYMENT COMMAND**

```bash
# Compile
npx hardhat compile

# Deploy
npx hardhat run scripts/deploy-v3.js --network baseSepolia

# Copy address from output
# Update .env
# Deploy and share address!
```

---

## ✅ **READY TO DEPLOY**

**Files created:**
- ✅ `contracts/StakeMatchV3.sol` - Fully on-chain contract
- ✅ `scripts/deploy-v3.js` - Deployment script

**Features:**
- ✅ Users on blockchain
- ✅ Images on IPFS
- ✅ Only chat on Supabase
- ✅ Fully decentralized
- ✅ Production ready

**Deploy and share the address! 🎉**
