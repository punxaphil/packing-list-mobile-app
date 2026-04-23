import UIKit

final class ReminderDatePickerViewController: UIViewController {
  private let onCancel: () -> Void
  private let onClear: () -> Void
  private let onSubmit: (Double) -> Void
  private let datePicker = UIDatePicker()

  init(options: NSDictionary, onCancel: @escaping () -> Void, onClear: @escaping () -> Void, onSubmit: @escaping (Double) -> Void) {
    self.onCancel = onCancel
    self.onClear = onClear
    self.onSubmit = onSubmit
    super.init(nibName: nil, bundle: nil)
    if let timestamp = options["timestamp"] as? Double {
      datePicker.date = Date(timeIntervalSince1970: timestamp / 1000)
    }
  }

  @available(*, unavailable)
  required init?(coder: NSCoder) { nil }

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = .systemGroupedBackground
    navigationItem.title = "Due Date"
    navigationItem.leftBarButtonItem = UIBarButtonItem(barButtonSystemItem: .close, target: self, action: #selector(cancelTapped))
    navigationItem.rightBarButtonItem = UIBarButtonItem(barButtonSystemItem: .done, target: self, action: #selector(doneTapped))
    configurePicker()
    configureClearButton()
  }

  private func configurePicker() {
    datePicker.datePickerMode = .dateAndTime
    datePicker.minimumDate = Date()
    datePicker.preferredDatePickerStyle = .wheels
    datePicker.translatesAutoresizingMaskIntoConstraints = false
    view.addSubview(datePicker)
    NSLayoutConstraint.activate([
      datePicker.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 16),
      datePicker.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
      datePicker.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),
    ])
  }

  private func configureClearButton() {
    let button = UIButton(type: .system)
    button.configuration = .plain()
    button.setTitle("Clear Due Date", for: .normal)
    button.addTarget(self, action: #selector(clearTapped), for: .touchUpInside)
    button.translatesAutoresizingMaskIntoConstraints = false
    view.addSubview(button)
    NSLayoutConstraint.activate([
      button.topAnchor.constraint(equalTo: datePicker.bottomAnchor, constant: 12),
      button.centerXAnchor.constraint(equalTo: view.centerXAnchor),
      button.bottomAnchor.constraint(lessThanOrEqualTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -16),
    ])
  }

  @objc private func cancelTapped() { dismiss(animated: true, completion: onCancel) }

  @objc private func clearTapped() { dismiss(animated: true, completion: onClear) }

  @objc private func doneTapped() {
    let timestamp = datePicker.date.timeIntervalSince1970 * 1000
    dismiss(animated: true) { self.onSubmit(timestamp) }
  }
}