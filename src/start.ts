import 'dotenv/config';
import inquirer from 'inquirer';

import { ServiceList } from './services';

export const start = async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { service: selected } = await inquirer.prompt([
    {
      type: 'list',
      name: 'service',
      message: '利用するサービスを選択してください',
      choices: ServiceList.map((service) => service.description),
    },
  ]);
  const service = ServiceList.find(
    (service) => service.description === selected,
  );
  service?.func();
};

start();
