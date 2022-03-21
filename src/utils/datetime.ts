export const DATE_TIME_UNIT = {
  YEAR: 'year',
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day',
  HOUR: 'hour',
  MINUTES: 'minutes',
  SECOND: 'second',
} as const;

export const differenceDate = ({
  fromDateString = new Date().toString(),
  toDateString = new Date().toString(),
  unit = DATE_TIME_UNIT.DAY,
}: {
  fromDateString?: string;
  toDateString?: string;
  unit?: string;
}): number | undefined => {
  const fromDate = new Date(fromDateString);
  const toDate = new Date(toDateString);

  if (!fromDate || !toDate) {
    return;
  }

  const diffMS = Number(toDate) - Number(fromDate);
  switch (unit) {
    case DATE_TIME_UNIT.YEAR:
      return Math.floor(diffMS / 365 / 1000 / 60 / 60 / 24);
    case DATE_TIME_UNIT.MONTH:
      return Math.floor(diffMS / 30 / 1000 / 60 / 60 / 24);
    case DATE_TIME_UNIT.WEEK:
      return Math.floor(diffMS / 7 / 1000 / 60 / 60 / 24);
    case DATE_TIME_UNIT.DAY:
      return Math.floor(diffMS / 1000 / 60 / 60 / 24);
    case DATE_TIME_UNIT.HOUR:
      return Math.floor(diffMS / 1000 / 60 / 60);
    case DATE_TIME_UNIT.MINUTES:
      return Math.floor(diffMS / 1000 / 60);
    case DATE_TIME_UNIT.SECOND:
      return Math.floor(diffMS / 1000);
  }
};
