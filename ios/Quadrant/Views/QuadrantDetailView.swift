import SwiftUI
import QuadrantKit

struct QuadrantDetailView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var taskStore: TaskStore
    let quadrant: Quadrant
    
    var body: some View {
        NavigationView {
            List {
                ForEach(taskStore.tasksInQuadrant(quadrant)) { task in
                    TaskDetailRow(task: task) { updatedTask in
                        Task {
                            await taskStore.updateTask(updatedTask)
                        }
                    }
                }
                .onDelete { indexSet in
                    let tasks = taskStore.tasksInQuadrant(quadrant)
                    for index in indexSet {
                        Task {
                            await taskStore.deleteTask(tasks[index])
                        }
                    }
                }
            }
            .navigationTitle(quadrant.title)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

struct TaskDetailRow: View {
    let task: Task
    let onUpdate: (Task) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Button(action: {
                    var updatedTask = task
                    updatedTask.isCompleted.toggle()
                    onUpdate(updatedTask)
                }) {
                    Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                        .foregroundColor(task.isCompleted ? .green : .gray)
                }
                
                Text(task.title)
                    .strikethrough(task.isCompleted)
            }
            
            if !task.description.isEmpty {
                Text(task.description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            HStack {
                Label(task.priority.title, systemImage: "flag.fill")
                    .font(.caption)
                    .foregroundColor(priorityColor(task.priority))
                
                if let dueDate = task.dueDate {
                    Label(dueDate, systemImage: "calendar")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
    }
    
    private func priorityColor(_ priority: Priority) -> Color {
        switch priority {
        case .low:
            return .blue
        case .medium:
            return .orange
        case .high:
            return .red
        }
    }
}
