const {SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('milestones')
        .setDescription('Lists all milestones'),
    async execute(interaction, mileStones) {
        let milestones = mileStones.getMilestones().map(milestone => milestone.milestone);
        if(milestones.length === 0) {
            await interaction.reply('No milestones found');
            return;
        }
        milestones.sort((a, b) => a - b);
        await interaction.reply(`Milestones: \n-- ${milestones.join(' --\n-- ')} --`);
    }
}