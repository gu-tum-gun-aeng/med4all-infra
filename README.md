# med4all-infrastructure

[![on-push-main](https://github.com/gu-tum-gun-aeng/med4all-infra/actions/workflows/on-push-main.yaml/badge.svg)](https://github.com/gu-tum-gun-aeng/med4all-infra/actions/workflows/on-push-main.yaml)

Declaration of med4all's infrastructure on AWS

## Installation

install package

```
npm install
```

setup husky for git hook `pre-commit` and `pre-push`

```
npm run prepare
```

## Tests

run unit tests

```
npm test
```

run integration tests

```
npm run integration
```

## Linting

run lint

```
npm run lint
```

fix lint automatically

```
npm run lint-fix
```

## Integrating Eslint with your code editor

### VS Code

install `ESLint` plugin from marketplace in extensions [VS Marketplace Link](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
