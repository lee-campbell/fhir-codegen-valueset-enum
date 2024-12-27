import { Bundle, BundleEntry, ValueSet } from "../types";
import InputDataProcessor from "./processor";

type UrlProcessorOptions = {
  url: string | URL;
  /**
   * If the result returns a Bundle that contains a "next" link, this boolean instructs the
   * processor to also process that link. This acts recursively and will continue until there are
   * no "next" links returned by the Bundle. It should be noted that for the FHIR R5 Terminology
   * server, there are 461 pages of results.
   */
  followLinks?: boolean;
};

const permittedContentTypes = ['application/fhir+json', 'application/json'];
const permittedResourceTypes = ['ValueSet', 'Bundle'];

const getFhirBaseUrl = (fhirUrl: URL): URL => {
  let path = fhirUrl.pathname;
  path = path.replace(/\/$/, '');
  
  // Split the pathname into segments
  const pathSegments = path.split('/').filter(segment => segment).reverse();

  // Identify the first FHIR resource or stop processing after known segments
  const possibleResourceIndex = pathSegments.findIndex(segment =>
    /^[A-Za-z]+$/.test(segment) // Matches resource types (e.g., Patient, ValueSet)
  );

  // Base URL includes all segments up to (but not including) the first resource type
  const basePath = pathSegments.reverse().slice(0, pathSegments.length - 1 - possibleResourceIndex).join('/');

  return new URL(`${fhirUrl.origin}${basePath ? `/${basePath}` : ''}`);
}

const getNextPageUrl = (originalUrl: URL, nextPageUrl: string): string => {
  const baseUrl = getFhirBaseUrl(originalUrl);

  if (nextPageUrl.startsWith(baseUrl.toString())) {
    return nextPageUrl;
  }

  return `${baseUrl.toString()}/${nextPageUrl}`;
};

const urlProcessor: InputDataProcessor = async (options: UrlProcessorOptions, callback) => {
  const { url } = options;
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch (ex: any) {
    throw new Error(`Unable to parse the supplied URL "${url.toString()}"`);
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`The request to "${url.toString()}" failed.`, { cause: response });
  }

  const contentType = response.headers.get('Content-Type');

  if (!permittedContentTypes.includes(contentType)) {
    throw new Error(`Content-Type "${contentType}" is not supported. Supported content types are: ${permittedContentTypes.join(', ')}.
    Hint: including the query string parameter "_format=json" will instruct some terminology servers to return JSON.`);
  }

  const data: any = await response.json();

  if (!permittedResourceTypes.includes(data.resourceType)) {
    throw new Error(
      `The returned resource must be one of the following types: ${permittedResourceTypes.join(', ')}. Received: ${data.resourceType}`,
      { cause: data }
    );
  }

  if (data.resourceType === 'ValueSet') {
    return await callback(JSON.stringify(data));
  }

  const bundle = data as Bundle<ValueSet>;

  const valueSetEntries = bundle.entry
    ?.filter(e => e.resource.resourceType === 'ValueSet')
    || [] as BundleEntry<ValueSet>[];

  if (!valueSetEntries.length) {
    console.warn(`Bundle returned from "${url.toString()}" does not contain any ValueSets.`);
  }
  
  for (const v of valueSetEntries) {
    // get the expanded ValueSet...
    if (!v.resource.expansion) {
      await urlProcessor({
        url: `${v.fullUrl}/$expand`,
        followLinks: options.followLinks,
      }, callback);
    } else await callback(JSON.stringify(v.resource));
  }

  if (options.followLinks) {
    const nextPage = bundle.link?.find(l => l.relation === 'next')?.url;

    if (nextPage) {
      // nextPage might be a relative URL. If so, we need to get the base URL from the supplied `options.url`:
      const nextPageUrl = getNextPageUrl(parsedUrl, nextPage);
      await urlProcessor({
        url: nextPageUrl,
        followLinks: true,
      }, callback);
    }
  }
};

export default urlProcessor;
