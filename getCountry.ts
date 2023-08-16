

const codes = [
    "--",
    "AP","EU","AD","AE","AF","AG","AI","AL","AM","CW",
    "AO","AQ","AR","AS","AT","AU","AW","AZ","BA","BB",
    "BD","BE","BF","BG","BH","BI","BJ","BM","BN","BO",
    "BR","BS","BT","BV","BW","BY","BZ","CA","CC","CD",
    "CF","CG","CH","CI","CK","CL","CM","CN","CO","CR",
    "CU","CV","CX","CY","CZ","DE","DJ","DK","DM","DO",
    "DZ","EC","EE","EG","EH","ER","ES","ET","FI","FJ",
    "FK","FM","FO","FR","SX","GA","GB","GD","GE","GF",
    "GH","GI","GL","GM","GN","GP","GQ","GR","GS","GT",
    "GU","GW","GY","HK","HM","HN","HR","HT","HU","ID",
    "IE","IL","IN","IO","IQ","IR","IS","IT","JM","JO",
    "JP","KE","KG","KH","KI","KM","KN","KP","KR","KW",
    "KY","KZ","LA","LB","LC","LI","LK","LR","LS","LT",
    "LU","LV","LY","MA","MC","MD","MG","MH","MK","ML",
    "MM","MN","MO","MP","MQ","MR","MS","MT","MU","MV",
    "MW","MX","MY","MZ","NA","NC","NE","NF","NG","NI",
    "NL","NO","NP","NR","NU","NZ","OM","PA","PE","PF",
    "PG","PH","PK","PL","PM","PN","PR","PS","PT","PW",
    "PY","QA","RE","RO","RU","RW","SA","SB","SC","SD",
    "SE","SG","SH","SI","SJ","SK","SL","SM","SN","SO",
    "SR","ST","SV","SY","SZ","TC","TD","TF","TG","TH",
    "TJ","TK","TM","TN","TO","TL","TR","TT","TV","TW",
    "TZ","UA","UG","UM","US","UY","UZ","VA","VC","VE",
    "VG","VI","VN","VU","WF","WS","YE","YT","RS","ZA",
    "ZM","ME","ZW","A1","A2","O1","AX","GG","IM","JE",
    "BL","MF", "BQ", "SS", "O1"
];

function ipToInt(ip: string) {
  const parts = ip.split(".");
  return (parseInt(parts[0]) << 24) +
    (parseInt(parts[1]) << 16) +
    (parseInt(parts[2]) << 8) +
    parseInt(parts[3]);
}

// function intToIp(ip: number) {
//   return `${(ip >>> 24)}.${(ip >> 16) & 255}.${(ip >> 8) & 255}.${ip & 255}`;
// }

const MAX_RECORD_LENGTH = 4;
const COUNTRY_BEGIN = 16776960;
const STANDARD_RECORD_LENGTH = 3;

async function intToIndex(ip: number, file: Deno.FsFile) {
  // let lastNetmask = 0;
  let next, y, record;
  let offset = 0;

  for (let depth = 31; depth >= 0; depth--) {
    await file.seek(2 * STANDARD_RECORD_LENGTH * offset, Deno.SeekMode.Start);
    const buffer = new Uint8Array(2 * MAX_RECORD_LENGTH);
    await file.read(buffer);
    record = Math.abs(ip & (1 << depth)) > 0 ? 1 : 0;
    next = 0;
    for (let j = 0; j < STANDARD_RECORD_LENGTH; j++) {
      y = buffer[record * STANDARD_RECORD_LENGTH + j];
      next += y << (j * 8);
    }
    if (next >= COUNTRY_BEGIN) {
      // lastNetmask = 32 - depth;
      break;
    }
    offset = next;
  }

  if (next) {
    const index = next - COUNTRY_BEGIN;
    return index;
  }
  return 0;
}

export async function getCountryCode(ip: string, file: Deno.FsFile) {
  return codes[await intToIndex(ipToInt(ip), file)];
}