import Foundation

public class APITaskManager: TaskManagerProtocol {
    private let baseURL: URL
    private let session: URLSession
    
    public init(baseURL: String) {
        guard let url = URL(string: baseURL) else {
            fatalError("Invalid API base URL")
        }
        self.baseURL = url
        self.session = URLSession.shared
    }
    
    private func endpoint(_ path: String) -> URL {
        baseURL.appendingPathComponent(path)
    }
    
    public func createTask(_ task: Task) async throws {
        let url = endpoint("api/tasks")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        request.httpBody = try encoder.encode(task)
        
        let (_, response) = try await session.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw TaskError.networkError
        }
    }
    
    public func updateTask(_ task: Task) async throws {
        let url = endpoint("api/tasks/\(task.id.uuidString)")
        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        request.httpBody = try encoder.encode(task)
        
        let (_, response) = try await session.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw TaskError.networkError
        }
    }
    
    public func deleteTask(_ taskId: UUID) async throws {
        let url = endpoint("api/tasks/\(taskId.uuidString)")
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        
        let (_, response) = try await session.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw TaskError.networkError
        }
    }
    
    public func fetchTasks() async throws -> [Task] {
        let url = endpoint("api/tasks")
        let request = URLRequest(url: url)
        
        let (data, response) = try await session.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw TaskError.networkError
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode([Task].self, from: data)
    }
    
    public func fetchTasks(in quadrant: Quadrant) async throws -> [Task] {
        let url = endpoint("api/tasks/quadrant/\(quadrant.rawValue)")
        let request = URLRequest(url: url)
        
        let (data, response) = try await session.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw TaskError.networkError
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode([Task].self, from: data)
    }
    
    public func fetchTasks(withTags tags: Set<String>) async throws -> [Task] {
        // 在實際應用中，你可能想要添加一個專門的API端點來處理標籤過濾
        let tasks = try await fetchTasks()
        return tasks.filter { !$0.tags.isDisjoint(with: tags) }
    }
}
