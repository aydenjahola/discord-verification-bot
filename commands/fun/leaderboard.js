const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Leaderboard = require("../../models/Leaderboard");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Displays the trivia leaderboard"),

  async execute(interaction, client) {
    const guild = interaction.guild;

    try {
      // Fetch top 10 leaderboard entries sorted by correct answers
      const scores = await Leaderboard.find()
        .sort({ correctAnswers: -1 })
        .limit(10);

      // Fetch display names for each leaderboard entry
      const leaderboardEntries = await Promise.all(
        scores.map(async (entry, index) => {
          try {
            const member = await guild.members.fetch(entry.userId);
            const displayName = member ? member.displayName : entry.username; // Fallback if member not found
            return `${index + 1}. ${displayName}: ${
              entry.correctAnswers
            } correct answers in ${entry.gamesPlayed} games`;
          } catch (error) {
            console.error(
              `Error fetching member for userId: ${entry.userId}`,
              error
            );
            return `${index + 1}. ${entry.username}: ${
              entry.correctAnswers
            } correct answers in ${entry.gamesPlayed} games`;
          }
        })
      );

      const leaderboardEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Trivia Leaderboard")
        .setDescription(leaderboardEntries.join("\n"))
        .setTimestamp();

      if (guild.iconURL()) {
        leaderboardEmbed.setFooter({
          text: guild.name,
          iconURL: guild.iconURL(),
        });
      } else {
        leaderboardEmbed.setFooter({
          text: guild.name,
        });
      }

      await interaction.reply({ embeds: [leaderboardEmbed] });
    } catch (error) {
      console.error("Error executing leaderboard command:", error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};
