import XCTest

@MainActor
final class PackingListScreenshots: XCTestCase {
  let app = XCUIApplication()

  override func setUp() {
    super.setUp()
    continueAfterFailure = false
    setupSnapshot(app)
    app.launch()
  }

  func testTakeScreenshots() {
    sleep(3)
    snapshot("01_Home")

    // Navigate to Lists tab
    let listsTab = app.tabBars.buttons["Lists"]
    if listsTab.exists {
      listsTab.tap()
      sleep(2)
      snapshot("02_Lists")
    }

    // Open space/sharing sheet
    let spaceButton = app.buttons["spaces"]
    if spaceButton.exists {
      spaceButton.tap()
      sleep(2)
      snapshot("03_Sharing")
      app.buttons["close"].firstMatch.tap()
      sleep(1)
    }

    // Open filters
    let filterButton = app.buttons["filter"]
    if filterButton.exists {
      filterButton.tap()
      sleep(2)
      snapshot("04_Filters")
      app.buttons["close"].firstMatch.tap()
      sleep(1)
    }

    // Open list info/notes
    let infoButton = app.buttons["info"]
    if infoButton.exists {
      infoButton.tap()
      sleep(2)
      snapshot("05_Notes")
    }
  }
}
