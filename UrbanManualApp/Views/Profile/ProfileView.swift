import SwiftUI

struct ProfileView: View {
    @StateObject private var viewModel = ProfileViewModel()
    @State private var showSettings = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    if let user = viewModel.user {
                        VStack(spacing: 12) {
                            // Avatar
                            if let avatarUrl = user.avatar, let url = URL(string: avatarUrl) {
                                AsyncImage(url: url) { image in
                                    image
                                        .resizable()
                                        .aspectRatio(contentMode: .fill)
                                } placeholder: {
                                    Circle()
                                        .fill(Color(UIColor.systemGray5))
                                }
                                .frame(width: 100, height: 100)
                                .clipShape(Circle())
                            } else {
                                Circle()
                                    .fill(LinearGradient(
                                        colors: [.blue, .purple],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    ))
                                    .frame(width: 100, height: 100)
                                    .overlay(
                                        Text(user.name?.prefix(1).uppercased() ?? "U")
                                            .font(.system(size: 40, weight: .bold))
                                            .foregroundColor(.white)
                                    )
                            }

                            Text(user.name ?? "User")
                                .font(.title2)
                                .fontWeight(.bold)

                            Text(user.email ?? "")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        .padding(.top, 20)
                    }

                    // Stats
                    statsSection

                    // Actions
                    VStack(spacing: 0) {
                        NavigationLink(destination: SavedPlacesView()) {
                            ProfileRow(icon: "bookmark.fill", title: "Saved Places", color: .blue)
                        }

                        Divider().padding(.leading, 50)

                        NavigationLink(destination: SavedPlacesView()) {
                            ProfileRow(icon: "checkmark.circle.fill", title: "Visited Places", color: .green)
                        }

                        Divider().padding(.leading, 50)

                        NavigationLink(destination: TripsView()) {
                            ProfileRow(icon: "airplane", title: "My Trips", color: .orange)
                        }

                        Divider().padding(.leading, 50)

                        Button(action: {
                            showSettings = true
                        }) {
                            ProfileRow(icon: "gearshape.fill", title: "Settings", color: .gray)
                        }
                    }
                    .background(Color(UIColor.systemGray6))
                    .cornerRadius(12)

                    // Sign out
                    if viewModel.user != nil {
                        Button(action: {
                            Task {
                                await viewModel.signOut()
                            }
                        }) {
                            Text("Sign Out")
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.red.opacity(0.1))
                                .foregroundColor(.red)
                                .cornerRadius(12)
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Profile")
            .sheet(isPresented: $showSettings) {
                SettingsView()
            }
            .task {
                await viewModel.loadProfile()
            }
        }
    }

    private var statsSection: some View {
        HStack(spacing: 20) {
            StatBox(value: viewModel.stats.savedCount, label: "Saved")
            StatBox(value: viewModel.stats.visitedCount, label: "Visited")
            StatBox(value: viewModel.stats.tripsCount, label: "Trips")
        }
        .padding()
        .background(Color(UIColor.systemGray6))
        .cornerRadius(12)
    }
}

struct ProfileRow: View {
    let icon: String
    let title: String
    let color: Color

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(color)
                .frame(width: 30)

            Text(title)
                .foregroundColor(.primary)

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
    }
}

struct StatBox: View {
    let value: Int
    let label: String

    var body: some View {
        VStack(spacing: 8) {
            Text("\(value)")
                .font(.title)
                .fontWeight(.bold)

            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}

struct UserStats {
    var savedCount: Int = 0
    var visitedCount: Int = 0
    var tripsCount: Int = 0
}

#Preview {
    ProfileView()
}
