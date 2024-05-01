import React from "react";

export const SketchError: React.FC = () => {
    return (
        <div className="w-full h-full flex items-center justify-center bg-stone-600">
            <p className="text-2xl text-slate-100">
                Oh no! Something went wrong {":("}
            </p>
        </div>
    );
};
