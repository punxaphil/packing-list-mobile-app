import UIKit

final class RenameItemSheetViewController: UIViewController {
  private let titleText: String
  private let duplicateMessage: String
  private let takenValues: Set<String>
  private let onCancel: () -> Void
  private let onSubmit: (String) -> Void
  private let textField = UITextField()
  private let errorLabel = UILabel()
  private lazy var saveButtonItem = UIBarButtonItem(barButtonSystemItem: .done, target: self, action: #selector(saveTapped))

  init(options: NSDictionary, onCancel: @escaping () -> Void, onSubmit: @escaping (String) -> Void) {
    titleText = options["title"] as? String ?? ""
    duplicateMessage = options["duplicateMessage"] as? String ?? ""
    takenValues = Set((options["takenValues"] as? [String] ?? []).map { $0.lowercased() })
    self.onCancel = onCancel
    self.onSubmit = onSubmit
    super.init(nibName: nil, bundle: nil)
    textField.text = options["initialValue"] as? String ?? ""
  }

  @available(*, unavailable)
  required init?(coder: NSCoder) { nil }

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = .systemGroupedBackground
    isModalInPresentation = true
    configureNavigation()
    configureContent()
    updateState()
  }

  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    textField.becomeFirstResponder()
  }

  private func configureNavigation() {
    navigationItem.title = titleText
    navigationItem.leftBarButtonItem = UIBarButtonItem(barButtonSystemItem: .close, target: self, action: #selector(cancelTapped))
    navigationItem.rightBarButtonItem = saveButtonItem
  }

  private func configureContent() {
    textField.borderStyle = .roundedRect
    textField.clearButtonMode = .whileEditing
    textField.font = .preferredFont(forTextStyle: .body)
    textField.backgroundColor = .secondarySystemGroupedBackground
    textField.addTarget(self, action: #selector(textDidChange), for: .editingChanged)
    textField.translatesAutoresizingMaskIntoConstraints = false
    errorLabel.font = .preferredFont(forTextStyle: .footnote)
    errorLabel.textColor = .systemRed
    errorLabel.numberOfLines = 0
    errorLabel.isHidden = true
    let stack = UIStackView(arrangedSubviews: [textField, errorLabel])
    stack.axis = .vertical
    stack.spacing = 8
    stack.translatesAutoresizingMaskIntoConstraints = false
    view.addSubview(stack)
    NSLayoutConstraint.activate([
      stack.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 24),
      stack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
      stack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
      textField.heightAnchor.constraint(equalToConstant: 44),
    ])
  }

  private func updateState() {
    let value = currentValue
    let invalid = value.isEmpty || takenValues.contains(value.lowercased())
    errorLabel.text = takenValues.contains(value.lowercased()) ? duplicateMessage : nil
    errorLabel.isHidden = errorLabel.text == nil
    saveButtonItem.isEnabled = !invalid
  }

  private var currentValue: String { textField.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? "" }

  @objc private func textDidChange() { updateState() }

  @objc private func cancelTapped() { dismiss(animated: true, completion: onCancel) }

  @objc private func saveTapped() {
    let value = currentValue
    dismiss(animated: true) { self.onSubmit(value) }
  }
}