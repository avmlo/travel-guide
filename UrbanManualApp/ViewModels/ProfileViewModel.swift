import Foundation

struct User: Codable {
    let id: String
    let name: String?
    let email: String?
    let avatar: String?
    let createdAt: Date?
    let lastSignedIn: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case email
        case avatar
        case createdAt = "created_at"
        case lastSignedIn = "last_signed_in"
    }
}

@MainActor
class ProfileViewModel: ObservableObject {
    @Published var user: User?
    @Published var stats = UserStats()
    @Published var isLoading: Bool = false

    private let supabaseService = SupabaseService.shared

    func loadProfile() async {
        isLoading = true

        do {
            user = try await supabaseService.fetchCurrentUser()

            // Load stats
            async let savedCount = supabaseService.getSavedPlacesCount()
            async let visitedCount = supabaseService.getVisitedPlacesCount()
            async let tripsCount = supabaseService.getTripsCount()

            stats = UserStats(
                savedCount: try await savedCount,
                visitedCount: try await visitedCount,
                tripsCount: try await tripsCount
            )
        } catch {
            print("Error loading profile: \(error)")
        }

        isLoading = false
    }

    func signOut() async {
        do {
            try await supabaseService.signOut()
            AppState.shared.isAuthenticated = false
        } catch {
            print("Error signing out: \(error)")
        }
    }
}
