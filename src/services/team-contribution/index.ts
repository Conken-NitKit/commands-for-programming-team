import chalk from 'chalk';
import inquirer from 'inquirer';

import { GitHubApiApolloClientImpl } from '../../infrastructures/apollo-github-api';
import { LineNotifyClientImpl } from '../../infrastructures/line-notify';
import { fetchContributionCount } from '../../scripts/fetchContributionCount';

import { BLACK_LIST_LOGIN_IDS } from './blackList';

export const teamContributionFunc = async () => {
  const githubAccessToken = process.env.GITHUB_ACCESS_TOKEN;
  const organizationId = process.env.ORGANIZATION_ID;

  if (!githubAccessToken) {
    console.error(
      chalk.red(
        'Error: .envファイルに GITHUB_ACCESS_TOKEN が設定されていないので強制終了しました。',
      ),
    );
    return;
  }
  if (!organizationId) {
    console.error(
      chalk.red(
        '.envファイルに ORGANIZATION_ID が設定されていないので強制終了しました。',
      ),
    );
    return;
  }

  console.log('監視対象から明示的の除外されるユーザーは以下の通りです。');
  BLACK_LIST_LOGIN_IDS.forEach((id) => {
    console.log(`- ${id}`);
  });
  console.log('');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { passBlackListUser } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'passBlackListUser',
      message: '以上のユーザーで問題ないですか？',
      default: false,
    },
  ]);

  if (!passBlackListUser) {
    return;
  }

  const PeriodMenus = [
    {
      cliMessage: '厳密に1週間(7日)',
      messageTitle: '今週のランキング',
      size: 7,
    },
    {
      cliMessage: 'ざっくりと1週間(8日)',
      messageTitle: '今週のランキング',
      size: 8,
    },
    { cliMessage: '一ヶ月(31日)', messageTitle: '今月のランキング', size: 31 },
    {
      cliMessage: '半年(180日)',
      messageTitle: '半年間のランキング',
      size: 180,
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { periodMessage, maxSize } = await inquirer.prompt([
    {
      type: 'list',
      name: 'periodMessage',
      message: '探索期間をお選びください。',
      choices: PeriodMenus.map((menu) => menu.cliMessage),
    },
    {
      type: 'number',
      name: 'maxSize',
      message: '表示したい最大メンバーの数を入力してください。',
    },
  ]);

  const watchPeriod = PeriodMenus.find(
    (menu) => menu.cliMessage === periodMessage,
  );

  if (!watchPeriod) {
    console.error(
      chalk.red(
        'Error: 選択された探索期間が不正な値であったため、強制終了しました。',
      ),
    );
    return;
  }

  const client = new GitHubApiApolloClientImpl(githubAccessToken);

  const memberIds = await client.fetchOrganizationMembers(organizationId);

  const requests = memberIds.map(async (id) => {
    const contributionCount = await fetchContributionCount(
      id,
      watchPeriod.size,
    );
    return { id, contributionCount };
  });

  const members = await Promise.all(requests);

  const activeMembers = members.filter((member) => {
    return (
      !!member.contributionCount && !BLACK_LIST_LOGIN_IDS.includes(member.id) // eslint-disable-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    );
  });

  activeMembers.sort((a, b) =>
    a.contributionCount < b.contributionCount ? 1 : -1,
  );

  const displayMembers = activeMembers.slice(0, Number(maxSize));

  const title = `🎉 ${watchPeriod.messageTitle} 🎉`;

  const sumContributions = displayMembers.reduce(
    (prev, member) => member.contributionCount + prev,
    0,
  );
  let firstMessage = '';
  firstMessage += `総contribution数: ${sumContributions}\n`;
  firstMessage += `計測日数: ${watchPeriod.size}日\n`;

  let message = '';

  displayMembers.forEach((member, idx) => {
    const _idx = idx + 1;
    const percent =
      Math.round((1000 * member.contributionCount) / sumContributions) / 10;
    message += `${_idx}位: ${member.id}\n`;
    message += `contribution数: ${member.contributionCount} (${percent}%)\n`;
    if (_idx < displayMembers.length) {
      message += `\n`;
    }
  });

  const footer =
    '▼　実装内容:\nhttps://github.com/Conken-NitKit/conken-contribution';

  const resultMessage = `${title}\n${firstMessage}\n${message}\n${footer}`;

  console.log('');
  console.log('結果は以下の通りです。');
  console.log('');

  console.log(resultMessage);
  console.log('');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { isNoticeToLine } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'isNoticeToLine',
      message: 'この結果を LINEグループ に通知しますか？',
      default: false,
    },
  ]);

  if (isNoticeToLine) {
    const lineNoticeToken = process.env.LINE_NOTICE_TOKEN;

    if (!lineNoticeToken) {
      console.error(
        chalk.red(
          'Error: .envファイルに LINE_NOTICE_TOKEN が設定されていないので強制終了しました。',
        ),
      );
      return;
    }

    const lineNotifyClient = new LineNotifyClientImpl(lineNoticeToken);
    lineNotifyClient.notifyMessage(resultMessage);
  }
};
