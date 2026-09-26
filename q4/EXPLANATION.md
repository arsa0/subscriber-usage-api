# Q4 — Troubleshoot & Explain

## Root cause

Two defects in the reduce callback:

1. It uses a block body and assigns to `total` without returning, so it returns
   `undefined` every iteration.
2. `reduce` is called with no initial value, so the accumulator starts as the first
   record object instead of a number.

## Fix

```ts
return records.reduce((total, record) => total + record.dataUsageMB, 0);
```

An initial value of `0`, and an expression body so the return cannot be forgotten.

## Why it broke

`reduce` feeds whatever the callback returns into the next iteration. Since the callback
returns `undefined`, the accumulator is destroyed immediately.

I ran the original to confirm the behaviour:

- `[]` → throws `TypeError: Reduce of empty array with no initial value`
- `[a]` → returns the record object; with one element and no initial value the callback
  is never called, so the bug is invisible
- `[a, b, ...]` → returns `undefined`

The single-element case is the dangerous one. It returns something plausible without
throwing, so a test using one record would pass on broken code.

## How to prevent this

- **Types.** A `number` return type makes TypeScript reject a callback returning `undefined`.
  The original is untyped JS, so nothing checked it.
- **Lint.** `array-callback-return` targets exactly this. Added to `eslint.config.mjs`.
  It also catches the harder case: a `return` inside an `if` with no `else`.
- **Tests.** Empty and single-element arrays are where this bug hides. Covered in
  `tests/getTotalUsageMB.test.ts`.

Beyond tooling: prefer expression-bodied arrows for pure transformations. There is no
place to forget the return.