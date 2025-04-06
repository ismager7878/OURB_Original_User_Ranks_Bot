const {SlashCommandBuilder, Colors} = require('discord.js');;
const applyAllRoles = require('../util.js');
const {MileStoneItem} = require('../milestone.js');

//Colors: { Default: 0x000000; White: 0xffffff; Aqua: 0x1abc9c; Green: 0x57f287; Blue: 0x3498db; Yellow: 0xfee75c; Purple: 0x9b59b6; LuminousVividPink: 0xe91e63; Fuchsia: 0xeb459e; Gold: 0xf1c40f; Orange: 0xe67e22; Red: 0xed4245; Grey: 0x95a5a6; Navy: 0x34495e; DarkAqua: 0x11806a; DarkGreen: 0x1f8b4c; DarkBlue: 0x206694; DarkPurple: 0x71368a; DarkVividPink: 0xad1457; DarkGold: 0xc27c0e; DarkOrange: 0xa84300; DarkRed: 0x992d22; DarkGrey: 0x979c9f; DarkerGrey: 0x7f8c8d; LightGrey: 0xbcc0c0; DarkNavy: 0x2c3e50; Blurple: 0x5865f2; Greyple: 0x99aab5; DarkButNotBlack: 0x2c2f33; NotQuiteBlack: 0x23272a;}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addmilestone')
        .setDescription('Adds a milestone to the list')
        .addStringOption(option => 
            option.setName('milestone')
                .setDescription('The milestone to add')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('The color of the milestone role(Defalut: Gold)')
                .setRequired(false)
                .addChoices(
                    { name: 'Gold', value: `${Colors.Gold}` },
                    { name: 'Red', value: `${Colors.Red}` },
                    { name: 'Green', value: `${Colors.Green}` },
                    { name: 'Blue', value: `${Colors.Blue}` },
                    { name: 'Aqua', value: `${Colors.Aqua}` },
                    { name: 'Purple', value: `${Colors.Purple}` },
                    { name: 'Fuchsia', value: `${Colors.Fuchsia}` },
                    { name: 'Orange', value: `${Colors.Orange}` },
                    { name: 'Yellow', value: `${Colors.Yellow}` },
                    { name: 'Navy', value: `${Colors.Navy}` },
                    { name: 'DarkAqua', value: `${Colors.DarkAqua}` },
                    { name: 'DarkGreen', value: `${Colors.DarkGreen}` },
                    { name: 'DarkBlue', value: `${Colors.DarkBlue}` },
                    { name: 'DarkPurple', value: `${Colors.DarkPurple}` },
                    { name: 'DarkGold', value: `${Colors.DarkGold}` },
                    { name: 'DarkOrange', value: `${Colors.DarkOrange}` },
                    { name: 'DarkRed', value: `${Colors.DarkRed}` },

                )),

    async execute(interaction, mileStones) {
        let milestone = interaction.options.getString('milestone');
        let color = interaction.options.getString('color');
        
        if(color === null) {
            color = Colors.Gold;
        }

        let milestoneInt = parseInt(milestone);
        if(isNaN(milestone)) {
            await interaction.reply(`Milestone must be a number: ${milestone}`);
            return;
        } 

        if(mileStones.getMilestones().map(m => m.milestone).includes(milestoneInt)) {
            await interaction.reply(`Milestone already exists: ${milestoneInt}`);
            return;
        }
        if(milestoneInt < 0) {
            await interaction.reply(`Milestone must be a positive number: ${milestoneInt}`);
            return;
        }

        let newMilestone = new MileStoneItem(milestoneInt, color);

        let roleName = mileStones.roleFormat.replace("##", milestoneInt);

        await interaction.guild.roles.create({
                name: roleName,
                color: parseInt(newMilestone.color),
                reason: `This guy is on the the first ${newMilestone.milestone} members! A true GOAT!`,
            }).then( role => {
                newMilestone.setRole(role);
            }).catch(console.error);

        mileStones.addMilestone(newMilestone);
        console.log(`Added milestone ${mileStones}`);
        await interaction.reply(`Milestone added: ${milestoneInt}`);
    }}