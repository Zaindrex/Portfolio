import type { IconType } from 'react-icons'
import {
  SiAngular,
  SiDotnet,
  SiGit,
  SiJavascript,
  SiJsonwebtokens,
  SiLangchain,
  SiMongodb,
  SiMysql,
  SiOllama,
  SiPython,
  SiQdrant,
  SiReact,
  SiSharp,
  SiSupabase,
  SiTailwindcss,
  SiTensorflow,
  SiTypescript,
} from 'react-icons/si'
import { FaDatabase, FaServer } from 'react-icons/fa6'
import { TbBrandCSharp } from 'react-icons/tb'

const map: Record<string, { Icon: IconType; color: string }> = {
  csharp: { Icon: TbBrandCSharp, color: '#a179dc' },
  sharp: { Icon: SiSharp, color: '#a179dc' },
  dotnet: { Icon: SiDotnet, color: '#7b5cff' },
  api: { Icon: FaServer, color: '#ff8a1f' },
  database: { Icon: FaDatabase, color: '#5fb3ff' },
  jwt: { Icon: SiJsonwebtokens, color: '#ff5fa2' },
  angular: { Icon: SiAngular, color: '#e23237' },
  react: { Icon: SiReact, color: '#61dafb' },
  typescript: { Icon: SiTypescript, color: '#3178c6' },
  javascript: { Icon: SiJavascript, color: '#f7df1e' },
  tailwind: { Icon: SiTailwindcss, color: '#38bdf8' },
  python: { Icon: SiPython, color: '#4b8bbe' },
  langchain: { Icon: SiLangchain, color: '#3ecf8e' },
  qdrant: { Icon: SiQdrant, color: '#dc244c' },
  ollama: { Icon: SiOllama, color: '#ffffff' },
  tensorflow: { Icon: SiTensorflow, color: '#ff8f00' },
  sqlserver: { Icon: FaDatabase, color: '#cc2927' },
  mysql: { Icon: SiMysql, color: '#4479a1' },
  mongodb: { Icon: SiMongodb, color: '#47a248' },
  supabase: { Icon: SiSupabase, color: '#3ecf8e' },
  git: { Icon: SiGit, color: '#f05032' },
}

/** Icon keys the studio offers in its picker. */
export const techIconKeys = Object.keys(map)

export function TechIcon({ name, className = '' }: { name: string; className?: string }) {
  const entry = map[name] ?? { Icon: FaServer, color: '#ff8a1f' }
  const { Icon, color } = entry
  return <Icon className={className} style={{ color }} aria-hidden />
}
