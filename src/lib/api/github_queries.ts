import { gql } from './gql';

/**
 * Get user's repositories
 */
export const REPOS_QUERY = gql`
  query GetRepositories($first: Int!, $after: String) {
    viewer {
      login
      avatarUrl
      repositories(first: $first, after: $after, orderBy: { field: UPDATED_AT, direction: DESC }, affiliations: [OWNER, COLLABORATOR]) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          name
          nameWithOwner
          url
          updatedAt
          primaryLanguage {
            name
            color
          }
          pullRequests(states: OPEN) {
            totalCount
          }
        }
      }
      organizations(first: 50) {
        nodes {
          login
          name
          avatarUrl
          url
        }
      }
    }
  }
`;

/**
 * Get repository tree for a branch
 */
export const TREE_QUERY = gql`
  query GetTree($owner: String!, $repo: String!, $expression: String!) {
    repository(owner: $owner, name: $repo) {
      id
      object(expression: $expression) {
        ... on Tree {
          entries {
            name
            type
            object {
              __typename
              ... on Blob {
                byteSize
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Get repository branches
 */
export const BRANCHES_QUERY = gql`
  query GetBranches($owner: String!, $repo: String!, $first: Int!) {
    repository(owner: $owner, name: $repo) {
      id
      refs(refPrefix: "refs/heads/", first: $first) {
        nodes {
          name
          target {
            __typename
          }
        }
      }
      defaultBranchRef {
        name
      }
    }
  }
`;

/**
 * Get README content
 */
export const README_QUERY = gql`
  query GetREADME($owner: String!, $repo: String!, $expression: String) {
    repository(owner: $owner, name: $repo) {
      id
      object(expression: $expression) {
        ... on Blob {
          text
        }
      }
    }
  }
`;

/**
 * Get file content
 */
export const FILE_QUERY = gql`
  query GetFile($owner: String!, $repo: String!, $expression: String!) {
    repository(owner: $owner, name: $repo) {
      id
      object(expression: $expression) {
        ... on Blob {
          text
          byteSize
          isBinary
        }
      }
    }
  }
`;

/**
 * Get pull requests for repo
 */
export const PRS_QUERY = gql`
  query GetPullRequests($owner: String!, $repo: String!, $first: Int!, $states: [PullRequestState!]) {
    repository(owner: $owner, name: $repo) {
      id
      pullRequests(states: $states, first: $first, orderBy: { field: UPDATED_AT, direction: DESC }) {
        nodes {
          number
          title
          state
          createdAt
          updatedAt
          author {
            login
            avatarUrl
          }
          commits(last: 1) {
            nodes {
              commit {
                statusCheckRollup {
                  state
                }
              }
            }
          }
        }
        totalCount
      }
    }
  }
`;

/**
 * Get issues for repo
 */
export const ISSUES_QUERY = gql`
  query GetIssues($owner: String!, $repo: String!, $first: Int!, $states: [IssueState!]) {
    repository(owner: $owner, name: $repo) {
      id
      issues(states: $states, first: $first, orderBy: { field: UPDATED_AT, direction: DESC }) {
        nodes {
          number
          title
          state
          createdAt
          updatedAt
          author {
            login
            avatarUrl
          }
          labels(first: 5) {
            nodes {
              name
              color
            }
          }
          assignees(first: 3) {
            nodes {
              login
              avatarUrl
            }
          }
        }
        totalCount
      }
    }
  }
`;
