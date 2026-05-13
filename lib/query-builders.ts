export function buildSafeQuery(query: string, variables: any) {
  const keys = Object.keys(variables || {});
  let finalQuery = query;
  const values: any[] = [];

  keys.forEach((key, index) => {
    finalQuery = finalQuery.replaceAll(`:${key}`, `$${index + 1}`);
    values.push(variables[key]);
  });

  return { finalQuery, values };
}