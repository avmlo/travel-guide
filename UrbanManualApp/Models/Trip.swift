import Foundation

struct Trip: Identifiable, Codable, Hashable {
    let id: Int
    let userId: String
    let title: String
    let description: String?
    let destination: String?
    let startDate: Date?
    let endDate: Date?
    let status: TripStatus
    let isPublic: Bool
    let coverImage: String?
    let createdAt: Date
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case title
        case description
        case destination
        case startDate = "start_date"
        case endDate = "end_date"
        case status
        case isPublic = "is_public"
        case coverImage = "cover_image"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }

    enum TripStatus: String, Codable {
        case planning
        case upcoming
        case ongoing
        case completed
    }
}

struct ItineraryItem: Identifiable, Codable, Hashable {
    let id: Int
    let tripId: Int
    let destinationSlug: String?
    let day: Int
    let orderIndex: Int
    let time: String?
    let title: String
    let description: String?
    let notes: String?
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case tripId = "trip_id"
        case destinationSlug = "destination_slug"
        case day
        case orderIndex = "order_index"
        case time
        case title
        case description
        case notes
        case createdAt = "created_at"
    }
}

// For creating new trips
struct CreateTripData: Codable {
    let userId: String
    let title: String
    let description: String?
    let destination: String?
    let startDate: Date?
    let endDate: Date?
    let status: String
    let isPublic: Bool

    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case title
        case description
        case destination
        case startDate = "start_date"
        case endDate = "end_date"
        case status
        case isPublic = "is_public"
    }
}
