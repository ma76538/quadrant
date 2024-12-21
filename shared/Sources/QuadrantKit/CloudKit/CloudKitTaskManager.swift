import Foundation
import CloudKit

public class CloudKitTaskManager: TaskManagerProtocol {
    private let container: CKContainer
    private let database: CKDatabase
    
    public init(containerIdentifier: String) {
        self.container = CKContainer(identifier: containerIdentifier)
        self.database = container.privateCloudDatabase
    }
    
    public func createTask(_ task: Task) async throws {
        let record = TaskRecord.toRecord(task)
        try await database.save(record)
    }
    
    public func updateTask(_ task: Task) async throws {
        let predicate = NSPredicate(format: "\(TaskRecord.fieldId) == %@", task.id.uuidString)
        let query = CKQuery(recordType: TaskRecord.recordType, predicate: predicate)
        
        let (results, _) = try await database.records(matching: query)
        guard let record = results.first?.1.record else {
            throw TaskError.taskNotFound
        }
        
        let updatedRecord = TaskRecord.toRecord(task)
        record.setValuesForKeys(updatedRecord.dictionaryWithValues(forKeys: record.allKeys()))
        
        try await database.save(record)
    }
    
    public func deleteTask(_ taskId: UUID) async throws {
        let predicate = NSPredicate(format: "\(TaskRecord.fieldId) == %@", taskId.uuidString)
        let query = CKQuery(recordType: TaskRecord.recordType, predicate: predicate)
        
        let (results, _) = try await database.records(matching: query)
        guard let recordID = results.first?.1.record.recordID else {
            throw TaskError.taskNotFound
        }
        
        try await database.deleteRecord(withID: recordID)
    }
    
    public func fetchTasks() async throws -> [Task] {
        let query = CKQuery(recordType: TaskRecord.recordType, predicate: NSPredicate(value: true))
        query.sortDescriptors = [NSSortDescriptor(key: TaskRecord.fieldCreatedAt, ascending: false)]
        
        var tasks: [Task] = []
        var cursor: CKQueryOperation.Cursor?
        
        repeat {
            let (results, newCursor) = try await database.records(matching: query, cursor: cursor)
            cursor = newCursor
            
            for result in results {
                if let task = TaskRecord.fromRecord(result.1.record) {
                    tasks.append(task)
                }
            }
        } while cursor != nil
        
        return tasks
    }
    
    public func fetchTasks(in quadrant: Quadrant) async throws -> [Task] {
        let predicate = NSPredicate(format: "\(TaskRecord.fieldQuadrant) == %d", quadrant.rawValue)
        let query = CKQuery(recordType: TaskRecord.recordType, predicate: predicate)
        query.sortDescriptors = [NSSortDescriptor(key: TaskRecord.fieldCreatedAt, ascending: false)]
        
        let (results, _) = try await database.records(matching: query)
        return results.compactMap { TaskRecord.fromRecord($0.1.record) }
    }
    
    public func fetchTasks(withTags tags: Set<String>) async throws -> [Task] {
        let predicate = NSPredicate(format: "ANY \(TaskRecord.fieldTags) IN %@", Array(tags))
        let query = CKQuery(recordType: TaskRecord.recordType, predicate: predicate)
        query.sortDescriptors = [NSSortDescriptor(key: TaskRecord.fieldCreatedAt, ascending: false)]
        
        let (results, _) = try await database.records(matching: query)
        return results.compactMap { TaskRecord.fromRecord($0.1.record) }
    }
    
    public func subscribeToChanges() async throws {
        let subscription = CKQuerySubscription(
            recordType: TaskRecord.recordType,
            predicate: NSPredicate(value: true),
            subscriptionID: "tasks-changes",
            options: [.firesOnRecordCreation, .firesOnRecordDeletion, .firesOnRecordUpdate]
        )
        
        let notificationInfo = CKSubscription.NotificationInfo()
        notificationInfo.shouldSendContentAvailable = true
        subscription.notificationInfo = notificationInfo
        
        try await database.save(subscription)
    }
}
