import { useContext } from "react";
import { SketchSearcherContext } from "../context";
import { SketchSearcher } from "../search";

export const useSearch = (): SketchSearcher => {
    const { sketchSearcherInstance } = useContext(SketchSearcherContext);
    if (!sketchSearcherInstance) {
        throw new Error("useSearch must be used within a SketchSearcherProvider");
    }
    return sketchSearcherInstance;
};