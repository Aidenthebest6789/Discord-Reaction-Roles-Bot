const fs = require('fs');
const path = require('path');
const DATA_FILE = path.join(__dirname, '..', 'data.json');

function ensureDataFile(){
  if(!fs.existsSync(DATA_FILE)){
    fs.writeFileSync(DATA_FILE, JSON.stringify({ guilds: {} }, null, 2));
  }
}
function read(){
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}
function write(data){
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}
module.exports = { ensureDataFile, read, write, DATA_FILE };
