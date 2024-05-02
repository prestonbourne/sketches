import React from 'react';

export type Sketch = {
    id: string;
    Component: ReturnType<typeof React.lazy>;
} & SketchMetaData;

export type SketchMetaData = {
    title: string;
    description: string;
    imageUrl?: string;
}