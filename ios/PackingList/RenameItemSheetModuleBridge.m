#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RenameItemSheetModule, NSObject)

RCT_EXTERN_METHOD(show:(NSDictionary *)options
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end