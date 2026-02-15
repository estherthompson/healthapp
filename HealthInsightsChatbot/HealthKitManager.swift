import Foundation
import HealthKit

class HealthKitManager: ObservableObject {
    private let healthStore = HKHealthStore()
    
    @Published var stepCount: Int = 0
    @Published var isAuthorized: Bool = false
    @Published var authorizationStatus: String = "Not requested"
    
    init() {
        checkAuthorizationStatus()
    }
    
    // MARK: - Authorization
    
    func requestAuthorization() {
        // Check if HealthKit is available on this device
        guard HKHealthStore.isHealthDataAvailable() else {
            authorizationStatus = "HealthKit not available"
            return
        }
        
        // Define what we want to read
        let typesToRead: Set<HKObjectType> = [
            HKObjectType.quantityType(forIdentifier: .stepCount)!
        ]
        
        // Request authorization
        healthStore.requestAuthorization(toShare: [], read: typesToRead) { [weak self] success, error in
            DispatchQueue.main.async {
                if success {
                    self?.isAuthorized = true
                    self?.authorizationStatus = "Authorized"
                    // Automatically fetch step count after authorization
                    self?.fetchTodayStepCount()
                } else {
                    self?.authorizationStatus = "Authorization denied"
                    if let error = error {
                        print("HealthKit authorization error: \(error.localizedDescription)")
                    }
                }
            }
        }
    }
    
    private func checkAuthorizationStatus() {
        guard HKHealthStore.isHealthDataAvailable() else {
            authorizationStatus = "HealthKit not available"
            return
        }
        
        let stepCountType = HKObjectType.quantityType(forIdentifier: .stepCount)!
        let status = healthStore.authorizationStatus(for: stepCountType)
        
        switch status {
        case .notDetermined:
            authorizationStatus = "Not requested"
        case .sharingDenied:
            authorizationStatus = "Access denied"
        case .sharingAuthorized:
            isAuthorized = true
            authorizationStatus = "Authorized"
            fetchTodayStepCount()
        @unknown default:
            authorizationStatus = "Unknown status"
        }
    }
    
    // MARK: - Data Fetching
    
    func fetchTodayStepCount() {
        guard isAuthorized else {
            print("Not authorized to read step count")
            return
        }
        
        let stepType = HKQuantityType.quantityType(forIdentifier: .stepCount)!
        
        // Create date range for today
        let calendar = Calendar.current
        let startDate = calendar.startOfDay(for: Date())
        let endDate = Date()
        
        let predicate = HKQuery.predicateForSamples(
            withStart: startDate,
            end: endDate,
            options: .strictStartDate
        )
        
        // Create statistics query to sum up all step counts for today
        let query = HKStatisticsQuery(
            quantityType: stepType,
            quantitySamplePredicate: predicate,
            options: .cumulativeSum
        ) { [weak self] _, result, error in
            DispatchQueue.main.async {
                if let error = error {
                    print("Error fetching step count: \(error.localizedDescription)")
                    return
                }
                
                if let result = result,
                   let sum = result.sumQuantity() {
                    let steps = Int(sum.doubleValue(for: HKUnit.count()))
                    self?.stepCount = steps
                } else {
                    self?.stepCount = 0
                }
            }
        }
        
        healthStore.execute(query)
    }
}