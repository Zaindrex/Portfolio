// Which tech tags can become filter chips in "More projects".
// Only languages and frameworks; libraries, databases and services are ignored.
// Each chip lists the spellings that count as it (matched case-insensitively).
// Add a line here to support a new language or framework.

export const FILTER_TECH: { label: string; aliases: string[] }[] = [
  // languages
  { label: 'Python', aliases: ['python'] },
  { label: 'JavaScript', aliases: ['javascript', 'js'] },
  { label: 'TypeScript', aliases: ['typescript', 'ts'] },
  { label: 'C#', aliases: ['c#', 'csharp', 'c sharp'] },
  { label: 'Java', aliases: ['java'] },
  { label: 'C++', aliases: ['c++', 'cpp'] },
  { label: 'C', aliases: ['c'] },
  { label: 'Go', aliases: ['go', 'golang'] },
  { label: 'Rust', aliases: ['rust'] },
  { label: 'Kotlin', aliases: ['kotlin'] },
  { label: 'Swift', aliases: ['swift'] },
  { label: 'Dart', aliases: ['dart'] },
  { label: 'PHP', aliases: ['php'] },
  { label: 'SQL', aliases: ['sql', 't-sql', 'tsql'] },
  // frameworks
  { label: '.NET', aliases: ['.net', 'dotnet', '.net core', 'asp.net', 'asp.net core', '.net / asp.net core', 'blazor'] },
  { label: 'React', aliases: ['react', 'react.js', 'reactjs'] },
  { label: 'Angular', aliases: ['angular', 'angularjs'] },
  { label: 'Vue', aliases: ['vue', 'vue.js', 'vuejs', 'nuxt'] },
  { label: 'Next.js', aliases: ['next.js', 'nextjs', 'next'] },
  { label: 'Node.js', aliases: ['node', 'node.js', 'nodejs', 'express', 'express.js'] },
  { label: 'Svelte', aliases: ['svelte', 'sveltekit'] },
  { label: 'React Native', aliases: ['react native'] },
  { label: 'Flutter', aliases: ['flutter'] },
  { label: 'Django', aliases: ['django'] },
  { label: 'Flask', aliases: ['flask'] },
  { label: 'FastAPI', aliases: ['fastapi'] },
  { label: 'Spring', aliases: ['spring', 'spring boot'] },
  { label: 'Laravel', aliases: ['laravel'] },
  { label: 'TensorFlow', aliases: ['tensorflow', 'keras'] },
  { label: 'PyTorch', aliases: ['pytorch', 'torch'] },
]

const byAlias = new Map(FILTER_TECH.flatMap((t) => t.aliases.map((a) => [a, t.label] as const)))

/** The filter labels a project's tech stack maps to (unknown tags are skipped). */
export function filterLabels(stack: string[]): string[] {
  const labels = new Set<string>()
  for (const tag of stack) {
    const label = byAlias.get(tag.trim().toLowerCase())
    if (label) labels.add(label)
  }
  return [...labels]
}
