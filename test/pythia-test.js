"use strict";

const expect = require("chai").expect;
const pythia = require("../lib/pythia.js");
const { PythiaError } = require("../lib/errors.js");

describe("pythia", () => {
  beforeEach(() => {
    expect(pythia.isPredicting()).to.equal(false);
  });

  afterEach(() => {
    pythia.forget();
    expect(pythia.isPredicting()).to.equal(false);
  });

  it("returns a number – indefinitely", () => {
    pythia.predict(0.123456);

    expect(Math.random()).to.equal(0.123456);
    expect(pythia.isPredicting()).to.equal(true);
    expect(Math.random()).to.equal(0.123456);
    expect(Math.random()).to.equal(0.123456);
    expect(pythia.isPredicting()).to.equal(true);
  });

  it("returns a number – once", () => {
    pythia.predict(0.123456, {repeat: false});

    expect(pythia.isPredicting()).to.equal(true);
    expect(Math.random()).to.equal(0.123456);
    expect(pythia.isPredicting()).to.equal(false);
    expect(Math.random()).to.not.equal(0.123456);
  });

  it("returns each number from an array – indefinitely", () => {
    const predictions = [0, 0.1, 0.2, 0.3];
    pythia.predict(predictions);

    runTwice(() => {
      expect(pythia.isPredicting()).to.equal(true);
      for (const prediction of predictions) {
        expect(Math.random()).to.equal(prediction);
      }
    });
  });

  it("returns each number from an array – once", () => {
    const predictions = [0, 0.1, 0.2, 0.3];
    pythia.predict(predictions, {repeat: false});

    expect(pythia.isPredicting()).to.equal(true);
    for (const prediction of predictions) {
      expect(Math.random()).to.equal(prediction);
    }

    expect(pythia.isPredicting()).to.equal(false);

    const random = Math.random();
    expect(random).to.be.within(0, 1);
    expect(random).to.not.equal(predictions[0]);
  });

  it("returns a number from a function – indefinitely", () => {
    let number = 0;
    pythia.predict(() => {
      return ++number / 10;
    });

    for (let i = 1; i < 7; ++i) {
      expect(pythia.isPredicting()).to.equal(true);
      expect(Math.random()).to.equal(i / 10);
    }
  });

  it("returns a number from a function, until falsy", () => {
    const predictions = [0.4, 0.2];
    pythia.predict(() => {
      return predictions.shift();
    });

    expect(pythia.isPredicting()).to.equal(true);
    expect(Math.random()).to.equal(0.4);

    expect(pythia.isPredicting()).to.equal(true);
    expect(Math.random()).to.equal(0.2);

    expect(pythia.isPredicting()).to.equal(true);
    expect(Math.random()).to.be.within(0, 1);
    expect(pythia.isPredicting()).to.equal(false);
  });

  it("asserts realistic random value", () => {
    pythia.predict(12);
    expect(Math.random).to.throw(PythiaError, "Random value must be less than one");

    pythia.predict(-1);
    expect(Math.random).to.throw(PythiaError, "Random value must be greater than or equal to zero");
  });

  it("asserts correct data type of random value", () => {
    pythia.predict(["0.5"]);
    expect(Math.random).to.throw(PythiaError, "Random value must be a number");

    pythia.predict(() => "0.5");
    expect(Math.random).to.throw(PythiaError, "Random value must be a number");
  });

  it("throws when no arguments are given", () => {
    const fn = () => pythia.predict();
    expect(fn).to.throw(PythiaError, "Unknown prediction type");
  });

  it("throws when prediction is a string", () => {
    const fn = () => pythia.predict("random string");
    expect(fn).to.throw(PythiaError, "Unknown prediction type");
  });

  it("throws when prediction array contains an object", () => {
    pythia.predict([0.4711, {}]);
    expect(Math.random()).to.be.within(0, 1);
    expect(Math.random).to.throw(PythiaError, "Random value must be a number");
  });

  it("throws when prediction is an object", () => {
    const fn = () => pythia.predict({});
    expect(fn).to.throw();
  });
});

function runTwice(fn) {
  Array(2).fill().forEach(() => {
    fn();
  });
}
