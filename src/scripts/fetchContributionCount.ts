import axios from 'axios';
import cheerio from 'cheerio';

import { differenceDate } from '../utils/datetime';

export const fetchContributionCount = async (
  githubId: string,
  explorationPeriod: number,
): Promise<number> => {
  const res = await axios.get(
    `http://github.com/users/${githubId}/contributions`,
  );

  if (res.status === 404) {
    throw new Error(
      `User Not Found: ${githubId} というユーザーは存在しません。`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const cheerioRoot = cheerio.load(res.data);
  const contributionCalendarDays = cheerioRoot(
    'svg.js-calendar-graph-svg rect.ContributionCalendar-day',
  );

  let contributionCount = 0;
  contributionCalendarDays.each((_, day) => {
    if (!instanceOfTagElement(day)) {
      return;
    }
    const daysAgo =
      differenceDate({ fromDateString: day.attribs['data-date'] }) || 0;
    if (daysAgo < explorationPeriod) {
      contributionCount += Number(day.attribs['data-count']) || 0;
    }
  });

  return contributionCount;
};

export const instanceOfTagElement = (
  element: cheerio.Element,
): element is cheerio.TagElement => {
  return ['tag', 'script', 'style'].includes(element.type);
};
