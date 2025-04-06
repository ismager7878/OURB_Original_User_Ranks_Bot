const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setroleformat")
        .setDescription("Sets the format for the role names")
        .addStringOption((option) =>
            option
                .setName("format")
                .setDescription("The format for the role names, use ## for the milestone number(e.g. First ## users)")
                .setRequired(true)
        ),
    async execute(interaction, mileStones) {
        let format = interaction.options.getString("format");
        

        if(!format.includes("##")) {
            await interaction.reply(`Format must include ##: ${format}`);
            return;
        }
        
        await mileStones.getMilestones().forEach(milestone => {
            interaction.guild.roles.edit(milestone.role.id, {
                name: format.replace("##", milestone.milestone),
            }).catch((err) => {
                console.error(err);
                interaction.reply(`Error updating role: ${milestone.role.id}`);
                return;
            });
        });
        
        mileStones.setRoleFormat(format);    
        await interaction.reply(`Role format set to: ${format}`);
    },
};