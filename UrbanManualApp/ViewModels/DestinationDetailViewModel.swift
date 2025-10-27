import Foundation

@MainActor
class DestinationDetailViewModel: ObservableObject {
    @Published var isSaved: Bool = false
    @Published var isVisited: Bool = false
    @Published var showAddToTrip: Bool = false

    private let destination: Destination
    private let supabaseService = SupabaseService.shared

    init(destination: Destination) {
        self.destination = destination
    }

    func loadData() async {
        // Check if destination is saved
        do {
            isSaved = try await supabaseService.isDestinationSaved(slug: destination.slug)
            isVisited = try await supabaseService.isDestinationVisited(slug: destination.slug)
        } catch {
            print("Error loading destination data: \(error)")
        }
    }

    func toggleSaved() async {
        do {
            if isSaved {
                try await supabaseService.unsaveDestination(slug: destination.slug)
                isSaved = false
            } else {
                try await supabaseService.saveDestination(slug: destination.slug)
                isSaved = true
            }
        } catch {
            print("Error toggling saved: \(error)")
        }
    }

    func toggleVisited() async {
        do {
            if isVisited {
                try await supabaseService.unmarkVisited(slug: destination.slug)
                isVisited = false
            } else {
                try await supabaseService.markVisited(slug: destination.slug)
                isVisited = true
            }
        } catch {
            print("Error toggling visited: \(error)")
        }
    }
}
