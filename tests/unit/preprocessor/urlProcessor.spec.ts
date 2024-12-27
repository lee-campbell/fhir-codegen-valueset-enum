import { beforeEach, describe, expect, it, vi } from "vitest";
import urlProcessor from "../../../src/preprocessor/urlProcessor";
import { Bundle, OperationOutcome, ValueSet } from "fhir/r5";

describe('urlProcessor tests', () => {
  const callback = vi.fn();
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockReset();
    callback.mockClear();
  });

  it('Throws an error when the supplied URL is invalid.', async () => {
    expect.assertions(1);

    try {
      await urlProcessor({
        url: 'Not a URL',
      }, callback);
    } catch (ex: any) {
      expect(ex.message).toEqual('Unable to parse the supplied URL "Not a URL"');
    }
  });

  it('Throws an error when the response is not OK.', async () => {
    expect.assertions(1);
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
    });

    try {
      await urlProcessor({ url: 'http://example.com/ValueSet/1234/$expand' }, callback);
    } catch (ex: any) {
      expect(ex.message).toEqual(`The request to "http://example.com/ValueSet/1234/$expand" failed.`);
    }
  });

  it('Throws an error when the returned data is not JSON.', async () => {
    expect.assertions(1);
    
    const mockHeaders = new Headers();
    mockHeaders.set('Content-Type', 'text/plain');
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: mockHeaders,
    });

    try {
      await urlProcessor({ url: 'http://example.com/ValueSet/1234/$expand' }, callback);
    } catch (ex: any) {
      expect(ex.message).toEqual(`Content-Type "text/plain" is not supported. Supported content types are: application/fhir+json, application/json.
    Hint: including the query string parameter "_format=json" will instruct some terminology servers to return JSON.`);
    }
  });

  it('Throws an error when the returned data is not a ValueSet or a Bundle', async () => {
    expect.assertions(1);

    const mockHeaders = new Headers();
    mockHeaders.set('Content-Type', 'application/fhir+json');
    
    const mockData: OperationOutcome = {
      resourceType: 'OperationOutcome',
      issue: [],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: mockHeaders,
      json: () => Promise.resolve(mockData),
    });

    try {
      await urlProcessor({ url: 'http://example.com/ValueSet/1234/$expand' }, callback);
    } catch (ex: any) {
      expect(ex.message).toEqual(`The returned resource must be one of the following types: ValueSet, Bundle. Received: OperationOutcome`);
    }
  });

  it('Calls the callback function with the retrieved ValueSet', async () => {
    const mockHeaders = new Headers();
    mockHeaders.set('Content-Type', 'application/fhir+json');
    
    const mockData: ValueSet = {
      resourceType: 'ValueSet',
      status: 'active',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: mockHeaders,
      json: () => Promise.resolve(mockData),
    });

    await urlProcessor({ url: 'http://example.com/ValueSet/1234/$expand' }, callback);

    expect(callback).toHaveBeenCalledWith(JSON.stringify(mockData));
  });

  it('Gracefully handles Bundles that contain no ValueSets', async () => {
    const mockHeaders = new Headers();
    mockHeaders.set('Content-Type', 'application/fhir+json');
    
    const mockData: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: mockHeaders,
      json: () => Promise.resolve(mockData),
    });

    await urlProcessor({ url: 'http://example.com/ValueSet/1234/$expand' }, callback);

    expect(callback).not.toHaveBeenCalled();
  });

  it('Retrieves the expanded ValueSet when a Bundle is returned from the original request', async () => {
    const mockHeaders = new Headers();
    mockHeaders.set('Content-Type', 'application/fhir+json');
    
    const mockValueSet: ValueSet = {
      resourceType: 'ValueSet',
      status: 'active',
    };
    
    const mockData: Bundle<ValueSet> = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 1,
      entry: [{
        fullUrl: 'http://example.com/ValueSet/1',
        resource: mockValueSet,
      }],
    };

    // Mock for the Bundle
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: mockHeaders,
      json: () => Promise.resolve(mockData),
    });

    // Mock for the $expanded ValueSet
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: mockHeaders,
      json: () => Promise.resolve(mockValueSet),
    });

    await urlProcessor({ url: 'http://example.com/ValueSet?status=active' }, callback);

    expect(callback).toHaveBeenCalledWith(JSON.stringify(mockValueSet));
  });

  it('Retrieves the expanded ValueSet when a Bundle is returned from the original request', async () => {
    const mockHeaders = new Headers();
    mockHeaders.set('Content-Type', 'application/fhir+json');
    
    const mockValueSet: ValueSet = {
      resourceType: 'ValueSet',
      status: 'active',
      expansion: {
        timestamp: new Date().toISOString(),
      },
    };
    
    const mockData: Bundle<ValueSet> = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 1,
      entry: [{
        fullUrl: 'http://example.com/ValueSet/1',
        resource: mockValueSet,
      }],
    };

    // Mock for the Bundle
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: mockHeaders,
      json: () => Promise.resolve(mockData),
    });

    await urlProcessor({ url: 'http://example.com/ValueSet?status=active' }, callback);

    expect(callback).toHaveBeenCalledWith(JSON.stringify(mockValueSet));
  });

  it('Gets the next page of results, if there is a relative next page link in the Bundle', async () => {
    const mockHeaders = new Headers();
    mockHeaders.set('Content-Type', 'application/fhir+json');
    
    const mockValueSet1: ValueSet = {
      resourceType: 'ValueSet',
      status: 'active',
      id: "1",
    };

    const mockValueSet2: ValueSet = {
      resourceType: 'ValueSet',
      status: 'active',
      id: "2",
    };
    
    const mockData: Bundle<ValueSet> = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 2,
      link: [{
        relation: 'next',
        url: 'ValueSet?offset=1&_count=1'
      }],
      entry: [{
        fullUrl: 'http://example.com/ValueSet/1',
        resource: mockValueSet1,
      }],
    };

    const mockNextPage: Bundle<ValueSet> = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 2,
      entry: [{
        fullUrl: 'http://example.com/ValueSet/2',
        resource: mockValueSet2,
      }],
    };

    // Mock for the Bundle
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: mockHeaders,
      json: () => Promise.resolve(mockData),
    });

    // Mock for the $expanded ValueSet
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: mockHeaders,
      json: () => Promise.resolve(mockValueSet1),
    });

    // Mock for the next page
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: mockHeaders,
      json: () => Promise.resolve(mockNextPage),
    });

    // Mock for the $expanded ValueSet
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: mockHeaders,
      json: () => Promise.resolve(mockValueSet2),
    });

    await urlProcessor({ url: 'http://example.com/fhir/r5/ValueSet?status=active', followLinks: true }, callback);

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, JSON.stringify(mockValueSet1));
    expect(callback).toHaveBeenNthCalledWith(2, JSON.stringify(mockValueSet2));

    expect(mockFetch).toHaveBeenNthCalledWith(3, 'http://example.com/fhir/r5/ValueSet?offset=1&_count=1');
  });

  it('Gets the next page of results, if there is an absolute next page link in the Bundle', async () => {
    const mockHeaders = new Headers();
    mockHeaders.set('Content-Type', 'application/fhir+json');
    
    const mockValueSet1: ValueSet = {
      resourceType: 'ValueSet',
      status: 'active',
      id: "1",
    };

    const mockValueSet2: ValueSet = {
      resourceType: 'ValueSet',
      status: 'active',
      id: "2",
    };
    
    const mockData: Bundle<ValueSet> = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 2,
      link: [{
        relation: 'next',
        url: 'http://example.com/ValueSet?offset=1&_count=1'
      }],
      entry: [{
        fullUrl: 'http://example.com/ValueSet/1',
        resource: mockValueSet1,
      }],
    };

    const mockNextPage: Bundle<ValueSet> = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 2,
      entry: [{
        fullUrl: 'http://example.com/ValueSet/2',
        resource: mockValueSet2,
      }],
    };

    // Mock for the Bundle
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: mockHeaders,
      json: () => Promise.resolve(mockData),
    });

    // Mock for the $expanded ValueSet
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: mockHeaders,
      json: () => Promise.resolve(mockValueSet1),
    });

    // Mock for the next page
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: mockHeaders,
      json: () => Promise.resolve(mockNextPage),
    });

    // Mock for the $expanded ValueSet
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: mockHeaders,
      json: () => Promise.resolve(mockValueSet2),
    });

    await urlProcessor({ url: 'http://example.com/ValueSet?status=active', followLinks: true }, callback);

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, JSON.stringify(mockValueSet1));
    expect(callback).toHaveBeenNthCalledWith(2, JSON.stringify(mockValueSet2));

    expect(mockFetch).toHaveBeenNthCalledWith(3, 'http://example.com/ValueSet?offset=1&_count=1');
  });
});
