require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, Partials, ActivityType } = require('discord.js');
const database = require('./utils/database');
const roleManager = require('./utils/roleManager');

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if(!TOKEN || !CLIENT_ID){
  console.error('Missing BOT_TOKEN or CLIENT_ID in environment variables.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
for(const f of fs.readdirSync(commandsPath).filter(x=>x.endsWith('.js'))){
  const cmd = require(path.join(commandsPath, f));
  client.commands.set(cmd.data.name, cmd);
}

// config and presence handling
const CONFIG_PATH = path.join(__dirname, 'config.json');
let CONFIG = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

function setPresenceFromConfig(){
  const activities = Array.isArray(CONFIG.activities) ? CONFIG.activities.slice(0,5) : [];
  const interval = (typeof CONFIG.activityInterval === 'number' && CONFIG.activityInterval >= 10000) ? CONFIG.activityInterval : 30000;
  const status = CONFIG.statusType || 'online';
  const activityType = (CONFIG.activityType || 'PLAYING').toUpperCase();

  client.user.setStatus(status).catch(()=>{});

  let idx = 0;
  if(activities.length === 0){
    client.user.setActivity({ name: 'Reaction Roles', type: ActivityType.Playing }).catch(()=>{});
    return;
  }
  if(client._presenceInterval) clearInterval(client._presenceInterval);
  client._presenceInterval = setInterval(()=>{
    const text = activities[idx % activities.length];
    let ttype = ActivityType.Playing;
    if(activityType === 'WATCHING') ttype = ActivityType.Watching;
    else if(activityType === 'LISTENING') ttype = ActivityType.Listening;
    else if(activityType === 'COMPETING') ttype = ActivityType.Competing;
    client.user.setActivity({ name: text, type: ttype }).catch(()=>{});
    idx++;
  }, interval);
}

// watch config file for live reload
fs.watchFile(CONFIG_PATH, { interval: 2000 }, (curr, prev)=>{
  try{
    CONFIG = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    if(client && client.user) setPresenceFromConfig();
    console.log('Config reloaded (config.json)');
  }catch(e){ console.error('Failed to reload config.json', e); }
});

client.once('ready', async ()=>{
  database.ensureDataFile();
  console.log(`Logged in as ${client.user.tag}`);
  try{
    const cmds = client.commands.map(c=>c.data.toJSON());
    await client.application.commands.set(cmds);
    console.log('Registered global commands.');
  }catch(e){ console.error('Failed to register commands', e); }
  roleManager.startCleanupTask(client);
  setPresenceFromConfig();
});

client.on('interactionCreate', async (interaction)=>{
  if(!interaction.isChatInputCommand()) return;
  const cmd = client.commands.get(interaction.commandName);
  if(!cmd) return;
  try{
    await cmd.execute({ client, interaction, database, roleManager });
  }catch(e){
    console.error('Command execution error', e);
    try{ await interaction.reply({ content: 'An error occurred.', ephemeral: true }); }catch(e){};
  }
});

client.on('messageReactionAdd', async (reaction, user)=>{
  if(user.bot) return;
  try{ await roleManager.handleReaction(reaction, user, 'add'); }catch(e){ console.error(e); }
});
client.on('messageReactionRemove', async (reaction, user)=>{
  if(user.bot) return;
  try{ await roleManager.handleReaction(reaction, user, 'remove'); }catch(e){ console.error(e); }
});

client.on('guildMemberAdd', async (member)=>{
  try{ await roleManager.handleAutoRole(member); }catch(e){ console.error(e); }
});

client.login(TOKEN);
