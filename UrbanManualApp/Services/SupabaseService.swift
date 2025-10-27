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

    // Fetch all destinations
    func fetchDestinations() async throws -> [Destination] {
        let response: [Destination] = try await client
            .from("destinations")
            .select()
            .order("name")
            .execute()
            .value

        return response
    }

    // Search destinations
    func searchDestinations(query: String) async throws -> [Destination] {
        let response: [Destination] = try await client
            .from("destinations")
            .select()
            .ilike("name", pattern: "%\(query)%")
            .execute()
            .value

        return response
    }

    // Fetch destinations by city
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

    // Fetch destinations by category
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
}
