# Building a Native iOS App for Urban Manual

**Date:** October 27, 2025
**Goal:** Create a truly native Swift iOS app that feels like a premium iOS experience, not a web wrapper

---

## Why Native iOS?

### **Benefits:**
- ✅ **Native performance** - Smooth 60fps animations
- ✅ **iOS design patterns** - SwiftUI, native navigation
- ✅ **Platform features** - Face ID, Apple Pay, Widgets, Live Activities
- ✅ **Offline support** - Core Data, local caching
- ✅ **App Store presence** - Discoverability and credibility
- ✅ **Push notifications** - Re-engagement
- ✅ **Better UX** - Native gestures, haptics, animations

### **Urban Manual iOS App Vision:**
- Magazine-quality interface with native iOS design
- Smooth scrolling and animations
- Native map integration (Apple Maps)
- Offline destination browsing
- Save destinations with iCloud sync
- Share destinations via native share sheet
- Widgets for "Destination of the Day"
- Live Activities for trip planning

---

## Architecture Overview

### **Hybrid Approach (Recommended):**

```
┌─────────────────────────────────────┐
│     Native Swift iOS App (SwiftUI)  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  UI Layer (100% Native)      │  │
│  │  - SwiftUI Views             │  │
│  │  - Native Navigation         │  │
│  │  - Animations                │  │
│  └──────────────────────────────┘  │
│              ↓                      │
│  ┌──────────────────────────────┐  │
│  │  Data Layer                  │  │
│  │  - Core Data (offline)       │  │
│  │  - URLSession (API calls)    │  │
│  │  - Combine (reactive)        │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Next.js Backend (Existing)        │
│   - Supabase Database               │
│   - tRPC API                        │
│   - Authentication                  │
└─────────────────────────────────────┘
```

**Key Point:** 
- **UI = 100% Native Swift/SwiftUI**
- **Data = API calls to your existing Next.js backend**
- **No web views, no wrappers**

---

## Step-by-Step Implementation Plan

### **Phase 1: Setup & Foundation** (Week 1)

#### 1.1 Create Xcode Project
```bash
# Requirements:
- macOS with Xcode 15+
- Apple Developer Account ($99/year for App Store)
- iOS 17+ target

# Project Setup:
1. Open Xcode
2. Create New Project → iOS → App
3. Product Name: "Urban Manual"
4. Interface: SwiftUI
5. Language: Swift
6. Storage: Core Data
```

#### 1.2 Project Structure
```
UrbanManual/
├── App/
│   ├── UrbanManualApp.swift       # App entry point
│   └── ContentView.swift           # Root view
├── Models/
│   ├── Destination.swift           # Data models
│   ├── City.swift
│   └── Category.swift
├── Views/
│   ├── Home/
│   │   ├── HomeView.swift
│   │   ├── DestinationCard.swift
│   │   └── CategoryFilter.swift
│   ├── Destination/
│   │   ├── DestinationDetailView.swift
│   │   └── DestinationMapView.swift
│   ├── Explore/
│   │   ├── ExploreView.swift
│   │   └── CityListView.swift
│   └── Saved/
│       └── SavedView.swift
├── Services/
│   ├── APIService.swift            # API calls to Next.js
│   ├── AuthService.swift           # Supabase auth
│   └── CacheService.swift          # Offline support
├── ViewModels/
│   ├── HomeViewModel.swift
│   ├── DestinationViewModel.swift
│   └── ExploreViewModel.swift
└── Resources/
    ├── Assets.xcassets
    └── Fonts/
```

#### 1.3 Install Dependencies
```swift
// Package.swift or SPM in Xcode
dependencies: [
    // Supabase SDK for auth & data
    .package(url: "https://github.com/supabase/supabase-swift", from: "2.0.0"),
    
    // Kingfisher for image loading
    .package(url: "https://github.com/onevcat/Kingfisher.git", from: "7.0.0"),
    
    // SwiftUI Navigation (optional)
    .package(url: "https://github.com/pointfreeco/swift-composable-architecture", from: "1.0.0")
]
```

---

### **Phase 2: Data Models & API Integration** (Week 1-2)

#### 2.1 Create Swift Models
```swift
// Models/Destination.swift
import Foundation

struct Destination: Identifiable, Codable {
    let id: String
    let slug: String
    let name: String
    let city: String
    let country: String
    let category: Category
    let mainImage: String?
    let description: String?
    let address: String?
    let latitude: Double?
    let longitude: Double?
    let website: String?
    let phone: String?
    let instagram: String?
    let priceRange: String?
    let vibes: [String]?
    let amenities: [String]?
    let michelinStars: Int?
    let isTopPick: Bool
    
    var coordinate: CLLocationCoordinate2D? {
        guard let lat = latitude, let lon = longitude else { return nil }
        return CLLocationCoordinate2D(latitude: lat, longitude: lon)
    }
}

enum Category: String, Codable, CaseIterable {
    case restaurant = "Restaurant"
    case cafe = "Cafe"
    case hotel = "Hotel"
    case bar = "Bar"
    case shop = "Shop"
    case bakery = "Bakery"
    case culture = "Culture"
    case others = "Others"
    
    var emoji: String {
        switch self {
        case .restaurant: return "🍽️"
        case .cafe: return "☕"
        case .hotel: return "🏨"
        case .bar: return "🍸"
        case .shop: return "🛍️"
        case .bakery: return "🥐"
        case .culture: return "🎨"
        case .others: return "📍"
        }
    }
}
```

#### 2.2 Create API Service
```swift
// Services/APIService.swift
import Foundation
import Supabase

class APIService {
    static let shared = APIService()
    
    private let supabase: SupabaseClient
    
    private init() {
        supabase = SupabaseClient(
            supabaseURL: URL(string: "https://avdnefdfwvpjkuanhdwk.supabase.co")!,
            supabaseKey: "your-anon-key"
        )
    }
    
    // Fetch all destinations
    func fetchDestinations() async throws -> [Destination] {
        let response: [Destination] = try await supabase
            .from("destinations")
            .select()
            .order("name")
            .execute()
            .value
        
        return response
    }
    
    // Fetch destinations by city
    func fetchDestinations(city: String) async throws -> [Destination] {
        let response: [Destination] = try await supabase
            .from("destinations")
            .select()
            .eq("city", value: city)
            .execute()
            .value
        
        return response
    }
    
    // Fetch destination by slug
    func fetchDestination(slug: String) async throws -> Destination {
        let response: [Destination] = try await supabase
            .from("destinations")
            .select()
            .eq("slug", value: slug)
            .single()
            .execute()
            .value
        
        return response.first!
    }
    
    // Search destinations
    func searchDestinations(query: String) async throws -> [Destination] {
        let response: [Destination] = try await supabase
            .from("destinations")
            .select()
            .textSearch("name", query: query)
            .execute()
            .value
        
        return response
    }
}
```

---

### **Phase 3: SwiftUI Views** (Week 2-3)

#### 3.1 Home View
```swift
// Views/Home/HomeView.swift
import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    @State private var selectedCategory: Category? = nil
    @State private var searchText = ""
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    // Header
                    headerView
                    
                    // Search Bar
                    searchBar
                    
                    // Category Filter
                    categoryFilter
                    
                    // Destinations Grid
                    destinationsGrid
                }
            }
            .navigationTitle("Urban Manual")
            .navigationBarTitleDisplayMode(.large)
            .task {
                await viewModel.loadDestinations()
            }
        }
    }
    
    private var headerView: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Curated Destinations")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("\(viewModel.destinations.count) places worldwide")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
    }
    
    private var searchBar: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(.secondary)
            
            TextField("Search destinations...", text: $searchText)
                .textFieldStyle(.plain)
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(12)
        .padding(.horizontal)
    }
    
    private var categoryFilter: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(Category.allCases, id: \.self) { category in
                    CategoryChip(
                        category: category,
                        isSelected: selectedCategory == category
                    ) {
                        selectedCategory = selectedCategory == category ? nil : category
                    }
                }
            }
            .padding(.horizontal)
        }
        .padding(.vertical)
    }
    
    private var destinationsGrid: some View {
        LazyVGrid(columns: [
            GridItem(.flexible(), spacing: 16),
            GridItem(.flexible(), spacing: 16)
        ], spacing: 16) {
            ForEach(filteredDestinations) { destination in
                NavigationLink(value: destination) {
                    DestinationCard(destination: destination)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal)
        .navigationDestination(for: Destination.self) { destination in
            DestinationDetailView(destination: destination)
        }
    }
    
    private var filteredDestinations: [Destination] {
        var destinations = viewModel.destinations
        
        if let category = selectedCategory {
            destinations = destinations.filter { $0.category == category }
        }
        
        if !searchText.isEmpty {
            destinations = destinations.filter {
                $0.name.localizedCaseInsensitiveContains(searchText) ||
                $0.city.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        return destinations
    }
}
```

#### 3.2 Destination Card
```swift
// Views/Home/DestinationCard.swift
import SwiftUI
import Kingfisher

struct DestinationCard: View {
    let destination: Destination
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Image
            if let imageURL = destination.mainImage {
                KFImage(URL(string: imageURL))
                    .resizable()
                    .aspectRatio(3/4, contentMode: .fill)
                    .clipped()
                    .cornerRadius(12)
            } else {
                Rectangle()
                    .fill(.gray.opacity(0.2))
                    .aspectRatio(3/4, contentMode: .fill)
                    .cornerRadius(12)
                    .overlay {
                        Image(systemName: "photo")
                            .font(.largeTitle)
                            .foregroundStyle(.secondary)
                    }
            }
            
            // Info
            VStack(alignment: .leading, spacing: 4) {
                Text(destination.name)
                    .font(.headline)
                    .lineLimit(2)
                
                HStack(spacing: 4) {
                    Text(destination.city)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    
                    Text("•")
                        .foregroundStyle(.secondary)
                    
                    Text(destination.category.rawValue)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                
                // Michelin stars
                if let stars = destination.michelinStars, stars > 0 {
                    HStack(spacing: 2) {
                        ForEach(0..<stars, id: \.self) { _ in
                            Image(systemName: "star.fill")
                                .font(.caption2)
                                .foregroundStyle(.yellow)
                        }
                    }
                }
            }
        }
    }
}
```

#### 3.3 Destination Detail View
```swift
// Views/Destination/DestinationDetailView.swift
import SwiftUI
import MapKit

struct DestinationDetailView: View {
    let destination: Destination
    @State private var isSaved = false
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Hero Image
                heroImage
                
                // Content
                VStack(alignment: .leading, spacing: 16) {
                    // Title & Category
                    titleSection
                    
                    // Quick Info
                    quickInfoSection
                    
                    // Description
                    if let description = destination.description {
                        Text(description)
                            .font(.body)
                            .foregroundStyle(.secondary)
                    }
                    
                    // Map
                    if let coordinate = destination.coordinate {
                        mapSection(coordinate: coordinate)
                    }
                    
                    // Contact Info
                    contactSection
                    
                    // Vibes
                    if let vibes = destination.vibes, !vibes.isEmpty {
                        vibesSection(vibes: vibes)
                    }
                }
                .padding()
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    isSaved.toggle()
                } label: {
                    Image(systemName: isSaved ? "heart.fill" : "heart")
                        .foregroundStyle(isSaved ? .red : .primary)
                }
            }
            
            ToolbarItem(placement: .topBarTrailing) {
                ShareLink(item: URL(string: "https://urbanmanual.com/destination/\(destination.slug)")!)
            }
        }
    }
    
    private var heroImage: some View {
        Group {
            if let imageURL = destination.mainImage {
                KFImage(URL(string: imageURL))
                    .resizable()
                    .aspectRatio(4/3, contentMode: .fill)
                    .clipped()
            } else {
                Rectangle()
                    .fill(.gray.opacity(0.2))
                    .aspectRatio(4/3, contentMode: .fill)
            }
        }
    }
    
    private var titleSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(destination.name)
                .font(.title)
                .fontWeight(.bold)
            
            HStack {
                Text(destination.category.emoji)
                Text(destination.category.rawValue)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
    }
    
    private var quickInfoSection: some View {
        HStack(spacing: 16) {
            if let priceRange = destination.priceRange {
                Label(priceRange, systemImage: "dollarsign.circle")
                    .font(.caption)
            }
            
            if let stars = destination.michelinStars, stars > 0 {
                HStack(spacing: 2) {
                    ForEach(0..<stars, id: \.self) { _ in
                        Image(systemName: "star.fill")
                            .foregroundStyle(.yellow)
                    }
                }
                .font(.caption)
            }
        }
    }
    
    private func mapSection(coordinate: CLLocationCoordinate2D) -> some View {
        Map(initialPosition: .region(MKCoordinateRegion(
            center: coordinate,
            span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01)
        ))) {
            Marker(destination.name, coordinate: coordinate)
        }
        .frame(height: 200)
        .cornerRadius(12)
    }
    
    private var contactSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            if let address = destination.address {
                Label(address, systemImage: "mappin.circle")
            }
            
            if let website = destination.website {
                Link(destination: URL(string: website)!) {
                    Label("Visit Website", systemImage: "safari")
                }
            }
            
            if let phone = destination.phone {
                Link(destination: URL(string: "tel:\(phone)")!) {
                    Label(phone, systemImage: "phone")
                }
            }
            
            if let instagram = destination.instagram {
                Link(destination: URL(string: "https://instagram.com/\(instagram)")!) {
                    Label("@\(instagram)", systemImage: "camera")
                }
            }
        }
        .font(.subheadline)
    }
    
    private func vibesSection(vibes: [String]) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Vibe")
                .font(.headline)
            
            FlowLayout(spacing: 8) {
                ForEach(vibes, id: \.self) { vibe in
                    Text(vibe)
                        .font(.caption)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(.ultraThinMaterial)
                        .cornerRadius(8)
                }
            }
        }
    }
}
```

---

### **Phase 4: Advanced Features** (Week 3-4)

#### 4.1 Offline Support with Core Data
```swift
// Services/CacheService.swift
import CoreData

class CacheService {
    static let shared = CacheService()
    
    lazy var persistentContainer: NSPersistentContainer = {
        let container = NSPersistentContainer(name: "UrbanManual")
        container.loadPersistentStores { _, error in
            if let error = error {
                fatalError("Core Data error: \(error)")
            }
        }
        return container
    }()
    
    func saveDestinations(_ destinations: [Destination]) {
        let context = persistentContainer.viewContext
        
        // Clear old data
        let fetchRequest: NSFetchRequest<NSFetchRequestResult> = DestinationEntity.fetchRequest()
        let deleteRequest = NSBatchDeleteRequest(fetchRequest: fetchRequest)
        try? context.execute(deleteRequest)
        
        // Save new data
        for destination in destinations {
            let entity = DestinationEntity(context: context)
            entity.id = destination.id
            entity.name = destination.name
            entity.city = destination.city
            // ... map other fields
        }
        
        try? context.save()
    }
    
    func fetchCachedDestinations() -> [Destination] {
        let context = persistentContainer.viewContext
        let fetchRequest: NSFetchRequest<DestinationEntity> = DestinationEntity.fetchRequest()
        
        guard let entities = try? context.fetch(fetchRequest) else {
            return []
        }
        
        return entities.compactMap { entity in
            // Convert entity to Destination model
            Destination(
                id: entity.id ?? "",
                slug: entity.slug ?? "",
                name: entity.name ?? "",
                // ... map other fields
            )
        }
    }
}
```

#### 4.2 Home Screen Widget
```swift
// Widgets/DestinationWidget.swift
import WidgetKit
import SwiftUI

struct DestinationWidget: Widget {
    let kind: String = "DestinationWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            DestinationWidgetView(entry: entry)
        }
        .configurationDisplayName("Destination of the Day")
        .description("Discover a new curated destination every day")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct DestinationWidgetView: View {
    var entry: Provider.Entry
    
    var body: some View {
        ZStack {
            // Background image
            if let imageURL = entry.destination.mainImage {
                AsyncImage(url: URL(string: imageURL)) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Color.gray
                }
            }
            
            // Overlay
            LinearGradient(
                colors: [.clear, .black.opacity(0.8)],
                startPoint: .top,
                endPoint: .bottom
            )
            
            // Content
            VStack(alignment: .leading) {
                Spacer()
                
                Text(entry.destination.name)
                    .font(.headline)
                    .foregroundStyle(.white)
                
                Text(entry.destination.city)
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.8))
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}
```

#### 4.3 Push Notifications
```swift
// Services/NotificationService.swift
import UserNotifications

class NotificationService {
    static let shared = NotificationService()
    
    func requestAuthorization() async -> Bool {
        do {
            return try await UNUserNotificationCenter.current()
                .requestAuthorization(options: [.alert, .badge, .sound])
        } catch {
            return false
        }
    }
    
    func scheduleDestinationReminder(destination: Destination, date: Date) {
        let content = UNMutableNotificationContent()
        content.title = "Don't forget to visit!"
        content.body = destination.name
        content.sound = .default
        
        let trigger = UNCalendarNotificationTrigger(
            dateMatching: Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: date),
            repeats: false
        )
        
        let request = UNNotificationRequest(
            identifier: destination.id,
            content: content,
            trigger: trigger
        )
        
        UNUserNotificationCenter.current().add(request)
    }
}
```

---

### **Phase 5: Polish & App Store** (Week 4-5)

#### 5.1 App Icon
- Create app icon in 1024x1024px
- Use your "UM" favicon design
- Add to Assets.xcassets

#### 5.2 Launch Screen
```swift
// LaunchScreen.storyboard or SwiftUI
struct LaunchScreenView: View {
    var body: some View {
        ZStack {
            Color.white
            
            VStack {
                Text("UM")
                    .font(.system(size: 80, weight: .light, design: .serif))
                
                Text("URBAN MANUAL")
                    .font(.caption)
                    .tracking(4)
            }
        }
    }
}
```

#### 5.3 App Store Assets
- Screenshots (6.7", 6.5", 5.5")
- App Preview video (optional)
- App Store description
- Keywords
- Privacy policy URL

---

## Cost Breakdown

### **Development:**
- **Apple Developer Account:** $99/year (required for App Store)
- **Mac with Xcode:** Free (if you have a Mac)
- **Backend:** $0 (using existing Next.js/Supabase)
- **Total:** $99/year

### **Optional:**
- **TestFlight beta testing:** Free
- **App Store optimization tools:** $0-50/month
- **Analytics (Firebase):** Free tier

---

## Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **Phase 1** | 1 week | Project setup, architecture |
| **Phase 2** | 1 week | Data models, API integration |
| **Phase 3** | 2 weeks | Core UI (Home, Detail, Explore) |
| **Phase 4** | 1 week | Offline, widgets, notifications |
| **Phase 5** | 1 week | Polish, App Store submission |
| **Total** | **6 weeks** | Native iOS app in App Store |

---

## Alternative: React Native (Faster but less native)

If you want to reuse some web code:

### **Pros:**
- ✅ Share business logic with web
- ✅ Faster development (3-4 weeks)
- ✅ Single codebase for iOS + Android
- ✅ Still feels pretty native with Expo

### **Cons:**
- ❌ Not 100% native feeling
- ❌ Larger app size
- ❌ Some platform features harder to access
- ❌ Performance slightly worse

### **Tech Stack:**
```
- React Native + Expo
- React Navigation
- React Native Maps
- Reanimated for animations
- Same Supabase backend
```

---

## My Recommendation

### **For Urban Manual:**

**Go with Native Swift + SwiftUI** because:

1. ✅ **Brand positioning** - You're a premium, curated brand. Native = premium.
2. ✅ **Performance** - Smooth scrolling through 921 destinations
3. ✅ **iOS-first** - Your audience likely skews iOS
4. ✅ **Future-proof** - Easy to add Apple Watch, Vision Pro later
5. ✅ **Learning** - Swift is valuable skill, great ecosystem

**Start with:**
- Home view (destination grid)
- Detail view (destination info)
- Basic search/filter
- Save functionality

**Add later:**
- Offline support
- Widgets
- Push notifications
- Trip planning

---

## Next Steps

Would you like me to:

1. **Create the Xcode project structure** - Set up the initial Swift project
2. **Build a prototype** - Create the first few views
3. **Write the API integration** - Connect to your Supabase backend
4. **Create a React Native version** - If you prefer faster development

Let me know which direction you want to go!

