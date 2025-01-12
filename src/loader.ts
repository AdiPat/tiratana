import chalk from "chalk";

export class Loader {
  private spinnerFrames: string[] = [
    "⠋",
    "⠙",
    "⠹",
    "⠸",
    "⠼",
    "⠴",
    "⠦",
    "⠧",
    "⠇",
    "⠏",
  ];
  private interval: NodeJS.Timer | null = null;
  private frameIndex: number = 0;
  private currentLine: string = ""; // Keeps track of the spinner's written content

  constructor(
    private defaultMessage: string = "Loading",
    private intervalTime: number = 50
  ) {}

  /**
   * Starts the loader animation with an optional message and configurable colors.
   * @param message Optional message to override the default.
   * @param spinnerColor Color of the spinner.
   * @param messageColor Color of the message.
   * @returns void
   */
  start(
    message?: string,
    spinnerColor: string = "cyan",
    messageColor: string = "white"
  ): void {
    if (message?.includes("\n")) {
      throw new Error("Message cannot contain newlines.");
    }

    if (this.interval) {
      throw new Error(
        "Loader is already running. Don't call 'start' twice. Call 'stop' first."
      );
    }

    const loaderMessage = message || this.defaultMessage;
    const coloredMessage = (chalk as any)[messageColor](loaderMessage);
    const spinnerFormatter = (chalk as any)[spinnerColor];

    this.interval = setInterval(() => {
      this.currentLine = `${coloredMessage} ${spinnerFormatter(
        this.spinnerFrames[this.frameIndex]
      )}`;
      process.stdout.write(`\r${this.currentLine}`);
      this.frameIndex = (this.frameIndex + 1) % this.spinnerFrames.length;
    }, this.intervalTime);
  }

  /**
   * Stops the loader animation and clears only the spinner remnants.
   * @param completionMessage Optional message to display after the loader stops.
   * @returns void
   */
  stop(completionMessage?: string): void {
    if (!this.interval) {
      console.error("Loader is not running.");
      return;
    }

    clearInterval(this.interval as any);
    this.interval = null;
    this.frameIndex = 0;

    this.clear();

    // Print the completion message
    if (completionMessage) {
      console.log(chalk.green(completionMessage));
    }
  }

  /**
   *
   * Clears only the spinner remnants without affecting other output.
   * @returns void
   */
  clear(): void {
    // Clear the spinner's line specifically
    process.stdout.write(`\r${" ".repeat(this.currentLine.length)}\r`); // Overwrite spinner content with spaces
    this.currentLine = ""; // Reset the current line tracker
  }

  /**
   *
   * Starts, runs and stops the loader with an artificial delay and a callback function.
   * @param callback The function to run after the loader starts.
   * @param inducedTime The amount of artificial delay to induce.
   * @param message The message to display while loading.
   * @param textColor The color of the message.
   * @param spinnerColor The color of the spinner.
   */
  public static async load(
    callback: Function,
    inducedTime = 1000,
    message = "Loading",
    textColor = "magenta",
    spinnerColor = "white"
  ) {
    const loader = new Loader();
    await loader.start(message, textColor, spinnerColor);
    await new Promise((resolve) => setTimeout(resolve, inducedTime));
    await loader.clear();
    await callback();
    await loader.stop();
  }
}