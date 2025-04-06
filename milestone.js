class GuildMileStones {
  constructor(guildId) {
    this.roleFormat = "First ## users"
    this.guildId = guildId;
    this.milestones = [];
  }

  addMilestone(milestone) {
    this.milestones.push(milestone)
  }

  setRoleFormat(format){
    this.roleFormat = format;
  }

  getMilestones() {
    return this.milestones;
  }

  removeMilestone(milestone) {
    this.milestones = this.milestones.filter(m => m.milestone !== milestone);
  }

}

class MileStoneItem {
  constructor(milestone, color) {
    this.milestone = milestone;
    this.color = color;
    this.roleId = null;
  }

  setRoleId(roleId) {
    this.roleId = roleId;
  }
}

module.exports = {
  GuildMileStones,
  MileStoneItem
}
