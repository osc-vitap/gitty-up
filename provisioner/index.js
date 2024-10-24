import dotenv from 'dotenv';
import fs from 'fs';
import { exec  } from "node:child_process"
dotenv.config();

async function main() {
const participants = fs.readFileSync("./data.csv", "utf8").split("\n").filter(x => x !== "").map((line) => line.split(", ").map((item) => item.trim()));
let records = [];
for (const participant of participants) {
    if (participant[0] === "registration_number") continue;
    console.log('Provisioning', participant[0]);
    appendRecord(records, participant);
    createConfFile(participant);
    runDocker(participant);
}
await postRecords(records);
}


function appendRecord(records, participant) {
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


async function postRecords(records) {
    let data = await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records/batch`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Auth-Email': process.env.CLOUDFLARE_EMAIL,
            'X-Auth-Key': process.env.CLOUDFLARE_API_KEY
        },
        body: JSON.stringify({ posts: records })
    });
    if (data.status === 200) {
        console.log("Records added successfully");
    } else {
        console.log("Error adding records", await data.json());
    }
}


function createConfFile(participant) {
    fs.writeFileSync(`../${process.env.NGINX_INCLUDE_DIR}/${participant[0]}.conf`,
        `server {
    listen 443 ssl;
        server_name ${participant[0]}.oscvitap.org;

    ssl_certificate /etc/nginx/ssl-cert.pem;
        ssl_certificate_key /etc/nginx/private.key;


    location / {
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_pass http://127.0.0.1:${participant[2]};
    }
}`
    )
}

function runDocker(participant) {
    console.log("Running Docker for",participant[0])
    exec(`docker run --name gitty-up-${participant[0]} -p ${participant[2]}:8080 -e PASSWORD=${participant[1]} -e CODER_MESSAGE=Hi -e REG_NO=${participant[0]} -d ghcr.io/osc-vitap/gitty-up-code-server:0.2.0`,(error,stdout,stderr) => {
        if (error) {
            console.log(`docker error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`docker stderr: ${stderr}`);
            return;
        }
        console.log(`docker stdout: ${stdout}`);
    })
}
await main();