# The Urban Manual - iOS App

Complete native SwiftUI iOS app for The Urban Manual travel guide platform.

## 🎯 Features

### ✅ Core Features
- **Home Feed**: Browse all destinations with infinite scroll
- **Smart Search**: Real-time search with debouncing
- **Advanced Filters**: Filter by category (restaurant, cafe, hotel, bar, shop, bakery) and city
- **Destination Details**: Full destination info with maps, images, and actions
- **Authentication**: Sign up/in with Supabase Auth
- **Save & Bookmark**: Save favorite places
- **Visited Tracking**: Mark places as visited with ratings
- **Trip Planning**: Create trips with custom itineraries
- **Interactive Map**: Explore destinations on map with category filtering
- **User Profile**: View stats, manage account
- **Settings**: Dark mode, notifications, privacy

### 🏗️ Architecture

**MVVM Pattern**
```
Models/
  - Destination.swift (Data models)
  - Trip.swift (Trip & itinerary models)
  - AppState.swift (Global app state)

Views/
  - HomeView.swift (Main feed)
  - DestinationDetailView.swift (Detail screen)
  - Auth/ (Sign in/up)
  - Trips/ (Trip management)
  - Saved/ (Saved & visited places)
  - Map/ (Map exploration)
  - Profile/ (User profile)
  - Settings/ (App settings)
  - Components/ (Reusable UI)

ViewModels/
  - HomeViewModel.swift
  - DestinationDetailViewModel.swift
  - AuthViewModel.swift
  - TripsViewModel.swift
  - ProfileViewModel.swift
  - And more...

Services/
  - SupabaseService.swift (Complete API service)
```

## 📱 Screens

### 1. Home (Tab 1)
- Grid layout of destinations
- Search bar (opens overlay)
- Category pills
- City filters with show more/less
- Pull to refresh

### 2. Map (Tab 2)
- Interactive map with markers
- Category filtering
- Tap markers to see details
- User location button
- Map controls (compass, scale)

### 3. Saved (Tab 3)
- Saved places grid
- Visited places grid
- Segmented control to switch
- Pull to refresh

### 4. Trips (Tab 4)
- List of trips
- Create new trip
- Trip detail with itinerary
- Add items to itinerary
- Add destinations to trips

### 5. Profile (Tab 5)
- User avatar & info
- Stats (saved, visited, trips count)
- Quick links to saved/visited/trips
- Settings access
- Sign out

## 🚀 Setup Instructions

### Prerequisites
- Xcode 15.0+
- iOS 17.0+
- Active Supabase project
- macOS Sonoma or later

### Step 1: Create Xcode Project

1. Open Xcode
2. File → New → Project
3. Choose **App** template
4. Set:
   - Product Name: `UrbanManualApp`
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Minimum iOS: **17.0**

### Step 2: Copy Source Files

Copy all files from `UrbanManualApp/` directory:

```bash
# From your terminal
cp -r UrbanManualApp/* /path/to/your/xcode/project/UrbanManualApp/
```

Or manually drag files into Xcode project.

### Step 3: Add Dependencies

#### Supabase Swift SDK

1. In Xcode: File → Add Package Dependencies
2. Enter: `https://github.com/supabase/supabase-swift`
3. Version: `2.0.0` or later
4. Add to target: `UrbanManualApp`

### Step 4: Configure Supabase

Edit `Services/SupabaseService.swift`:

```swift
let supabaseURL = URL(string: "https://[project-id].supabase.co")!
let supabaseKey = "[your-anon-key]"
```

Get credentials from Supabase Dashboard:
- Project Settings → API
- Project URL
- Anon/Public Key

### Step 5: Configure Info.plist

Add network permissions:

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

Add location permission (for map):

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show nearby destinations</string>
```

### Step 6: Build & Run

1. Select target device or simulator
2. Press `Cmd+R` to build and run
3. App launches with authentication screen
4. Sign up or skip to browse

## 📂 Project Structure

```
UrbanManualApp/
├── UrbanManualApp.swift          # App entry point
├── Models/
│   ├── Destination.swift         # Destination & Category models
│   ├── Trip.swift                # Trip & Itinerary models
│   └── AppState.swift            # Global state management
├── Services/
│   └── SupabaseService.swift     # Complete Supabase API client
├── ViewModels/
│   ├── HomeViewModel.swift
│   ├── DestinationDetailViewModel.swift
│   ├── AuthViewModel.swift
│   ├── TripsViewModel.swift
│   ├── TripDetailViewModel.swift
│   └── ProfileViewModel.swift
└── Views/
    ├── MainTabView.swift         # Tab navigation
    ├── HomeView.swift            # Home feed
    ├── DestinationDetailView.swift
    ├── Auth/
    │   └── AuthView.swift        # Sign in/up
    ├── Trips/
    │   ├── TripsView.swift
    │   ├── TripDetailView.swift
    │   ├── CreateTripView.swift
    │   └── AddToTripView.swift
    ├── Saved/
    │   └── SavedPlacesView.swift
    ├── Map/
    │   └── MapView.swift
    ├── Profile/
    │   └── ProfileView.swift
    ├── Settings/
    │   └── SettingsView.swift
    └── Components/
        ├── SearchBarView.swift
        ├── CategoryFilterView.swift
        ├── CityFilterView.swift
        ├── DestinationCard.swift
        ├── DestinationGridView.swift
        └── DestinationGridViewNavigable.swift
```

## 🔑 Key Technologies

- **SwiftUI**: Modern declarative UI framework
- **Combine**: Reactive programming for search debouncing
- **Async/Await**: Modern concurrency for API calls
- **MapKit**: Native map integration
- **Supabase Swift**: Backend client
- **MVVM**: Clean architecture pattern

---

Built with ❤️ using SwiftUI and Supabase
