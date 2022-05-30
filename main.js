const fetch = require("node-fetch");
const { spawn } = require("child_process");

async function hasBookingOpened(bookMyShowURL) {
   return !!(await fetch(bookMyShowURL, {
      redirect: "error",
   }).catch(() => false));
}

async function poll(interval, URL) {
   try {
      const result = await hasBookingOpened(URL);
      console.log(result);
      if (result) {
         spawn("start", ["alarm.mp4"], {
            detached: true,
            shell: true,
            stdio: ["ignore", "ignore", "ignore"],
         }).on("error", e => {
            console.log(e);
         });
         return;
      } else {
         await new Promise(resolve => {
            setTimeout(resolve, interval);
         });
         poll(interval);
      }
   } catch (error) {
      console.log(error);
   }
}

const bookMyShowURL = process.argv[2];
const interval = process.argv[3] || 5000;

if (!bookMyShowURL || !bookMyShowURL.startsWith("https://in.bookmyshow.com")) {
   console.error("Must provide a valid bookmyshow URL");
   process.exit(1);
}

poll(interval, bookMyShowURL);
