# Xcode Setup Instructions

## Quick Fix for "Target is Empty" Error

### Option 1: Add Files to Existing Target (Recommended)

1. **Open your Xcode project**
2. **Select all Swift files** in the left navigator
3. **Right-click** → Show File Inspector (or press `Cmd+Option+1`)
4. **Check the box** next to "UrbanManualApp" under "Target Membership"
5. **Build** again (`Cmd+B`)

### Option 2: Fresh Xcode Project Setup

Follow these steps to create a working Xcode project:

#### 1. Create New Project

1. Open Xcode
2. File → New → Project
3. Choose **App** template
4. Settings:
   - Product Name: `UrbanManualApp`
   - Team: Your team
   - Organization Identifier: `com.yourname`
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Storage: None
   - Minimum Deployment: **iOS 17.0**
5. Save to a location (NOT in the git repo yet)

#### 2. Add Supabase Package

1. File → Add Package Dependencies
2. Paste: `https://github.com/supabase/supabase-swift`
3. Dependency Rule: **Up to Next Major Version** `2.0.0`
4. Add Package
5. Select: **Supabase** (check the box)
6. Add Package

#### 3. Replace Default Files

Delete these files from Xcode:
- `ContentView.swift` (delete)
- Keep `UrbanManualApp.swift` but we'll replace it

#### 4. Copy Source Files

**Method A: Drag & Drop in Xcode**

1. Open Finder and navigate to the git repo: `UrbanManualApp/`
2. Drag these folders into Xcode's left navigator:
   - `Models/`
   - `Services/`
   - `ViewModels/`
   - `Views/`
3. In the dialog:
   - ✅ **Copy items if needed**
   - ✅ **Create groups**
   - ✅ **Add to targets: UrbanManualApp**
4. Copy the main app file:
   - Drag `UrbanManualApp.swift` and choose **Replace**

**Method B: Terminal Copy**

```bash
# Navigate to your Xcode project directory
cd /path/to/your/XcodeProject/UrbanManualApp/

# Copy all source files
cp -r /path/to/git/repo/UrbanManualApp/Models ./
cp -r /path/to/git/repo/UrbanManualApp/Services ./
cp -r /path/to/git/repo/UrbanManualApp/ViewModels ./
cp -r /path/to/git/repo/UrbanManualApp/Views ./
cp /path/to/git/repo/UrbanManualApp/UrbanManualApp.swift ./
```

Then in Xcode:
- File → Add Files to "UrbanManualApp"
- Select all folders
- ✅ **Copy items if needed**
- ✅ **Create groups**
- ✅ **Add to targets: UrbanManualApp**

#### 5. Configure Supabase

Edit `Services/SupabaseService.swift`:

```swift
let supabaseURL = URL(string: "https://YOUR_PROJECT_ID.supabase.co")!
let supabaseKey = "YOUR_ANON_KEY"
```

#### 6. Update Info.plist

Select your target → Info tab → Add keys:

**Network Access:**
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSExceptionDomains</key>
    <dict>
        <key>supabase.co</key>
        <dict>
            <key>NSIncludesSubdomains</key>
            <true/>
            <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

**Location (for Maps):**
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show nearby destinations on the map</string>
```

Or use the GUI:
1. Click `+` button in Info tab
2. Add `Privacy - Location When In Use Usage Description`
3. Value: `We need your location to show nearby destinations on the map`

#### 7. Set Minimum iOS Version

1. Select project in left navigator
2. Select target "UrbanManualApp"
3. General tab
4. Minimum Deployments: **iOS 17.0**

#### 8. Build & Run

1. Select a simulator (e.g., iPhone 15 Pro)
2. Press `Cmd+R` or click ▶️ Play button
3. Wait for build to complete
4. App should launch! 🎉

## Troubleshooting

### "No such module 'Supabase'"

**Fix:**
1. File → Add Package Dependencies
2. Search for and add: `https://github.com/supabase/supabase-swift`
3. Make sure it's added to your target

### "Multiple commands produce..."

**Fix:**
1. File Inspector (Cmd+Option+1) for duplicate files
2. Uncheck one of the duplicate targets
3. Or delete duplicate files

### Files not building

**Fix:**
1. Select the file in Project Navigator
2. File Inspector (Cmd+Option+1)
3. Under "Target Membership" check ✅ **UrbanManualApp**

### Build succeeds but crashes

**Fix:**
1. Check you've set Supabase URL and Key in `SupabaseService.swift`
2. Check Info.plist has network permissions
3. Check minimum iOS is 17.0

### Dark mode not working

**Fix:**
1. The app reads `UserDefaults` for dark mode
2. Check Settings view toggle works
3. Restart app to see changes

## Verification

After setup, you should see:

```
UrbanManualApp/
├── UrbanManualApp.swift ✅
├── Models/
│   ├── Destination.swift ✅
│   ├── Trip.swift ✅
│   └── AppState.swift ✅
├── Services/
│   └── SupabaseService.swift ✅
├── ViewModels/ (6 files) ✅
└── Views/
    ├── MainTabView.swift ✅
    ├── HomeView.swift ✅
    ├── DestinationDetailView.swift ✅
    ├── Auth/ ✅
    ├── Trips/ (4 files) ✅
    ├── Saved/ ✅
    ├── Map/ ✅
    ├── Profile/ ✅
    ├── Settings/ ✅
    └── Components/ (6 files) ✅
```

All files should have ✅ next to them in Target Membership.

## Success Test

Build and run. You should see:
1. **Auth screen** on first launch
2. Can tap "Continue without signing in"
3. **Tab bar** with 5 tabs
4. **Home feed** loads (might be empty if no data)
5. Can navigate between tabs
6. Can open search
7. Can filter categories

## Need Help?

If still having issues:

1. **Clean Build Folder**: `Cmd+Shift+K`
2. **Delete Derived Data**:
   - Xcode → Settings → Locations
   - Click arrow next to Derived Data path
   - Delete `UrbanManualApp` folder
   - Rebuild
3. **Restart Xcode**
4. **Check all files are added to target** (File Inspector)

Good luck! 🚀
