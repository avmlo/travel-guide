# The Urban Manual - iOS App

Native SwiftUI iOS app for The Urban Manual travel guide.

## Features

- **Home Feed**: Browse all destinations with search and filters
- **Search**: Quick search overlay for finding destinations
- **Category Filters**: Filter by restaurant, cafe, hotel, bar, shop, bakery
- **City Filters**: Filter destinations by city
- **Destination Cards**: Beautiful card layout with images and details

## Setup Instructions

### 1. Create New Xcode Project

1. Open Xcode
2. File → New → Project
3. Choose **App** template
4. Set:
   - Product Name: `UrbanManualApp`
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Minimum iOS: **17.0**

### 2. Add Supabase Dependency

1. In Xcode, go to File → Add Package Dependencies
2. Enter: `https://github.com/supabase/supabase-swift`
3. Version: 2.0.0 or later
4. Add to target: UrbanManualApp

### 3. Add Source Files

Copy all the Swift files from this directory into your Xcode project:

**App Structure:**
```
UrbanManualApp/
├── UrbanManualApp.swift          # App entry point
├── Models/
│   └── Destination.swift         # Data models
├── Services/
│   └── SupabaseService.swift     # API service
├── ViewModels/
│   └── HomeViewModel.swift       # Home screen logic
└── Views/
    ├── HomeView.swift             # Main home screen
    └── Components/
        ├── SearchBarView.swift    # Search UI
        ├── CategoryFilterView.swift # Category filters
        ├── CityFilterView.swift   # City filters
        ├── DestinationGridView.swift # Grid layout
        └── DestinationCard.swift  # Card component
```

### 4. Configure Supabase

Edit `Services/SupabaseService.swift`:

```swift
let supabaseURL = URL(string: "YOUR_SUPABASE_PROJECT_URL")!
let supabaseKey = "YOUR_SUPABASE_ANON_KEY"
```

Get these from your Supabase project dashboard:
- Project URL: `https://[project-id].supabase.co`
- Anon Key: Found in Settings → API

### 5. Update Info.plist

Add network permissions for Supabase:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

Or specifically for your Supabase domain:

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

### 6. Run the App

1. Select your target device or simulator
2. Press Cmd+R to build and run
3. The home screen should load with destinations from your Supabase database

## Architecture

### MVVM Pattern
- **Models**: Data structures (Destination, Category)
- **Views**: SwiftUI views (HomeView, DestinationCard)
- **ViewModels**: Business logic (HomeViewModel)
- **Services**: API calls (SupabaseService)

### Key Technologies
- **SwiftUI**: Declarative UI framework
- **Combine**: Reactive programming for search debouncing
- **Async/Await**: Modern concurrency for API calls
- **Supabase Swift**: Database client

## Customization

### Change Grid Layout

Edit `DestinationGridView.swift`:
```swift
private let columns = [
    GridItem(.adaptive(minimum: 150), spacing: 16)
]
```

Adjust `minimum` to control card size.

### Add More Categories

Edit `Models/Destination.swift`:
```swift
static let all = [
    Category(id: "", label: "All", icon: "🌍"),
    Category(id: "restaurant", label: "Restaurant", icon: "🍽️"),
    // Add more...
]
```

### Styling

All views use SwiftUI's native styling. Customize colors, fonts, and spacing in individual view files.

## Next Steps

### Phase 2 - Destination Detail
- Create `DestinationDetailView.swift`
- Add navigation from cards
- Show full content, map, photos

### Phase 3 - User Features
- Authentication (Supabase Auth)
- Save/bookmark destinations
- Mark as visited
- User profile

### Phase 4 - Trip Planning
- Create trips
- Add destinations to trips
- Itinerary builder

### Phase 5 - Advanced Features
- Map view with annotations
- AI recommendations
- Offline support
- Share destinations

## Troubleshooting

### Build Errors
- Clean build folder: Cmd+Shift+K
- Rebuild: Cmd+B

### Supabase Connection Issues
- Verify URL and API key
- Check network permissions in Info.plist
- Test connection in browser

### UI Issues
- Preview not working? Restart Xcode
- Layout issues? Check device size in preview

## Contributing

This is the iOS frontend for The Urban Manual. The web version uses Next.js and shares the same Supabase backend.
