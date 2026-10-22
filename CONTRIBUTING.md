# Contributing to Expense Tracker

Thank you for your interest in contributing to **Expense Tracker**! 🎉
We welcome contributions of all kinds — whether it's fixing bugs, adding features, improving documentation, or enhancing UI/UX.

---

## Table of Contents

1. [How to Contribute](#how-to-contribute)
2. [Project Structure](#project-structure)
3. [Development Setup](#development-setup)
4. [Code Style](#code-style)
5. [Reporting Issues](#reporting-issues)
6. [Submitting Pull Requests](#submitting-pull-requests)
7. [Additional Guidelines](#additional-guidelines)

---

## How to Contribute

1. **Fork the repository** to your GitHub account.
2. **Clone** your fork locally:

```bash
git clone https://github.com/<your-username>/mern-expense-tracker.git
cd mern-expense-tracker
```

3. **Create a new branch** for your feature or bugfix:

```bash
git checkout -b feature/my-new-feature
```

4. **Make your changes** and test them locally.
5. **Commit your changes** with clear messages:

```bash
git add .
git commit -m "feat(api): add summary endpoint"
```

6. **Push your branch** to your fork:

```bash
git push origin feature/my-new-feature
```

7. **Open a Pull Request** from your branch to the main repository.

---

## Project Structure

```
mern-expense-tracker/
├── server/                # Backend (Express API)
│   ├── models/           # Mongoose models
│   │   └── Expense.js
│   ├── server.js         # Server entry point
│   └── package.json      # Backend deps & scripts
├── src/                   # Frontend (React + TypeScript, Vite)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json           # Frontend deps & scripts (Vite)
├── README.md
└── CONTRIBUTING.md
```

---

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm (or yarn)

### Backend Setup

1. Navigate to the server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the `server` directory with:

```env
MONGODB_URI=mongodb://<user>:<pass>@host:port/dbname
PORT=5000
NODE_ENV=development
```

4. Start the backend server in watch/dev mode:

```bash
npm run dev
```

The API base URL will be: http://localhost:5000

### Frontend Setup

From the project root:

```bash
npm install
npm run dev
```

Vite will print the local dev URL (usually http://localhost:5173).

---

## Code Style

- Follow the existing TypeScript and ESLint rules. The project includes ESLint and TypeScript configurations.
- Use clear, descriptive variable and function names.
- Keep PRs small and focused — one concern per PR.

Suggested commit message format examples:

```
feat(api): add monthly-summary endpoint
fix(ui): prevent crash when expense list is empty
docs: update README with deployment notes
chore(deps): bump tailwindcss
```

---

## Reporting Issues

1. Go to the repository Issues tab.
2. Choose an appropriate template (bug, feature, docs) if available.
3. Provide a clear title, steps to reproduce, expected vs actual behavior, environment, and screenshots/logs if relevant.

Wait for maintainers to triage the issue before starting large work.

---

## Submitting Pull Requests

1. Push your branch to your fork and open a PR against `main`.
2. In the PR description include:
   - Summary of changes
   - Related issue (Closes #xxx) if any
   - How to test (steps)
   - Screenshots for UI changes
3. Ensure your PR is focused and includes tests if applicable.

PR checklist:

- [ ] Follows project style and linters
- [ ] No sensitive data committed (no .env)
- [ ] Documentation updated if behavior changed
- [ ] Tests added/updated where practical

---

## Additional Guidelines

- Large or breaking changes: open an issue first to discuss the approach.
- Keep accessibility in mind when modifying UI components.
- When adding dependencies, prefer small, well-maintained packages and explain the need in the PR.



## Thank You

Small contributions matter — documentation, examples, and tiny fixes are great first PRs. Thanks for helping improve Expense Tracker! ❤️

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).
