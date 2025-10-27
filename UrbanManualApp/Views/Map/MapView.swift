import SwiftUI
import MapKit

struct ExploreMapView: View {
    @StateObject private var viewModel = MapViewModel()
    @State private var selectedDestination: Destination?
    @State private var showFilters = false

    var body: some View {
        ZStack(alignment: .top) {
            // Map
            Map(position: $viewModel.cameraPosition, selection: $selectedDestination) {
                ForEach(viewModel.filteredDestinations) { destination in
                    if let lat = destination.latitude, let lon = destination.longitude {
                        Marker(
                            destination.name,
                            coordinate: CLLocationCoordinate2D(latitude: lat, longitude: lon)
                        )
                        .tint(markerColor(for: destination))
                        .tag(destination)
                    }
                }
            }
            .mapStyle(.standard(elevation: .realistic))
            .mapControls {
                MapUserLocationButton()
                MapCompass()
                MapScaleView()
            }
            .ignoresSafeArea()

            // Search and filter bar
            VStack(spacing: 12) {
                HStack {
                    // Search
                    Button(action: {
                        viewModel.showSearch = true
                    }) {
                        HStack {
                            Image(systemName: "magnifyingglass")
                            Text("Search destinations...")
                                .foregroundColor(.secondary)
                            Spacer()
                        }
                        .padding()
                        .background(.ultraThinMaterial)
                        .cornerRadius(12)
                    }

                    // Filter button
                    Button(action: {
                        showFilters.toggle()
                    }) {
                        Image(systemName: "slider.horizontal.3")
                            .padding()
                            .background(.ultraThinMaterial)
                            .cornerRadius(12)
                    }
                }
                .padding(.horizontal)
                .padding(.top)

                // Category filters
                if showFilters {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            ForEach(Category.all) { category in
                                Button(action: {
                                    viewModel.selectedCategory = category.id == viewModel.selectedCategory ? "" : category.id
                                }) {
                                    HStack(spacing: 6) {
                                        Text(category.icon)
                                        Text(category.label)
                                            .font(.caption)
                                    }
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 8)
                                    .background(
                                        viewModel.selectedCategory == category.id ?
                                        Color.blue : Color(UIColor.systemGray6)
                                    )
                                    .foregroundColor(
                                        viewModel.selectedCategory == category.id ?
                                        .white : .primary
                                    )
                                    .cornerRadius(20)
                                }
                            }
                        }
                        .padding(.horizontal)
                    }
                    .frame(height: 40)
                    .background(.ultraThinMaterial)
                }
            }

            // Selected destination card
            if let destination = selectedDestination {
                VStack {
                    Spacer()

                    MapDestinationCard(destination: destination) {
                        viewModel.showDestinationDetail = destination
                        selectedDestination = nil
                    }
                    .padding()
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }
            }
        }
        .sheet(isPresented: $viewModel.showSearch) {
            SearchOverlayView(viewModel: viewModel.homeViewModel, isPresented: $viewModel.showSearch)
        }
        .sheet(item: $viewModel.showDestinationDetail) { destination in
            NavigationStack {
                DestinationDetailView(destination: destination)
            }
        }
        .task {
            await viewModel.loadDestinations()
        }
    }

    private func markerColor(for destination: Destination) -> Color {
        switch destination.category.lowercased() {
        case "restaurant": return .red
        case "cafe": return .brown
        case "hotel": return .blue
        case "bar": return .purple
        case "shop": return .green
        case "bakery": return .orange
        default: return .gray
        }
    }
}

struct MapDestinationCard: View {
    let destination: Destination
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                // Image thumbnail
                if let imageUrl = destination.mainImage, let url = URL(string: imageUrl) {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        default:
                            Rectangle()
                                .fill(Color(UIColor.systemGray5))
                        }
                    }
                    .frame(width: 60, height: 60)
                    .cornerRadius(8)
                }

                // Info
                VStack(alignment: .leading, spacing: 4) {
                    Text(destination.name)
                        .font(.headline)
                        .lineLimit(1)

                    Text(capitalizeCity(destination.city))
                        .font(.caption)
                        .foregroundColor(.secondary)

                    Text(destination.category.capitalized)
                        .font(.caption2)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(Color.blue.opacity(0.2))
                        .foregroundColor(.blue)
                        .cornerRadius(4)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .foregroundColor(.secondary)
                    .font(.caption)
            }
            .padding()
            .background(.ultraThinMaterial)
            .cornerRadius(12)
            .shadow(radius: 4)
        }
        .buttonStyle(.plain)
    }

    private func capitalizeCity(_ city: String) -> String {
        city.split(separator: "-").map { $0.capitalized }.joined(separator: " ")
    }
}

@MainActor
class MapViewModel: ObservableObject {
    @Published var destinations: [Destination] = []
    @Published var selectedCategory: String = ""
    @Published var cameraPosition: MapCameraPosition = .automatic
    @Published var showSearch: Bool = false
    @Published var showDestinationDetail: Destination?

    let homeViewModel = HomeViewModel()

    private let supabaseService = SupabaseService.shared

    var filteredDestinations: [Destination] {
        if selectedCategory.isEmpty {
            return destinations.filter { $0.latitude != nil && $0.longitude != nil }
        } else {
            return destinations.filter {
                $0.latitude != nil && $0.longitude != nil &&
                $0.category.localizedCaseInsensitiveContains(selectedCategory)
            }
        }
    }

    func loadDestinations() async {
        do {
            destinations = try await supabaseService.fetchDestinations()

            // Center on first destination with coordinates
            if let first = destinations.first(where: { $0.latitude != nil && $0.longitude != nil }),
               let lat = first.latitude,
               let lon = first.longitude {
                cameraPosition = .region(MKCoordinateRegion(
                    center: CLLocationCoordinate2D(latitude: lat, longitude: lon),
                    span: MKCoordinateSpan(latitudeDelta: 20, longitudeDelta: 20)
                ))
            }
        } catch {
            print("Error loading destinations: \(error)")
        }
    }
}

#Preview {
    ExploreMapView()
}
