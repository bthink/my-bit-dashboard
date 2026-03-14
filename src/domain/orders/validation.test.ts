import {describe, it, expect} from "vitest";
import {
  normalizeOrderInput,
  validateOrderInput,
  normalizeDateInput,
  isValidIsoDate,
} from "./validation";
import type {CreateOrderInput, UpdateOrderInput} from "./order";

describe("normalizeOrderInput", () => {
  it("trims destination country and normalizes date", () => {
    const input: CreateOrderInput = {
      destinationCountry: "  Germany  ",
      shippingDate: "  2024-03-15  ",
      price: 42.5,
    };
    const result = normalizeOrderInput(input);
    expect(result.destinationCountry).toBe("Germany");
    expect(result.shippingDate).toBe("2024-03-15");
    expect(result.price).toBe(42.5);
  });

  it("converts string price to number when finite", () => {
    const input: CreateOrderInput = {
      destinationCountry: "France",
      shippingDate: "2024-03-15",
      price: "99.99" as unknown as number,
    };
    const result = normalizeOrderInput(input);
    expect(result.price).toBe(99.99);
  });
});

describe("validateOrderInput", () => {
  const validInput: CreateOrderInput = {
    destinationCountry: "Germany",
    shippingDate: "2024-03-15",
    price: 100.5,
  };

  it("throws when destination country is empty", () => {
    expect(() =>
      validateOrderInput({...validInput, destinationCountry: ""}),
    ).toThrow();
    let thrown: unknown;
    try {
      validateOrderInput({...validInput, destinationCountry: ""});
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toMatchObject({
      name: "OrderValidationError",
      message: "Invalid order input.",
      fieldErrors: {
        destinationCountry: "Destination country is required.",
      },
    });
    expect(() =>
      validateOrderInput({...validInput, destinationCountry: "   "}),
    ).toThrow();
  });

  it("throws when destination country exceeds max length", () => {
    const long = "a".repeat(201);
    expect(() =>
      validateOrderInput({...validInput, destinationCountry: long}),
    ).toThrow();
    try {
      validateOrderInput({...validInput, destinationCountry: long});
    } catch (e: unknown) {
      expect(
        (e as {fieldErrors?: Record<string, string>}).fieldErrors
          ?.destinationCountry,
      ).toMatch(/200/);
    }
  });

  it("throws when destination country is not allowed", () => {
    expect(() =>
      validateOrderInput({...validInput, destinationCountry: "Atlantis"}),
    ).toThrow();
    try {
      validateOrderInput({...validInput, destinationCountry: "Atlantis"});
    } catch (e: unknown) {
      expect(
        (e as {fieldErrors?: Record<string, string>}).fieldErrors
          ?.destinationCountry,
      ).toMatch(/allowed/);
    }
  });

  it("allows legacy country when updating via allowLegacyCountry", () => {
    const legacyInput: UpdateOrderInput = {
      destinationCountry: "Legacy Country Name",
      shippingDate: "2024-03-15",
      price: 50,
    };
    expect(() =>
      validateOrderInput(legacyInput, {
        allowLegacyCountry: "Legacy Country Name",
      }),
    ).not.toThrow();
  });

  it("throws when shipping date is invalid", () => {
    expect(() =>
      validateOrderInput({...validInput, shippingDate: "not-a-date"}),
    ).toThrow();
    expect(() =>
      validateOrderInput({...validInput, shippingDate: "2024-13-45"}),
    ).toThrow();
  });

  it("throws when price is not a positive number", () => {
    expect(() => validateOrderInput({...validInput, price: 0})).toThrow();
    expect(() => validateOrderInput({...validInput, price: -10})).toThrow();
    expect(() =>
      validateOrderInput({
        ...validInput,
        price: Number.NaN,
      }),
    ).toThrow();
  });

  it("does not throw for valid input", () => {
    expect(() => validateOrderInput(validInput)).not.toThrow();
  });
});

describe("normalizeDateInput", () => {
  it("returns trimmed empty string for empty input", () => {
    expect(normalizeDateInput("")).toBe("");
    expect(normalizeDateInput("   ")).toBe("");
  });

  it("normalizes ISO-like dates to YYYY-MM-DD", () => {
    expect(normalizeDateInput("2024-03-15")).toBe("2024-03-15");
  });
});

describe("isValidIsoDate", () => {
  it("returns true for valid YYYY-MM-DD", () => {
    expect(isValidIsoDate("2024-03-15")).toBe(true);
  });

  it("returns false for invalid format", () => {
    expect(isValidIsoDate("03/15/2024")).toBe(false);
    expect(isValidIsoDate("2024-3-15")).toBe(false);
  });

  it("returns false for invalid dates", () => {
    expect(isValidIsoDate("2024-13-01")).toBe(false);
    expect(isValidIsoDate("2024-02-30")).toBe(false);
  });
});
