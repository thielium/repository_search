// Partial types for Github responses

export interface RepositoryRow {
  node_id: string;
  owner: {
    login: string;
  };
  stargazers_count: number;
  html_url: string;
  name: string;
  commits_url: string;
  forks_url: string;
}

export interface RepositorySearchResponse {
  items: RepositoryRow[];
  total_count: number;
}

export interface Commit {
  author: {
    login?: string;
  };
}

export interface Fork {
  owner: {
    url: string;
    login: string;
  };
}

export interface Owner {
  bio?: string;
}
