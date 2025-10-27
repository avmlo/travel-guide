import SwiftUI

struct DestinationCard: View {
    let destination: Destination
    @State private var imageLoaded = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Image
            ZStack(alignment: .topTrailing) {
                if let imageUrl = destination.mainImage, let url = URL(string: imageUrl) {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .empty:
                            Rectangle()
                                .fill(Color(UIColor.systemGray5))
                                .overlay(
                                    ProgressView()
                                )
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .transition(.opacity)
                        case .failure:
                            Rectangle()
                                .fill(Color(UIColor.systemGray5))
                                .overlay(
                                    Image(systemName: "photo")
                                        .foregroundColor(.secondary)
                                        .font(.title)
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
                                .foregroundColor(.secondary)
                                .font(.title)
                        )
                }

                // Crown badge for special places
                if destination.crown {
                    Image(systemName: "crown.fill")
                        .font(.caption)
                        .foregroundColor(.yellow)
                        .padding(8)
                        .background(
                            Circle()
                                .fill(.ultraThinMaterial)
                        )
                        .padding(8)
                }
            }
            .frame(height: 150)
            .clipped()
            .cornerRadius(12)

            // Details
            VStack(alignment: .leading, spacing: 4) {
                // Name
                Text(destination.name)
                    .font(.system(size: 14, weight: .semibold))
                    .lineLimit(2)
                    .foregroundColor(.primary)

                // Location
                Text(capitalizeCity(destination.city))
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(1)

                // Category & Michelin
                HStack(spacing: 4) {
                    Text(destination.category.capitalized)
                        .font(.caption2)
                        .foregroundColor(.secondary)

                    if destination.michelinStars > 0 {
                        HStack(spacing: 2) {
                            ForEach(0..<destination.michelinStars, id: \.self) { _ in
                                Image(systemName: "star.fill")
                                    .font(.system(size: 8))
                                    .foregroundColor(.red)
                            }
                        }
                    }
                }
            }
            .padding(.top, 8)
        }
        .contentShape(Rectangle())
        .onTapGesture {
            // TODO: Navigate to destination detail
            print("Tapped: \(destination.name)")
        }
    }

    // Get icon based on category
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
        return city
            .split(separator: "-")
            .map { $0.capitalized }
            .joined(separator: " ")
    }
}

#Preview {
    HStack(spacing: 16) {
        DestinationCard(
            destination: Destination(
                id: "1",
                name: "Le Cinq",
                slug: "le-cinq",
                city: "paris",
                category: "restaurant",
                content: "Elegant French dining with exceptional service",
                mainImage: nil,
                michelinStars: 3,
                crown: true,
                latitude: 48.8566,
                longitude: 2.3522
            )
        )
        .frame(width: 150)

        DestinationCard(
            destination: Destination(
                id: "2",
                name: "The Wolseley",
                slug: "the-wolseley",
                city: "london",
                category: "cafe",
                content: "Grand European café",
                mainImage: nil,
                michelinStars: 0,
                crown: false,
                latitude: 51.5074,
                longitude: -0.1278
            )
        )
        .frame(width: 150)
    }
    .padding()
}
