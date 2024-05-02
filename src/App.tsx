import React from "react";
import { Sidebar } from "./ui/Sidebar";
import { Viewport } from "./ui/Viewport";
import { Suspense } from "react";
import { getSketches } from "./sketches";
import { SketchLoading } from "./ui/SketchLoading";
import { SketchError } from "./ui/SketchError";
import { SketchSearcherProvider } from "./common/context";
import { Sketch } from "./common/types";

type ErrorBoundaryProps = {
    children: React.ReactNode;
    fallback: React.ReactNode;
};
type ErrorBoundaryState = {
    error: boolean;
};

class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { error: false }; // Now correctly typed
    }

    static getDerivedStateFromError(): ErrorBoundaryState {
        // Return new state indicating there was an error
        return { error: true };
    }

    componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo): void {
        // Log or handle errorInfo as needed
        // TODO: Log error to Sentry or similar
        console.log(_error, _errorInfo);
    }

    render() {
        if (this.state.error) {
            return this.props.fallback;
        }

        return this.props.children;
    }
}

function App() {
    const [sketches, setSketches] = React.useState<Sketch[]>([]);

    getSketches().then(sketches => {
        setSketches(sketches);
        return sketches;
    });

    const SketchComponent = sketches[0] ? sketches[0].Component : () => null;
    

    return (
        <div className="flex h-full">
            <SketchSearcherProvider sketches={sketches}>
                <Sidebar sketches={sketches} />
            </SketchSearcherProvider>
            <Viewport>
                <ErrorBoundary fallback={<SketchError />}>
                    <Suspense fallback={<SketchLoading />}>
                         <SketchComponent />
                    </Suspense>
                </ErrorBoundary>
            </Viewport>
        </div>
    );
}

export default App;
