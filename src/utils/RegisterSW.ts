const registerSW = () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.log("SW registration failed:", error);
    });
  }

  // if ("serviceWorker" in navigator) {
  //   navigator.serviceWorker
  //     .getRegistrations()
  //     .then((registrations) => {
  //       registrations.forEach((registration) => {
  //         registration.unregister();
  //       });
  //     })
  //     .catch((error) => {
  //       console.error("Error on remove service worker", error);
  //     });
  // }
};

export default registerSW;
