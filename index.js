'use strict';
const Discord = require('discord.js');
const {prefix, BOT_TOKEN} = require("./config.json");
const fs = require('fs');
const { greenBright, yellowBright, redBright, blueBright } = require('chalk');;

const client = new Discord.Client();

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

const channelsList = new Array();

client.on(`ready`, () => {
    console.log(greenBright('Online'));
    const thisGuild = client.guilds.cache.get('762641627289878528')
    thisGuild.channels.cache.forEach(channel => {
        if(channel.type == 'voice' || channel.type == "text"){
            channelsList.push(channel.id);
        }
    })
    console.log(channelsList);
})

client.on(`voiceStateUpdate`, (oldMember, newMember) => {

    let newUserChannel = newMember.channelID;
    let oldUserChannel = oldMember.channelID;
    var newUserChannelPosition;
    if(newMember.channelID === null || undefined){return}
    else {
        newUserChannelPosition = newMember.channel.rawPosition;
        if(newUserChannelPosition !== 4){
            var nextPosition = newUserChannelPosition + 1;
        } else {
            nextPosition = newUserChannelPosition;
        }
        if(newUserChannelPosition !== 0){
            var behindPosition = newUserChannelPosition - 1;
        }else {
            behindPosition = newUserChannelPosition;
        }
        console.log(`Next : ${nextPosition} Current: ${newUserChannelPosition} Behind: ${behindPosition}`)
    }
    const thisGuild = client.guilds.cache.get('762641627289878528')
    const user = newMember.member.user.username;
    var userRole;

    newMember.member.roles.cache.forEach(role => {
        if(role.name !== '@everyone'){
            userRole = role.name;
        } else {return}
    });

    console.log(`El user ${user} tiene el rol ${userRole}`)
    
    channelsList.forEach(channelId => {
        if(channelId == newUserChannel){
            console.log(`Not updating this channel ${channelId}`)
            return;
        } else{
            let channel = thisGuild.channels.cache.get(channelId);
            channel.updateOverwrite(channel.guild.roles.cache.find(role => role.name === userRole), { VIEW_CHANNEL: false });
            console.log(blueBright(`Silenced channel ${channelId} for role ${role.name}`))
        }
    })

    const voiceFilter = thisGuild.channels.cache.filter(test => test.type === 'voice')
    const voicePositionFilter = voiceFilter.filter(test => test.rawPosition == behindPosition || test.rawPosition == nextPosition || test.rawPosition == newUserChannelPosition);
    voicePositionFilter.forEach(element => {
        let channel = thisGuild.channels.cache.get(element.id);
        channel.updateOverwrite(channel.guild.roles.cache.find(role => role.name === userRole), { VIEW_CHANNEL: true });
        console.log(blueBright(`Updated channel ${element.name} voice`))
    })
    const textFilter = thisGuild.channels.cache.filter(test => test.type === 'text')
    const textPositionFilter = textFilter.filter(test => test.rawPosition == newUserChannelPosition);
    textPositionFilter.forEach(element => {
        let channel = thisGuild.channels.cache.get(element.id);
        channel.updateOverwrite(channel.guild.roles.cache.find(role => role.name === userRole), { VIEW_CHANNEL: true });
        console.log(blueBright(`Updated channel ${element.name} text`))
    })


    if(newUserChannel !== null){
        if(oldUserChannel !== newUserChannel && oldUserChannel !== undefined){
            let userInVc = newMember.member.user.username;
            console.log(yellowBright(`${userInVc} joined another channel: ${newUserChannel}`))
        } else {
            let userInVc = newMember.member.user.username;
            console.log(yellowBright(`${userInVc} joined channel: ${newUserChannel}`))
        }
    }
    else if(oldUserChannel !== undefined){
        let userInVcAfter = oldMember.member.user.username;
        console.log(blueBright(`${userInVcAfter} just left ${oldMember.channelID}`))
    }
})

client.on(`message`, message => {

    const idPlayersList = ['197842483961397249', '591668209325965312', '644836939207409664', '763922489084215306']
    const playersColors = ['Red', 'Blue', 'Yellow', 'Green']
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const shuffledArray = shuffle(idPlayersList);


    try {
        if(message.channel.type == "dm"){
            const killUser = args[0];
            const user = message.author.username;
            if(message.author.bot){return}
            if(commandName == 'kill'){
                message.channel.send(`U killed ${killUser}`)
                console.log(redBright(`${user} killed ${killUser}`))
            }
            return;
        }
        else{
            if(message.author.bot){return}
            if(commandName == 'start'){
                makingRoles(message);
                addingRolesToPlayers(shuffledArray, playersColors);
            }
            if(commandName == 'test'){
                const impostorRole1 = choosingImpostors(playersColors);
                let impostorRole2 = choosingImpostors(playersColors);
                for(let i = 0; i < 4; i++)
                    if(impostorRole1 == impostorRole2){
                        impostorRole2 = choosingImpostors(playersColors);
                        console.log(redBright('Impostors have the same role, shuffling again'))
                    }
                console.log(impostorRole1);
                console.log(impostorRole2);
                const impostorsList = findingImpostor(impostorRole1, impostorRole2, shuffledArray);
                console.log(impostorsList);
            }
        }
    } catch (error){
        console.log(redBright(`ERROR ${error}`))
    }

});

client.login(BOT_TOKEN);


function makingRoles(message){
    const playersColors = ['Red', 'Blue', 'Yellow', 'Green']
    const colors = ['Red', 'BLUE', 'YELLOW', 'GREEN']
    const guild = message.guild;
    for(let i = 0; i < 4; i++){
        const role = guild.roles.cache.find(role => role.name === playersColors[i])
        if(role !== undefined){
            console.log(yellowBright(`El rol ${playersColors[i]} already exists`))
        } else {
            guild.roles.create({
                data: {
                    name: playersColors[i],
                    color: colors[i],
                    permissions: 'ADMINISTRATOR'
                },
            })
            .then(console.log(greenBright(`Role created ${playersColors[i]}`)))
            .catch(console.error);
        }
    }
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    while (0 !== currentIndex) {
  
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
}

var once = 0;

function addingRolesToPlayers(shuffledArray, playersColors){

    if(once == 0){
        const thisGuild = client.guilds.cache.get('762641627289878528');

        for(let i = 0; i < 4; i++){
            const role = thisGuild.roles.cache.find(role => role.name === playersColors[i]);
            const members = thisGuild.members.cache.get(shuffledArray[i]);
            members.roles.add(role);
        }
        once = 1;
    } else {
        console.log(blueBright('U already started the shit'))
    }
}

function choosingImpostors(array){
    const randomElement = array[Math.floor(Math.random() * array.length)];
    return randomElement;
}

function findingImpostor(impostor1, impostor2, shuffledArray){
    const impostorsList = new Array()
    const thisGuild = client.guilds.cache.get('762641627289878528');
    for(let i = 0; i < 4; i++){
        const members = thisGuild.members.cache.get(shuffledArray[i]);
        if(members.roles.cache.find(role => role.name === impostor1)){
            console.log(`${members.user.username} has role ${impostor1}`)
            impostorsList.push(members.user.username);
        }
        if(members.roles.cache.find(role => role.name === impostor2)){
            console.log(`${members.user.username} has role ${impostor2}`)
            impostorsList.push(members.user.username);
        }
    }
    return impostorsList;
}


