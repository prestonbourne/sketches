import { forwardRef, HTMLProps } from "react";

type VanillaCanvasProps = HTMLProps<HTMLCanvasElement>;
export const VanillaCanvas = forwardRef<HTMLCanvasElement, VanillaCanvasProps>((props, ref) => {

    return <canvas className='w-full h-full' ref={ref} {...props} />;
});

VanillaCanvas.displayName = "Canvas";