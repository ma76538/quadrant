import Foundation

public struct Task: Identifiable, Codable, Hashable {
    public let id: UUID
    public var title: String
    public var description: String
    public var isCompleted: Bool
    public var quadrant: Quadrant
    public var dueDate: Date?
    public var priority: Priority
    public var tags: Set<String>
    public var createdAt: Date
    public var updatedAt: Date
    
    public init(
        id: UUID = UUID(),
        title: String,
        description: String = "",
        isCompleted: Bool = false,
        quadrant: Quadrant,
        dueDate: Date? = nil,
        priority: Priority = .medium,
        tags: Set<String> = [],
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.title = title
        self.description = description
        self.isCompleted = isCompleted
        self.quadrant = quadrant
        self.dueDate = dueDate
        self.priority = priority
        self.tags = tags
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
    
    public func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    public static func == (lhs: Task, rhs: Task) -> Bool {
        lhs.id == rhs.id
    }
}
