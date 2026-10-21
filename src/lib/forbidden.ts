// Identifiers that must never appear in this public repository: the employer's
// private repo owner and slug, the names of repos that held employer documents,
// ticket keys, phone prefix, work email domain and token prefixes.
export const FORBIDDEN =
  /marcomu|reinamadre\/|reinamadre-audits|manual-operativo|REI-\d|\+52|@reinamadre\.mx|ghp_|github_pat_/i;
