import type { Sketch } from "src/common/types";

export const sketches: Sketch[] = [
    {
        "id": "simple-sea",
        "route": "src/sketches/simple-sea/sketch.tsx",
        "imageUrl": "src/sketches/simple-sea/cover.png",
        "title": "Perlin Noise Sea | Three.js Journey",
        "description": "A sea with waves using sin waves and noise. This is a project from the Three.js Journey course by Bruno Simon."
    }
];

export const sketchModules: Record <string, string> = {
    "simple-sea": "./sketches/simple-sea/sketch.tsx"
};
