import type { StaticImageData } from "next/image";
import adloggs from "@/assets/Networks/Adloggs.png";
import bharath from "@/assets/Networks/bharath.png";
import flash from "@/assets/Networks/flash.png";
import ondc from "@/assets/Networks/ondc.png";
import pidge from "@/assets/Networks/pidge.png";
import proRouting from "@/assets/Networks/proRoutes.png";
import quicka from "@/assets/Networks/quicka.png";
import shiprocket from "@/assets/Networks/shipRockert.png";
import owter from "@/assets/Networks/qwquer.png";

/**
 * Partner marks, keyed by provider id.
 *
 * Keyed rather than an array in provider order, because two places now need
 * these and only one of them iterates the providers list. A parallel array
 * silently maps the wrong logo to the wrong network the first time anyone
 * reorders `providers`; a lookup by id cannot.
 *
 * The files themselves are supplied art and their filenames are whatever they
 * arrived as — `qwquer.png` is Owter's, `shipRockert.png` is Shiprocket's.
 * The mapping is corrected here, once, rather than at each call site.
 */
export const networkMarks: Record<string, StaticImageData> = {
  adloggs,
  "shiprocket-quick": shiprocket,
  owter,
  "flash-shadowfax": flash,
  quicka,
  pidge,
  "ek-bharath": bharath,
  "pro-routing": proRouting,
  ondc,
};
