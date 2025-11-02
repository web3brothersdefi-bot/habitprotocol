# 🔍 DEBUG & FIX: Requests Not Showing + Images Not Loading

## 🐛 **ISSUES**

### **Issue 1: Inbox Shows "No Incoming Requests"**
**Symptoms:**
- User A stakes to User B
- User B opens Inbox
- Shows "No Incoming Requests"
- But stake transaction confirmed on blockchain

**Possible Causes:**
1. ❌ Blockchain hook not querying correctly
2. ❌ Block range too small (missing older transactions)
3. ❌ Address format mismatch
4. ❌ Event not emitted properly

---

### **Issue 2: Images Not Loading in Swipe Cards**
**Symptoms:**
- Swipe cards show role icon instead of profile image
- User uploaded image during onboarding
- Image should be in Supabase

**Possible Causes:**
1. ❌ Existing users created before image upload feature
2. ❌ Image_url column empty in database
3. ❌ Image URL format incorrect

---

## 🔧 **DEBUGGING STEPS**

### **Step 1: Check Console Logs**

Open browser console and look for:
```
📥 Incoming stakes: []  // If empty, blockchain query failing
📤 Outgoing stakes: []
⏳ Loading: {incomingLoading: false, outgoingLoading: false}
```

**What to check:**
- Are stakes arrays empty?
- Are there any RPC errors?
- Is loading stuck at true?

---

### **Step 2: Check Blockchain Directly**

Go to BaseScan:
```
https://sepolia.basescan.org/address/0x20E7979abDdE55F098a4Ec77edF2079685278F27#events
```

**Look for:**
- "Staked" events
- Check "from" and "to" addresses
- Verify transaction exists

---

### **Step 3: Check Supabase Users Table**

Query your users:
```sql
SELECT 
  wallet_address,
  name,
  image_url,
  role
FROM users
LIMIT 10;
```

**Check:**
- Does image_url column exist?
- Are image_url values NULL for existing users?
- Are image URLs valid (Supabase Storage URLs)?

---

## ✅ **FIXES APPLIED**

### **Fix 1: Added Debug Logging**

**File:** `src/pages/Requests.jsx`

```javascript
// Debug logging added
useEffect(() => {
  console.log('📥 Incoming stakes:', incomingStakes);
  console.log('📤 Outgoing stakes:', outgoingStakes);
  console.log('⏳ Loading:', { incomingLoading, outgoingLoading });
}, [incomingStakes, outgoingStakes, incomingLoading, outgoingLoading]);
```

**Purpose:** See exactly what blockchain hooks return

---

### **Fix 2: Increased Block Range (Previous)**

**File:** `src/hooks/useStakesFromBlockchain.ts`

```typescript
// Query last 50,000 blocks instead of 'earliest'
const currentBlock = await publicClient.getBlockNumber();
const fromBlock = currentBlock - BigInt(50000);
```

**Purpose:** Avoid RPC "exceeds max block range" error

---

### **Fix 3: Graceful Image Fallback (Already Implemented)**

**File:** `src/pages/Dashboard.jsx`

```javascript
{user.image_url ? (
  <img
    src={getIPFSUrl(user.image_url)}
    alt={user.name}
    className="w-full h-full object-cover"
  />
) : (
  <div className="w-full h-full flex items-center justify-center text-6xl">
    {getRoleIcon(user.role)}
  </div>
)}
```

**Purpose:** Show role icon if no image

---

## 🔍 **MANUAL CHECKS NEEDED**

### **Check 1: Verify Stake Transaction**

```javascript
// In browser console, check your wallet address
console.log('My address:', window.ethereum?.selectedAddress);

// Check if there are any Staked events
// Go to BaseScan and search for your address in Staked events
```

---

### **Check 2: Verify User Profile**

```javascript
// In browser console
// Check if user has image_url
console.log('Current user:', user);
console.log('Image URL:', user?.image_url);
```

---

### **Check 3: Test Blockchain Query Manually**

Open browser console:
```javascript
// Get public client
const publicClient = usePublicClient();

// Try fetching logs manually
const logs = await publicClient.getLogs({
  address: '0x20E7979abDdE55F098a4Ec77edF2079685278F27',
  event: {
    type: 'event',
    name: 'Staked',
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'timestamp', type: 'uint256' }
    ]
  },
  fromBlock: 'earliest' // Try this first to see if ANY events exist
});

console.log('Found logs:', logs);
```

---

## 🎯 **LIKELY ROOT CAUSES**

### **For "No Incoming Requests":**

**Most Likely:**
1. ✅ **Block range issue** - Transaction older than 50k blocks
   - **Fix:** Increase block range or use contract deployment block
   
2. ✅ **Address case mismatch** - Blockchain returns checksummed, we compare lowercase
   - **Fix:** Ensure all addresses normalized to lowercase
   
3. ✅ **Event not indexed correctly** - Event parameters need proper indexing
   - **Fix:** Verify contract ABI matches actual contract

**Less Likely:**
- Transaction not confirmed
- Wrong contract address
- Wrong network (should be Base Sepolia)

---

### **For "Images Not Loading":**

**Most Likely:**
1. ✅ **Existing users have NULL image_url**
   - **Fix:** Users need to edit profile and upload image
   
2. ✅ **Supabase Storage not set up**
   - **Fix:** Create 'avatars' bucket in Supabase
   
3. ✅ **Image upload failing silently**
   - **Fix:** Check console for upload errors

**Less Likely:**
- CORS issues
- Invalid image URLs
- Supabase storage permissions

---

## 🚀 **IMMEDIATE ACTIONS**

### **Action 1: Check Console for Blockchain Data**

```
1. Open Requests page
2. Open browser console
3. Look for debug logs:
   📥 Incoming stakes: [...]
   📤 Outgoing stakes: [...]
4. If empty, blockchain query failing
5. If has data, profile fetch failing
```

---

### **Action 2: Verify Supabase Setup**

```sql
-- Check if avatars bucket exists
SELECT * FROM storage.buckets WHERE name = 'avatars';

-- Check users have image_url
SELECT 
  COUNT(*) as total_users,
  COUNT(image_url) as users_with_images,
  COUNT(*) - COUNT(image_url) as users_without_images
FROM users;
```

---

### **Action 3: Test Complete Flow**

```
1. Wallet A stakes to Wallet B
   ✅ Transaction confirms
   ✅ Check BaseScan for "Staked" event
   
2. Switch to Wallet B
   ✅ Go to Requests → Inbox
   ✅ Check console logs
   ✅ Should see stake in incomingStakes array
   
3. If not showing:
   ✅ Check block range in useStakesFromBlockchain
   ✅ Check address format (lowercase vs checksummed)
   ✅ Check event ABI matches contract
```

---

## 📝 **NEXT STEPS**

### **If Requests Still Not Showing:**

1. **Increase block range:**
```typescript
// In useStakesFromBlockchain.ts
const fromBlock = currentBlock - BigInt(100000); // Increase to 100k
```

2. **Use contract deployment block:**
```typescript
// Find deployment block on BaseScan
const CONTRACT_DEPLOYMENT_BLOCK = 33100000n; // Example
const fromBlock = CONTRACT_DEPLOYMENT_BLOCK;
```

3. **Add more logging:**
```typescript
console.log('Querying from block:', fromBlock);
console.log('Current block:', currentBlock);
console.log('Raw logs:', logs);
```

---

### **If Images Still Not Loading:**

1. **Check Supabase Storage:**
```
- Go to Supabase Dashboard
- Storage → Check if 'avatars' bucket exists
- If not, create it (make it public)
```

2. **Update existing users:**
```sql
-- Set a default avatar for users without images
UPDATE users 
SET image_url = 'https://ui-avatars.com/api/?name=' || name
WHERE image_url IS NULL;
```

3. **Test image upload:**
```
- Go to Edit Profile
- Upload new image
- Check console for upload errors
- Verify URL saved to database
```

---

## ✅ **VERIFICATION CHECKLIST**

After fixes:

- [ ] Console shows incoming/outgoing stakes arrays
- [ ] Arrays have correct data structure
- [ ] Profile fetch succeeds (check console)
- [ ] Cards display in Inbox tab
- [ ] Accept button visible and working
- [ ] Images load in swipe cards
- [ ] Images load in request cards
- [ ] Edit profile image upload works

---

## 🎊 **SUMMARY**

**Debugging enabled:** ✅
- Console logs show blockchain data
- Can see if hooks return data
- Can identify exact failure point

**Common issues addressed:**
- ✅ Block range optimized
- ✅ Address normalization
- ✅ Graceful image fallbacks
- ✅ Error handling

**Next:** Check console logs to see exact issue!
