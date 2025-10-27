import SwiftUI

struct SavedPlacesView: View {
    @StateObject private var viewModel = SavedPlacesViewModel()
    @State private var selectedFilter: PlaceFilter = .saved

    enum PlaceFilter: String, CaseIterable {
        case saved = "Saved"
        case visited = "Visited"
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Filter picker
                Picker("Filter", selection: $selectedFilter) {
                    ForEach(PlaceFilter.allCases, id: \.self) { filter in
                        Text(filter.rawValue).tag(filter)
                    }
                }
                .pickerStyle(.segmented)
                .padding()

                // Content
                if viewModel.isLoading {
                    ProgressView()
                        .frame(maxHeight: .infinity)
                } else {
                    let destinations = selectedFilter == .saved ? viewModel.savedDestinations : viewModel.visitedDestinations

                    if destinations.isEmpty {
                        emptyStateView
                    } else {
                        ScrollView {
                            LazyVGrid(
                                columns: [GridItem(.adaptive(minimum: 150), spacing: 16)],
                                spacing: 16
                            ) {
                                ForEach(destinations) { destination in
                                    NavigationLink(destination: DestinationDetailView(destination: destination)) {
                                        DestinationCard(destination: destination)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                            .padding()
                        }
                    }
                }
            }
            .navigationTitle("My Places")
            .task {
                await viewModel.loadPlaces()
            }
            .refreshable {
                await viewModel.loadPlaces()
            }
        }
    }

    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: selectedFilter == .saved ? "bookmark" : "checkmark.circle")
                .font(.system(size: 60))
                .foregroundColor(.secondary)

            Text("No \(selectedFilter.rawValue.lowercased()) places")
                .font(.title2)
                .fontWeight(.semibold)

            Text("Start exploring and \(selectedFilter == .saved ? "save" : "mark") places you love")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
        .frame(maxHeight: .infinity)
    }
}

@MainActor
class SavedPlacesViewModel: ObservableObject {
    @Published var savedDestinations: [Destination] = []
    @Published var visitedDestinations: [Destination] = []
    @Published var isLoading: Bool = false

    private let supabaseService = SupabaseService.shared

    func loadPlaces() async {
        isLoading = true

        do {
            async let saved = supabaseService.fetchSavedPlaces()
            async let visited = supabaseService.fetchVisitedPlaces()

            savedDestinations = try await saved
            visitedDestinations = try await visited
        } catch {
            print("Error loading places: \(error)")
        }

        isLoading = false
    }
}

#Preview {
    SavedPlacesView()
}
