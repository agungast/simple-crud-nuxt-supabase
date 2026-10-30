import { describe, it, expect } from "vitest"

describe("taskStatus", () => {
  it("toggle TODO->DONE->TODO", () => {
    let s = "TODO"
    s = s === "DONE" ? "TODO" : "DONE"
    expect(s).toBe("DONE")
    s = s === "DONE" ? "TODO" : "DONE"
    expect(s).toBe("TODO")
  })
  it("optimistic update then rollback shape", () => {
    const tasks = [{ id: 1, status: "TODO" }]
    const old = tasks[0].status
    tasks[0].status = "DONE"
    // simulate error -> rollback
    tasks[0].status = old
    expect(tasks[0].status).toBe("TODO")
  })
})
