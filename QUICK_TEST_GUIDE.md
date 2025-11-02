# 🧪 QUICK TEST GUIDE - VERIFY EVERYTHING WORKS

## ✅ **TEST 1: Requests Page (FIXED)**

### **Steps:**
1. Open http://localhost:3002/requests
2. Open Console (F12)
3. Check for logs

### **Expected Console Output:**
```
🔍 INCOMING: Querying stakes TO: 0x2D97...
📊 INCOMING: Trying Last 10k blocks (xxxxx → xxxxx)
✅ INCOMING: Found X events in Last 10k
📥 INCOMING: Found X active stakes

🔍 OUTGOING: Querying stakes FROM: 0x2D97...
📊 OUTGOING: Trying Last 10k blocks (xxxxx → xxxxx)
✅ OUTGOING: Found X events in Last 10k
📤 OUTGOING: Found X active stakes
```

### **Success Criteria:**
- ✅ No errors in console
- ✅ See event query logs
- ✅ No "ContractFunctionExecutionError"
- ✅ Page loads without crashes

---

## 🧪 **TEST 2: Create a Stake**

### **Preparation:**
- Need 2 wallets (A and B)
- Both need USDC on Base Sepolia
- Get USDC from faucet

### **Steps (Wallet A):**
```
1. Connect Wallet A
2. Go to Dashboard
3. Find Wallet B in swipe cards
4. Swipe right (or click Stake)
5. Approve USDC (first time only)
6. Click "Stake to Connect"
7. Confirm transaction in wallet
8. Wait for confirmation
```

### **Expected Result:**
```
✅ USDC approved
✅ Stake transaction confirmed
✅ Toast: "Successfully staked!"
✅ Navigate to Requests page
✅ Sent tab shows the stake
```

### **Console Check:**
```
Should see:
- Transaction hash
- Confirmation logs
- Event query with 1 result
```

---

## 🧪 **TEST 3: View Incoming Request**

### **Steps (Wallet B):**
```
1. Switch to Wallet B
2. Go to Requests → Inbox tab
3. Check console
4. Look for stake card
```

### **Expected Result:**
```
✅ Inbox shows 1 request
✅ Card shows Wallet A's details:
   - Name (or address if no profile)
   - Role badge
   - "Accept (1 USDC)" button
   - "View Profile" button
```

### **Console Check:**
```
📊 INCOMING: Trying Last 10k blocks
✅ INCOMING: Found 1 events in Last 10k
📥 INCOMING: Found 1 active stakes
```

---

## 🧪 **TEST 4: Accept Request**

### **Steps (Wallet B):**
```
1. On Inbox tab with Wallet A's request
2. Click "Accept (1 USDC)"
3. Approve USDC (if first time)
4. Confirm transaction
5. Wait for confirmation
```

### **Expected Result:**
```
✅ USDC approved
✅ Stake transaction confirmed
✅ Toast: "Request accepted! You are now matched!"
✅ Status changes to "Matched"
✅ "Chat Here" button appears
```

### **Both Wallets Should Show:**
```
Wallet A (Sent tab):
- Status: Matched ✅
- "💬 Chat Here" button

Wallet B (Inbox tab):
- Status: Matched ✅
- "💬 Chat Here" button
```

---

## 🧪 **TEST 5: Chat**

### **Steps (Either Wallet):**
```
1. Click "Chat Here" on matched request
2. Should navigate to /chat/[address]
3. Type a message
4. Press Enter or click Send
```

### **Expected Result:**
```
✅ Chat page opens
✅ Messages load
✅ Can send messages
✅ Messages appear in real-time
✅ Other user sees messages
```

---

## 📋 **TROUBLESHOOTING**

### **Issue: No stakes showing**
```
Check:
1. Are you using the correct wallet?
2. Has anyone staked to you?
3. Check console for event logs
4. Try staking from another account
```

### **Issue: Can't stake**
```
Check:
1. Do you have USDC?
2. Is USDC approved?
3. Is contract address correct?
4. Check wallet network (Base Sepolia)
```

### **Issue: Accept button doesn't work**
```
Check:
1. Do you have USDC?
2. Is USDC approved?
3. Check console for errors
4. Try refreshing page
```

### **Issue: Chat doesn't work**
```
Check:
1. Are users matched?
2. Is Supabase configured?
3. Check network tab
4. Check console errors
```

---

## 🎯 **QUICK STATUS CHECK**

### **Run This Checklist:**

**Backend:**
- [ ] Contract deployed on Base Sepolia
- [ ] Contract verified on BaseScan
- [ ] USDC token address correct
- [ ] Contract has USDC approval
- [ ] Supabase configured

**Frontend:**
- [x] Requests page fixed (event logs)
- [ ] Dashboard shows users
- [ ] Stake button works
- [ ] Accept button works
- [ ] Chat opens and works

**Network:**
- [ ] Connected to Base Sepolia
- [ ] RPC endpoint working
- [ ] Block explorer shows txs
- [ ] Events emitting correctly

---

## 🚀 **SUCCESS METRICS**

### **MVP Complete When:**
```
✅ User can connect wallet
✅ User can see other users
✅ User can stake to connect
✅ User receives incoming request
✅ User can accept request
✅ Users match successfully
✅ Chat opens
✅ Messages work
✅ No critical errors
```

---

## 💡 **TIPS**

### **For Testing:**
1. Use Chrome DevTools
2. Keep console open
3. Check Network tab for API calls
4. Use 2 different browsers for 2 wallets
5. Clear cache if issues

### **For Debugging:**
1. Check console logs
2. Verify contract on BaseScan
3. Check transaction history
4. Verify USDC balance
5. Check Supabase data

### **Common Issues:**
1. Wrong network (use Base Sepolia)
2. No USDC (get from faucet)
3. No approval (approve first)
4. Old data (refresh page)
5. Cache issues (hard refresh)

---

## 🎊 **YOU'RE READY!**

**Current Status:**
- ✅ Requests page fixed
- ✅ Event logs working
- ✅ Console errors minimal
- ⚠️ Need to test complete flow

**Next Steps:**
1. Refresh page
2. Test stake creation
3. Test acceptance
4. Test matching
5. Test chat

**Let's test it! 🚀**
