export function filterProposal(proposals: any, query: string) {
  return proposals.filter((proposal: any) => {
    let matches = true;

    if (query) {
      const properties = ['proponent', 'locator'];
      let containsQuery = false;

      properties.forEach((property) => {
        if (
          proposal[property]?.phone === query
        ) {
          containsQuery = true;
        }
      });

      if (!containsQuery) {
        matches = false;
      }
    }
    return matches;
  });
}