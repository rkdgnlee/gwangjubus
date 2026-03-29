import Foundation
import ActivityKit

#if os(iOS)

// 다이나믹 아일랜드에 표시될 데이터 구조 정의
struct BusArrivalAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var routeNo: String
        var remainStops: Int
    }
    var stopName: String
}

@objc(LiveActivityModule)
class LiveActivityModule: NSObject {
    
    private var currentActivity: Activity<BusArrivalAttributes>? = nil
    
    @objc(startActivity:routeId:)
    func startActivity(stopName: String, routeId: String) {
        guard ActivityAuthorizationInfo().areActivitiesEnabled else { return }
        
        let attributes = BusArrivalAttributes(stopName: stopName)
        let contentState = BusArrivalAttributes.ContentState(routeNo: "-", remainStops: 0)
        
        do {
            currentActivity = try Activity.request(
                attributes: attributes,
                content: .init(state: contentState, staleDate: nil)
            )
            print("Live Activity Started")
        } catch {
            print("Error starting Live Activity: \(error.localizedDescription)")
        }
    }
    
    @objc(updateActivity:remainStops:)
    func updateActivity(routeNo: String, remainStops: Int) {
        Task {
            let updatedState = BusArrivalAttributes.ContentState(routeNo: routeNo, remainStops: remainStops)
            await currentActivity?.update(using: updatedState)
        }
    }
    
    @objc
    func stopActivity() {
        Task {
            for activity in Activity<BusArrivalAttributes>.activities {
                await activity.end(dismissalPolicy: .immediate)
            }
        }
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
}

#endif