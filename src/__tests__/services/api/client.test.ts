import { ApiError, BookingsApi } from "@/services/api";

/**
 * The client wraps `fetch` and maps HTTP outcomes onto `ApiError` with a
 * typed `kind`. Tests stub `global.fetch` per case.
 */

const mockFetch = jest.fn();
const api = new BookingsApi();

beforeAll(() => {
  global.fetch = mockFetch as unknown as typeof fetch;
});

afterEach(() => {
  mockFetch.mockReset();
});

function jsonResponse(body: unknown, status = 200): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: new Map([["Content-Type", "application/json"]]),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

describe("BookingsApi.listBookings", () => {
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

describe("BookingsApi.listCustomers", () => {
  it("fetches customers", async () => {
    const data = [{ id: "cust_1", name: "Acme" }];
    mockFetch.mockResolvedValueOnce(jsonResponse(data));
    expect(await api.listCustomers()).toEqual(data);
  });
});

describe("BookingsApi.listVessels", () => {
  it("fetches vessels", async () => {
    const data = [{ id: "ves_1", name: "MV Star" }];
    mockFetch.mockResolvedValueOnce(jsonResponse(data));
    expect(await api.listVessels()).toEqual(data);
  });
});

describe("BookingsApi.create", () => {
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

    const result = await api.create(input);

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

describe("BookingsApi.patch", () => {
  it("patches a booking by id", async () => {
    const updated = { id: "bkg_1", origin: "Hamburg" };
    mockFetch.mockResolvedValueOnce(jsonResponse(updated));

    const result = await api.patch("bkg_1", { origin: "Hamburg" });

    expect(result).toEqual(updated);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/bookings/bkg_1",
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it("url-encodes the id", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ id: "bkg/weird id" }));
    await api.patch("bkg/weird id", {});
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/bookings/bkg%2Fweird%20id",
      expect.any(Object),
    );
  });
});

describe("BookingsApi with custom baseUrl", () => {
  it("respects the baseUrl passed to the constructor", async () => {
    const custom = new BookingsApi("/mock-api");
    mockFetch.mockResolvedValueOnce(jsonResponse([]));
    await custom.listBookings();
    expect(mockFetch).toHaveBeenCalledWith(
      "/mock-api/bookings",
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
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: "Not found" }, 404));
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

  it("ApiError#fieldErrors maps a JSON-issues 400 body to field map", async () => {
    const zodIssues = JSON.stringify([
      { path: ["customerId"], message: "Pick a customer" },
      { path: ["origin"], message: "Required" },
    ]);
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: zodIssues }, 400));

    try {
      await api.listBookings();
      fail("expected ApiError");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const fields = (err as ApiError).fieldErrors();
      expect(fields).toEqual({
        customerId: "Pick a customer",
        origin: "Required",
      });
    }
  });

  it("ApiError#fieldErrors returns null for non-field-shaped bodies", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: "boom" }, 400),
    );
    try {
      await api.listBookings();
      fail("expected ApiError");
    } catch (err) {
      expect((err as ApiError).fieldErrors()).toBeNull();
    }
  });
});
