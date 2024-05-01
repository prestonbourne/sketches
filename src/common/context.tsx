import React, { createContext } from "react";
import { SketchSearcher } from "./search";
import { Sketch } from "./types";

type SketchSearcherContext = {
    sketchSearcherInstance: SketchSearcher | null;
};

const SketchSearcherContext = createContext<SketchSearcherContext>({
    sketchSearcherInstance: null,
});

type SketchSearcherContextProps = {
    sketches: Sketch[];
    children?: React.ReactNode;
};

const SketchSearcherProvider: React.FC<SketchSearcherContextProps> = ({
    children,
    sketches,
}) => {
    const sketchSearcherInstance = new SketchSearcher(sketches);

    return (
        <SketchSearcherContext.Provider value={{ sketchSearcherInstance }}>
            {children}
        </SketchSearcherContext.Provider>
    );
};



export { SketchSearcherContext, SketchSearcherProvider };
