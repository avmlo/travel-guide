import Foundation

@MainActor
class AuthViewModel: ObservableObject {
    @Published var email: String = ""
    @Published var password: String = ""
    @Published var confirmPassword: String = ""
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private let supabaseService = SupabaseService.shared

    var isFormValid: Bool {
        !email.isEmpty && !password.isEmpty && password.count >= 6
    }

    func signIn() async {
        guard isFormValid else {
            errorMessage = "Please fill in all fields"
            return
        }

        isLoading = true
        errorMessage = nil

        do {
            try await supabaseService.signIn(email: email, password: password)
            // Navigation handled by AppState
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func signUp() async {
        guard isFormValid else {
            errorMessage = "Please fill in all fields"
            return
        }

        guard password == confirmPassword else {
            errorMessage = "Passwords don't match"
            return
        }

        isLoading = true
        errorMessage = nil

        do {
            try await supabaseService.signUp(email: email, password: password)
            // Navigation handled by AppState
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func skipAuth() {
        // Continue to app without authentication
        AppState.shared.isAuthenticated = false
        AppState.shared.hasCompletedOnboarding = true
    }

    func clearError() {
        errorMessage = nil
    }
}
