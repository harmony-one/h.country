import { addMessage } from "./firebase";

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