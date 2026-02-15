import SwiftUI

struct ContentView: View {
    @StateObject private var healthKitManager = HealthKitManager()
    
    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                // Header
                VStack(spacing: 10) {
                    Image(systemName: "heart.fill")
                        .font(.system(size: 50))
                        .foregroundColor(.red)
                    
                    Text("Health Insights")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                    
                    Text("Phase 1: HealthKit Foundation")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.top, 40)
                
                Spacer()
                
                // Authorization Status
                VStack(spacing: 15) {
                    HStack {
                        Image(systemName: healthKitManager.isAuthorized ? "checkmark.circle.fill" : "exclamationmark.circle.fill")
                            .foregroundColor(healthKitManager.isAuthorized ? .green : .orange)
                        
                        Text("HealthKit Status:")
                            .fontWeight(.medium)
                        
                        Text(healthKitManager.authorizationStatus)
                            .foregroundColor(healthKitManager.isAuthorized ? .green : .primary)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(10)
                    
                    // Authorization Button
                    if !healthKitManager.isAuthorized {
                        Button(action: {
                            healthKitManager.requestAuthorization()
                        }) {
                            HStack {
                                Image(systemName: "lock.open.fill")
                                Text("Request HealthKit Permission")
                            }
                            .foregroundColor(.white)
                            .padding()
                            .background(Color.blue)
                            .cornerRadius(10)
                        }
                    }
                }
                
                // Step Count Display
                VStack(spacing: 20) {
                    Text("Today's Steps")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    
                    Text("\(healthKitManager.stepCount)")
                        .font(.system(size: 60, weight: .bold, design: .rounded))
                        .foregroundColor(.primary)
                    
                    HStack {
                        Image(systemName: "figure.walk")
                        Text("steps")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    // Refresh Button
                    if healthKitManager.isAuthorized {
                        Button(action: {
                            healthKitManager.fetchTodayStepCount()
                        }) {
                            HStack {
                                Image(systemName: "arrow.clockwise")
                                Text("Refresh")
                            }
                            .foregroundColor(.blue)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 8)
                            .background(Color.blue.opacity(0.1))
                            .cornerRadius(8)
                        }
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(15)
                .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
                
                Spacer()
                
                // Phase Progress
                VStack(spacing: 10) {
                    Text("🎯 Phase 1 Goals")
                        .font(.headline)
                    
                    VStack(alignment: .leading, spacing: 5) {
                        HStack {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                            Text("App opens")
                        }
                        
                        HStack {
                            Image(systemName: healthKitManager.isAuthorized ? "checkmark.circle.fill" : "circle")
                                .foregroundColor(healthKitManager.isAuthorized ? .green : .gray)
                            Text("Health permission works")
                        }
                        
                        HStack {
                            Image(systemName: healthKitManager.stepCount > 0 ? "checkmark.circle.fill" : "circle")
                                .foregroundColor(healthKitManager.stepCount > 0 ? .green : .gray)
                            Text("Shows step count on screen")
                        }
                    }
                    .font(.subheadline)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(10)
                
                Spacer()
            }
            .padding()
            .navigationTitle("")
            .navigationBarHidden(true)
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}