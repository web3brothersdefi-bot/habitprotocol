# ✅ EXPERIENCE LEVEL CONSTRAINT FIX

## 🔍 **ROOT CAUSE ANALYSIS**

### **Error Message:**
```
new row for relation "users" violates check constraint "users_experience_level_check"
```

### **The Problem:**

**Database Constraint (schema.sql line 22):**
```sql
experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'expert') OR experience_level IS NULL)
```
✅ Expects: `'beginner'`, `'intermediate'`, `'expert'` (lowercase)

**Code (RoleDetails.jsx line 44):**
```javascript
const experienceLevels = ['Beginner', 'Intermediate', 'Expert'];
```
❌ Was sending: `'Beginner'`, `'Intermediate'`, `'Expert'` (capitalized)

**Result:**
- User selects "Beginner" in UI
- Code tries to save "Beginner" to database
- Database rejects it because "Beginner" ≠ "beginner"
- Profile creation fails! ❌

---

## ✅ **FIXES APPLIED**

### **Fix 1: RoleDetails.jsx - Convert to Lowercase When Saving**

**File:** `src/pages/onboarding/RoleDetails.jsx`

**Line 73-78 (was line 73):**
```javascript
// BEFORE:
updateFormData({ skills, experienceLevel, openToProjects });

// AFTER:
updateFormData({ 
  skills, 
  experienceLevel: experienceLevel.toLowerCase(),  // ✅ Convert to lowercase
  openToProjects 
});
```

**Why:** Ensures the value stored in formData is always lowercase ('beginner', 'intermediate', 'expert')

---

### **Fix 2: RoleDetails.jsx - Handle Lowercase Values from FormData**

**File:** `src/pages/onboarding/RoleDetails.jsx`

**Line 24-29 (was line 24):**
```javascript
// BEFORE:
const [experienceLevel, setExperienceLevel] = useState(formData.experienceLevel || '');

// AFTER:
const [experienceLevel, setExperienceLevel] = useState(
  formData.experienceLevel 
    ? formData.experienceLevel.charAt(0).toUpperCase() + formData.experienceLevel.slice(1)
    : ''
);
```

**Why:** When user clicks "Back", formData has lowercase 'beginner', but UI needs 'Beginner' to match the button. This capitalizes it for proper comparison.

---

### **Fix 3: HabitsGoals.jsx - Safety Check on Final Submission**

**File:** `src/pages/onboarding/HabitsGoals.jsx`

**Line 74-77 (was line 74):**
```javascript
// BEFORE:
experience_level: formData.experienceLevel || null,

// AFTER:
experience_level: formData.experienceLevel 
  ? formData.experienceLevel.toLowerCase() 
  : null,
```

**Why:** 
- Extra safety layer to ensure lowercase
- Handles empty strings by converting to null
- Database accepts null, but not empty string ''

---

## 🔄 **DATA FLOW (FIXED)**

### **Scenario 1: User Selects Experience Level**

1. **UI Display:** User sees buttons: `Beginner | Intermediate | Expert`
2. **User Clicks:** "Intermediate"
3. **Local State:** `experienceLevel = "Intermediate"` (capitalized)
4. **On Next Click:** Convert to `"intermediate"` (lowercase)
5. **Save to FormData:** `formData.experienceLevel = "intermediate"`
6. **Navigate:** Go to Socials page

### **Scenario 2: User Goes Back**

1. **Load FormData:** `formData.experienceLevel = "intermediate"` (lowercase)
2. **Initialize State:** Convert to `"Intermediate"` (capitalized)
3. **UI Comparison:** `experienceLevel === "Intermediate"` ✅ Matches button
4. **Button Highlighted:** Correct selection shown

### **Scenario 3: Final Submission**

1. **HabitsGoals Page:** User fills habits/goals
2. **Click Complete:** Prepare profile data
3. **Experience Level:** `formData.experienceLevel.toLowerCase()` → `"intermediate"`
4. **Send to Database:** `experience_level: "intermediate"` ✅
5. **Database Check:** `"intermediate" IN ('beginner', 'intermediate', 'expert')` ✅ Valid!
6. **Profile Created:** Success! 🎉

---

## 🎯 **FILES MODIFIED (2 files)**

1. ✅ `src/pages/onboarding/RoleDetails.jsx`
   - Line 24-29: Capitalize when loading from formData
   - Line 73-78: Convert to lowercase when saving

2. ✅ `src/pages/onboarding/HabitsGoals.jsx`
   - Line 74-77: Safety check + null handling

---

## 🧪 **TESTING CHECKLIST**

### **Test 1: New User (Builder Role)**
- [ ] Go to onboarding
- [ ] Select "Builder" role
- [ ] Fill name and bio
- [ ] Select skills (at least one)
- [ ] **Click "Beginner"** experience level
- [ ] Click Next
- [ ] Fill socials
- [ ] Fill habits/goals
- [ ] Click "Complete Profile"
- [ ] ✅ Should succeed without constraint error

### **Test 2: Back Navigation**
- [ ] Start onboarding as Builder
- [ ] Select "Intermediate" experience
- [ ] Click Next
- [ ] **Click Back button**
- [ ] ✅ "Intermediate" should still be selected
- [ ] Change to "Expert"
- [ ] Continue to completion
- [ ] ✅ Profile should save with "expert" (lowercase)

### **Test 3: Other Roles (No Experience Level)**
- [ ] **Founder Role:** Should work (no experience_level field)
- [ ] **Investor Role:** Should work (no experience_level field)
- [ ] Only Builder role uses experience_level

### **Test 4: Database Verification**
1. Create profile as Builder with "Expert"
2. Check Supabase → Table Editor → `users`
3. Find your user row
4. ✅ `experience_level` column should show: `"expert"` (lowercase)

---

## 🚨 **VALIDATION RULES**

### **What's Valid:**
```javascript
✅ 'beginner'     // lowercase
✅ 'intermediate' // lowercase
✅ 'expert'       // lowercase
✅ null           // for non-builder roles
```

### **What's Invalid:**
```javascript
❌ 'Beginner'     // capitalized
❌ 'BEGINNER'     // uppercase
❌ ''             // empty string
❌ undefined      // will cause error
❌ 'senior'       // not in list
```

---

## 🎉 **EXPECTED BEHAVIOR**

### **Before Fix:**
```
User: Selects "Beginner"
Code: Saves "Beginner"
Database: ❌ Constraint violation!
Error: "Failed to create profile"
```

### **After Fix:**
```
User: Selects "Beginner"
Code: Saves "beginner"
Database: ✅ Accepted!
Success: Profile created! 🎉
```

---

## 📝 **ADDITIONAL NOTES**

### **Why Not Change Database?**
Could update constraint to accept capitalized:
```sql
CHECK (experience_level IN ('Beginner', 'Intermediate', 'Expert') OR experience_level IS NULL)
```

**Reasons to keep lowercase:**
- Standard practice (database values lowercase)
- Easier for queries and comparisons
- More flexible for future changes
- Better for case-insensitive searches

### **Why Not Change UI to Lowercase?**
Could show 'beginner' buttons in UI:
```javascript
const experienceLevels = ['beginner', 'intermediate', 'expert'];
```

**Reasons to keep capitalized:**
- Better UX (looks professional)
- Consistent with other labels
- Users expect proper capitalization
- Easy to read

---

## ✅ **SOLUTION SUMMARY**

**Approach:** Keep UI capitalized for UX, store lowercase in database for standards

**How:**
1. Display: Capitalized (`'Beginner'`)
2. Storage: Lowercase (`'beginner'`)
3. Convert: On save and load
4. Validate: Ensure lowercase before database

**Result:** Best of both worlds! 🎉

---

**Test the fix by completing onboarding as a Builder role!** 🚀
