import axios from "axios";
import { AddressComponents } from "../types";
import { addMessage } from "./firebase";

export const getCurrentLocation = async (): Promise<AddressComponents> => {
  return new Promise((res, rej) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };

            if (locationData.latitude && locationData.longitude) {
              try {
                const response = await axios.get(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${locationData.latitude}&lon=${locationData.longitude}`
                );
                res(response.data.address);
              } catch (error) {
                console.error("Error fetching address: ", error);
                rej("Error fetching address from nominatim")
              }
            }
          } catch (error) {
            console.error("Error fetching address: ", error);
            rej("Error fetching address: ");
          }
        },
        () => rej("Error fetching address")
      );
    } else {
      rej("Geolocation is not supported by your browser")
    }
  });
}

export const addMessageWithGeolocation = async (
  from: string,
  text: string,
  customPayload?: any
) => {
  let locationData = {
    latitude: null as number | null,
    longitude: null as number | null,
    address: "No Address",
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          locationData.latitude = position.coords.latitude;
          locationData.longitude = position.coords.longitude;
        } catch (error) {
          console.error("Error fetching address: ", error);
        } finally {
          await addMessage({ locationData, from, text, customPayload });
        }
      },
      async () => {
        await addMessage({ locationData, from, text, customPayload });
      }
    );
  } else {
    console.error("Geolocation is not supported by your browser");
    await addMessage({ locationData, from, text, customPayload });
  }
};