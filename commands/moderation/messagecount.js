const storage = require('storage-to-json');
const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'messagecount',
		description:
			'Returns the number of messages since bot started counting per user',
		category: 'moderation',
		accessableby: 'Moderators',
	},
	run: async (bot, message, args) => {
		if (!message.member.hasPermission(['ADMINISTRATOR']))
			return message.channel.send('You dont have permission to perform this command!');

		const count = new storage(`${message.guild.id}`);
		let embed = new MessageEmbed()
			.setTitle(`Message Count for ${message.guild.name}`)
			.setColor('GREEN')
			.setThumbnail(message.guild.iconURL)
			.setFooter(`© ${message.guild.me.displayName} | Developed By DistroByte`, bot.user.displayAvatarURL())
			.setTimestamp();

		let regexTotal = /Total/;
		let date = new Date().toString().slice(4, 24);
		let runningTotal = 0;

		let objArray = [];
		count.each((v, k) => {
			let obj = { v, k }
			objArray.push(obj);
			console.log(obj);
		});
		console.log(objArray);

		count.each(function (value, key) {
			if (!regexTotal.test(key)) {
				let userKey;
				if (bot.users.cache.get(key)) {
					userKey = bot.users.cache.get(key).username;
				} else {
					userKey = key;
				}
				embed.addField(`${userKey}`, `Messages sent: \`${value}\``, true);
				runningTotal += value;
			} else if (regexTotal.test(key)) {
				lastDate = value.slice(0, 20);
			}
		});
		embed.setDescription(`Total messages on server: \`${runningTotal}\``);
		count.set(`Total`, `${date} ${runningTotal}`);
		message.channel.send(embed);
	},
};
// TODO
// var points = [40, 100, 1, 5, 25, 10];
// points.sort(function (a, b) { return a - b });