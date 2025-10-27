import Foundation
import Supabase

class SupabaseService {
    static let shared = SupabaseService()

    private let client: SupabaseClient

    private init() {
        // TODO: Replace with your Supabase credentials
        let supabaseURL = URL(string: "YOUR_SUPABASE_URL")!
        let supabaseKey = "YOUR_SUPABASE_ANON_KEY"

        self.client = SupabaseClient(
            supabaseURL: supabaseURL,
            supabaseKey: supabaseKey
        )
    }

    // MARK: - Authentication

    func signIn(email: String, password: String) async throws {
        try await client.auth.signIn(email: email, password: password)
        AppState.shared.isAuthenticated = true
    }

    func signUp(email: String, password: String) async throws {
        try await client.auth.signUp(email: email, password: password)
        AppState.shared.isAuthenticated = true
    }

    func signOut() async throws {
        try await client.auth.signOut()
        AppState.shared.signOut()
    }

    func fetchCurrentUser() async throws -> User {
        let session = try await client.auth.session
        let userId = session.user.id.uuidString

        let response: User = try await client
            .from("users")
            .select()
            .eq("id", value: userId)
            .single()
            .execute()
            .value

        return response
    }

    // MARK: - Destinations

    func fetchDestinations() async throws -> [Destination] {
        let response: [Destination] = try await client
            .from("destinations")
            .select()
            .order("name")
            .execute()
            .value

        return response
    }

    func searchDestinations(query: String) async throws -> [Destination] {
        let response: [Destination] = try await client
            .from("destinations")
            .select()
            .ilike("name", pattern: "%\(query)%")
            .execute()
            .value

        return response
    }

    func fetchDestinations(city: String) async throws -> [Destination] {
        let response: [Destination] = try await client
            .from("destinations")
            .select()
            .eq("city", value: city)
            .order("name")
            .execute()
            .value

        return response
    }

    func fetchDestinations(category: String) async throws -> [Destination] {
        let response: [Destination] = try await client
            .from("destinations")
            .select()
            .ilike("category", pattern: "%\(category)%")
            .order("name")
            .execute()
            .value

        return response
    }

    // MARK: - Saved Places

    func saveDestination(slug: String) async throws {
        let session = try await client.auth.session
        let userId = session.user.id.uuidString

        try await client
            .from("saved_places")
            .insert([
                "user_id": userId,
                "destination_slug": slug,
                "saved_at": ISO8601DateFormatter().string(from: Date())
            ])
            .execute()
    }

    func unsaveDestination(slug: String) async throws {
        let session = try await client.auth.session
        let userId = session.user.id.uuidString

        try await client
            .from("saved_places")
            .delete()
            .eq("user_id", value: userId)
            .eq("destination_slug", value: slug)
            .execute()
    }

    func isDestinationSaved(slug: String) async throws -> Bool {
        let session = try await client.auth.session
        let userId = session.user.id.uuidString

        let response: [String: String] = try await client
            .from("saved_places")
            .select()
            .eq("user_id", value: userId)
            .eq("destination_slug", value: slug)
            .maybeSingle()
            .execute()
            .value ?? [:]

        return !response.isEmpty
    }

    func fetchSavedPlaces() async throws -> [Destination] {
        let session = try await client.auth.session
        let userId = session.user.id.uuidString

        // Fetch saved place slugs
        let savedSlugs: [SavedPlace] = try await client
            .from("saved_places")
            .select()
            .eq("user_id", value: userId)
            .execute()
            .value

        // Fetch full destination details
        let slugs = savedSlugs.map { $0.destinationSlug }

        if slugs.isEmpty {
            return []
        }

        let destinations: [Destination] = try await client
            .from("destinations")
            .select()
            .in("slug", values: slugs)
            .execute()
            .value

        return destinations
    }

    func getSavedPlacesCount() async throws -> Int {
        let session = try await client.auth.session
        let userId = session.user.id.uuidString

        let response: [SavedPlace] = try await client
            .from("saved_places")
            .select()
            .eq("user_id", value: userId)
            .execute()
            .value

        return response.count
    }

    // MARK: - Visited Places

    func markVisited(slug: String, rating: Int? = nil) async throws {
        let session = try await client.auth.session
        let userId = session.user.id.uuidString

        try await client
            .from("visited_places")
            .insert([
                "user_id": userId,
                "destination_slug": slug,
                "visited_at": ISO8601DateFormatter().string(from: Date()),
                "rating": rating
            ])
            .execute()
    }

    func unmarkVisited(slug: String) async throws {
        let session = try await client.auth.session
        let userId = session.user.id.uuidString

        try await client
            .from("visited_places")
            .delete()
            .eq("user_id", value: userId)
            .eq("destination_slug", value: slug)
            .execute()
    }

    func isDestinationVisited(slug: String) async throws -> Bool {
        let session = try await client.auth.session
        let userId = session.user.id.uuidString

        let response: [String: String] = try await client
            .from("visited_places")
            .select()
            .eq("user_id", value: userId)
            .eq("destination_slug", value: slug)
            .maybeSingle()
            .execute()
            .value ?? [:]

        return !response.isEmpty
    }

    func fetchVisitedPlaces() async throws -> [Destination] {
        let session = try await client.auth.session
        let userId = session.user.id.uuidString

        // Fetch visited place slugs
        let visitedSlugs: [VisitedPlace] = try await client
            .from("visited_places")
            .select()
            .eq("user_id", value: userId)
            .execute()
            .value

        // Fetch full destination details
        let slugs = visitedSlugs.map { $0.destinationSlug }

        if slugs.isEmpty {
            return []
        }

        let destinations: [Destination] = try await client
            .from("destinations")
            .select()
            .in("slug", values: slugs)
            .execute()
            .value

        return destinations
    }

    func getVisitedPlacesCount() async throws -> Int {
        let session = try await client.auth.session
        let userId = session.user.id.uuidString

        let response: [VisitedPlace] = try await client
            .from("visited_places")
            .select()
            .eq("user_id", value: userId)
            .execute()
            .value

        return response.count
    }

    // MARK: - Trips

    func fetchTrips() async throws -> [Trip] {
        let session = try await client.auth.session
        let userId = session.user.id.uuidString

        let response: [Trip] = try await client
            .from("trips")
            .select()
            .eq("user_id", value: userId)
            .order("created_at", ascending: false)
            .execute()
            .value

        return response
    }

    func createTrip(
        title: String,
        description: String?,
        destination: String?,
        startDate: Date,
        endDate: Date,
        status: String,
        isPublic: Bool
    ) async throws -> Trip {
        let session = try await client.auth.session
        let userId = session.user.id.uuidString

        let dateFormatter = ISO8601DateFormatter()

        let response: Trip = try await client
            .from("trips")
            .insert([
                "user_id": userId,
                "title": title,
                "description": description as Any,
                "destination": destination as Any,
                "start_date": dateFormatter.string(from: startDate),
                "end_date": dateFormatter.string(from: endDate),
                "status": status,
                "is_public": isPublic,
                "created_at": dateFormatter.string(from: Date()),
                "updated_at": dateFormatter.string(from: Date())
            ])
            .select()
            .single()
            .execute()
            .value

        return response
    }

    func deleteTrip(id: Int) async throws {
        try await client
            .from("trips")
            .delete()
            .eq("id", value: id)
            .execute()
    }

    func getTripsCount() async throws -> Int {
        let session = try await client.auth.session
        let userId = session.user.id.uuidString

        let response: [Trip] = try await client
            .from("trips")
            .select()
            .eq("user_id", value: userId)
            .execute()
            .value

        return response.count
    }

    // MARK: - Itinerary

    func fetchItineraryItems(tripId: Int) async throws -> [ItineraryItem] {
        let response: [ItineraryItem] = try await client
            .from("itinerary_items")
            .select()
            .eq("trip_id", value: tripId)
            .order("day")
            .order("order_index")
            .execute()
            .value

        return response
    }

    func addItineraryItem(
        tripId: Int,
        destinationSlug: String?,
        day: Int,
        orderIndex: Int,
        title: String,
        description: String? = nil,
        time: String? = nil
    ) async throws -> ItineraryItem {
        let dateFormatter = ISO8601DateFormatter()

        let response: ItineraryItem = try await client
            .from("itinerary_items")
            .insert([
                "trip_id": tripId,
                "destination_slug": destinationSlug as Any,
                "day": day,
                "order_index": orderIndex,
                "time": time as Any,
                "title": title,
                "description": description as Any,
                "created_at": dateFormatter.string(from: Date())
            ])
            .select()
            .single()
            .execute()
            .value

        return response
    }

    func getMaxDay(tripId: Int) async throws -> Int {
        let items: [ItineraryItem] = try await fetchItineraryItems(tripId: tripId)
        return items.map { $0.day }.max() ?? 1
    }

    func getMaxOrderIndex(tripId: Int, day: Int) async throws -> Int {
        let items: [ItineraryItem] = try await fetchItineraryItems(tripId: tripId)
        let dayItems = items.filter { $0.day == day }
        return dayItems.map { $0.orderIndex }.max() ?? 0
    }
}

// MARK: - Helper Models

struct SavedPlace: Codable {
    let destinationSlug: String

    enum CodingKeys: String, CodingKey {
        case destinationSlug = "destination_slug"
    }
}

struct VisitedPlace: Codable {
    let destinationSlug: String

    enum CodingKeys: String, CodingKey {
        case destinationSlug = "destination_slug"
    }
}
