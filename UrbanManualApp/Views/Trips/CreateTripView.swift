import SwiftUI

struct CreateTripView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = CreateTripViewModel()

    let onTripCreated: (Trip) async -> Void

    var body: some View {
        NavigationStack {
            Form {
                Section("Trip Details") {
                    TextField("Title", text: $viewModel.title)
                    TextField("Destination", text: $viewModel.destination)
                    TextField("Description", text: $viewModel.description, axis: .vertical)
                        .lineLimit(3...6)
                }

                Section("Dates") {
                    DatePicker("Start Date", selection: $viewModel.startDate, displayedComponents: .date)
                    DatePicker("End Date", selection: $viewModel.endDate, displayedComponents: .date)
                }

                Section("Status") {
                    Picker("Status", selection: $viewModel.status) {
                        Text("Planning").tag("planning")
                        Text("Upcoming").tag("upcoming")
                        Text("Ongoing").tag("ongoing")
                        Text("Completed").tag("completed")
                    }

                    Toggle("Public Trip", isOn: $viewModel.isPublic)
                }

                if let errorMessage = viewModel.errorMessage {
                    Section {
                        Text(errorMessage)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                }
            }
            .navigationTitle("Create Trip")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Create") {
                        Task {
                            if let trip = await viewModel.createTrip() {
                                await onTripCreated(trip)
                                dismiss()
                            }
                        }
                    }
                    .disabled(!viewModel.isFormValid || viewModel.isLoading)
                }
            }
            .disabled(viewModel.isLoading)
            .overlay {
                if viewModel.isLoading {
                    ProgressView()
                }
            }
        }
    }
}

@MainActor
class CreateTripViewModel: ObservableObject {
    @Published var title: String = ""
    @Published var destination: String = ""
    @Published var description: String = ""
    @Published var startDate: Date = Date()
    @Published var endDate: Date = Date().addingTimeInterval(86400 * 7) // 7 days later
    @Published var status: String = "planning"
    @Published var isPublic: Bool = false
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private let supabaseService = SupabaseService.shared

    var isFormValid: Bool {
        !title.isEmpty && !destination.isEmpty
    }

    func createTrip() async -> Trip? {
        guard isFormValid else {
            errorMessage = "Please fill in required fields"
            return nil
        }

        isLoading = true
        errorMessage = nil

        do {
            let trip = try await supabaseService.createTrip(
                title: title,
                description: description.isEmpty ? nil : description,
                destination: destination,
                startDate: startDate,
                endDate: endDate,
                status: status,
                isPublic: isPublic
            )
            isLoading = false
            return trip
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
            return nil
        }
    }
}
