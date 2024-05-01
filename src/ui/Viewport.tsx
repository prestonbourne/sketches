import React from "react";

type ViewportProps = {
    children: React.ReactNode;
};

export const Viewport: React.FC<ViewportProps> = ({ children }) => {

    

    return <div className="flex-grow w-4/5">{children}</div>;
};