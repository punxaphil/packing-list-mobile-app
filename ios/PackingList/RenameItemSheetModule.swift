import React
import UIKit

@objc(RenameItemSheetModule)
final class RenameItemSheetModule: NSObject {
  @objc static func requiresMainQueueSetup() -> Bool { true }

  @objc(show:resolve:reject:)
  func show(_ options: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      guard let presenter = Self.topViewController() else {
        reject("no_presenter", "Unable to present rename sheet.", nil)
        return
      }
      let controller = RenameItemSheetViewController(options: options, onCancel: { resolve(NSNull()) }, onSubmit: resolve)
      let navigationController = UINavigationController(rootViewController: controller)
      Self.configureSheet(navigationController)
      presenter.present(navigationController, animated: true)
    }
  }

  private static func configureSheet(_ navigationController: UINavigationController) {
    navigationController.modalPresentationStyle = .pageSheet
    guard let sheet = navigationController.sheetPresentationController else { return }
    sheet.detents = [.large()]
    sheet.prefersGrabberVisible = false
    sheet.preferredCornerRadius = 32
  }

  private static func topViewController(_ controller: UIViewController? = activeWindow()?.rootViewController) -> UIViewController? {
    if let navigationController = controller as? UINavigationController { return topViewController(navigationController.visibleViewController) }
    if let tabBarController = controller as? UITabBarController { return topViewController(tabBarController.selectedViewController) }
    if let presentedViewController = controller?.presentedViewController { return topViewController(presentedViewController) }
    return controller
  }

  private static func activeWindow() -> UIWindow? {
    UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap(\.windows)
      .first(where: \.isKeyWindow)
  }
}