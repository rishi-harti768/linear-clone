import { useLiveQuery } from '@electric-sql/pglite-react';
import type { LiveQuery } from '@electric-sql/pglite/live';
import { useLoaderData } from 'react-router-dom';
import TopFilter from '../../components/TopFilter';
import type { Issue, StatusValue } from '../../types/types';
import type { FilterState } from '../../utils/filterState';
import IssueBoard from './IssueBoard';

export interface BoardLoaderData {
  filterState: FilterState;
  columnsLiveIssues: Record<StatusValue, LiveQuery<Issue>>;
}

function Board() {
  const { columnsLiveIssues, filterState } = useLoaderData() as BoardLoaderData;

  const totalIssuesCount = Object.values(columnsLiveIssues).reduce((total, liveQuery) => {
    const issuesRes = useLiveQuery(liveQuery);
    return total + (issuesRes?.totalCount ?? 0);
  }, 0);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopFilter
        title="Board"
        filterState={filterState}
        filteredIssuesCount={totalIssuesCount}
        hideSort={true}
      />
      <IssueBoard columnsLiveIssues={columnsLiveIssues} />
    </div>
  );
}

export default Board;
