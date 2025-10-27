import SwiftUI

struct SearchBarView: View {
    @Binding var isPresented: Bool

    var body: some View {
        Button(action: {
            isPresented = true
        }) {
            HStack(spacing: 12) {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.secondary)
                    .font(.system(size: 16))

                Text("Search destinations...")
                    .foregroundColor(.secondary)
                    .font(.system(size: 16))

                Spacer()
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(Color(UIColor.systemGray6))
            .cornerRadius(12)
        }
        .buttonStyle(.plain)
    }
}

struct SearchOverlayView: View {
    @ObservedObject var viewModel: HomeViewModel
    @Binding var isPresented: Bool
    @FocusState private var isSearchFocused: Bool

    var body: some View {
        NavigationStack {
            VStack {
                // Search field
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.secondary)

                    TextField("Search destinations...", text: $viewModel.searchQuery)
                        .focused($isSearchFocused)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)

                    if !viewModel.searchQuery.isEmpty {
                        Button(action: {
                            viewModel.searchQuery = ""
                        }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(.secondary)
                        }
                    }
                }
                .padding()
                .background(Color(UIColor.systemGray6))
                .cornerRadius(10)
                .padding()

                // Results
                if viewModel.filteredDestinations.isEmpty && !viewModel.searchQuery.isEmpty {
                    ContentUnavailableView(
                        "No Results",
                        systemImage: "magnifyingglass",
                        description: Text("Try searching for something else")
                    )
                } else {
                    List(viewModel.filteredDestinations) { destination in
                        Button(action: {
                            // TODO: Navigate to destination detail
                            isPresented = false
                        }) {
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(destination.name)
                                        .font(.headline)

                                    Text(viewModel.capitalizeCity(destination.city))
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }

                                Spacer()

                                Text(destination.category.capitalized)
                                    .font(.caption)
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(Color.blue)
                                    .cornerRadius(6)
                            }
                        }
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Search")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        isPresented = false
                    }
                }
            }
            .onAppear {
                isSearchFocused = true
            }
        }
    }
}

#Preview {
    SearchBarView(isPresented: .constant(false))
}
