import SwiftUI
import QuadrantKit

@main
struct QuadrantApp: App {
    @StateObject private var taskStore = TaskStore()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(taskStore)
        }
    }
}
