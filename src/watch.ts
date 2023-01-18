import { getData, getPilotData } from "./data";

interface Drone {
  serialNumber: string;
  model: string;
  manufacturer: string;
  mac: string;
  ipv4: string;
  ipv6: string;
  firmware: string;
  positionX: number;
  positionY: number;
  altitude: number;
}

interface Pilot {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  lastBroken: number;
  closestDistanceToNest: number;
}

interface Pilots {
  [pilotId: string]: Pilot;
}

const updateInterval = 2000; // time in ms
const persistTime = 10 * 60 * 1000; // amount of time until the persisted data will be deleted, 10mins in ms
const minDistance = 100000; // min distance for triggering the detection system
const origin = [250000, 250000]; // origin coordinates of the nest

export let pilots: Pilots = {}; // includes pilots with the pilotId being their key

async function updateData() {
  const data = await getData();
  if (!data.success) {
    console.log("Getting data failed!");
    return;
  }

  data.obj.report.capture.drone.forEach(async (drone: Drone) => {
    // distance from the drone to the nest
    const distance = Math.sqrt(
      Math.pow(origin[0] - drone.positionX, 2) +
        Math.pow(origin[1] - drone.positionY, 2)
    );

    if (distance < minDistance) {
      const pilotResponse = await getPilotData(drone.serialNumber);
      if (!pilotResponse.success) {
        console.log("Getting pilot data failed!");
        return;
      }

      const { pilotData } = pilotResponse;

      if (pilotData.pilotId in pilots) {
        if (pilotData.closestDistanceToNest < distance) {
          pilots[pilotData.pilotId].closestDistanceToNest = distance;
        }
        const date = Date.now();
        pilots[pilotData.pilotId].lastBroken = date;
        return;
      }

      // const wantedData = Object.values(pilotData).map(
      //   ({ firstName, lastName, phoneNumber, email }) => {
      //     const date = Date.now();
      //     return {
      //       firstName,
      //       lastName,
      //       phoneNumber,
      //       email,
      //       lastBroken: date,
      //       closestDistanceToNest: distance,
      //     };
      //   }
      // );

      const { pilotId, firstName, lastName, phoneNumber, email } = pilotData;
      const date = Date.now();

      // save only the required data and add the date and distance

      const wantedData: Pilot = {
        firstName,
        lastName,
        phoneNumber,
        email,
        closestDistanceToNest: distance,
        lastBroken: date,
      };

      pilots[pilotId] = wantedData;
    }
  });

  const date = Date.now();
  Object.entries(pilots).forEach(([pilotId, pilot]) => {
    if (date - pilot.lastBroken > persistTime) {
      delete pilots[pilotId];
      console.log(`Successfully deleted pilot ${pilot} with ID ${pilotId}`);
    }
  });
}

updateData();
setInterval(updateData, updateInterval);
