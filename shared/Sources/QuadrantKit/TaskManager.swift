import Foundation

public protocol TaskManagerProtocol {
    func createTask(_ task: Task) async throws
    func updateTask(_ task: Task) async throws
    func deleteTask(_ taskId: UUID) async throws
    func fetchTasks() async throws -> [Task]
    func fetchTasks(in quadrant: Quadrant) async throws -> [Task]
    func fetchTasks(withTags tags: Set<String>) async throws -> [Task]
}

public class TaskManager {
    private var tasks: [UUID: Task] = [:]
    
    public init() {}
}

extension TaskManager: TaskManagerProtocol {
    public func createTask(_ task: Task) async throws {
        tasks[task.id] = task
    }
    
    public func updateTask(_ task: Task) async throws {
        guard tasks[task.id] != nil else {
            throw TaskError.taskNotFound
        }
        tasks[task.id] = task
    }
    
    public func deleteTask(_ taskId: UUID) async throws {
        guard tasks[taskId] != nil else {
            throw TaskError.taskNotFound
        }
        tasks.removeValue(forKey: taskId)
    }
    
    public func fetchTasks() async throws -> [Task] {
        Array(tasks.values).sorted { $0.createdAt > $1.createdAt }
    }
    
    public func fetchTasks(in quadrant: Quadrant) async throws -> [Task] {
        try await fetchTasks().filter { $0.quadrant == quadrant }
    }
    
    public func fetchTasks(withTags tags: Set<String>) async throws -> [Task] {
        try await fetchTasks().filter { !$0.tags.isDisjoint(with: tags) }
    }
}

public enum TaskError: Error {
    case taskNotFound
    case invalidData
    case networkError
    case unauthorized
    case unknown
    
    public var description: String {
        switch self {
        case .taskNotFound:
            return "Task not found"
        case .invalidData:
            return "Invalid data"
        case .networkError:
            return "Network error"
        case .unauthorized:
            return "Unauthorized access"
        case .unknown:
            return "Unknown error"
        }
    }
}
