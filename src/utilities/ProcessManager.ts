export class ProcessManager {
  private static env_var: string | undefined;

  public static get(key: string) {
    this.env_var = process.env[key];
    return this;
  }

  public static get str(): string | undefined {
    return this.env_var;
  }

  public static get num(): number | undefined {
    const normalized = parseInt(this.env_var ?? "");

    if (!isNaN(normalized)) {
      return normalized;
    }

    return undefined;
  }
}
