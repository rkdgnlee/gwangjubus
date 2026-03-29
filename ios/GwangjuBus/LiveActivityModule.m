#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(LiveActivityModule, NSObject)

RCT_EXTERN_METHOD(startActivity:(NSString *)stopName routeId:(NSString *)routeId)
RCT_EXTERN_METHOD(updateActivity:(NSString *)routeNo remainStops:(NSInteger)remainStops)
RCT_EXTERN_METHOD(stopActivity)

@end