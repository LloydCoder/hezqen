import * as migration_20261115_155359_initial from "./20261115_155359_initial";
import * as migration_20261116_000000_editorial_scheduling_corrections from "./20261116_000000_editorial_scheduling_corrections";

export const migrations = [
  {
    up: migration_20261115_155359_initial.up,
    down: migration_20261115_155359_initial.down,
    name: "20261115_155359_initial",
  },
  {
    up: migration_20261116_000000_editorial_scheduling_corrections.up,
    down: migration_20261116_000000_editorial_scheduling_corrections.down,
    name: "20261116_000000_editorial_scheduling_corrections",
  },
];
