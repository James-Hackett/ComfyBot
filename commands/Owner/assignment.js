const Command = require("../../base/Command"),
  { UpdateAssignmentsEmbed, FetchModuleNameFromCode } = require("../../helpers/assignmentsHelper"),
  Assignments = require("../../base/Assignment");

class Assignment extends Command {
  constructor(client) {
    super(client, {
      name: "assignment",
      description: "Adds a new assignment to CA Server",
      usage: "([new] [module code] [due date] [due time] [description])/([update/delete] [id])",
      examples: ["{{p}}assignment new CA117 2020-06-27 10:00:00 Final Exam", "{{p}}assignment edit 2", "{{p}}assignment delete 1"],
      dirname: __dirname,
      enabled: true,
      guildOnly: false,
      aliases: [],
      memberPermissions: [],
      botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      nsfw: false,
      ownerOnly: true,
      args: true,
      cooldown: 3000
    });
  }

  async run(message, args, data) {
    const AwaitFilter = response => { return response.author.id === message.author.id; };

    let action = args.shift();
    if (action === "new") {
      if (!args[1]) {
        return message.error("Please specify a due date!");
      }

      let ModCode = args[0];
      let DueDate = args[1] + " " + (args[2] ? args[2] : "00:00");
      let ModuleName = await FetchModuleNameFromCode(ModCode)
        .catch(err => {
          message.reply(`Invalid module code provided: ${ModCode}`);
          return;
        });

      let AssignmentID = 0;
      await Assignments.find({}, "assignmentID", function (err, ids) {
        ids.forEach(id => {
          if (id.assignmentID >= AssignmentID) {
            AssignmentID = id.assignmentID;
          }
        });
      });

      if (ModuleName) {
        message.sendM("Please enter a description for this assignment.", { prefixEmoji: "loading" })
          .then(() => {
            message.channel.awaitMessages(AwaitFilter, { max: 1, time: 30000, errors: ["time"] })
              .then(ConfirmationResponse => {
                let AssignmentDescription = ConfirmationResponse.first().content;
                message.sendM(`Type "confirm" or "cancel" to confirm or cancel this submission: \n**Module Code:** ${ModCode}\n**Module Name:** ${ModuleName}\n**Due Date:** ${DueDate.toString().slice(0, 24)}\n**Description:** ${AssignmentDescription}`, { prefixEmoji: "loading" })
                  .then(() => {
                    message.channel.awaitMessages(AwaitFilter, { max: 1, time: 30000, errors: ["time"] })
                      .then(ConfirmationResponse => {
                        if (ConfirmationResponse.first().content.toLowerCase() != "confirm") return message.error("Confirmation denied - request was not submitted.");

                        Assignments.create({ "moduleCode": ModCode, "moduleName": ModuleName, "description": AssignmentDescription, "dueDate": new Date(DueDate), "uploader": message.author.username, "assignmentID": AssignmentID + 1 }, function (err, new_instance) {
                          if (err) return console.log(err);
                          message.success("New assignment created.");
                          UpdateAssignmentsEmbed(message.client);
                        });
                      })
                      .catch(err => {
                        console.log(err);
                        message.error(`Command timed out. \n ${err}`);
                      });
                  });
              })
              .catch(err => {
                console.log(err);
                message.error(`Command timed out. \n ${err}`);
              });
          });
      }
    }

    if (action == "edit") {
      // eslint-disable-next-line no-unused-vars
      let id = args[0];
    }
  }
}

module.exports = Assignment;
