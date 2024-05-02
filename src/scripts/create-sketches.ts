import fs from "fs";
import path from "path";
import { promisify } from "util";
import { fileURLToPath } from "url";
import { dirname } from "path";
import type { Sketch, SketchMetaData } from "../common/types";
import { logger } from "./logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, "../");

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const usedIDMap: Record<string, boolean> = {};

async function findSketchFiles(
    dir: string,
    baseRoute: string = projectRoot,
    baseURL: string = "src"
): Promise<Sketch[]> {
    const sketches: Sketch[] = [];
    const files = await readdir(dir);

    const hasDirs = files.some(async file => {
        const fileStats = await stat(path.join(dir, file));
        return fileStats.isDirectory();
    });

    const curSketchFile = files.find(
        file =>
            file === "sketch.ts" ||
            file === "sketch.js" ||
            file === "sketch.jsx" ||
            file === "sketch.tsx"
    );

    if (!curSketchFile && !hasDirs) {
        return sketches;
    }

    for (const file of files) {
        const filePath = path.join(dir, file);
        const fileStats = await stat(filePath);

        if (fileStats.isDirectory()) {
            const nestedSketches = await findSketchFiles(
                filePath,
                `${baseRoute}/${file}`
            );
            sketches.push(...nestedSketches);
        } else if (file === "meta.js" || file === "meta.ts") {
            const { metaData }: { metaData: SketchMetaData } = await import(
                filePath
            );

            // typecast to string to avoid TS error
            const fullRoute = path.join(baseRoute, curSketchFile as string);

            const relativeRouteArr = path
                .relative(projectRoot, fullRoute)
                .split(path.sep);

            const id = relativeRouteArr[0];
            if (usedIDMap[id]) {
                throw new Error(`Duplicate Sketch found: ${id}`);
            }
            usedIDMap[id] = true;

            // insert `src/sketches` into the route
            relativeRouteArr.unshift("sketches");
            relativeRouteArr.unshift(baseURL);
            const route = relativeRouteArr.join(path.sep);

            relativeRouteArr.pop();
            relativeRouteArr.push("cover.png");
            const imageUrl = relativeRouteArr.join(path.sep);

            // spread the metaData AFTER to override for custom keys
            sketches.push({
                id,
                route,
                imageUrl,
                ...metaData,
            });
        }
    }

    return sketches;
}

async function main() {
    const sketchesDirectory = path.join(__dirname, "../sketches");

    const projectBaseURL = "src";
    const sketches = await findSketchFiles(
        sketchesDirectory,
        undefined,
        projectBaseURL
    );

    const sketchModules = sketches.reduce<Record<string, string>>(
        (acc, sketch) => {
            acc[sketch.id] = sketch.route.replace(projectBaseURL, ".");
            return acc;
        },
        {}
    );

    logger.info(`Found ${sketches.length} sketches`);
    for (const sketch of sketches) {
        logger.info(`- ${sketch.title}`);
    }

    const indexFilePath = path.join(sketchesDirectory, "index.ts");

    const content = `import type { Sketch } from "src/common/types";

export const sketches: Sketch[] = ${JSON.stringify(sketches, null, 4)};

export const sketchModules: Record <string, string> = ${JSON.stringify(
        sketchModules,
        null,
        4
    )};
`;

    fs.writeFileSync(indexFilePath, content, "utf-8");
}

main().catch(console.error);
