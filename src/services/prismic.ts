import * as prismic from '@prismicio/client';
import { HttpRequestLike } from '@prismicio/client';
import { enableAutoPreviews } from '@prismicio/next';
import sm from '../../sm.json';

export const endpoint = sm.apiEndpoint
export const repositoryName = prismic.getRepositoryName(endpoint)

export function linkResolver(doc) {
  switch (doc.type) {
    case 'homepage':
      return '/'
    case 'posts':
      return `/posts`
    default:
      return null
  }
}

export interface PrismicConfig {
  req?: HttpRequestLike;
}

export function getPrismicClient(config: PrismicConfig): prismic.Client {
  const client = prismic.createClient(process.env.PRISMIC_API_ENDPOINT);

  enableAutoPreviews({
    client,
    req: config.req,
  })

  return client;
}
