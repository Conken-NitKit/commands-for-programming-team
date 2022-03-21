import { teamContributionFunc } from './team-contribution';

export const Service = {
  teamContribution: {
    description: 'チーム全体のcontribution数を取得する',
    func: teamContributionFunc,
  },
} as const;

export const ServiceList = Object.values(Service);
