# Contributing to Ploutos

Thank you for your interest in contributing to Ploutos! This document outlines our contribution guidelines and workflow.

## Code of Conduct

We are committed to providing a welcoming and inspiring community. Please read and adhere to our Code of Conduct:
- Be respectful and inclusive
- Welcome diverse perspectives
- Focus on what is best for the community
- Show empathy towards others

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Ploutos.git
   cd Ploutos
   git remote add upstream https://github.com/DYoussef999/Ploutos.git
   ```
3. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Set up your development environment** (see [README.md](./README.md#quick-start))

## Development Workflow

### Branch Naming
- Features: `feature/description`
- Bugfixes: `fix/description`
- Documentation: `docs/description`
- Chores: `chore/description`

Example: `feature/add-location-clustering`

### Commit Messages
Write clear, descriptive commit messages in the imperative mood:

```
✅ Good:
- Add location clustering feature
- Fix race condition in canvas sync
- Update API documentation

❌ Don't:
- Added location clustering
- Fixed race condition
- Documentation updates
```

### Code Style

**Python (Backend)**
- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/)
- Use type hints for function signatures
- Max line length: 100 characters
- Use `black` for formatting: `black backend/`
- Use `flake8` for linting: `flake8 backend/`

```python
# Good
async def analyze_canvas(
    canvas_state: dict[str, Any],
) -> FinancialHealthReport:
    """Analyze canvas and return financial report."""
    ...

# Avoid
def analyze(state):
    # missing type hints, unclear parameter names
    ...
```

**JavaScript/TypeScript (Frontend)**
- Follow [Airbnb Style Guide](https://github.com/airbnb/javascript)
- Use Prettier for formatting: `npm run format`
- Use ESLint for linting: `npm run lint`
- Prefer TypeScript over JavaScript
- Use functional components with hooks (React 18+)

```typescript
// Good
interface CanvasNode {
  id: string;
  label: string;
  type: 'revenue' | 'expense';
}

export function NodeComponent({ node }: { node: CanvasNode }) {
  return <div>{node.label}</div>;
}

// Avoid
export default function NodeComponent(props) {
  return <div>{props.node.label}</div>;
}
```

### Testing

We encourage test-driven development. Before submitting a PR:

**Backend:**
```bash
cd backend
pytest tests/ -v --cov=gemini_agents
```

**Frontend:**
```bash
cd frontend
npm run test -- --coverage
```

If tests don't exist yet, please add them for your changes.

## Making Changes

### For Bug Fixes
1. Create a test case that reproduces the bug
2. Fix the bug
3. Ensure the test passes
4. Update documentation if needed

### For Features
1. Create an issue to discuss the feature (optional but encouraged)
2. Create tests for your feature
3. Implement the feature
4. Update the README if adding user-facing functionality
5. Update the roadmap if it's a significant feature

### For Documentation
- Keep examples up-to-date and tested
- Add docstrings to all public functions
- Use clear, accessible language
- Include code examples where helpful

## Submitting Changes

### Pull Request Process

1. **Ensure your branch is up-to-date:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your changes:**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request on GitHub**
   - Give it a clear, descriptive title
   - Reference related issues: `Closes #123`
   - Describe what changed and why
   - Include before/after screenshots if UI changes
   - Check that all CI checks pass

4. **PR Template:**
   ```
   ## Description
   Brief description of changes.

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Related Issues
   Closes #123

   ## Testing
   Additional testing done:
   - [ ] Manual testing on Windows/Mac/Linux
   - [ ] Unit tests added/updated
   - [ ] Integration tests added/updated

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Documentation updated
   - [ ] No new warnings generated
   - [ ] Tested locally
   ```

5. **Wait for review and address feedback**
   - Be open to suggestions
   - Discuss disagreements constructively
   - Push additional commits to address feedback (don't force-push)

## Review Process

- Maintainers will review PRs within 48 hours (best effort)
- At least one approval required before merge
- All CI checks must pass
- Respectful discussion of any concerns

## Project Structure

See [README.md#-project-structure](./README.md#-project-structure) for an overview.

When adding new features:
- Backend code: `backend/gemini_agents/` or new service file
- Frontend code: `frontend/components/` or new hook
- Models: `backend/models/`
- Tests: `backend/tests/` or `frontend/__tests__/`
- Documentation: Update README and add inline comments

## Development Tips

### Backend Debugging
```bash
# See all agent calls
tail -f backend.log | grep "gemini\|backboard"

# Test an agent in isolation
python -c "
import asyncio
from gemini_agents import accountant_agent
asyncio.run(accountant_agent.analyze({'nodes': []}))
"

# Check API health
curl http://localhost:8000/health
```

### Frontend Debugging
```bash
# React DevTools: https://react-devtools-tutorial.vercel.app/
# Redux DevTools: recommended for state management

# Check API calls in Network tab (F12)
# Check console for errors and warnings
```

### Database
Currently using SQLite for dev. Schema migrations:
```bash
# Future: alembic upgrade head
```

## Areas We Need Help With

- [ ] Unit tests for agent logic
- [ ] Integration tests for API endpoints
- [ ] Performance optimization (React Flow for 1000+ nodes)
- [ ] Mobile responsiveness
- [ ] Accessibility improvements (WCAG 2.1)
- [ ] International location support
- [ ] Error handling edge cases
- [ ] Documentation expansion
- [ ] Example scenarios/templates

## Questions or Need Help?

- Open an issue with your question
- Join our community discussions on GitHub
- Email: support@ploutos.io (future)

## License

By contributing to Ploutos, you agree that your contributions will be licensed under its MIT License.

---

Thank you for contributing to Ploutos! 🚀
