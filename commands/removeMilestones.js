const {SlashCommandBuilder} = require('discord.js');
const applyAllRoles = require('../util.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removemilestone')
        .setDescription('Removes a milestone from the list')
        .addStringOption(option => 
            option.setName('milestone')
                .setDescription('The milestone to remove')
                .setRequired(true)),
    async execute(interaction, mileStones) {
        let milestone = interaction.options.getString('milestone');
        let milestoneInt = parseInt(milestone);
        if(isNaN(milestone)) {
            await interaction.reply(`Milestone must be a number: ${milestone}`);
            return;
        } 
        if(!mileStones.getMilestones().map(milestone => milestone.milestone).includes(milestoneInt)) {
            await interaction.reply(`Milestone does not exist: ${milestoneInt}`);
            return;
        }

        mileStoneToRemove = mileStones.getMilestones().find(milestone => milestone.milestone === milestoneInt);
        await interaction.guild.roles.delete(mileStoneToRemove.roleId).catch((err) => {
            console.error(err);
            interaction.reply(`Error deleting role: ${milestoneInt}`);
        });
        
        mileStones.removeMilestone(milestoneInt)
        
        await interaction.reply(`Milestone removed: ${milestoneInt}`);
    }};