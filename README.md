# @okyrychenko-dev/react-action-guard-ui

[![npm version](https://img.shields.io/npm/v/@okyrychenko-dev/react-action-guard-ui.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-ui)
[![npm downloads](https://img.shields.io/npm/dm/@okyrychenko-dev/react-action-guard-ui.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> UI-agnostic guarded control primitives for React Action Guard - build accessible blocked buttons, fields, links, and groups without framework-specific adapters

## Features

- **Framework-Agnostic UI Primitives** - Works with native controls, design systems, and component libraries
- **Scope-Based Blocking** - Connect controls to `react-action-guard` scopes with explicit props or inherited context
- **Accessibility State Helpers** - Returns ARIA attributes such as `aria-busy`, `aria-disabled`, `aria-readonly`, and `aria-describedby`
- **Typed State Mappers** - Function overloads support custom state shapes without type assertions
- **Control Categories** - Hooks for actions, buttons, fields, links, and groups
- **Reason Handling** - Display blocking reasons as visible text, helper text, descriptions, or keep them hidden
- **Tree-Shakeable** - Import only the primitives and resolvers you need
- **TypeScript-Friendly** - Strong return types for default and custom mapped states
- **No Adapter Lock-In** - No MUI, HeroUI, Radix, or router dependency; wrap your own components locally

## Installation

```bash
npm install @okyrychenko-dev/react-action-guard-ui @okyrychenko-dev/react-action-guard
# or
yarn add @okyrychenko-dev/react-action-guard-ui @okyrychenko-dev/react-action-guard
# or
pnpm add @okyrychenko-dev/react-action-guard-ui @okyrychenko-dev/react-action-guard
```

This package requires the following peer dependencies:

- [@okyrychenko-dev/react-action-guard](https://www.npmjs.com/package/@okyrychenko-dev/react-action-guard) ^1.0.2 - The core UI blocking library
- [React](https://react.dev/) ^18.0.0 || ^19.0.0

Install any peer dependencies required by `@okyrychenko-dev/react-action-guard` according to your package manager's peer dependency behavior.

## Quick Start

Use `useAsyncAction` from the core package to create blockers, then use UI primitives to resolve control state.

```tsx
import { useAsyncAction } from "@okyrychenko-dev/react-action-guard";
import { useGuardedButton } from "@okyrychenko-dev/react-action-guard-ui";

function SaveButton() {
  const save = useAsyncAction("save-profile", "profile");
  const { buttonState } = useGuardedButton({
    scope: "profile",
    blockedState: "loading",
  });

  return (
    <button
      disabled={buttonState.disabled}
      aria-busy={buttonState.ariaBusy}
      aria-disabled={buttonState.ariaDisabled}
      onClick={() => save(api.saveProfile)}
    >
      {buttonState.loading ? "Saving..." : "Save"}
    </button>
  );
}
```

## Scope Usage

There are two supported ways to connect guarded controls to a blocking scope.

### Provider Scope

Use `GuardedScopeProvider` when several controls belong to the same form, panel, or workflow. Child hooks can omit `scope`; they inherit it from React context.

```tsx
import { useAsyncAction } from "@okyrychenko-dev/react-action-guard";
import {
  GuardedScopeProvider,
  useGuardedButton,
  useGuardedField,
} from "@okyrychenko-dev/react-action-guard-ui";

function ProfileForm() {
  const save = useAsyncAction("save-profile", "profile");

  return (
    <GuardedScopeProvider scope="profile">
      <ProfileNameField />
      <SaveButton onSave={() => save(api.saveProfile)} />
    </GuardedScopeProvider>
  );
}

function ProfileNameField() {
  const { fieldState, reasonContent } = useGuardedField({
    blockedState: "readOnly",
    reasonMode: "helperText",
  });

  return (
    <>
      <input readOnly={fieldState.readOnly} aria-readonly={fieldState.ariaReadOnly} />
      {reasonContent ? <p>{reasonContent}</p> : null}
    </>
  );
}

function SaveButton({ onSave }: { onSave: () => Promise<void> }) {
  const { buttonState } = useGuardedButton({ blockedState: "loading" });

  return (
    <button disabled={buttonState.disabled} aria-busy={buttonState.ariaBusy} onClick={onSave}>
      {buttonState.loading ? "Saving..." : "Save"}
    </button>
  );
}
```

`GuardedScopeProvider` works through normal React context, so it works across intermediate components as long as the guarded controls render below the provider in the same React tree. Normal React portals preserve context, but components mounted into a separate React root should use explicit scope.

### Explicit Scope

Pass `scope` directly when a control is reusable, rendered outside the provider subtree, or intentionally belongs to a different blocking domain.

```tsx
import { useAsyncAction } from "@okyrychenko-dev/react-action-guard";
import { useGuardedButton, useGuardedField } from "@okyrychenko-dev/react-action-guard-ui";

function ProfileForm() {
  const save = useAsyncAction("save-profile", "profile");

  return (
    <>
      <ProfileNameField scope="profile" />
      <SaveButton scope="profile" onSave={() => save(api.saveProfile)} />
    </>
  );
}

function ProfileNameField({ scope }: { scope: string }) {
  const { fieldState } = useGuardedField({
    scope,
    blockedState: "readOnly",
  });

  return <input readOnly={fieldState.readOnly} aria-readonly={fieldState.ariaReadOnly} />;
}

function SaveButton({ onSave, scope }: { onSave: () => Promise<void>; scope: string }) {
  const { buttonState } = useGuardedButton({ scope, blockedState: "loading" });

  return (
    <button disabled={buttonState.disabled} aria-busy={buttonState.ariaBusy} onClick={onSave}>
      Save
    </button>
  );
}
```

Scope resolution priority:

```txt
explicit scope -> GuardedScopeProvider scope -> global
```

## API Reference

### Scope Context

#### `<GuardedScopeProvider scope>`

Provides a default guarded scope to descendants.

**Props:**

- `scope: string | readonly string[]` - Scope or scopes inherited by child guarded hooks
- `children: ReactNode` - Subtree that should inherit the scope

`GuardedFormScopeProvider` is an alias of `GuardedScopeProvider` for form-oriented APIs.

#### `useGuardedScope()`

Reads the nearest guarded scope context.

**Returns:** `string | readonly string[] | undefined`

#### `useResolvedGuardedScope(explicitScope?)`

Resolves scope using the package priority rule.

**Parameters:**

- `explicitScope?: string | readonly string[]`

**Returns:** explicit scope, inherited provider scope, or `undefined` so lower-level helpers can fall back to global.

### Hooks

#### `useTopBlocker(scope?)`

Returns blocker metadata for the highest-priority blocker affecting a scope.

**Parameters:**

- `scope?: string | readonly string[]` - Scope(s) to inspect. Defaults to global behavior when omitted.

**Returns:**

- `status: "idle" | "blocked"`
- `isBlocked: boolean`
- `blockers: readonly BlockerInfo[]`
- `topBlocker: BlockerInfo | null`
- `reason: string | null`

#### `useGuardedAction(options?)`

Generic action-control hook for commands, menu items, toolbar actions, and clickable controls.

**Options:**

- `scope?: string | readonly string[]` - Blocking scope(s)
- `blockedState?: "disabled" | "loading" | "none"` - How blocked state affects the control (default: `"disabled"`)
- `disabled?: boolean` - Existing disabled state to merge with blocking state
- `loading?: boolean` - Existing loading state to merge with blocking state
- `reasonMode?: "visible" | "description" | "hidden"` - How reason text is exposed (default: `"hidden"`)
- `reasonFallback?: string` - Fallback reason when the blocker has none
- `reasonId?: string` - ID used for `aria-describedby` when `reasonMode="description"`
- `getActionState?: (state: GuardedActionState) => TActionState` - Optional custom state mapper

**Returns:** `{ blocker, isBlocked, actionState, reasonContent, ariaDescribedBy }`

#### `useGuardedButton(options?)`

Button-oriented action hook. It accepts the same options as `useGuardedAction`, but uses `getButtonState` for custom mapping and returns `buttonState` instead of `actionState`.

**Options:**

- `scope?: string | readonly string[]` - Blocking scope(s)
- `blockedState?: "disabled" | "loading" | "none"` - How blocked state affects the button (default: `"disabled"`)
- `disabled?: boolean` - Existing disabled state to merge with blocking state
- `loading?: boolean` - Existing loading state to merge with blocking state
- `reasonMode?: "visible" | "description" | "hidden"` - How reason text is exposed (default: `"hidden"`)
- `reasonFallback?: string` - Fallback reason when the blocker has none
- `reasonId?: string` - ID used for `aria-describedby` when `reasonMode="description"`
- `getButtonState?: (state: GuardedActionState) => TButtonState` - Optional custom state mapper

**Returns:** `{ blocker, isBlocked, buttonState, reasonContent, ariaDescribedBy }`

Use this for native buttons, icon buttons, submit buttons, and design-system button components.

```tsx
const { buttonState, reasonContent } = useGuardedButton({
  scope: "checkout",
  blockedState: "loading",
  reasonMode: "visible",
});
```

#### `useGuardedField(options?)`

Field-control hook for inputs, textareas, selects, checkboxes, switches, date pickers, and similar controls.

**Options:**

- `scope?: string | readonly string[]`
- `blockedState?: "disabled" | "readOnly" | "loading" | "none"` - How blocked state affects the field (default: `"disabled"`)
- `disabled?: boolean`
- `readOnly?: boolean`
- `loading?: boolean`
- `reasonMode?: "helperText" | "description" | "hidden"` - How reason text is exposed (default: `"hidden"`)
- `reasonFallback?: string`
- `reasonId?: string`
- `getFieldState?: (state: GuardedFieldState) => TFieldState` - Optional custom state mapper

**Returns:** `{ blocker, isBlocked, fieldState, reasonContent, ariaDescribedBy }`

#### `useGuardedLink(options?)`

Link/navigation-control hook that prevents navigation while blocked.

**Options:**

- `scope?: string | readonly string[]`
- `disabled?: boolean`
- `removeFromTabOrder?: boolean` - Sets `tabIndex=-1` when blocked or disabled
- `stopPropagationWhenBlocked?: boolean` - Stops click propagation when blocked
- `onClick?: MouseEventHandler<TElement>` - Called only when navigation is allowed
- `reasonMode?: "visible" | "description" | "hidden"`
- `reasonFallback?: string`
- `reasonId?: string`

**Returns:** `{ blocker, isBlocked, linkState, onClick, reasonContent, ariaDescribedBy }`

#### `useGuardedGroup(options?)`

Group/container hook for forms, fieldsets, panels, cards, and sections.

**Options:**

- `scope?: string | readonly string[]`
- `reasonMode?: "visible" | "description" | "hidden"`
- `reasonFallback?: string`
- `reasonId?: string`

**Returns:** `{ blocker, isBlocked, groupState, reasonContent, ariaDescribedBy }`

`groupState.ariaDisabled` is descriptive only. It does not disable descendants automatically. Disable child controls individually, or use a native `<fieldset disabled>` when that is the desired behavior.

### State Resolvers

Use resolvers directly when you do not need React hooks or want to build your own wrapper hook.

- `resolveGuardedActionState({ blockedState, isBlocked, disabled, loading })`
- `resolveGuardedFieldState({ blockedState, isBlocked, disabled, readOnly, loading })`
- `resolveGuardedLinkState({ isBlocked, disabled, removeFromTabOrder })`
- `resolveGuardedGroupState(isBlocked)`
- `normalizeGuardedScope(scope?)`

### Styles

#### `visuallyHiddenClassName`

Class name for screen-reader-only text. Prefer this when your project has a no-inline-styles rule.

```tsx
import { visuallyHiddenClassName } from "@okyrychenko-dev/react-action-guard-ui";

<span className={visuallyHiddenClassName}>{reasonContent}</span>
```

Add the CSS once in your app stylesheet:

```css
.visually-hidden {
  border: 0;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
```

#### `visuallyHiddenCss`

CSS text for the same class, useful when your styling system accepts injected global CSS.

#### `visuallyHiddenStyle`

Reusable React `CSSProperties` object for environments where a class is not practical. Prefer `visuallyHiddenClassName` for app code that enforces no inline styles.

```tsx
<span style={visuallyHiddenStyle}>{reasonContent}</span>
```

## TypeScript Support

The package is written in TypeScript and includes full type definitions.

```ts
import type {
  GuardedActionState,
  GuardedFieldState,
  GuardedLinkState,
  GuardedScope,
  UseGuardedButtonReturn,
  UseGuardedFieldReturn,
} from "@okyrychenko-dev/react-action-guard-ui";
```

Custom state mappers preserve their return type without type assertions:

```tsx
const { buttonState } = useGuardedButton({
  scope: "checkout",
  getButtonState: (state) => ({
    isDisabled: state.disabled,
    isLoading: state.loading,
    "aria-busy": state.ariaBusy,
  }),
});

// buttonState is typed as:
// { isDisabled: boolean; isLoading: boolean; "aria-busy": true | undefined }
```

## Design Philosophy

This package intentionally stops at primitives. It does not export `MuiGuardedButton`, `HeroUIGuardedSelect`, or similar adapters because those APIs change independently and rarely cover every control a real app needs.

Instead, build small local wrappers around your own components using the hooks above. The library handles blocking semantics, priority, reasons, and ARIA state; your app owns component-library props and visuals.

## License

MIT © Oleksii Kyrychenko
