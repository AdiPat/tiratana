/**
 * A re-usable Loader class for CLI applications.
 * @class Loader
 * @property {string[]} spinnerFrames - The frames of the spinner animation.
 * @property {NodeJS.Timer | null} interval - The interval for the spinner animation.
 * @property {number} frameIndex - The current frame index.
 * @property {string} currentLine - The current line of the spinner.
 * @property {string} defaultMessage - The default message to display.
 * @property {number} intervalTime - The interval time for the spinner.
 *
 * @example
 * const loader = new Loader();
 * loader.start("Loading...");
 * loader.stop("Done!");
 *
 * @summary We wanted loading animations for our CLI, so we built a re-usable Loader class.
 * Our goal was to avoid using external libraries and keep the codebase minimal.
 * Current libraries don't have what we need without bloat  - simple, clean and customizable loaders.
 * If you plan to copy this code and use it in your project, make sure you comply with the MIT license.
 *
 */
export declare class Loader {
    private defaultMessage;
    private intervalTime;
    private spinnerFrames;
    private interval;
    private frameIndex;
    private currentLine;
    constructor(defaultMessage?: string, intervalTime?: number);
    /**
     * Starts the loader animation with an optional message and configurable colors.
     * @param message Optional message to override the default.
     * @param spinnerColor Color of the spinner.
     * @param messageColor Color of the message.
     * @returns void
     */
    start(message?: string, spinnerColor?: string, messageColor?: string): void;
    /**
     * Stops the loader animation and clears only the spinner remnants.
     * @param completionMessage Optional message to display after the loader stops.
     * @returns void
     */
    stop(completionMessage?: string): void;
    /**
     *
     * Clears only the spinner remnants without affecting other output.
     * @returns void
     */
    clear(): void;
    /**
     *
     * Starts, runs and stops the loader with an artificial delay and a callback function.
     * @param callback The function to run after the loader starts.
     * @param inducedTime The amount of artificial delay to induce.
     * @param message The message to display while loading.
     * @param textColor The color of the message.
     * @param spinnerColor The color of the spinner.
     */
    static load(callback: Function, inducedTime?: number, message?: string, textColor?: string, spinnerColor?: string): Promise<void>;
}
