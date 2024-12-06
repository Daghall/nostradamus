# pythia

> _Pythia  was the name of the high priestess of the Temple of Apollo at Delphi.
> She specifically served as its oracle and was known as the Oracle of Delphi._

Deterministically mock values from `Math.random`.

Values can be given as a single number, an array or a function returning a value. Optionally stop mocking after the values have been used.

Values are verified to be of type `number` and in the interval `[0,1[`, as this is what `Math.random` returns.
An error is thrown when unexpected values are detected.

## Installation

```bash
$ npm install --save-dev the-pythia
```

## Usage

```javascript
const pythia = require("the-pythia");

pythia.predict(0.5);

console.log(Math.random()); // 0.5
```

## API

### `predict(prediction [, options])`

#### Parameters

##### `prediction`

The value(s) to return.

Accepts the following types:

| Type       | `Math.random()` returns |
| ---------- | ----------------------- |
| `number`   | the given number |
| `array`    | each number in the array per subsequent call |
| `function` | the return value of the function, until it returns something `falsy` |

---
##### `options`

An options object that only has one setting: `repeat`.

Setting this to `false` will reset `Math.random` when the value(s) have been exhausted. Has no effect on `function` predictions, since it resets as soon as the function returns something `falsy`.

### `isPredicting()`

Returns a `boolean` reflecting if _pythia_ is predicting random values.

### `forget()`

Reset `Math.random` to its original functionality.

### `reset()`

Alias for `forget()`.

## Examples

```javascript
const pythia = require("the-pythia");

// Type: number
pythia.predict(0.1982);

Math.random(); // 0.1982
Math.random(); // 0.1982


// Type: number, no repeat
pythia.predict(0.42, { repeat: false });

Math.random(); // 0.42
Math.random(); // Psuedo-random value between 0 and 1


// Type: array
pythia.predict([0.31, 0.41, 0.52]);

Math.random(); // 0.31
Math.random(); // 0.41
Math.random(); // 0.52
Math.random(); // 0.31


// Type: array, no repeat
pythia.predict([0.31, 0.41, 0.52], { repeat: false });

Math.random(); // 0.31
Math.random(); // 0.41
Math.random(); // 0.52
Math.random(); // Psuedo-random value between 0 and 1


// Type: function
let fakeRandomCalls = 0;
pythia.predict(() => {
  if (fakeRandomCalls++ > 2) return false;
  return 0.8219
});

Math.random(); // 0.8219
Math.random(); // 0.8219
Math.random(); // 0.8219
Math.random(); // Psuedo-random value between 0 and 1


// Unexpected predictions
pythia.predict(-1); // Throws PythiaError: "Random value must be greater than or equal to zero"
pythia.predict(12); // Throws PythiaError: "Random value must be less than one"
```
