import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

let records = [];

const participants = fs.readFileSync("./data.csv", "utf8").split("\n").filter(x => x !== "").map((line) => line.split(", ").map((item) => item.trim()));

for (const participant of participants) {
    if (participant[0] === "registration_number") continue;
    records.push({
        "name": `${participant[0]}.oscvitap.org`,
        "proxied": true,
        "comment": "testing",
        "settings": {},
        "tags": [],
        "ttl": 3600,
        "content": process.env.IP_RECORD,
        "type": "A"
    })
}
console.log(records);
let data = await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records/batch`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Auth-Email': process.env.CLOUDFLARE_EMAIL,
        'X-Auth-Key': process.env.CLOUDFLARE_API_KEY
    },
    body: JSON.stringify({ posts: records })
});
console.log(await data.json());

