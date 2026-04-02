/**
 * Simple gql template tag - just returns the string
 * In a real app this would parse and validate queries
 */
export function gql(strings: TemplateStringsArray): string {
  return strings.join('').replace(/\s+/g, ' ').trim();
}
