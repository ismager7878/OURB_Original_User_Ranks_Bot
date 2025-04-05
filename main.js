const {Client, Events, Collection, GatewayIntentBits, GuildMember} = require('discord.js');
const path = require('node:path');
const fs = require('node:fs');

//Importing the dotenv package to load environment variables from a .env file
require('dotenv').config();

mileStones = []

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
] });

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for(const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}


client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
})

client.login(process.env.DISCORD_TOKEN)

client.on(Events.InteractionCreate, async interaction => {
    if(!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);
        if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
    }

    console.log(interaction); 

})

client.on(Events.GuildMemberAdd, member => {
    console.log(`New member joined: ${member.user.tag}`);
    const channel = member.guild.channels.cache.find(channel => channel.name === 'general');
    if (!channel) return;

    totalMembers = member.guild.memberCount

    mileStones.filter(mileStone => mileStone <= totalMembers)


    
    channel.send(`Welcome to the server, ${member}!`);
})