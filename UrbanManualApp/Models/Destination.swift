import Foundation

struct Destination: Identifiable, Codable, Hashable {
    let id: String
    let name: String
    let slug: String
    let city: String
    let category: String
    let content: String
    let mainImage: String?
    let michelinStars: Int
    let crown: Bool
    let latitude: Double?
    let longitude: Double?

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case slug
        case city
        case category
        case content
        case mainImage = "image"
        case michelinStars = "michelin_stars"
        case crown
        case latitude = "lat"
        case longitude = "long"
    }
}

// Category model for filters
struct Category: Identifiable {
    let id: String
    let label: String
    let icon: String

    static let all = [
        Category(id: "", label: "All", icon: "🌍"),
        Category(id: "restaurant", label: "Restaurant", icon: "🍽️"),
        Category(id: "cafe", label: "Cafe", icon: "☕"),
        Category(id: "hotel", label: "Hotel", icon: "🏨"),
        Category(id: "bar", label: "Bar", icon: "🍸"),
        Category(id: "shop", label: "Shop", icon: "🛍️"),
        Category(id: "bakery", label: "Bakery", icon: "🥐")
    ]
}
