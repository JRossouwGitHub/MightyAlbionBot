const commands = [
    ["`!ping`", "Test to see if the Mighty Albion Bot is working."],
    ["`!hello`", "To greet the bot."],
    ["`!help`", "List of helpful commands."],
    ["`!commands`", "List of helpful commands."],
    ["`!start <blank|party size>`", "Start a content party. Leave blank to show options menu, or specify a party size. Example: `!start 5`"],
    ["`!check-group <queue id>`", "Check the current status of the queue."],
    ["`!leave <queue id>`", "Leave a queue."],
    ["`!register`", "Register to the Mighty Albion Cartel."],
    ["`!pay <blank|amount in full without commas>`", "Pay the cartel fee. Leave blank to pay the whole weekly fee, or specifity an amount to pay."],
    ["`!members`", "See a list of all the Mighty Albion Cartel members and their details."],
    ["`!split <split tab> <split total>`", "Register the loot in a split tab for auction."],
    ["`!bid <amount in full without commas (lowest is 100k)> <split id>`", "Bid on a split."],
    ["`!check-split <split id>`", "See the total amount and players for a split."],
    ["`!split-add <split id> <player 1> <player 2> <etc...>`", "Add players to the split to keep track."],
    ["`!split-pay <split id> <player 1> <player 2> <etc...>`", "Pay players on the split."],
    ["`!split-owing <split id>`", "See who is still owed for the split."]
]

module.exports = {commands}