import SwiftUI
import QuadrantKit

struct ContentView: View {
    @EnvironmentObject private var taskStore: TaskStore
    @State private var selectedQuadrant: Quadrant?
    @State private var showingAddTask = false
    
    private let columns = [
        GridItem(.flexible()),
        GridItem(.flexible())
    ]
    
    var body: some View {
        NavigationView {
            ScrollView {
                LazyVGrid(columns: columns, spacing: 16) {
                    ForEach(Quadrant.allCases, id: \.self) { quadrant in
                        QuadrantView(quadrant: quadrant, tasks: taskStore.tasksInQuadrant(quadrant))
                            .onTapGesture {
                                selectedQuadrant = quadrant
                            }
                    }
                }
                .padding()
            }
            .navigationTitle("Quadrant")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button(action: { showingAddTask = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddTask) {
                AddTaskView()
            }
            .sheet(item: $selectedQuadrant) { quadrant in
                QuadrantDetailView(quadrant: quadrant)
            }
            .task {
                await taskStore.loadTasks()
            }
        }
    }
}
