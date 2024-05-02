import type { Sketch, SketchMetaData } from "src/common/types";
import { lazy } from "react";

type MetadataModule = {
    default: SketchMetaData;
};

const sketchModulesRaw = import.meta.glob("./**/sketch.{ts,js,jsx,tsx}");
const sketchesMeta = import.meta.glob("./**/meta.{ts,js,tsx,jsx}");
const sketchesCovers = import.meta.glob("./**/cover.{png,jpg,jpeg,wepb}");

const importRouteToMap = (route: string, file: string) => {
    const formattedPath = route.startsWith("./") ? route.substring(2) : route;
    const segs = formattedPath.split("/");
    const id = segs[0];
    const folderSegs = segs.slice(0, segs.length - 1);
    folderSegs.push(file);
    folderSegs.unshift("src", "sketches");
    const path = folderSegs.join("/");

    return {
        id,
        path,
    };
};

const imageRoutesMap: Record<string, string> = Object.keys(
    sketchesCovers
).reduce<Record<string, string>>((acc, route) => {
    const { id, path } = importRouteToMap(route, "cover.png");
    acc[id] = path;
    return acc;
}, {});

type MetaDataMap = Record<string, () => Promise<MetadataModule>>;

const metaDataMap: MetaDataMap = Object.keys(sketchesMeta).reduce(
    (acc: MetaDataMap, route: string) => {
        const metaFile = route.includes(".ts") ? "meta.ts" : "meta.js";
        const { id } = importRouteToMap(route, metaFile);
        const relPath = `./${id}/${metaFile}`;

        acc[id] = sketchesMeta[relPath] as () => Promise<MetadataModule>;
        return acc;
    },
    {}
);

type SketchModule = Record<string, ReturnType<typeof lazy>>;

const sketchModules: SketchModule = Object.entries(
    sketchModulesRaw
).reduce<SketchModule>((acc, [k, v]) => {
    const fileName = k.includes(".tsx")
        ? k.includes(".ts")
            ? "ts"
            : "tsx"
        : k.includes(".jsx")
        ? "jsx"
        : "js";
    const { id } = importRouteToMap(k, fileName);

    acc[id] = lazy(v as () => Promise<{ default: React.ComponentType }>);
    return acc;
}, {});

export const getSketches = (() => {
    let cache: Promise<Sketch[]> | null = null;

    return async (): Promise<Sketch[]> => {
        if (cache) {
            return cache;
        }

        cache = Promise.all(
            Object.keys(sketchModules).map(async (id) => {
                const imageUrl = imageRoutesMap[id];
                const metaDataModule = metaDataMap[id];
                const Component = sketchModules[id];

                if (!metaDataModule || !imageUrl) {
                    throw new Error(`Missing metadata or image for sketch: ${id}`);
                }

                const { default: metaData } = await metaDataModule();

                return {
                    id,
                    imageUrl,
                    ...metaData,
                    Component,
                };
            })
        );

        return cache;
    };
})();
