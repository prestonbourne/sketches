type LogLevel = "info" | "warn" | "error";
/*
Only works for Node.js, in the browser, you can use console.log with CSS styles
*/
class Logger {
    private colors = {
        info: "\x1b[34m", // blue
        warn: "\x1b[33m", // yellow
        error: "\x1b[31m", // red
        reset: "\x1b[0m", // reset color
    };

    log(level: LogLevel, message: string) {
        const color = this.colors[level] || ""; // Fix: Add type assertion to keyof typeof this.colors
        const resetColor = this.colors.reset;
        console.log(`${color}[${level.toUpperCase()}]${resetColor} ${message}`);
    }

    info(message: string) {
        this.log("info", message);
    }

    warn(message: string) {
        this.log("warn", message);
    }

    error(message: string) {
        this.log("error", message);
    }
}

export const logger = new Logger();
