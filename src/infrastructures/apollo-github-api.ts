import { gql } from '@apollo/client/core';

import { BaseApolloClientImpl } from './apollo-base';

interface Organization {
  membersWithRole: {
    nodes: {
      login: string;
    }[];
  };
}

export abstract class GitHubApiApolloClient extends BaseApolloClientImpl {
  abstract fetchOrganizationMembers(organizationId: string): Promise<string[]>;
}

export class GitHubApiApolloClientImpl extends GitHubApiApolloClient {
  constructor(token: string) {
    const serverLink = 'https://api.github.com/graphql';
    const authorization = token ? `Bearer ${token}` : '';
    super(serverLink, authorization);
  }

  async fetchOrganizationMembers(organizationId: string): Promise<string[]> {
    const { data } = await this.query<
      { organization: Organization },
      { organizationId: string }
    >({
      query: gql`
        query ($organizationId: String!) {
          organization(login: $organizationId) {
            membersWithRole(first: 100) {
              nodes {
                login
              }
            }
          }
        }
      `,
      variables: {
        organizationId,
      },
    });

    const members = data.organization.membersWithRole.nodes.map(
      (node) => node.login,
    );
    return members;
  }
}
