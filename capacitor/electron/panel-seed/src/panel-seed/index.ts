import { apply, chain, MergeStrategy, mergeWith, move, Rule, SchematicContext, SchematicsException, template, Tree, url } from "@angular-devkit/schematics"
import { join, normalize } from "path"
import { getWorkspace } from "@schematics/angular/utility/workspace"
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks"

import {
  NodeDependency,
  NodeDependencyType,
  addPackageJsonDependency,
} from '@schematics/angular/utility/dependencies';

export async function setupOptions(host: Tree, options: any): Promise<Tree> {

  const workspace = await getWorkspace(host)
  if (!options.project) {
    options.project = workspace.projects.keys().next().value
  }
  const project = workspace.projects.get(options.project)
  if (!project) {
    throw new SchematicsException(`Invalid project name: ${options.project}`)
  }

  options.path = join(normalize(project.root), "src")
  return host
}

export function panelSeed(_options: any): Rule {
  return async (tree: Tree, _context: SchematicContext) => {

     const dep: NodeDependency = {
       type: NodeDependencyType.Dev,
       name: "bootstrap",
       version: "^5.0",
       overwrite: true,
     }

     addPackageJsonDependency(tree, dep)

    await setupOptions(tree, _options)

    const movePath = normalize(_options.path + "/")
    const templateSource = apply(url("./files"), [template({ ..._options }), move(movePath)])

    _context.addTask(new NodePackageInstallTask(), [])

    return chain([mergeWith(templateSource, MergeStrategy.Overwrite)])
  }
}
