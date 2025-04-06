const {Client, Events, Collection, GatewayIntentBits, GuildMember, Colors} = require('discord.js');
const path = require('node:path');
const fs = require('node:fs');
const {GuildMileStones, MileStoneItem} = require('./milestone.js');

//Importing the dotenv package to load environment variables from a .env file
require('dotenv').config();

let mileStones = JSON.parse(fs.readFileSync('saved_milestones.json', 'utf8'));
mileStones = mileStones.map(milestone => {
    oldGuildMilestones = new GuildMileStones(milestone.guildId);
    oldGuildMilestones.setRoleFormat(milestone.roleFormat);
    milestone.milestones.forEach(milestone => {
        oldmileStone = new MileStoneItem(milestone.milestone, milestone.color);
        oldmileStone.setRoleId(milestone.roleId);
        oldGuildMilestones.addMilestone(oldmileStone);
    }) 
    return oldGuildMilestones;
});

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

applyAllRoles = async (guild) => {
    let guildMilestonesClass = mileStones.find(milestone => milestone.guildId === guild.id)

    if (!guildMilestonesClass) {
        console.log(`No milestones found for guild ${guild.name}`);
        return;
    }

    let members = await guild.members.fetch()
    members = members.filter(member => !member.user.bot); // Filter out bots
    members.sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);
    members.map(x=>x).forEach((member, index) => {
        memberNumber = index + 1; // +1 because the index is 0 based
        let guildMilestones = guildMilestonesClass.getMilestones().filter(milestone => milestone.milestone >= memberNumber)
        console.log(`Member ${member.user.tag} is number ${memberNumber}`)
        if (guildMilestones.length === 0) {
            console.log(`No relevant milestones found for ${member.user.tag}`);
            return;
        }

        //Sort the milestones in ascending order and return the first one
        let bestMilestone = guildMilestones.sort((a, b) => a.milestone - b.milestone)[0];
        
        //console.log(`Best milestone for ${member.user.tag} is ${bestMilestone.milestone}`);
        member.guild.roles.fetch() // Fetch all roles in the guild
            .then(async roles => {
                const roleName = guildMilestonesClass.roleFormat.replace('##', bestMilestone.milestone);
                console.log(`Looking for role ${roleName}`);
                let role = roles.find(role => role.name === roleName);

                member.roles.add(role)
                    .then((role) => {
                        console.log(`Assigned role ${role.name} to ${member.user.tag}`)
                        saveToJSON()
                    })
                    .catch(console.error);
                
            }).catch(console.error);
    })
}

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
})

client.login(process.env.DISCORD_TOKEN)


//Listen for new commands
client.on(Events.InteractionCreate, async interaction => {
    if(!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    let guildMilestone = mileStones.find(milestone => milestone.guildId === interaction.guildId);

    if (!guildMilestone) {
        guildMilestone = new GuildMileStones(interaction.guildId);
        mileStones.push(guildMilestone);
    }

    try {
        await command.execute(interaction, guildMilestone);
    } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);
        if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
    }
    finally {
        console.log(`Final Milestone guild: ${guildMilestone}`);
        if(command.data.name === 'addmilestone' || command.data.name === 'removemilestone') {
            console.log(`Applying all roles to guild ${interaction.guild.name}`);
            applyAllRoles(interaction.guild);
        }
        saveToJSON();
    }
    

})


//New member joins
client.on(Events.GuildMemberAdd, async member => {
    console.log(`New member joined: ${member.user.tag}`);

    let totalMembers = member.guild.members.cache.filter(member => !member.user.bot).size;

    let guildMilestonesClass = mileStones.find(milestone => milestone.guildId === member.guild.id)

    if (!guildMilestonesClass) {
        console.log(`No milestones found for guild ${member.guild.name}`);
        return;
    }

    guildMilestones = guildMilestonesClass.getMilestones().filter(milestone => milestone.milestone >= totalMembers)

    if (guildMilestones.length === 0) {
        console.log(`No relevant milestones found for ${member.user.tag}`);
        return;
    }

    //Sort the milestones in ascending order and return the first one
    let bestMilestone = guildMilestones.sort((a, b) => a.milestone - b.milestone)[0];
    
    console.log(`Best milestone for ${member.user.tag} is ${bestMilestone.milestone}`);
    await member.guild.roles.fetch() // Fetch all roles in the guild
        .then(async roles => {
            const roleName = guildMilestonesClass.roleFormat.replace('##', bestMilestone.milestone);
            console.log(`Looking for role ${roleName}`);
            let role = roles.find(role => role.name === roleName);

            if (!role) {
                await member.guild.roles.create({
                    name: roleName,
                    color: parseInt(bestMilestone.color),
                    reason: `These guy is one of the first ${bestMilestone.milestone} members! True GOAT's!`,
                }).then( newRole => {
                    role = newRole
                    bestMilestone.setRoleId(role.id);
                }).catch(console.error);
            }

            member.roles.add(role)
                .then(() => console.log(`Assigned role ${role.name} to ${member.user.tag}`))
                .catch(console.error);
            
        }).then( () => saveToJSON()).catch(console.error);
    
    
})


    

saveToJSON = () => {
    jsonMilestones = JSON.stringify(mileStones, null, 2, (err) => {
        if (err) throw err;
    });
    fs.writeFile('saved_milestones.json', jsonMilestones, 'utf8', (err) => {
        if (err) throw err;
    })}