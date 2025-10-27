import SwiftUI

struct AddToTripView: View {
    let destination: Destination
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = AddToTripViewModel()

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView()
                } else if viewModel.trips.isEmpty {
                    VStack(spacing: 20) {
                        Image(systemName: "airplane")
                            .font(.largeTitle)
                            .foregroundColor(.secondary)

                        Text("No trips yet")
                            .font(.headline)

                        Text("Create a trip first to add destinations")
                            .font(.subheadline)
                            .foregroundColor(.secondary)

                        Button("Create Trip") {
                            viewModel.showCreateTrip = true
                        }
                        .buttonStyle(.borderedProminent)
                    }
                } else {
                    List(viewModel.trips) { trip in
                        Button(action: {
                            Task {
                                await viewModel.addToTrip(trip: trip, destination: destination)
                                dismiss()
                            }
                        }) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(trip.title)
                                    .font(.headline)

                                if let dest = trip.destination {
                                    Text(dest.capitalized)
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Add to Trip")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        viewModel.showCreateTrip = true
                    }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $viewModel.showCreateTrip) {
                CreateTripView { _ in
                    await viewModel.loadTrips()
                }
            }
            .task {
                await viewModel.loadTrips()
            }
        }
    }
}

@MainActor
class AddToTripViewModel: ObservableObject {
    @Published var trips: [Trip] = []
    @Published var isLoading: Bool = false
    @Published var showCreateTrip: Bool = false

    private let supabaseService = SupabaseService.shared

    func loadTrips() async {
        isLoading = true

        do {
            trips = try await supabaseService.fetchTrips()
        } catch {
            print("Error loading trips: \(error)")
        }

        isLoading = false
    }

    func addToTrip(trip: Trip, destination: Destination) async {
        do {
            // Add as next item on the last day
            let maxDay = try await supabaseService.getMaxDay(tripId: trip.id)
            let maxOrder = try await supabaseService.getMaxOrderIndex(tripId: trip.id, day: maxDay)

            try await supabaseService.addItineraryItem(
                tripId: trip.id,
                destinationSlug: destination.slug,
                day: maxDay,
                orderIndex: maxOrder + 1,
                title: destination.name,
                description: destination.content
            )
        } catch {
            print("Error adding to trip: \(error)")
        }
    }
}

struct AddItineraryItemView: View {
    let tripId: Int
    let onItemAdded: (ItineraryItem) async -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var title: String = ""
    @State private var description: String = ""
    @State private var day: Int = 1
    @State private var time: String = ""
    @State private var isLoading: Bool = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Details") {
                    TextField("Title", text: $title)
                    TextField("Description", text: $description, axis: .vertical)
                        .lineLimit(3...6)
                }

                Section("Schedule") {
                    Stepper("Day \(day)", value: $day, in: 1...30)
                    TextField("Time (optional)", text: $time)
                        .placeholder("e.g., 9:00 AM, Morning")
                }
            }
            .navigationTitle("Add Item")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add") {
                        Task {
                            await addItem()
                        }
                    }
                    .disabled(title.isEmpty || isLoading)
                }
            }
        }
    }

    private func addItem() async {
        isLoading = true

        do {
            let item = try await SupabaseService.shared.addItineraryItem(
                tripId: tripId,
                destinationSlug: nil,
                day: day,
                orderIndex: 0, // Will be calculated
                title: title,
                description: description.isEmpty ? nil : description,
                time: time.isEmpty ? nil : time
            )

            await onItemAdded(item)
            dismiss()
        } catch {
            print("Error adding item: \(error)")
        }

        isLoading = false
    }
}

extension View {
    func placeholder(_ text: String) -> some View {
        self.modifier(PlaceholderModifier(placeholder: text))
    }
}

struct PlaceholderModifier: ViewModifier {
    let placeholder: String

    func body(content: Content) -> some View {
        content
            .submitLabel(.done)
    }
}
