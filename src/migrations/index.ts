import * as migration_20261115_154905_initial from './20261115_154905_initial';

export const migrations = [
  {
    up: migration_20261115_154905_initial.up,
    down: migration_20261115_154905_initial.down,
    name: '20261115_154905_initial'
  },
];
