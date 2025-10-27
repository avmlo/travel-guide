import Foundation
import Combine

@MainActor
class HomeViewModel: ObservableObject {
    @Published var destinations: [Destination] = []
    @Published var filteredDestinations: [Destination] = []
    @Published var searchQuery: String = ""
    @Published var selectedCity: String = ""
    @Published var selectedCategory: String = ""
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private let supabaseService = SupabaseService.shared
    private var cancellables = Set<AnyCancellable>()

    // Computed property for unique cities
    var cities: [String] {
        let citySet = Set(destinations.map { $0.city })
        return Array(citySet).sorted()
    }

    init() {
        setupSearchDebounce()
    }

    // Load destinations from Supabase
    func loadDestinations() async {
        isLoading = true
        errorMessage = nil

        do {
            let fetchedDestinations = try await supabaseService.fetchDestinations()
            destinations = fetchedDestinations
            applyFilters()
            isLoading = false
        } catch {
            errorMessage = "Failed to load destinations: \(error.localizedDescription)"
            isLoading = false
        }
    }

    // Setup debounced search
    private func setupSearchDebounce() {
        $searchQuery
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .sink { [weak self] _ in
                self?.applyFilters()
            }
            .store(in: &cancellables)

        $selectedCity
            .sink { [weak self] _ in
                self?.applyFilters()
            }
            .store(in: &cancellables)

        $selectedCategory
            .sink { [weak self] _ in
                self?.applyFilters()
            }
            .store(in: &cancellables)
    }

    // Apply filters to destinations
    func applyFilters() {
        filteredDestinations = destinations.filter { destination in
            let matchesSearch = searchQuery.isEmpty ||
                destination.name.localizedCaseInsensitiveContains(searchQuery) ||
                destination.content.localizedCaseInsensitiveContains(searchQuery) ||
                destination.city.localizedCaseInsensitiveContains(searchQuery) ||
                destination.category.localizedCaseInsensitiveContains(searchQuery)

            let matchesCity = selectedCity.isEmpty || destination.city == selectedCity

            let matchesCategory = selectedCategory.isEmpty ||
                destination.category.localizedCaseInsensitiveContains(selectedCategory)

            return matchesSearch && matchesCity && matchesCategory
        }
    }

    // Clear all filters
    func clearFilters() {
        searchQuery = ""
        selectedCity = ""
        selectedCategory = ""
    }

    // Format city name (capitalize)
    func capitalizeCity(_ city: String) -> String {
        return city
            .split(separator: "-")
            .map { $0.capitalized }
            .joined(separator: " ")
    }
}
