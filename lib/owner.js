import fs from 'fs';

const path = './data/owners.json';

export function getOwners() {
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, JSON.stringify({ owners: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(path)).owners;
}

export function saveOwners(owners) {
    fs.writeFileSync(path, JSON.stringify({ owners }, null, 2));
}

export function isOwner(jid) {
    return getOwners().includes(jid);
}
