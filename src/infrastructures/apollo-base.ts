import {
  ApolloClient,
  ApolloLink,
  ApolloQueryResult,
  concat,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  QueryOptions,
} from '@apollo/client/core';
import fetch from 'cross-fetch';

export abstract class BaseApolloClient {
  abstract query<T, TVariables>(
    options: QueryOptions<TVariables, T>,
  ): Promise<ApolloQueryResult<T>>;
}

export class BaseApolloClientImpl extends BaseApolloClient {
  private client: ApolloClient<NormalizedCacheObject>;

  constructor(serverLink: string, authorization?: string) {
    super();
    const httpLink = createHttpLink({
      uri: serverLink,
      fetch,
    });
    const authMiddleware = new ApolloLink((operation, forward) => {
      operation.setContext(({ headers = {} }) => ({
        headers: {
          ...headers,
          authorization,
        },
      }));
      return forward(operation);
    });
    this.client = new ApolloClient({
      link: concat(authMiddleware, httpLink),
      cache: new InMemoryCache(),
    });
  }

  query<T, TVariables>(options: QueryOptions<TVariables, T>) {
    return this.client.query(options);
  }
}
