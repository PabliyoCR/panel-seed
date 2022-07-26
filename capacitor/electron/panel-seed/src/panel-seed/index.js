"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.panelSeed = exports.setupOptions = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const path_1 = require("path");
const workspace_1 = require("@schematics/angular/utility/workspace");
const tasks_1 = require("@angular-devkit/schematics/tasks");
const dependencies_1 = require("@schematics/angular/utility/dependencies");
function setupOptions(host, options) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(host.exists("package.json"));
        console.log("------------");
        const workspace = yield (0, workspace_1.getWorkspace)(host);
        if (!options.project) {
            options.project = workspace.projects.keys().next().value;
        }
        const project = workspace.projects.get(options.project);
        if (!project) {
            throw new schematics_1.SchematicsException(`Invalid project name: ${options.project}`);
        }
        options.path = (0, path_1.join)((0, path_1.normalize)(project.root), "src");
        return host;
    });
}
exports.setupOptions = setupOptions;
function panelSeed(_options) {
    return (tree, _context) => __awaiter(this, void 0, void 0, function* () {
        console.log(tree);
        console.log("..............");
        const dep_bootstrap = {
            type: dependencies_1.NodeDependencyType.Dev,
            name: "bootstrap",
            version: "^5.0",
            overwrite: true,
        };
        const dep_types_ootstrap = {
            type: dependencies_1.NodeDependencyType.Dev,
            name: "@types/bootstrap",
            version: "^5.1.10",
            overwrite: true,
        };
        (0, dependencies_1.addPackageJsonDependency)(tree, dep_bootstrap);
        (0, dependencies_1.addPackageJsonDependency)(tree, dep_types_ootstrap);
        yield setupOptions(tree, _options);
        const movePath = (0, path_1.normalize)(_options.path + "/");
        const templateSource = (0, schematics_1.apply)((0, schematics_1.url)("./files"), [(0, schematics_1.template)(Object.assign({}, _options)), (0, schematics_1.move)(movePath)]);
        _context.addTask(new tasks_1.NodePackageInstallTask(), []);
        return (0, schematics_1.chain)([(0, schematics_1.mergeWith)(templateSource, schematics_1.MergeStrategy.Overwrite)]);
    });
}
exports.panelSeed = panelSeed;
//# sourceMappingURL=index.js.map