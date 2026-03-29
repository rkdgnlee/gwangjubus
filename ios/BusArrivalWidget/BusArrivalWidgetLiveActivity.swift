import ActivityKit
import WidgetKit
import SwiftUI

#if os(iOS)
// 위젯 타겟이 App 타겟의 구조체를 볼 수 있도록 동일한 정의를 추가합니다.
struct BusArrivalAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var routeNo: String
        var remainStops: Int
    }
    var stopName: String
}

struct BusArrivalWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: BusArrivalAttributes.self) { context in
            // 잠금 화면에 표시될 UI
            VStack {
                HStack {
                    Text("🚌 \(context.state.routeNo)번 버스")
                        .font(.headline)
                    Spacer()
                    Text("\(context.state.remainStops)정거장 전")
                        .foregroundColor(.green)
                        .bold()
                }
                Text(context.attributes.stopName)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding()

        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text("🚌 \(context.state.routeNo)번")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("\(context.state.remainStops)전")
                        .foregroundColor(.green)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text(context.attributes.stopName)
                        .font(.caption)
                }
            } compactLeading: { Text("🚌") }
            compactTrailing: { Text("\(context.state.remainStops)전").foregroundColor(.green) }
            minimal: { Text("\(context.state.remainStops)").foregroundColor(.green) }
            .keylineTint(Color.green)
        }
    }
}
#endif