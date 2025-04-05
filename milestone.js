class GuildMileStones {
  constructor(guildId) {
    this.guildId = guildId;
    this.milestones = [];
  }

  addMilestone(milestone) {
    this.milestones.push(milestone);
  }

  getMilestones() {
    return this.milestones;
  }

  getBestRelevantMilestone(userCount) {
    relavantMilestones = this.milestones.filter(milestone => userCount <= milestone)
    
    if (relavantMilestones.length === 0) return null;
    //Sort the milestones in ascending order and return the first one
    bestMileStone = relavantMilestones.sort((a, b) => a - b)[0];
}