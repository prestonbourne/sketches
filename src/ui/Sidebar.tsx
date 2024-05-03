import { Sketch } from "src/common/types";
import React from "react";
import { useState, useMemo } from "react";
import { useDebounce } from "src/common/hooks/useDebounce";
import { useSearch } from "src/common/hooks";

type SidebarProps = SketchListProps;

export const Sidebar: React.FC<SidebarProps> = ({ sketches }) => {
    return (
        <aside className="flex-none w-1/5 min-w-80 max-w-md bg-stone-950">
            <Header name="Preston" />
            <SearchBar sketches={sketches} />
        </aside>
    );
};

const Header: React.FC<{ name: string }> = ({ name }) => {
    return (
        <header className="text-xl mx-auto w-11/12 my-4 flex flex-row justify-between">
            <div className="w-fit">
                <h2 className="text-slate-50 text-3xl font-bold tracking-wide">
                    <a
                        href="https://www.prestonbourne.dev/"
                        className="underline decoration-purple-400 hover:text-purple-400 transition-all underline-offset-4 hover:underline-offset-2"
                        target="_blank"
                    >
                        {name}
                    </a>{" "}
                    / sketches /
                </h2>
            </div>
        </header>
    );
};

type SearchBarProps = {
    sketches: Sketch[];
};

const SearchBar: React.FC<SearchBarProps> = ({ sketches }) => {
    const [query, setQuery] = useState("");

    const debouncedQuery = useDebounce(query); // Debounce query with a 500ms delay

    const searcher = useSearch();

    const filteredSketches = useMemo(() => {
        if (debouncedQuery.trim() === "") return sketches;

        const results = searcher.getResults(debouncedQuery); 
        return sketches.filter(sketch => results.includes(sketch.id));
    }, [debouncedQuery, sketches, searcher]); 

    return (
        <div className="w-11/12 mx-auto">
            <input
                type="text"
                className="mx-auto w-full my-2 p-4 rounded-md border-solid border-2 border-slate-400 text-slate-400 bg-stone-900 hover:bg-stone-800 hover:ring-purple-300 hover:ring-1 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                placeholder="Search sketches..."
                value={query}
                onChange={e => setQuery(e.target.value)}
            />
            <SketchList sketches={filteredSketches} />
        </div>
    );
};

type SketchListProps = {
    sketches: Sketch[];
};

const SketchList: React.FC<SketchListProps> = ({ sketches }) => {
    const sketchesJSX = sketches.map(sketch => {
        return <Item key={sketch.id} sketch={sketch} />;
    });

    return (
        <nav>
            <ul className="mx-auto my-4">{sketchesJSX}</ul>
        </nav>
    );
};

type SketchItemProps = {
    sketch: Sketch;
};

const Item: React.FC<SketchItemProps> = ({ sketch }) => {
   
    const imageUrl = new URL(`../sketches/${sketch.id}/cover.png`, import.meta.url).href;

    return (
        <li className="group relative h-64 block rounded-lg border-solid border-slate-400 border-2 overflow-hidden hover:border-purple-400 transition-all text-slate-100 hover:cursor-pointer">
            <img
                className="w-full h-full object-cover"
                src={imageUrl}
                alt={sketch.title}
            />

            <div className="p-4 w-full absolute bottom-0 left-0 bg-stone-900 bg-opacity-70 backdrop-blur-lg">
                <div className="h-fit w-full">
                    <h3 className="font-semibold text-lg">{sketch.title}</h3>
                </div>
                <div className="transition-all max-h-0 opacity-0 group-hover:opacity-100 group-hover:max-h-32">
                    <p className="text-base text-ellipsis">
                        {sketch.description}
                    </p>
                </div>
            </div>
        </li>
    );
};
