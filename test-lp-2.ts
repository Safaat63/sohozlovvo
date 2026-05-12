import { getLandingPage } from "./src/actions/landing-pages";

async function test() {
  const landingPage = await getLandingPage("mango");
  console.log("Found:", !!landingPage);
  if (landingPage) console.log("Title:", landingPage.title);
  process.exit(0);
}
test();
