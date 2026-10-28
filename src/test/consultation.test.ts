import { describe, expect, it } from "vitest";
import { handleApiRequest } from "@/server/apiHandler";

describe("Consultation Processing API", () => {
  it("processes transcript into structured prescription with safety rules", async () => {
    const transcript =
      "Saya resepkan Paracetamol 500mg diminum 2x sehari sesudah makan pagi dan malam.";
    const req = new Request("http://localhost:3000/api/consultation/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript,
        doctorName: "Dr. Budi Santoso",
        clinic: "Klinik Pratama",
      }),
    });

    const res = await handleApiRequest(req);
    expect(res).not.toBeNull();
    expect(res?.status).toBe(200);

    const json = await res?.json();
    expect(json.success).toBe(true);
    expect(json.data.prescriptions.length).toBeGreaterThan(0);
    const rx = json.data.prescriptions[0];
    expect(rx.frequency).toContain("2x sehari");
    expect(rx.timing).toBe("after_meal");
    expect(rx.spokeSummary).toBeTruthy();
  }, 40000);

  it("handles empty transcript with 400 error", async () => {
    const req = new Request("http://localhost:3000/api/consultation/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: "" }),
    });

    const res = await handleApiRequest(req);
    expect(res?.status).toBe(400);
  });
});
