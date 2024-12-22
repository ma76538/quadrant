import Foundation
import QuadrantKit

@MainActor
class TaskStore: ObservableObject {
    @Published private(set) var tasks: [Task] = []
    private let taskManager: TaskManagerProtocol
    
    init(apiBaseURL: String = "https://your-api-domain.com") {
        self.taskManager = APITaskManager(baseURL: apiBaseURL)
    }
    
    func loadTasks() async {
        do {
            tasks = try await taskManager.fetchTasks()
        } catch {
            print("Error loading tasks: \(error)")
        }
    }
    
    func addTask(_ task: Task) async {
        do {
            try await taskManager.createTask(task)
            tasks = try await taskManager.fetchTasks()
        } catch {
            print("Error adding task: \(error)")
        }
    }
    
    func updateTask(_ task: Task) async {
        do {
            try await taskManager.updateTask(task)
            tasks = try await taskManager.fetchTasks()
        } catch {
            print("Error updating task: \(error)")
        }
    }
    
    func deleteTask(_ task: Task) async {
        do {
            try await taskManager.deleteTask(task.id)
            tasks = try await taskManager.fetchTasks()
        } catch {
            print("Error deleting task: \(error)")
        }
    }
    
    func tasksInQuadrant(_ quadrant: Quadrant) -> [Task] {
        tasks.filter { $0.quadrant == quadrant }
    }
}
