import SwiftUI

@main
struct UrbanManualApp: App {
    @StateObject private var appState = AppState.shared

    var body: some Scene {
        WindowGroup {
            Group {
                if appState.hasCompletedOnboarding {
                    MainTabView()
                } else {
                    AuthView()
                }
            }
            .preferredColorScheme(getColorScheme())
        }
    }

    private func getColorScheme() -> ColorScheme? {
        let darkMode = UserDefaults.standard.bool(forKey: "darkMode")
        return darkMode ? .dark : .light
    }
}
