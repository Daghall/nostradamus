"use strict";

const assert = require("assert");
const { PythiaError } = require("./errors");

let isPredicting = false;
const originalRandom = Math.random;

function predict(prediction, {repeat} = {repeat: true}) {
  const predictionType = typeOf(prediction);
  switch (predictionType) {
    case "number":
      setupNumber(prediction, repeat);
      break;
    case "array": {
      setupArray(prediction, repeat);
      break;
    }
    case "function":
      setupFunction(prediction);
      break;
    default:
      throw new PythiaError("Unknown prediction type");
  }

  isPredicting = true;
}

function setupNumber(prediction, repeat) {
  Math.random = () => {
    if (!repeat) {
      forget();
    }
    return assertRealisticValue(prediction);
  };
}

function setupArray(prediction, repeat) {
  if (repeat) {
    let index = 0;
    Math.random = function pythia() {
      index %= prediction.length;
      return assertRealisticValue(prediction[index++]);
    };
  } else {
    const predictons = prediction.slice();
    Math.random = function pythia() {
      const random = predictons.shift();
      if (predictons.length === 0) {
        forget();
      }
      return assertRealisticValue(random);
    };
  }
}

function setupFunction(prediction) {
  Math.random = function pythia() {
    const random = prediction();
    if (!random && typeof random !== "number") {
      forget();
      return Math.random();
    }
    return assertRealisticValue(random);
  };
}

function forget() {
  isPredicting = false;
  Math.random = originalRandom;
}

function typeOf(value) {
  const type = typeof value;
  if (type === "object") {
    return Array.isArray(value) ? "array" : type;
  }
  return type;
}

function assertRealisticValue(value) {
  try {
    assert.equal(typeof value, "number", "Random value must be a number");
    assert(value >= 0, "Random value must be greater than or equal to zero");
    assert(value < 1, "Random value must be less than one");
    return value;
  } catch ({message}) {
    throw new PythiaError(message);
  }
}

module.exports = {
  predict,
  forget,
  reset: forget,
  isPredicting() {
    return isPredicting;
  },
};
