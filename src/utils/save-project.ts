import type { Project } from 'ts-morph'
import { log } from './helpers'

export async function saveProject(project: Project) {
  log('[start] saving project...')
  await project.save()
  log('[finished] project saved.')
}
