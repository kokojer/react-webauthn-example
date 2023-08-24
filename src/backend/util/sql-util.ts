interface Column {
  name: string;
  alias: string;
}

const makeSelect = (columns: Column[]) => {
  return columns.map((value) => `${value.name} as "${value.alias}"`).join(", ");
};

export { makeSelect };
