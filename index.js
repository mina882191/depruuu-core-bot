const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const express = require("express");
const cors = require("cors");

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID || "1552632205740613692";
const PORT = process.env.PORT || 3000;

if (!TOKEN) {
  console.error("ไม่พบ DISCORD_TOKEN ใน Secrets/Environment Variables");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences]
});

const app = express();
app.use(cors());

app.get("/", (_, res) => res.send("DEPRUUU CORE Presence API is running 💜"));

app.get("/api/online", (_, res) => {
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) return res.status(503).json({ok:false,error:"ไม่พบเซิร์ฟเวอร์"});

  const members = [...guild.members.cache.values()]
    .filter(m => (m.presence?.status || "offline") !== "offline")
    .map(m => ({
      id:m.id,
      name:m.displayName,
      username:m.user.username,
      avatar:m.displayAvatarURL({extension:"png",size:128}),
      status:m.presence?.status || "offline"
    }))
    .sort((a,b)=>a.name.localeCompare(b.name,"th"));

  res.json({
    ok:true,
    guild:{id:guild.id,name:guild.name,icon:guild.iconURL({extension:"png",size:128})},
    online:members.length,
    members,
    updatedAt:new Date().toISOString()
  });
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity("DEPRUUU CORE",{type:ActivityType.Watching});
});

app.listen(PORT,()=>console.log(`API running on port ${PORT}`));
client.login(TOKEN);
