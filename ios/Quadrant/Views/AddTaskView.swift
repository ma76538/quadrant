import SwiftUI
import QuadrantKit

struct AddTaskView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var taskStore: TaskStore
    
    @State private var title = ""
    @State private var description = ""
    @State private var quadrant: Quadrant = .urgentImportant
    @State private var priority: Priority = .medium
    @State private var dueDate = Date()
    @State private var hasDate = false
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Task Details")) {
                    TextField("Title", text: $title)
                    TextField("Description", text: $description, axis: .vertical)
                        .lineLimit(3...6)
                }
                
                Section(header: Text("Quadrant")) {
                    Picker("Quadrant", selection: $quadrant) {
                        ForEach(Quadrant.allCases, id: \.self) { quadrant in
                            Text(quadrant.title)
                                .tag(quadrant)
                        }
                    }
                }
                
                Section(header: Text("Priority")) {
                    Picker("Priority", selection: $priority) {
                        ForEach(Priority.allCases, id: \.self) { priority in
                            Text(priority.title)
                                .tag(priority)
                        }
                    }
                    .pickerStyle(.segmented)
                }
                
                Section(header: Text("Due Date")) {
                    Toggle("Has Due Date", isOn: $hasDate)
                    
                    if hasDate {
                        DatePicker(
                            "Due Date",
                            selection: $dueDate,
                            displayedComponents: [.date]
                        )
                    }
                }
            }
            .navigationTitle("New Task")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        let task = Task(
                            title: title,
                            description: description,
                            quadrant: quadrant,
                            dueDate: hasDate ? dueDate : nil,
                            priority: priority
                        )
                        
                        Task {
                            await taskStore.addTask(task)
                            dismiss()
                        }
                    }
                    .disabled(title.isEmpty)
                }
            }
        }
    }
}
