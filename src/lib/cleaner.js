import fs from "fs";

const raw = JSON.parse(fs.readFileSync("./raw_schemes.json", "utf8"));

const map = {};
const final = [];

for (const s of raw) {
    const id = s.id.trim().toLowerCase();
    if (!map[id]) {
        map[id] = true;
        final.push(s);
    }
}

fs.writeFileSync("./src/data/schemes.json", JSON.stringify(final, null, 2));
console.log("Cleaned:", final.length, "schemes saved!");
