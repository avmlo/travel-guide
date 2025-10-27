import SwiftUI

struct AuthView: View {
    @StateObject private var viewModel = AuthViewModel()
    @State private var isSignUp = false

    var body: some View {
        NavigationStack {
            ZStack {
                // Background
                LinearGradient(
                    colors: [Color.blue.opacity(0.1), Color.purple.opacity(0.1)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()

                VStack(spacing: 30) {
                    Spacer()

                    // Logo/Title
                    VStack(spacing: 12) {
                        Image(systemName: "globe.americas.fill")
                            .font(.system(size: 60))
                            .foregroundStyle(
                                LinearGradient(
                                    colors: [.blue, .purple],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )

                        Text("The Urban Manual")
                            .font(.largeTitle)
                            .fontWeight(.bold)

                        Text("Discover the world's best places")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding(.bottom, 40)

                    // Form
                    VStack(spacing: 16) {
                        // Email
                        TextField("Email", text: $viewModel.email)
                            .textContentType(.emailAddress)
                            .textInputAutocapitalization(.never)
                            .keyboardType(.emailAddress)
                            .autocorrectionDisabled()
                            .padding()
                            .background(Color(UIColor.systemBackground))
                            .cornerRadius(12)

                        // Password
                        SecureField("Password", text: $viewModel.password)
                            .textContentType(isSignUp ? .newPassword : .password)
                            .padding()
                            .background(Color(UIColor.systemBackground))
                            .cornerRadius(12)

                        // Confirm Password (Sign Up only)
                        if isSignUp {
                            SecureField("Confirm Password", text: $viewModel.confirmPassword)
                                .textContentType(.newPassword)
                                .padding()
                                .background(Color(UIColor.systemBackground))
                                .cornerRadius(12)
                        }

                        // Error message
                        if let errorMessage = viewModel.errorMessage {
                            Text(errorMessage)
                                .font(.caption)
                                .foregroundColor(.red)
                                .multilineTextAlignment(.center)
                        }

                        // Main action button
                        Button(action: {
                            Task {
                                if isSignUp {
                                    await viewModel.signUp()
                                } else {
                                    await viewModel.signIn()
                                }
                            }
                        }) {
                            HStack {
                                if viewModel.isLoading {
                                    ProgressView()
                                        .tint(.white)
                                } else {
                                    Text(isSignUp ? "Create Account" : "Sign In")
                                        .fontWeight(.semibold)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(
                                LinearGradient(
                                    colors: [.blue, .purple],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        }
                        .disabled(viewModel.isLoading || !viewModel.isFormValid)
                        .opacity(viewModel.isFormValid ? 1 : 0.6)

                        // Toggle sign in/up
                        Button(action: {
                            withAnimation {
                                isSignUp.toggle()
                                viewModel.clearError()
                            }
                        }) {
                            Text(isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up")
                                .font(.subheadline)
                                .foregroundColor(.blue)
                        }
                    }
                    .padding(.horizontal, 30)

                    Spacer()

                    // Skip for now
                    Button("Continue without signing in") {
                        viewModel.skipAuth()
                    }
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                }
            }
            .navigationBarHidden(true)
        }
    }
}

#Preview {
    AuthView()
}
