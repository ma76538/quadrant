import SwiftUI
import QuadrantKit

struct QuadrantView: View {
    let quadrant: Quadrant
    let tasks: [Task]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(quadrant.title)
                .font(.headline)
            
            Text(quadrant.description)
                .font(.caption)
                .foregroundColor(.secondary)
            
            Divider()
            
            ForEach(tasks.prefix(3)) { task in
                TaskRow(task: task)
            }
            
            if tasks.count > 3 {
                Text("+ \(tasks.count - 3) more")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}

struct TaskRow: View {
    let task: Task
    
    var body: some View {
        HStack {
            Circle()
                .fill(task.isCompleted ? Color.green : Color.clear)
                .stroke(Color.green, lineWidth: 1)
                .frame(width: 20, height: 20)
            
            Text(task.title)
                .strikethrough(task.isCompleted)
            
            Spacer()
            
            if let dueDate = task.dueDate {
                Text(dueDate, style: .date)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
}
