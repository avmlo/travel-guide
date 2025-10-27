# Quick Start - 5 Minutes Setup

## TL;DR

```bash
# 1. Create Xcode project (App template, SwiftUI, iOS 17+)
# 2. Add Supabase package: https://github.com/supabase/supabase-swift
# 3. Drag all files from UrbanManualApp/ into Xcode (copy, create groups, add to target)
# 4. Update SupabaseService.swift with your credentials
# 5. Add Info.plist permissions (network, location)
# 6. Build & Run!
```

## Step by Step (First Time)

### 1️⃣ Create Xcode Project (1 min)

1. Xcode → New → Project → **App**
2. Name: `UrbanManualApp`
3. Interface: **SwiftUI**
4. Language: **Swift**
5. iOS: **17.0**

### 2️⃣ Add Supabase Package (1 min)

1. File → Add Package Dependencies
2. Paste: `https://github.com/supabase/supabase-swift`
3. Version: `2.0.0`
4. Add to target ✅

### 3️⃣ Add Source Files (1 min)

**Drag these into Xcode:**
- `Models/` folder
- `Services/` folder
- `ViewModels/` folder
- `Views/` folder
- `UrbanManualApp.swift` (replace existing)

**Dialog settings:**
- ✅ Copy items if needed
- ✅ Create groups
- ✅ Add to targets: UrbanManualApp

Delete `ContentView.swift` (we don't need it)

### 4️⃣ Configure Supabase (30 sec)

Edit `Services/SupabaseService.swift`:

```swift
// Line 11-12
let supabaseURL = URL(string: "https://[YOUR-PROJECT].supabase.co")!
let supabaseKey = "[YOUR-ANON-KEY]"
```

### 5️⃣ Add Permissions (30 sec)

**Option A - Add to Info tab:**
1. Target → Info
2. Add `Privacy - Location When In Use Usage Description`
3. Value: `For showing nearby destinations`

**Option B - Edit Info.plist:**
Right-click Info.plist → Open As → Source Code, add:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>For showing nearby destinations</string>
```

### 6️⃣ Build & Run! (1 min)

Press `Cmd+R` 🚀

## Checklist

Before building, verify:

- [ ] Supabase package added
- [ ] All folders copied with "Create groups"
- [ ] All files show target membership checkmark
- [ ] SupabaseService.swift has your credentials
- [ ] Info.plist has location permission
- [ ] Minimum deployment: iOS 17.0
- [ ] Deleted `ContentView.swift`

## Expected Result

✅ App launches with auth screen
✅ Can skip authentication
✅ See 5 tabs (Home, Map, Saved, Trips, Profile)
✅ Home feed loads
✅ Can search and filter
✅ Can navigate between tabs

## If It Doesn't Work

### Error: "Target is empty"
👉 Files not added to target. Select all files → File Inspector → Check "UrbanManualApp" under Target Membership

### Error: "No such module 'Supabase'"
👉 Add package: File → Add Package Dependencies → `https://github.com/supabase/supabase-swift`

### Error: "Cannot find type 'X' in scope"
👉 Missing files. Make sure ALL folders (Models, Services, ViewModels, Views) are copied

### App crashes on launch
👉 Check SupabaseService.swift has valid URL and key

### Build succeeds but shows errors
👉 Clean build: `Cmd+Shift+K` then rebuild `Cmd+B`

## File Structure Check

After setup, your Xcode project should look like:

```
▼ UrbanManualApp
  ├── UrbanManualApp.swift
  ▼ Models
    ├── Destination.swift
    ├── Trip.swift
    └── AppState.swift
  ▼ Services
    └── SupabaseService.swift
  ▼ ViewModels
    ├── HomeViewModel.swift
    ├── DestinationDetailViewModel.swift
    ├── AuthViewModel.swift
    ├── TripsViewModel.swift
    ├── TripDetailViewModel.swift
    └── ProfileViewModel.swift
  ▼ Views
    ├── MainTabView.swift
    ├── HomeView.swift
    ├── DestinationDetailView.swift
    ▼ Auth
      └── AuthView.swift
    ▼ Trips
      ├── TripsView.swift
      ├── TripDetailView.swift
      ├── CreateTripView.swift
      └── AddToTripView.swift
    ▼ Saved
      └── SavedPlacesView.swift
    ▼ Map
      └── MapView.swift
    ▼ Profile
      └── ProfileView.swift
    ▼ Settings
      └── SettingsView.swift
    ▼ Components
      ├── SearchBarView.swift
      ├── CategoryFilterView.swift
      ├── CityFilterView.swift
      ├── DestinationCard.swift
      ├── DestinationGridView.swift
      └── DestinationGridViewNavigable.swift
  ▼ Assets.xcassets
  └── Info.plist
```

## Pro Tips

💡 **Use Cmd+Shift+O** to quickly find files
💡 **Cmd+B** to build without running
💡 **Cmd+Shift+K** to clean build folder if errors
💡 **Cmd+R** to build and run
💡 **Cmd+.** to stop running app

## Need More Help?

See `SETUP_XCODE.md` for detailed troubleshooting.

---

**Total setup time: ~5 minutes**
**Lines of code: ~3,800**
**Files: 35+**
**Features: Complete iOS app!** 🎉
