import Foundation
import CloudKit

public struct TaskRecord {
    static let recordType = "Task"
    
    static let fieldId = "id"
    static let fieldTitle = "title"
    static let fieldDesc = "description"
    static let fieldIsCompleted = "isCompleted"
    static let fieldQuadrant = "quadrant"
    static let fieldDueDate = "dueDate"
    static let fieldPriority = "priority"
    static let fieldTags = "tags"
    static let fieldCreatedAt = "createdAt"
    static let fieldUpdatedAt = "updatedAt"
    
    public static func toRecord(_ task: Task) -> CKRecord {
        let record = CKRecord(recordType: recordType)
        record.setValue(task.id.uuidString, forKey: fieldId)
        record.setValue(task.title, forKey: fieldTitle)
        record.setValue(task.description, forKey: fieldDesc)
        record.setValue(task.isCompleted, forKey: fieldIsCompleted)
        record.setValue(task.quadrant.rawValue, forKey: fieldQuadrant)
        record.setValue(task.dueDate, forKey: fieldDueDate)
        record.setValue(task.priority.rawValue, forKey: fieldPriority)
        record.setValue(Array(task.tags), forKey: fieldTags)
        record.setValue(task.createdAt, forKey: fieldCreatedAt)
        record.setValue(task.updatedAt, forKey: fieldUpdatedAt)
        return record
    }
    
    public static func fromRecord(_ record: CKRecord) -> Task? {
        guard let idString = record.value(forKey: fieldId) as? String,
              let id = UUID(uuidString: idString),
              let title = record.value(forKey: fieldTitle) as? String,
              let quadrantRaw = record.value(forKey: fieldQuadrant) as? Int,
              let quadrant = Quadrant(rawValue: quadrantRaw),
              let priorityRaw = record.value(forKey: fieldPriority) as? Int,
              let priority = Priority(rawValue: priorityRaw),
              let createdAt = record.value(forKey: fieldCreatedAt) as? Date,
              let updatedAt = record.value(forKey: fieldUpdatedAt) as? Date
        else {
            return nil
        }
        
        let description = record.value(forKey: fieldDesc) as? String ?? ""
        let isCompleted = record.value(forKey: fieldIsCompleted) as? Bool ?? false
        let dueDate = record.value(forKey: fieldDueDate) as? Date
        let tags = Set((record.value(forKey: fieldTags) as? [String]) ?? [])
        
        return Task(
            id: id,
            title: title,
            description: description,
            isCompleted: isCompleted,
            quadrant: quadrant,
            dueDate: dueDate,
            priority: priority,
            tags: tags,
            createdAt: createdAt,
            updatedAt: updatedAt
        )
    }
}
