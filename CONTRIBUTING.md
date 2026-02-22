# Contributing to Resume Generator

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🎯 How to Contribute

### Report Bugs
- Search existing issues first
- Create a new issue with a clear title and description
- Include:
  - Steps to reproduce
  - Expected behavior
  - Actual behavior
  - Screenshots/logs if applicable
  - Your environment (OS, browser, Node version)

### Suggest Enhancements
- Use issue template for feature requests
- Describe the problem/use case
- Propose a solution or workaround
- Label as `enhancement`

### Submit Code Changes
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages: `git commit -m "Add feature: description"`
6. Push to your fork
7. Create a Pull Request

## 📋 Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/resumeCreator.git
cd resumeCreator

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add your OpenRouter API key

# Start development server
npm start
```

## 🔍 Code Style

### React Components
- Use functional components with hooks
- Keep components focused and single-responsibility
- Use descriptive component names
- Add PropTypes or JSDoc comments

### File Naming
- Components: `PascalCase.jsx` (e.g., `ProfileForm.jsx`)
- Utilities/Services: `camelCase.js` (e.g., `jobTargetingService.js`)
- `index.js` for exports

### Tailwind CSS
- Use utility classes for styling
- Keep component-specific styles in CSS files when needed
- Maintain responsive design patterns
- Use Tailwind breakpoints (md:, lg:, etc.)

## 🧪 Testing

- Write tests for new features
- Run tests: `npm test`
- Aim for >80% code coverage
- Test edge cases and error scenarios

## 📝 Commit Messages

Follow conventional commit format:
```
type(scope): subject

body

footer
```

**Types**: feat, fix, docs, style, refactor, test, chore

**Examples**:
```
feat(JobAnalysis): add tooltip for missing keywords
fix(ResumePDF): correct date formatting for education section
docs(README): update setup instructions
```

## 🚀 Pull Request Process

1. Update README if adding features
2. Update SECURITY.md if making security changes
3. Run `npm audit` and fix any vulnerabilities
4. Ensure all tests pass
5. Keep PR focused on single feature/fix
6. Add description explaining changes
7. Link related issues using `Closes #123`

## 📦 Adding Dependencies

Before adding a new package:
1. Check if functionality exists in current deps
2. Verify package is maintained and secure
3. Run `npm audit` after adding
4. Document why it's needed in commit message

**Avoid adding if**:
- Already available in React/Tailwind
- Adds significant bundle size
- Introduces security vulnerabilities
- Not actively maintained

## 🎨 UI/UX Guidelines

- Keep consistent with existing design
- Use the current Tailwind color scheme
- Ensure responsive design (mobile-first)
- Test on multiple browsers
- Maintain accessibility (WCAG 2.1 AA)
- Add loading states for async operations

## 📚 Documentation

- Update README for user-facing changes
- Add JSDoc comments for complex functions
- Keep documentation up-to-date
- Include examples for new features
- Document breaking changes clearly

## 🐛 Bug Fix Process

1. Create issue if one doesn't exist
2. Create branch: `git checkout -b fix/issue-number`
3. Fix the bug
4. Add test to prevent regression
5. Create PR with link to issue

## ✅ Checklist Before Submitting PR

- [ ] Code follows project style
- [ ] Tests pass locally
- [ ] `npm audit` shows no vulnerabilities
- [ ] No console errors/warnings
- [ ] Documentation updated
- [ ] Git history is clean
- [ ] Commit messages are clear
- [ ] PR description is detailed

## 🚫 What Not to Do

- Don't commit `.env` or sensitive files
- Don't remove existing features without discussion
- Don't introduce breaking changes without planning
- Don't add large dependencies without justification
- Don't commit commented-out code
- Don't use `console.log` in production code

## 💡 Good First Issues

Look for issues labeled `good first issue` or `help wanted` if you're new to the project.

## 🤝 Code Review

- Be open to feedback
- Respond to reviewer comments courteously
- Make requested changes in new commits
- Resolve all conversations before merging
- Thank reviewers for their time

## 📞 Questions?

- Check existing documentation
- Search previous issues and discussions
- Ask in issue/PR comments
- Create a new discussion if needed

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing!** 🙏

Your contributions make Resume Generator better for everyone.
