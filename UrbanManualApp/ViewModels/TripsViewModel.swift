import Foundation

@MainActor
class TripsViewModel: ObservableObject {
    @Published var trips: [Trip] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private let supabaseService = SupabaseService.shared

    func loadTrips() async {
        isLoading = true
        errorMessage = nil

        do {
            trips = try await supabaseService.fetchTrips()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func deleteTrip(_ trip: Trip) async {
        do {
            try await supabaseService.deleteTrip(id: trip.id)
            trips.removeAll { $0.id == trip.id }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
