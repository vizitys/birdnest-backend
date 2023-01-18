import { XMLParser } from "fast-xml-parser";

export async function getData() {
  try {
    const response = await fetch(
      "https://assignments.reaktor.com/birdnest/drones"
    );

    if (!response.ok) return { success: false };

    const parser = new XMLParser();
    const obj = parser.parse(await response.text());

    return { success: true, obj };
  } catch {
    return { success: false };
  }
}

export async function getPilotData(droneSN: string) {
  try {
    console.log(`Fetched drone ${droneSN}`);
    const response = await fetch(
      `https://assignments.reaktor.com/birdnest/pilots/${droneSN}`
    );

    if (!response.ok) return { success: false };

    return { success: true, pilotData: await response.json() };
  } catch {
    return { success: false };
  }
}

getPilotData;
