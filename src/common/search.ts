import { Sketch } from "src/common/types";

type SketchTokens = {
    id: string;
    tokens: string[];
};

type SearchResults = {
    id: string;
    score: number;
};

export class SketchSearcher {
    private sketchData: SketchTokens[];

    constructor(data: Sketch[]) {
        this.sketchData = data.map(sketch => {
            const tokens = this.tokenize(sketch.title).concat(
                this.tokenize(sketch.description)
            );

            return {
                id: sketch.id,
                tokens,
            };
        });
    }

    private tokenizeQuery(q: string): string[] {
        const tokens = q.toLocaleLowerCase().split(" ");
        return tokens;
    }

    private tokenize(text: string): string[] {
        const tokens = text
            .toLocaleLowerCase()
            .split(" ")
            .filter(t => t.length > 2);
        return tokens;
    }

    getResults(
        query: string,
        count: number = this.sketchData.length,
        threshold: number = 0
    ): string[] {
        const results = this.search(query);
        const topResults = results.filter(r => r.score >= threshold);
        topResults.sort((a, b) => b.score - a.score);
        return topResults.slice(0, count).map(r => r.id);
    }

    search(query: string): SearchResults[] {
        const results: SearchResults[] = [];
        const searchTokens = this.tokenizeQuery(query);

        for (const s of this.sketchData) {
            const score = this.calculateScore(s.tokens, searchTokens);

            results.push({ id: s.id, score });
        }
        console.log(results);
        return results;
    }

    private calculateScore(tokens: string[], searchTokens: string[]): number {
        let score = 1;

        for (const searchToken of searchTokens) {
            for (const token of tokens) {
                const distance = this.levenshteinDist(token, searchToken);
                score /= distance;
            }
        }
        return score;
    }

    private levenshteinDist(a: string, b: string): number {
        const m = a.length;
        const n = b.length;
        const dp: number[][] = [];

        for (let i = 0; i <= m; i++) {
            dp[i] = [];
            dp[i][0] = i;
        }

        for (let j = 0; j <= n; j++) {
            dp[0][j] = j;
        }

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (a[i - 1] === b[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = Math.min(
                        dp[i - 1][j] + 1, // deletion
                        dp[i][j - 1] + 1, // insertion
                        dp[i - 1][j - 1] + 1 // substitution
                    );
                }
            }
        }

        return dp[m][n];
    }
}
