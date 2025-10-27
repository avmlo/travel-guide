import SwiftUI

struct TripsView: View {
    @StateObject private var viewModel = TripsViewModel()
    @State private var showCreateTrip = false

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView("Loading trips...")
                } else if viewModel.trips.isEmpty {
                    emptyStateView
                } else {
                    tripsList
                }
            }
            .navigationTitle("Trips")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        showCreateTrip = true
                    }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showCreateTrip) {
                CreateTripView { newTrip in
                    await viewModel.loadTrips()
                }
            }
            .task {
                await viewModel.loadTrips()
            }
        }
    }

    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "airplane.departure")
                .font(.system(size: 60))
                .foregroundColor(.secondary)

            Text("No trips yet")
                .font(.title2)
                .fontWeight(.semibold)

            Text("Create your first trip to start planning your adventure")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            Button(action: {
                showCreateTrip = true
            }) {
                Text("Create Trip")
                    .fontWeight(.semibold)
                    .frame(maxWidth: 200)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(12)
            }
        }
    }

    private var tripsList: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                ForEach(viewModel.trips) { trip in
                    NavigationLink(destination: TripDetailView(trip: trip)) {
                        TripCard(trip: trip)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding()
        }
    }
}

struct TripCard: View {
    let trip: Trip

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(trip.title)
                        .font(.headline)
                        .foregroundColor(.primary)

                    if let destination = trip.destination {
                        Text(destination.capitalized)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }

                Spacer()

                // Status badge
                Text(trip.status.rawValue.capitalized)
                    .font(.caption)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(statusColor.opacity(0.2))
                    .foregroundColor(statusColor)
                    .cornerRadius(8)
            }

            // Dates
            if let startDate = trip.startDate {
                HStack(spacing: 8) {
                    Image(systemName: "calendar")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    Text(formatDateRange(from: startDate, to: trip.endDate))
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            // Description
            if let description = trip.description {
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
            }
        }
        .padding()
        .background(Color(UIColor.systemGray6))
        .cornerRadius(12)
    }

    private var statusColor: Color {
        switch trip.status {
        case .planning: return .blue
        case .upcoming: return .orange
        case .ongoing: return .green
        case .completed: return .gray
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

#Preview {
    TripsView()
}
