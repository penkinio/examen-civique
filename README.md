# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Getting Started

To run the application in development mode:

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`.

**Note:** Do not run `src/main.jsx` directly with Node.js. This file contains JSX syntax and is intended to be processed by Vite and run in a web browser.

## Official Plugins

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
