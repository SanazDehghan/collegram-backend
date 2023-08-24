import { ProcessManager } from "~/utilities/ProcessManager";

describe("utilities", () => {
  test("Process Manager", () => {
    expect(ProcessManager.get("PORT").num).toBe(3000);

    expect(ProcessManager.get("PORT").str).toBe("3000");

    expect(ProcessManager.get("abc").num).toBeUndefined();

    expect(ProcessManager.get("abc").str).toBeUndefined();
  });
});
