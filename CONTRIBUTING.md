# Contributing to Weight Loss Tracker

Thank you for your interest in contributing to the Weight Loss Tracker! This document provides guidelines and information for contributors.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/weight-loss-tracker.git
   cd weight-loss-tracker
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code formatting (we use ESLint)
- Use meaningful variable and function names
- Add comments for complex logic
- Follow React best practices and hooks patterns

### Commit Messages

We follow conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

Example: `feat: add BMI calculation with metric units`

### Testing

- Test your changes thoroughly in development
- Ensure the app works both online and offline
- Test Airtable integration if applicable
- Verify responsive design on different screen sizes

## Feature Requests

Before implementing new features:

1. **Check existing issues** to avoid duplicates
2. **Open an issue** to discuss the feature
3. **Wait for approval** before starting work
4. **Reference the issue** in your pull request

## Pull Request Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the guidelines above

3. **Test thoroughly**:
   ```bash
   npm run build
   npm run lint
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: your descriptive commit message"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** with:
   - Clear description of changes
   - Screenshots if UI changes
   - Reference to related issues
   - Test instructions

## Bug Reports

When reporting bugs, please include:

- **Description** of the issue
- **Steps to reproduce** the problem
- **Expected behavior**
- **Actual behavior**
- **Browser/OS information**
- **Screenshots** if applicable
- **Error messages** from console

## Areas for Contribution

We welcome contributions in these areas:

### Features
- Additional chart types and visualizations
- More export/import formats
- Integration with other fitness APIs
- Mobile app development
- Advanced statistics and analytics

### Improvements
- Performance optimizations
- Accessibility enhancements
- UI/UX improvements
- Better error handling
- Code documentation

### Bug Fixes
- Cross-browser compatibility
- Edge case handling
- Data validation improvements
- Sync reliability

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help newcomers get started
- Focus on the technical aspects
- Maintain a positive environment

## Questions?

If you have questions about contributing:

1. Check existing issues and discussions
2. Open a new issue with the "question" label
3. Be specific about what you need help with

Thank you for contributing to the Weight Loss Tracker! 🎉