import Foundation

@MainActor
class TripDetailViewModel: ObservableObject {
    @Published var itineraryItems: [ItineraryItem] = []
    @Published var showAddItem: Bool = false
    @Published var showDeleteAlert: Bool = false
    @Published var isLoading: Bool = false

    private let trip: Trip
    private let supabaseService = SupabaseService.shared

    init(trip: Trip) {
        self.trip = trip
    }

    var groupedByDay: [Int: [ItineraryItem]] {
        Dictionary(grouping: itineraryItems, by: { $0.day })
    }

    func loadItinerary() async {
        isLoading = true

        do {
            itineraryItems = try await supabaseService.fetchItineraryItems(tripId: trip.id)
        } catch {
            print("Error loading itinerary: \(error)")
        }

        isLoading = false
    }
}
