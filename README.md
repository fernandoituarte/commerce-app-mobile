# Commerce App Native

A production-ready React Native mobile app template built with Expo, TypeScript, and a modern tech stack. Designed as a starter for SaaS apps connected to a REST backend.

---

## Tech Stack

| Layer              | Technology                                      |
| ------------------ | ----------------------------------------------- |
| Framework          | React Native (Expo SDK 54)                      |
| Language           | TypeScript (strict mode)                        |
| Server State       | TanStack Query (React Query v5)                 |
| HTTP Client        | Axios (centralised client with interceptors)    |
| Global State       | Redux Toolkit                                   |
| Styling            | NativeWind v4 (Tailwind CSS for React Native)   |
| Navigation         | React Navigation v7 (native stack)              |
| Forms              | React Hook Form                                 |
| Local Storage      | @react-native-async-storage/async-storage       |

---

## Folder Structure

```
├── App.tsx                     # App entry – providers & theme sync
├── global.css                  # Tailwind CSS directives
├── tailwind.config.js          # Tailwind / NativeWind configuration
├── metro.config.js             # Metro bundler config (NativeWind)
├── babel.config.js             # Babel presets (NativeWind JSX)
├── .env.example                # Environment variable template
│
└── src/
    ├── api/
    │   ├── client.ts           # Axios instance, request/response interceptors
    │   └── endpoints.ts        # Centralised API route constants
    │
    ├── components/
    │   └── ui/
    │       ├── Button.tsx       # Reusable button (variants, sizes, loading)
    │       └── Input.tsx        # Reusable input (label, error, password toggle)
    │
    ├── hooks/
    │   └── useAuth.ts          # Auth mutations (login, register, forgot, reset)
    │
    ├── navigation/
    │   ├── types.ts            # Navigation param-list types
    │   ├── AuthNavigator.tsx   # Auth stack (Login → Register → Forgot → Reset)
    │   └── RootNavigator.tsx   # Root navigator (Auth ↔ App split)
    │
    ├── providers/
    │   └── AppProviders.tsx    # Combined Redux + TanStack Query + SafeArea
    │
    ├── screens/
    │   └── auth/
    │       ├── LoginScreen.tsx
    │       ├── RegisterScreen.tsx
    │       ├── ForgotPasswordScreen.tsx
    │       └── ResetPasswordScreen.tsx
    │
    ├── services/
    │   └── auth.service.ts     # API calls for auth endpoints
    │
    ├── store/
    │   ├── index.ts            # Redux store configuration
    │   ├── hooks.ts            # Typed useAppDispatch / useAppSelector
    │   └── slices/
    │       ├── authSlice.ts    # Auth state (user, tokens, loading)
    │       └── themeSlice.ts   # Theme mode (system / light / dark)
    │
    ├── theme/
    │   └── index.ts            # Colour palette & spacing constants
    │
    ├── types/
    │   ├── auth.ts             # Auth request / response types
    │   └── api.ts              # Generic API response types
    │
    └── utils/
        └── storage.ts          # AsyncStorage helpers (tokens, generic)
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- **Expo CLI** (`npx expo` — ships with Expo SDK 54)

### 1 · Clone & install

```bash
git clone <repo-url>
cd commerce-app-native
npm install
```

### 2 · Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and set your backend URL:

```
EXPO_PUBLIC_API_URL=https://your-api.example.com/api
```

> Expo automatically exposes variables prefixed with `EXPO_PUBLIC_` as `process.env.EXPO_PUBLIC_*`.  
> **No extra packages** are needed — just restart the bundler after changes.

### 3 · Run the app

```bash
# Start Expo dev server
npx expo start

# Or target a specific platform
npx expo start --android
npx expo start --ios
npx expo start --web
```

---

## Environment Variables

| Variable               | Description                     | Example                             |
| ---------------------- | ------------------------------- | ----------------------------------- |
| `EXPO_PUBLIC_API_URL`  | Base URL for the backend API    | `https://api.myapp.com/api`         |

Add new variables to both `.env` and `.env.example` to keep them documented.

---

## Dark Mode

The app supports three theme modes controlled via Redux (`themeSlice`):

| Mode     | Behaviour                                       |
| -------- | ----------------------------------------------- |
| `system` | Follows the device's appearance setting          |
| `light`  | Forces light theme                               |
| `dark`   | Forces dark theme                                |

Toggle programmatically:

```ts
import { useAppDispatch } from "./src/store/hooks";
import { setThemeMode, toggleTheme } from "./src/store/slices/themeSlice";

dispatch(setThemeMode("dark"));   // set explicitly
dispatch(toggleTheme());          // cycle: light → dark → system
```

NativeWind classes like `dark:bg-slate-900` automatically respond to the active scheme.

---

## API Layer

The Axios client in `src/api/client.ts` automatically:
- Attaches the `Authorization: Bearer <token>` header to every request.
- Clears stored tokens on `401` responses.
- Normalises error responses into a consistent `ApiError` shape.

Extend it by adding new service files under `src/services/`.

---

## Adding Protected Routes

1. Create your screens inside `src/screens/`.
2. Build an `AppNavigator` in `src/navigation/`.
3. Wire it into `RootNavigator.tsx` — the `isAuthenticated` guard is already in place.

---

## Scripts

| Command           | Description                |
| ------------------| -------------------------- |
| `npm start`       | Start Expo dev server       |
| `npm run android` | Start on Android emulator   |
| `npm run ios`     | Start on iOS simulator      |
| `npm run web`     | Start in web browser        |

---

## License

MIT
