# Contributing to Invoice Generator & Payment Tracker

Thank you for your interest in contributing! We're excited to have you on board. Please take a moment to review this document for guidelines on how to contribute to this project.

## 🚀 Getting Started

1. **Fork the repository** on GitHub.
2. **Clone** the forked repository to your local machine:
   ```bash
   git clone https://github.com/your-username/invoice-generator-payment-tracker.git
   cd invoice-generator-payment-tracker
   ```
3. **Set up** the development environment (see [README.md](README.md) for instructions).
4. **Create a new branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/issue-number-description
   ```

## 🛠 Development Workflow

### Code Style
- Follow the existing code style and formatting.
- Use meaningful variable and function names.
- Keep functions small and focused on a single responsibility.
- Add comments to explain complex logic.
- Write tests for new features and bug fixes.

### Commit Message Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) for our commit messages. The format should be:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Example:
```
feat(invoices): add bulk delete functionality

Add the ability to delete multiple invoices at once.

Closes #123
```

### Pull Request Process

1. Ensure all tests pass before submitting a PR.
2. Update the README.md with details of changes if needed.
3. Reference any related issues in your PR description.
4. You may merge the PR once you have at least one approval.

## 🧪 Testing

### Running Tests

```bash
# Run all tests
cd server && npm test
cd ../client && npm test

# Run tests in watch mode
npm test -- --watch

# Generate test coverage report
npm test -- --coverage
```

### Test Coverage
We aim to maintain high test coverage. Please ensure your contributions include appropriate tests.

## 📝 Reporting Issues

When creating an issue, please include:
- A clear title and description
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable
- Browser/OS version if relevant

## 🏷 Pull Request Labels

- `bug` - Indicates an unexpected problem or unintended behavior
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `dependencies` - Updates to dependencies
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

## 🙏 Thank You!

Your contributions to open source, large or small, make great projects like this possible. Thank you for being part of our community!
