import SwiftUI
import MapKit

struct DestinationDetailView: View {
    let destination: Destination
    @StateObject private var viewModel: DestinationDetailViewModel
    @Environment(\.dismiss) private var dismiss

    init(destination: Destination) {
        self.destination = destination
        _viewModel = StateObject(wrappedValue: DestinationDetailViewModel(destination: destination))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // Hero Image
                heroImageSection

                // Content
                VStack(alignment: .leading, spacing: 20) {
                    // Title & Location
                    headerSection

                    Divider()

                    // Actions (Save, Visited)
                    actionsSection

                    Divider()

                    // Details
                    detailsSection

                    // Map
                    if destination.latitude != nil && destination.longitude != nil {
                        mapSection
                    }

                    // Add to Trip
                    addToTripSection
                }
                .padding()
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                ShareLink(item: shareText) {
                    Image(systemName: "square.and.arrow.up")
                }
            }
        }
        .task {
            await viewModel.loadData()
        }
    }

    // MARK: - Sections

    private var heroImageSection: some View {
        ZStack(alignment: .topTrailing) {
            if let imageUrl = destination.mainImage, let url = URL(string: imageUrl) {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .empty:
                        Rectangle()
                            .fill(Color(UIColor.systemGray5))
                            .overlay(ProgressView())
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    case .failure:
                        Rectangle()
                            .fill(Color(UIColor.systemGray5))
                            .overlay(
                                Image(systemName: "photo")
                                    .font(.largeTitle)
                                    .foregroundColor(.secondary)
                            )
                    @unknown default:
                        EmptyView()
                    }
                }
            } else {
                Rectangle()
                    .fill(Color(UIColor.systemGray5))
                    .overlay(
                        Image(systemName: categoryIcon)
                            .font(.system(size: 60))
                            .foregroundColor(.secondary)
                    )
            }

            // Crown badge
            if destination.crown {
                Image(systemName: "crown.fill")
                    .font(.title2)
                    .foregroundColor(.yellow)
                    .padding()
                    .background(
                        Circle()
                            .fill(.ultraThinMaterial)
                    )
                    .padding()
            }
        }
        .frame(height: 300)
        .clipped()
    }

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(destination.name)
                .font(.title)
                .fontWeight(.bold)

            HStack {
                Image(systemName: "mappin.and.ellipse")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Text(capitalizeCity(destination.city))
                    .font(.subheadline)
                    .foregroundColor(.secondary)

                Spacer()

                Text(destination.category.capitalized)
                    .font(.caption)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.blue.opacity(0.1))
                    .foregroundColor(.blue)
                    .cornerRadius(8)
            }

            // Michelin stars
            if destination.michelinStars > 0 {
                HStack(spacing: 4) {
                    ForEach(0..<destination.michelinStars, id: \.self) { _ in
                        Image(systemName: "star.fill")
                            .foregroundColor(.red)
                    }
                    Text("\(destination.michelinStars) Michelin Star\(destination.michelinStars > 1 ? "s" : "")")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
    }

    private var actionsSection: some View {
        HStack(spacing: 16) {
            // Save button
            Button(action: {
                Task {
                    await viewModel.toggleSaved()
                }
            }) {
                HStack {
                    Image(systemName: viewModel.isSaved ? "bookmark.fill" : "bookmark")
                    Text(viewModel.isSaved ? "Saved" : "Save")
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(viewModel.isSaved ? Color.blue : Color(UIColor.systemGray6))
                .foregroundColor(viewModel.isSaved ? .white : .primary)
                .cornerRadius(12)
            }

            // Visited button
            Button(action: {
                Task {
                    await viewModel.toggleVisited()
                }
            }) {
                HStack {
                    Image(systemName: viewModel.isVisited ? "checkmark.circle.fill" : "checkmark.circle")
                    Text(viewModel.isVisited ? "Visited" : "Mark Visited")
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(viewModel.isVisited ? Color.green : Color(UIColor.systemGray6))
                .foregroundColor(viewModel.isVisited ? .white : .primary)
                .cornerRadius(12)
            }
        }
    }

    private var detailsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("About")
                .font(.headline)

            Text(destination.content)
                .font(.body)
                .foregroundColor(.secondary)
                .lineLimit(nil)
        }
    }

    private var mapSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Location")
                .font(.headline)

            if let lat = destination.latitude, let lon = destination.longitude {
                Map(position: .constant(.region(MKCoordinateRegion(
                    center: CLLocationCoordinate2D(latitude: lat, longitude: lon),
                    span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01)
                )))) {
                    Marker(destination.name, coordinate: CLLocationCoordinate2D(latitude: lat, longitude: lon))
                }
                .frame(height: 200)
                .cornerRadius(12)
            }
        }
    }

    private var addToTripSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Add to Trip")
                .font(.headline)

            Button(action: {
                viewModel.showAddToTrip = true
            }) {
                HStack {
                    Image(systemName: "plus.circle.fill")
                    Text("Add to a trip")
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color(UIColor.systemGray6))
                .cornerRadius(12)
            }
            .foregroundColor(.primary)
        }
        .sheet(isPresented: $viewModel.showAddToTrip) {
            AddToTripView(destination: destination)
        }
    }

    // MARK: - Helpers

    private var categoryIcon: String {
        switch destination.category.lowercased() {
        case "restaurant": return "fork.knife"
        case "cafe": return "cup.and.saucer"
        case "hotel": return "bed.double"
        case "bar": return "wineglass"
        case "shop": return "bag"
        case "bakery": return "birthday.cake"
        default: return "mappin.and.ellipse"
        }
    }

    private func capitalizeCity(_ city: String) -> String {
        return city.split(separator: "-").map { $0.capitalized }.joined(separator: " ")
    }

    private var shareText: String {
        "Check out \(destination.name) in \(capitalizeCity(destination.city)) on The Urban Manual!"
    }
}

#Preview {
    NavigationStack {
        DestinationDetailView(
            destination: Destination(
                id: "1",
                name: "Le Cinq",
                slug: "le-cinq",
                city: "paris",
                category: "restaurant",
                content: "Le Cinq offers an exceptional fine dining experience with three Michelin stars. The elegant setting and impeccable service make it a must-visit destination in Paris.",
                mainImage: nil,
                michelinStars: 3,
                crown: true,
                latitude: 48.8566,
                longitude: 2.3522
            )
        )
    }
}
