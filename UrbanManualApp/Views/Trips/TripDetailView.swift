import SwiftUI

struct TripDetailView: View {
    let trip: Trip
    @StateObject private var viewModel: TripDetailViewModel

    init(trip: Trip) {
        self.trip = trip
        _viewModel = StateObject(wrappedValue: TripDetailViewModel(trip: trip))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header
                VStack(alignment: .leading, spacing: 8) {
                    Text(trip.title)
                        .font(.largeTitle)
                        .fontWeight(.bold)

                    if let destination = trip.destination {
                        HStack {
                            Image(systemName: "mappin.circle.fill")
                                .foregroundColor(.blue)
                            Text(destination.capitalized)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }

                    if let startDate = trip.startDate {
                        HStack {
                            Image(systemName: "calendar")
                                .foregroundColor(.secondary)
                            Text(formatDateRange(from: startDate, to: trip.endDate))
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }

                    if let description = trip.description {
                        Text(description)
                            .font(.body)
                            .foregroundColor(.secondary)
                            .padding(.top, 4)
                    }
                }
                .padding()

                Divider()

                // Itinerary
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("Itinerary")
                            .font(.title2)
                            .fontWeight(.bold)

                        Spacer()

                        Button(action: {
                            viewModel.showAddItem = true
                        }) {
                            Image(systemName: "plus.circle.fill")
                                .font(.title3)
                        }
                    }
                    .padding(.horizontal)

                    if viewModel.itineraryItems.isEmpty {
                        VStack(spacing: 12) {
                            Image(systemName: "list.bullet.clipboard")
                                .font(.largeTitle)
                                .foregroundColor(.secondary)

                            Text("No itinerary items yet")
                                .font(.subheadline)
                                .foregroundColor(.secondary)

                            Button("Add First Item") {
                                viewModel.showAddItem = true
                            }
                            .buttonStyle(.borderedProminent)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 40)
                    } else {
                        // Group by day
                        ForEach(viewModel.groupedByDay.keys.sorted(), id: \.self) { day in
                            DaySection(
                                day: day,
                                items: viewModel.groupedByDay[day] ?? []
                            )
                        }
                        .padding(.horizontal)
                    }
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Menu {
                    Button(action: {
                        // Share trip
                    }) {
                        Label("Share", systemImage: "square.and.arrow.up")
                    }

                    Button(role: .destructive, action: {
                        viewModel.showDeleteAlert = true
                    }) {
                        Label("Delete Trip", systemImage: "trash")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            }
        }
        .sheet(isPresented: $viewModel.showAddItem) {
            AddItineraryItemView(tripId: trip.id) { newItem in
                await viewModel.loadItinerary()
            }
        }
        .alert("Delete Trip", isPresented: $viewModel.showDeleteAlert) {
            Button("Cancel", role: .cancel) {}
            Button("Delete", role: .destructive) {
                // Handle delete
            }
        } message: {
            Text("Are you sure you want to delete this trip? This action cannot be undone.")
        }
        .task {
            await viewModel.loadItinerary()
        }
    }

    private func formatDateRange(from start: Date, to end: Date?) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium

        if let end = end {
            return "\(formatter.string(from: start)) - \(formatter.string(from: end))"
        } else {
            return formatter.string(from: start)
        }
    }
}

struct DaySection: View {
    let day: Int
    let items: [ItineraryItem]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Day \(day)")
                .font(.headline)
                .padding(.top, 8)

            ForEach(items) { item in
                ItineraryItemRow(item: item)
            }
        }
    }
}

struct ItineraryItemRow: View {
    let item: ItineraryItem

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // Time
            if let time = item.time {
                Text(time)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .frame(width: 60, alignment: .leading)
            }

            // Content
            VStack(alignment: .leading, spacing: 4) {
                Text(item.title)
                    .font(.subheadline)
                    .fontWeight(.semibold)

                if let description = item.description {
                    Text(description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(UIColor.systemGray6))
        .cornerRadius(8)
    }
}

#Preview {
    NavigationStack {
        TripDetailView(
            trip: Trip(
                id: 1,
                userId: "user123",
                title: "Paris Adventure",
                description: "Exploring the City of Light",
                destination: "Paris",
                startDate: Date(),
                endDate: Date().addingTimeInterval(86400 * 5),
                status: .upcoming,
                isPublic: false,
                coverImage: nil,
                createdAt: Date(),
                updatedAt: Date()
            )
        )
    }
}
