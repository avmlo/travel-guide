import SwiftUI

struct CityFilterView: View {
    let cities: [String]
    @Binding var selectedCity: String
    @ObservedObject var viewModel: HomeViewModel
    @State private var showAllCities = false

    private var displayedCities: [String] {
        showAllCities ? cities : Array(cities.prefix(20))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("PLACES")
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.secondary)

            FlowLayout(spacing: 12) {
                // All button
                CityButton(
                    title: "All",
                    isSelected: selectedCity.isEmpty
                ) {
                    selectedCity = ""
                }

                // City buttons
                ForEach(displayedCities, id: \.self) { city in
                    CityButton(
                        title: viewModel.capitalizeCity(city),
                        isSelected: selectedCity == city
                    ) {
                        if selectedCity == city {
                            selectedCity = ""
                        } else {
                            selectedCity = city
                        }
                    }
                }

                // Show more/less button
                if cities.count > 20 {
                    Button(action: {
                        showAllCities.toggle()
                    }) {
                        Text(showAllCities ? "- Show Less" : "+ Show More")
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.secondary)
                    }
                }
            }
        }
    }
}

struct CityButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(isSelected ? .primary : .secondary)
                .scaleEffect(isSelected ? 1.05 : 1.0)
                .animation(.spring(response: 0.3), value: isSelected)
        }
    }
}

// Flow layout for wrapping items
struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = FlowResult(in: proposal.replacingUnspecifiedDimensions().width, subviews: subviews, spacing: spacing)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = FlowResult(in: bounds.width, subviews: subviews, spacing: spacing)
        for (index, subview) in subviews.enumerated() {
            subview.place(at: CGPoint(x: bounds.minX + result.frames[index].minX, y: bounds.minY + result.frames[index].minY), proposal: .unspecified)
        }
    }

    struct FlowResult {
        var frames: [CGRect] = []
        var size: CGSize = .zero

        init(in maxWidth: CGFloat, subviews: Subviews, spacing: CGFloat) {
            var currentX: CGFloat = 0
            var currentY: CGFloat = 0
            var lineHeight: CGFloat = 0

            for subview in subviews {
                let size = subview.sizeThatFits(.unspecified)
                if currentX + size.width > maxWidth && currentX > 0 {
                    currentX = 0
                    currentY += lineHeight + spacing
                    lineHeight = 0
                }

                frames.append(CGRect(origin: CGPoint(x: currentX, y: currentY), size: size))
                lineHeight = max(lineHeight, size.height)
                currentX += size.width + spacing
            }

            self.size = CGSize(width: maxWidth, height: currentY + lineHeight)
        }
    }
}

#Preview {
    CityFilterView(
        cities: ["paris", "london", "new-york", "tokyo"],
        selectedCity: .constant(""),
        viewModel: HomeViewModel()
    )
    .padding()
}
