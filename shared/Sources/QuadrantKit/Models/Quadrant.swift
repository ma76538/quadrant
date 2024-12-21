import Foundation

public enum Quadrant: Int, Codable, CaseIterable {
    case urgentImportant = 1
    case urgentNotImportant = 2
    case notUrgentImportant = 3
    case notUrgentNotImportant = 4
    
    public var title: String {
        switch self {
        case .urgentImportant:
            return "Urgent & Important"
        case .urgentNotImportant:
            return "Urgent & Not Important"
        case .notUrgentImportant:
            return "Not Urgent & Important"
        case .notUrgentNotImportant:
            return "Not Urgent & Not Important"
        }
    }
    
    public var description: String {
        switch self {
        case .urgentImportant:
            return "Do First - Tasks that need immediate attention"
        case .urgentNotImportant:
            return "Schedule - Tasks that can be delegated"
        case .notUrgentImportant:
            return "Plan - Tasks that contribute to long-term goals"
        case .notUrgentNotImportant:
            return "Eliminate - Tasks that can be minimized or eliminated"
        }
    }
}
