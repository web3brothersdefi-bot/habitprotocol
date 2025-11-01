# 🔧 QUICK FIX - Experience Level Constraint Error

## ❌ **WHAT WAS BROKEN**

```
Error: new row for relation "users" violates check constraint 
       "users_experience_level_check"
```

**Problem:** UI sends `'Beginner'` but database wants `'beginner'`

---

## ✅ **WHAT WAS FIXED**

### **File 1: RoleDetails.jsx (2 changes)**

**Change 1 - Line 24:** Capitalize when loading
```javascript
// Convert 'beginner' → 'Beginner' for UI
const [experienceLevel, setExperienceLevel] = useState(
  formData.experienceLevel 
    ? formData.experienceLevel.charAt(0).toUpperCase() + formData.experienceLevel.slice(1)
    : ''
);
```

**Change 2 - Line 73:** Convert to lowercase when saving
```javascript
// Convert 'Beginner' → 'beginner' for database
updateFormData({ 
  skills, 
  experienceLevel: experienceLevel.toLowerCase(),
  openToProjects 
});
```

---

### **File 2: HabitsGoals.jsx (1 change)**

**Change - Line 74:** Safety check
```javascript
// Ensure lowercase + handle empty strings
experience_level: formData.experienceLevel 
  ? formData.experienceLevel.toLowerCase() 
  : null,
```

---

## 🎯 **HOW TO TEST**

1. **Start Onboarding** → Choose Builder role
2. **Select Skills** → Pick at least one
3. **Select Experience** → Click "Intermediate"
4. **Complete Flow** → Fill all steps
5. **Submit** → Click "Complete Profile"
6. **✅ Should Work!** → No more constraint error

---

## 📊 **DATA FLOW**

```
User Clicks: "Intermediate"
      ↓
UI Stores: "Intermediate" (capitalized)
      ↓
On Save: "intermediate" (lowercase)
      ↓
FormData: "intermediate"
      ↓
Database: "intermediate" ✅ VALID!
```

---

## 🎉 **RESULT**

**Before:** ❌ Profile creation fails  
**After:** ✅ Profile created successfully!

---

**Go test it now!** Complete onboarding as a Builder role 🚀
