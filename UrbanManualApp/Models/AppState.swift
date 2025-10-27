import Foundation
import SwiftUI

class AppState: ObservableObject {
    static let shared = AppState()

    @Published var isAuthenticated: Bool = false
    @Published var hasCompletedOnboarding: Bool = false
    @Published var currentUser: User?

    private init() {
        // Load saved auth state
        loadAuthState()
    }

    func loadAuthState() {
        // Check if user has valid session
        Task {
            do {
                let user = try await SupabaseService.shared.fetchCurrentUser()
                await MainActor.run {
                    self.currentUser = user
                    self.isAuthenticated = true
                    self.hasCompletedOnboarding = true
                }
            } catch {
                await MainActor.run {
                    self.isAuthenticated = false
                    self.hasCompletedOnboarding = UserDefaults.standard.bool(forKey: "hasCompletedOnboarding")
                }
            }
        }
    }

    func completeOnboarding() {
        hasCompletedOnboarding = true
        UserDefaults.standard.set(true, forKey: "hasCompletedOnboarding")
    }

    func signOut() {
        isAuthenticated = false
        currentUser = nil
    }
}
