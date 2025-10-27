# Manual Xcode Project Setup - Step by Step

Since you don't have Target Membership showing, it means you need to **create the Xcode project first**. Here's exactly what to do:

---

## 🎯 Step-by-Step (Cannot Go Wrong)

### STEP 1: Open Xcode

1. Open **Xcode** application
2. You should see a welcome screen

### STEP 2: Create New Project

1. Click **"Create New Project"** or File → New → Project
2. You'll see a template chooser

### STEP 3: Choose App Template

1. At the top, make sure **"iOS"** tab is selected
2. Under "Application", click **"App"**
3. Click **"Next"** (bottom right)

### STEP 4: Configure Project

Fill in these fields **exactly**:

```
Product Name:          UrbanManualApp
Team:                  [Your Apple ID / None]
Organization Identifier: com.yourname.urbanmanual
Interface:             SwiftUI  ← Important!
Language:              Swift   ← Important!
Storage:               None
Include Tests:         ✅ (optional)
```

Click **"Next"**

### STEP 5: Choose Location

1. Choose where to save (e.g., Desktop or Documents)
2. Make sure **"Create Git repository"** is UNCHECKED ❌
3. Click **"Create"**

Xcode will create the project and open it.

---

## 🎯 STEP 6: Add Supabase Package (Do This First!)

**This is crucial before adding files:**

1. In Xcode, go to **File** → **Add Package Dependencies...**
2. In the search box (top right), paste:
   ```
   https://github.com/supabase/supabase-swift
   ```
3. Wait for it to load (may take 10-30 seconds)
4. Dependency Rule: **"Up to Next Major Version"** `2.0.0`
5. Click **"Add Package"** (bottom right)
6. A new dialog appears - make sure **"Supabase"** is checked ✅
7. Click **"Add Package"** again
8. Wait for Xcode to download and integrate (30-60 seconds)

You should see "Supabase" appear in the left sidebar under "Dependencies" or "Packages".

---

## 🎯 STEP 7: Delete Default Files

In the left Project Navigator:

1. Find **`ContentView.swift`**
2. Right-click → **Delete**
3. Choose **"Move to Trash"** (not just remove reference)

---

## 🎯 STEP 8: Add Source Files

Now we'll add the actual app code.

### Method A: Drag from Finder (Easiest)

1. Open **Finder**
2. Navigate to: `/path/to/urban-manual/UrbanManualApp/`
3. You should see these folders:
   - Models/
   - Services/
   - ViewModels/
   - Views/

4. **Arrange windows side-by-side:**
   - Finder on right
   - Xcode on left

5. **Drag folders one by one from Finder into Xcode:**
   - Drag **`Models`** folder into Xcode's left navigator (below UrbanManualApp folder)
   - A dialog appears with options:

   ```
   ✅ Copy items if needed           ← Check this!
   ✅ Create groups                  ← Check this!
   ✅ Add to targets: UrbanManualApp ← Check this!
   ```

   - Click **"Finish"**

6. **Repeat for other folders:**
   - Drag **`Services`**
   - Drag **`ViewModels`**
   - Drag **`Views`**
   - Same options each time!

7. **Replace main app file:**
   - Drag **`UrbanManualApp.swift`** from Finder
   - Xcode will ask: **"Do you want to replace?"**
   - Click **"Replace"**

### Method B: Use Add Files (Alternative)

If dragging doesn't work:

1. In Xcode: **File** → **Add Files to "UrbanManualApp"...**
2. Navigate to `/path/to/urban-manual/UrbanManualApp/`
3. Select **`Models`** folder (just click it once)
4. At the bottom, make sure:
   - ✅ **"Copy items if needed"**
   - ✅ **"Create groups"** (NOT "Create folder references")
   - ✅ **"Add to targets: UrbanManualApp"**
5. Click **"Add"**
6. Repeat for `Services`, `ViewModels`, `Views`
7. For `UrbanManualApp.swift`, do the same (it will ask to replace)

---

## 🎯 STEP 9: Verify Files Are Added

In Xcode's left navigator, you should now see:

```
▼ UrbanManualApp
  ├── UrbanManualApp.swift          ← Should be there
  ├── Assets.xcassets
  ▼ Models                          ← Yellow folder icon
    ├── Destination.swift
    ├── Trip.swift
    └── AppState.swift
  ▼ Services                        ← Yellow folder icon
    └── SupabaseService.swift
  ▼ ViewModels                      ← Yellow folder icon
    ├── HomeViewModel.swift
    ├── DestinationDetailViewModel.swift
    ├── AuthViewModel.swift
    ├── TripsViewModel.swift
    ├── TripDetailViewModel.swift
    └── ProfileViewModel.swift
  ▼ Views                           ← Yellow folder icon
    ├── MainTabView.swift
    ├── HomeView.swift
    └── ... (many more files)
```

**Important:** Folders should have **YELLOW** folder icons, not blue!
- Yellow = "Groups" (good!)
- Blue = "Folder References" (bad, won't build)

---

## 🎯 STEP 10: Check Target Membership (Now It Will Appear!)

1. Click on **any Swift file** in the navigator (e.g., `HomeViewModel.swift`)
2. Look at the **right panel** (File Inspector)
   - If you don't see it: **View** → **Inspectors** → **Show File Inspector**
   - Or press: **Cmd+Option+1**

3. You should now see a section called **"Target Membership"**
4. Make sure **UrbanManualApp** is checked ✅

If it's not checked:
- Check the box for **every file** that's unchecked
- You can select multiple files (Cmd+click) and check them all at once

---

## 🎯 STEP 11: Configure Supabase

1. In Xcode navigator, open: **Services** → **SupabaseService.swift**
2. Find lines 11-12:
   ```swift
   let supabaseURL = URL(string: "YOUR_SUPABASE_URL")!
   let supabaseKey = "YOUR_SUPABASE_ANON_KEY"
   ```
3. Replace with your actual Supabase credentials:
   ```swift
   let supabaseURL = URL(string: "https://abcdefgh.supabase.co")!
   let supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

---

## 🎯 STEP 12: Add Info.plist Permission

1. In the Project Navigator (left), click on the **blue project icon** at the very top (UrbanManualApp)
2. In the main area, click on the **target** "UrbanManualApp" (under TARGETS)
3. Click the **"Info"** tab at the top
4. You'll see a list of properties

5. Hover over any row and click the **"+"** button
6. A dropdown appears - scroll and find:
   ```
   Privacy - Location When In Use Usage Description
   ```
7. In the "Value" column, type:
   ```
   We need your location to show nearby destinations on the map
   ```

---

## 🎯 STEP 13: Set Minimum iOS Version

1. Still in the same screen (Target → General tab)
2. Scroll to **"Minimum Deployments"**
3. Change **iOS** to: **17.0**

---

## 🎯 STEP 14: Build!

1. At the top of Xcode, next to the Run button, you'll see a device selector
2. Click it and choose: **iPhone 15 Pro** (or any simulator)
3. Press the **Play button** ▶️ or **Cmd+R**

Xcode will:
1. Build (30-60 seconds first time)
2. Launch simulator
3. Install app
4. Run app

You should see:
- ✅ Auth screen with logo
- ✅ "The Urban Manual" title
- ✅ Email/password fields
- ✅ "Continue without signing in" button

---

## ⚠️ Common Problems

### "No such module 'Supabase'"
👉 You didn't add the Supabase package. Go back to STEP 6.

### "Cannot find type 'Destination' in scope"
👉 Files not added to target. Select all files, check Target Membership in File Inspector.

### Folders have blue icons
👉 You added them as "Folder References". Delete and re-add with "Create groups" option.

### Build succeeds but app crashes
👉 You didn't update Supabase credentials in SupabaseService.swift

### Can't find File Inspector panel
👉 Press **Cmd+Option+1** or **View** → **Inspectors** → **Show File Inspector**

---

## 🎉 Success!

If you see the auth screen, you're done! The app is working.

You can now:
- Click "Continue without signing in"
- Browse the home feed
- Search destinations
- Use all 5 tabs

---

## 📞 Still Need Help?

If you're still stuck:

1. Take a screenshot of your Xcode window
2. Take a screenshot of any error messages
3. Tell me exactly which step you're on

I'll help you figure it out!
