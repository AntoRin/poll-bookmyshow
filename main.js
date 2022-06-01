const { spawn } = require("child_process");
const fetch = require("node-fetch");
const inquirer = require("inquirer");
const { existsSync } = require("fs");

async function hasBookingOpened(bookMyShowURL) {
   return !!(await fetch(bookMyShowURL, {
      redirect: "error",
   }).catch(e => {
      if (e.type === "no-redirect") return false;
      else throw e;
   }));
}

async function poll(interval, URL) {
   try {
      const result = await hasBookingOpened(URL);
      console.log(result);
      if (result) {
         return;
      } else {
         await new Promise(resolve => {
            setTimeout(resolve, interval);
         });
         await poll(interval, URL);
      }
   } catch (error) {
      console.error(error);
      process.exit(1);
   }
}

inquirer
   .prompt([
      {
         type: "input",
         name: "bookMyShowURL",
         message:
            "Enter a valid bookmyshow URL for a theatre you'd like to poll for availability:",
         validate: input =>
            input && input.startsWith("https://in.bookmyshow.com")
               ? true
               : "Must provide a valid bookmyshow URL",
      },
      {
         type: "input",
         name: "pollInterval",
         message: "Enter the interval for polling in milliseconds:",
         validate: input => (!isNaN(Number(input)) ? true : "Must enter a number"),
         default: 5000,
      },
      {
         type: "input",
         name: "alarm",
         message:
            "File that will be opened for notifying once booking has been opened (leave it blank to skip):",
         validate: input =>
            !input ? true : existsSync(input) ? true : "Must be a valid file system path",
      },
   ])
   .then(answers => {
      poll(answers.pollInterval, answers.bookMyShowURL).then(() => {
         if (!answers.alarm) return;
         spawn("start", [answers.alarm], {
            detached: true,
            shell: true,
            stdio: ["ignore", "ignore", "ignore"],
         }).on("error", e => {
            console.log(e);
         });
      });
   })
   .catch(e => {
      console.error(e);
      process.exit(1);
   });
