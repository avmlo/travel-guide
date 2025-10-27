import SwiftUI

struct DestinationGridViewNavigable: View {
    let destinations: [Destination]

    // Adaptive grid with minimum 150pt width
    private let columns = [
        GridItem(.adaptive(minimum: 150), spacing: 16)
    ]

    var body: some View {
        LazyVGrid(columns: columns, spacing: 16) {
            ForEach(destinations) { destination in
                NavigationLink(destination: DestinationDetailView(destination: destination)) {
                    DestinationCard(destination: destination)
                }
                .buttonStyle(.plain)
                .transition(.scale.combined(with: .opacity))
            }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.8), value: destinations.count)
    }
}
