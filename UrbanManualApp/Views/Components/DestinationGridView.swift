import SwiftUI

struct DestinationGridView: View {
    let destinations: [Destination]

    // Adaptive grid with minimum 150pt width
    private let columns = [
        GridItem(.adaptive(minimum: 150), spacing: 16)
    ]

    var body: some View {
        LazyVGrid(columns: columns, spacing: 16) {
            ForEach(destinations) { destination in
                DestinationCard(destination: destination)
                    .transition(.scale.combined(with: .opacity))
            }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.8), value: destinations.count)
    }
}

#Preview {
    ScrollView {
        DestinationGridView(
            destinations: [
                Destination(
                    id: "1",
                    name: "Le Cinq",
                    slug: "le-cinq",
                    city: "paris",
                    category: "restaurant",
                    content: "Elegant French dining",
                    mainImage: nil,
                    michelinStars: 3,
                    crown: true,
                    latitude: 48.8566,
                    longitude: 2.3522
                ),
                Destination(
                    id: "2",
                    name: "The Ivy",
                    slug: "the-ivy",
                    city: "london",
                    category: "restaurant",
                    content: "British cuisine",
                    mainImage: nil,
                    michelinStars: 0,
                    crown: false,
                    latitude: 51.5074,
                    longitude: -0.1278
                )
            ]
        )
        .padding()
    }
}
