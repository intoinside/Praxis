# Contributing to Praxis

Thank you for your interest in contributing to Praxis! We welcome
contributions from the community to help improve the intent/spec-driven
development experience.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Adding New Agent Support](#adding-new-agent-support)
- [Testing](#testing-requirements)
- [Documentation](#documentation)
- [Release Process](#release-process)
- [Community](#community)

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/your-username/praxis.git
   cd praxis
   ```

3. **Set up the development environment** (see [Development Setup](#development-setup))
4. **Create a feature branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Make your changes** and ensure tests pass
6. **Submit a pull request** with a clear description of your changes

## Development Setup

### Prerequisites

- **Git**
- **Supported AI agent** (for testing)

## Contributing Guidelines

### Code Standards

- **Follow PEP 8** for Python code style
- **Use type hints** for all function signatures
- **Write docstrings** for all public functions and classes
- **Keep functions small** and focused on single responsibilities
- **Use meaningful variable names** and avoid abbreviations

### Commit Guidelines

- **Use conventional commits**: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- **Write clear commit messages** explaining what and why
- **Reference issues** when applicable: `Fixes #123`, `Closes #456`
- **Keep commits atomic** - one logical change per commit

### Pull Request Process

1. **Update documentation** if you're changing functionality
2. **Add tests** for new features or bug fixes
3. **Submit your PR** with a clear description

### Testing Requirements

- **Unit tests** for all new functionality
- **Integration tests** for CLI commands and agent interactions
- **Cross-platform tests** (Windows, macOS, Linux)
- **Agent compatibility tests** for all supported AI agents

## Documentation

### Documentation Structure

- **`README.md`**: Main project overview and getting started guide
- **Inline documentation**: Code comments and docstrings

### Writing Documentation

- **Use clear, concise language** appropriate for the audience
- **Include examples** for complex features
- **Keep documentation in sync** with code changes
- **Use relative links** for internal references
- **Test code examples** to ensure they work

## Community

### Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and discussions
- **Documentation**: Check the docs first for common questions

### Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md) when participating in the Praxis community.

### Recognition

Contributors who make significant improvements to Praxis may be recognized in the project documentation or release notes.

---

Thank you for contributing! Your help makes Praxis better for everyone.
