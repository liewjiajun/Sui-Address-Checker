## Sui Address Checker Web App

**Purpose:** Simple web UI to check whether a list of Sui wallet identifiers are valid, with optional resolution of `.sui` name-service domains and `@handle` aliases.

### Features

- **Bulk input:** Paste multiple identifiers (one per line) such as:
  - `0x...` Sui wallet addresses
  - `example.sui` name service domains
  - `@handle` aliases (resolved as `handle.sui`)
- **Resolution options:**
  - Toggle whether to resolve `.sui` domains
  - Toggle whether to resolve `@handle` aliases
- **Results table:**
  - Shows original input, detected type, resolved/normalized Sui address, and validation status.

### Tech stack

- React + TypeScript + Vite
- `@mysten/dapp-kit` and `@mysten/sui.js` for Sui client and name-service resolution
- `@tanstack/react-query` for client-side data layer

### Install dependencies

From the project root:

```bash
cd /Users/liewjiajun/my_dapp
npm install
```

> If you prefer `pnpm` or `yarn`, you can generate an equivalent lockfile and use that instead.

### Run the web app

```bash
cd /Users/liewjiajun/my_dapp
npm run dev
```

Then open the local dev URL that Vite prints in the terminal (by default `http://localhost:5173`).

### How resolution works

- **Raw Sui addresses (`0x...`):**
  - Validated with `isValidSuiAddress`.
  - Normalized with `normalizeSuiAddress` and marked **Valid/Invalid**.
- **`.sui` domains:**
  - When the **Resolve `.sui` domains** option is on, the app calls
    `suiClient.resolveNameServiceAddress({ name })` and validates the returned address.
- **`@handle` aliases:**
  - When the **Resolve `@handle`** option is on, the app interprets `@name` as
    `name.sui` and resolves it using the same name-service call.

You can adjust the default network (e.g. `testnet` instead of `mainnet`) in `src/main.tsx` via the `defaultNetwork` prop on `SuiClientProvider`.




