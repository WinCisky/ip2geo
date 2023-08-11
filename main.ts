import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import maxmind from "https://esm.sh/maxmind@0.6.0";

const countryDbPath = "./db/GeoIP.dat";
const isIpv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
// const isIpv6Regex = /^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$/;

const router = new Router();
router
  .get("/", (context) => {
    context.response.body = "Welcome to ip-2-geo API!";
  })
  // ip 2 country ipv4
  .get("/api/country/:ip", async (context) => {
    if (context?.params?.ip && isIpv4Regex.test(context?.params?.ip)) {
      maxmind.init(countryDbPath);
      const location = await maxmind.getCountry(context?.params?.ip);
      context.response.body = {
        "status": "success",
        "country-code": location?.code,
        "country-name": location?.name,
      };
    } else {
      context.response.body = {
        "status": "error",
      }
    }
  });

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
