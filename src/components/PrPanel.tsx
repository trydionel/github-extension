import React from "react";
import { PrTable } from "./PrTable";
import { searchForPr } from "../lib/github/searchForPr";
import GithubSearchQuery from "../lib/github/GithubSearchQuery";
import { useGithubApi } from "../lib/useGithubApi";

export const PrPanel: React.FC<{
  filter: string;
  repos: string[];
  columns: import("./PrTable/PrTable").TableCols;
}> = ({ filter, repos, columns }) => {
  const query = [
    new GithubSearchQuery()
      .repo(...repos, { quote: true })
      .is("pr")
      .toQuery(),
    filter,
  ]
    .filter(Boolean)
    .join(" ");

  const { authed, error, loading, data, fetchData } = useGithubApi(
    async (api) => {
      const { edges } = await searchForPr(api, {
        query,
        includeStatus: columns.checks,
        includeReviews: columns.reviews,
        includeLabels: columns.labels,
        count: 10,
      });
      return edges.map((e) => e.node);
    },
    {},
    [query, columns]
  );

  if (!authed || error) {
    return (
      <div className="page-content empty-state">
        <div
          className="empty-state__content"
          style={{ textAlign: "center", paddingTop: 50 }}
        >
          <p>Authenticate with GitHub to get started.</p>
          <aha-button type="primary" onClick={() => fetchData()}>
            Authenticate with GitHub
          </aha-button>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="page-content empty-state">
        <div className="empty-state__content">
          <div
            style={{
              fontSize: 36,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <aha-spinner />
          </div>
        </div>
      </div>
    );
  }

  return <PrTable prs={data} columns={columns} />;
};
