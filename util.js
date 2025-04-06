module.exports = async (mileStones, guild) => {
    console.log(mileStones)
    let guildMilestonesClass = mileStones.find(milestone => milestone.guildId === guild.id)

    if (!guildMilestonesClass) {
        console.log(`No milestones found for guild ${guild.name}`);
        return;
    }

    let members = guild.members.cache.filter(member => !member.user.bot);
    members.sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);
    let memberNumber = 1;

    members.forEach(async member => {
        let guildMilestones = guildMilestonesClass.getMilestones().filter(milestone => milestone.milestone >= memberNumber)

        if (guildMilestones.length === 0) {
            console.log(`No relevant milestones found for ${member.user.tag}`);
            return;
        }

        //Sort the milestones in ascending order and return the first one
        let bestMilestone = guildMilestones.sort((a, b) => a.milestone - b.milestone)[0];
        
        //console.log(`Best milestone for ${member.user.tag} is ${bestMilestone.milestone}`);
        await member.guild.roles.fetch() // Fetch all roles in the guild
            .then(async roles => {
                const roleName = guildMilestonesClass.roleFormat.replace('##', bestMilestone.milestone);
                console.log(`Looking for role ${roleName}`);
                let role = roles.find(role => role.name === roleName);

                if (!role) {
                    await member.guild.roles.create({
                        name: roleName,
                        color: parseInt(bestMilestone.color),
                        reason: `This guy is on the the first ${bestMilestone.milestone} members! A true GOAT!`,
                    }).then( newRole => {
                        role = newRole
                        bestMilestone.setRoleCreated(role.id);
                    }).catch(console.error);
                }

                member.roles.add(role)
                    .then(() => console.log(`Assigned role ${role.name} to ${member.user.tag}`))
                    .catch(console.error);
                
            }).catch(console.error);
    })

    saveToJSON()
}