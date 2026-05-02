import { ApiError, api } from "@/lib/api/client";

/**
 * The client wraps `fetch` and maps HTTP outcomes onto `ApiError` with a
 * typed `kind`. Tests stub `global.fetch` per case.
 */

const mockFetch = jest.fn();

beforeAll(() => {
  global.fetch = mockFetch as unknown as typeof fetch;
});

afterEach(() => {
  mockFetch.mockReset();
});

/**
 * Tiny structural `Response` stub. The client only touches `status`, `ok`
 * and `json()`, so there's no need to pull in a full WHATWG polyfill
 * under jsdom. If we ever need more of the `Response` surface area,
 * swap this for `undici` or a real polyfill.
 */
function jsonResponse(body: unknown, status = 200): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: new Map([["Content-Type", "application/json"]]),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

describe("api.listBookings", () => {
  it("fetches and returns bookings", async () => {
    const data = [{ id: "bkg_1" }];
    mockFetch.mockResolvedValueOnce(jsonResponse(data));

    const result = await api.listBookings();

    expect(result).toEqual(data);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/bookings",
      expect.objectContaining({
        headers: expect.objectContaining({ Accept: "application/json" }),
      }),
    );
  });
});

describe("api.listCustomers", () => {
  it("fetches customers", async () => {
    const data = [{ id: "cust_1", name: "Acme" }];
    mockFetch.mockResolvedValueOnce(jsonResponse(data));

    const result = await api.listCustomers();
    expect(result).toEqual(data);
  });
});

describe("api.listVessels", () => {
  it("fetches vessels", async () => {
    const data = [{ id: "ves_1", name: "MV Star" }];
    mockFetch.mockResolvedValueOnce(jsonResponse(data));

    const result = await api.listVessels();
    expect(result).toEqual(data);
  });
});

describe("api.createBooking", () => {
  it("posts a booking and returns the result", async () => {
    const input = {
      customerId: "cust_1",
      vesselId: "ves_1",
      origin: "A",
      destination: "B",
      cargoType: "general",
      weightKg: 10,
      status: "pending" as const,
      departureAt: "2024-06-01T10:00:00Z",
      arrivalAt: "2024-06-15T10:00:00Z",
    };
    const created = { id: "bkg_new", ...input };
    mockFetch.mockResolvedValueOnce(jsonResponse(created, 201));

    const result = await api.createBooking(input);

    expect(result).toEqual(created);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/bookings",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(input),
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
  });
});

describe("api.patchBooking", () => {
  it("patches a booking by id", async () => {
    const updated = { id: "bkg_1", origin: "Hamburg" };
    mockFetch.mockResolvedValueOnce(jsonResponse(updated));

    const result = await api.patchBooking("bkg_1", { origin: "Hamburg" });

    expect(result).toEqual(updated);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/bookings/bkg_1",
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it("url-encodes the id", async () => {
    const updated = { id: "bkg/weird id" };
    mockFetch.mockResolvedValueOnce(jsonResponse(updated));

    await api.patchBooking("bkg/weird id", {});

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/bookings/bkg%2Fweird%20id",
      expect.any(Object),
    );
  });
});

describe("error handling", () => {
  it("throws ApiError with kind=server for 500", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: "Internal error" }, 500),
    );

    await expect(api.listBookings()).rejects.toMatchObject({
      name: "ApiError",
      kind: "server",
      status: 500,
    });
  });

  it("throws ApiError with kind=validation for 400", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: "Bad request" }, 400),
    );

    await expect(api.listBookings()).rejects.toMatchObject({
      kind: "validation",
      status: 400,
    });
  });

  it("throws ApiError with kind=client for 404", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: "Not found" }, 404),
    );

    await expect(api.listBookings()).rejects.toMatchObject({
      kind: "client",
      status: 404,
    });
  });

  it("throws ApiError with kind=network when fetch rejects", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const result = api.listBookings();

    await expect(result).rejects.toBeInstanceOf(ApiError);
    await expect(result).rejects.toMatchObject({
      kind: "network",
      status: null,
    });
  });

  it("re-throws AbortError as-is (not wrapped)", async () => {
    const abort = new DOMException("aborted", "AbortError");
    mockFetch.mockRejectedValueOnce(abort);

    await expect(api.listBookings()).rejects.toBe(abort);
  });

  it("includes the request path on the error", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: "x" }, 500));

    try {
      await api.listBookings();
      fail("expected ApiError");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).path).toBe("/api/bookings");
    }
  });
});
