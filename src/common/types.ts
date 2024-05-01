export type Sketch = {
    id: string;
    route: string;
} & SketchMetaData;

export type SketchMetaData = {
    title: string;
    description: string;
    imageUrl?: string;
}