import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    @State private var showSearchOverlay = false

    var body: some View {
        NavigationStack {
            ZStack {
                // Background color
                Color(UIColor.systemBackground)
                    .ignoresSafeArea()

                if viewModel.isLoading {
                    ProgressView("Loading destinations...")
                } else if let errorMessage = viewModel.errorMessage {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 50))
                            .foregroundColor(.orange)
                        Text(errorMessage)
                            .multilineTextAlignment(.center)
                        Button("Retry") {
                            Task {
                                await viewModel.loadDestinations()
                            }
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding()
                } else {
                    ScrollView {
                        VStack(alignment: .leading, spacing: 20) {
                            // Search Bar
                            SearchBarView(isPresented: $showSearchOverlay)
                                .padding(.horizontal)

                            // Category Filter
                            CategoryFilterView(selectedCategory: $viewModel.selectedCategory)
                                .padding(.horizontal)

                            // City Filter
                            CityFilterView(
                                cities: viewModel.cities,
                                selectedCity: $viewModel.selectedCity,
                                viewModel: viewModel
                            )
                            .padding(.horizontal)

                            // Results Count
                            Text("\(viewModel.filteredDestinations.count) \(viewModel.filteredDestinations.count == 1 ? "destination" : "destinations")")
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .padding(.horizontal)

                            // Destination Grid
                            DestinationGridView(destinations: viewModel.filteredDestinations)
                                .padding(.horizontal)

                            if viewModel.filteredDestinations.isEmpty && !viewModel.destinations.isEmpty {
                                VStack(spacing: 16) {
                                    Text("No destinations found")
                                        .font(.title3)
                                        .foregroundColor(.secondary)

                                    Button("Clear Filters") {
                                        viewModel.clearFilters()
                                    }
                                    .buttonStyle(.borderedProminent)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 40)
                            }
                        }
                        .padding(.vertical)
                    }
                }
            }
            .navigationTitle("The Urban Manual")
            .navigationBarTitleDisplayMode(.large)
            .task {
                if viewModel.destinations.isEmpty {
                    await viewModel.loadDestinations()
                }
            }
            .sheet(isPresented: $showSearchOverlay) {
                SearchOverlayView(
                    viewModel: viewModel,
                    isPresented: $showSearchOverlay
                )
            }
        }
    }
}

#Preview {
    HomeView()
}
