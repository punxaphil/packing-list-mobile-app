import React
import UIKit
import UserNotifications

@objc(PackingListReminderModule)
final class PackingListReminderModule: RCTEventEmitter {
  private static let eventName = "PackingListReminderOpen"
  private static var pendingReminderTarget: [String: String]?
  private static weak var emitter: PackingListReminderModule?

  private var hasListeners = false

  override init() {
    super.init()
    Self.emitter = self
  }

  @objc override class func requiresMainQueueSetup() -> Bool { true }

  override func supportedEvents() -> [String]! { [Self.eventName] }

  override func startObserving() {
    hasListeners = true
    flushPendingReminderTarget()
  }

  override func stopObserving() {
    hasListeners = false
  }

  @objc(showDatePicker:resolve:reject:)
  func showDatePicker(_ options: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      guard let presenter = Self.topViewController() else {
        reject("no_presenter", "Unable to present due date picker.", nil)
        return
      }
      let controller = ReminderDatePickerViewController(
        options: options,
        onCancel: { resolve(["action": "cancel"]) },
        onClear: { resolve(["action": "clear"]) },
        onSubmit: { resolve(["action": "set", "timestamp": $0]) }
      )
      let navigationController = UINavigationController(rootViewController: controller)
      Self.configureSheet(navigationController)
      presenter.present(navigationController, animated: true)
    }
  }

  @objc(schedule:resolve:reject:)
  func schedule(_ options: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    guard
      let listId = options["listId"] as? String,
      let spaceId = options["spaceId"] as? String,
      let timestamp = options["timestamp"] as? Double
    else {
      reject("invalid_options", "Missing reminder options.", nil)
      return
    }
    let title = options["title"] as? String ?? "Packing list reminder"
    let body = options["body"] as? String ?? "Don't forget your packing list."
    let center = UNUserNotificationCenter.current()
    center.requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
      if let error {
        reject("notification_error", error.localizedDescription, error)
        return
      }
      guard granted else {
        reject("notification_denied", "Notifications are disabled.", nil)
        return
      }
      let dueDate = Date(timeIntervalSince1970: timestamp / 1000)
      guard dueDate.timeIntervalSinceNow > 0 else {
        self.cancelReminder(identifier: listId)
        resolve(nil)
        return
      }
      self.scheduleReminder(
        center: center,
        dueDate: dueDate,
        listId: listId,
        spaceId: spaceId,
        title: title,
        body: body,
        resolve: resolve,
        reject: reject
      )
    }
  }

  @objc(cancel:resolve:reject:)
  func cancel(_ options: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    guard
      let listId = options["listId"] as? String,
      let spaceId = options["spaceId"] as? String
    else {
      reject("invalid_options", "Missing reminder cancel options.", nil)
      return
    }
    cancelReminder(listId: listId, spaceId: spaceId)
    resolve(nil)
  }

  private func scheduleReminder(
    center: UNUserNotificationCenter,
    dueDate: Date,
    listId: String,
    spaceId: String,
    title: String,
    body: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    cancelReminder(listId: listId, spaceId: spaceId)
    let content = UNMutableNotificationContent()
    content.title = title
    content.body = body
    content.sound = .default
    content.userInfo = ["listId": listId, "spaceId": spaceId]
    let components = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: dueDate)
    let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
    let request = UNNotificationRequest(identifier: Self.notificationId(for: listId, spaceId: spaceId), content: content, trigger: trigger)
    center.add(request) { error in
      if let error {
        reject("schedule_failed", error.localizedDescription, error)
        return
      }
      resolve(nil)
    }
  }

  private func cancelReminder(listId: String, spaceId: String) {
    let notificationId = Self.notificationId(for: listId, spaceId: spaceId)
    let center = UNUserNotificationCenter.current()
    center.removePendingNotificationRequests(withIdentifiers: [notificationId])
    center.removeDeliveredNotifications(withIdentifiers: [notificationId])
  }

  private static func notificationId(for listId: String, spaceId: String) -> String {
    "packing-list-reminder-\(spaceId)-\(listId)"
  }

  private static func configureSheet(_ navigationController: UINavigationController) {
    navigationController.modalPresentationStyle = .pageSheet
    guard let sheet = navigationController.sheetPresentationController else { return }
    sheet.detents = [.medium()]
    sheet.preferredCornerRadius = 32
  }

  private func flushPendingReminderTarget() {
    guard hasListeners, let target = Self.pendingReminderTarget else { return }
    Self.pendingReminderTarget = nil
    sendEvent(withName: Self.eventName, body: target)
  }

  static func handleReminderOpen(listId: String, spaceId: String?) {
    let target = ["listId": listId, "spaceId": spaceId ?? ""]
    guard let emitter else {
      pendingReminderTarget = target
      return
    }
    if emitter.hasListeners {
      emitter.sendEvent(withName: eventName, body: target)
      return
    }
    pendingReminderTarget = target
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