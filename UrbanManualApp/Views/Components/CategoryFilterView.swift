import SwiftUI

struct CategoryFilterView: View {
    @Binding var selectedCategory: String

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(Category.all) { category in
                    CategoryButton(
                        category: category,
                        isSelected: selectedCategory == category.id
                    ) {
                        if selectedCategory == category.id {
                            selectedCategory = ""
                        } else {
                            selectedCategory = category.id
                        }
                    }
                }
            }
        }
    }
}

struct CategoryButton: View {
    let category: Category
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Text(category.icon)
                    .font(.system(size: 14))

                Text(category.label)
                    .font(.system(size: 14, weight: .medium))
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(
                isSelected ? Color.primary : Color(UIColor.systemGray6)
            )
            .foregroundColor(
                isSelected ? Color(UIColor.systemBackground) : Color.primary
            )
            .cornerRadius(20)
        }
        .buttonStyle(.plain)
        .scaleEffect(isSelected ? 1.05 : 1.0)
        .animation(.spring(response: 0.3), value: isSelected)
    }
}

#Preview {
    CategoryFilterView(selectedCategory: .constant(""))
        .padding()
}
