const Discord = require('discord.js'); 
const fs = require('fs');
let config = require('./botconfig.json')
let elements = require('./casinoconf.json')
let users = require('./userconfig.json')
const mysql = require("mysql2");
const { get } = require('http');
let prefix = config.prefix;

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "botbd",
    password: "123456"
  });
function UpdateDate(id, coins){
    const user = [coins, id];
    const sql = "UPDATE `botbd`.`users` SET `time` = ? WHERE (`id` = ?);";
    connection.query(sql, user, function(err, results) {
        if(err)
        {
            console.log(err);
        } 
        else{
            console.log("Данные обновлены");
        } 
    });
}

function UpdateData(id, coins){
    const user = [coins, id];
    const sql = "UPDATE `botbd`.`users` SET `coins` = ? WHERE (`id` = ?);";
    connection.query(sql, user, function(err, results) {
        if(err)
        {
            console.log(err);
        } 
        else{
            console.log("Данные обновлены");
        } 
    });
}

function getData(callBack, mess, args){
    const user = [mess.author.id];
    const sql = "SELECT * FROM botbd.users WHERE(`id` = ?);";
    connection.query(sql, user,function(err, results) {
    console.log(err);
    callBack(results, mess,args);
});
}

function setData(mess){
    const user = [mess.author.id, 1000, mess.createdAt];
    const sql = "INSERT INTO botbd.users(id, coins, time) VALUES(?, ?, ?)";
    connection.query(sql, user, function(err, results) {
    if(err)
    {
        console.log(err);
    } 
    else{
        console.log("Данные добавлены");
        mess.channel.send("Ну все, теперь ты в игре!");
    } 
});
}


function getRandomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

function callBackReg(data, mess, args){
    if(data.length != 0) {
        mess.channel.send("Ты уже зарегестрирован!");
        return;
    }   
    setData(mess, args);
}

function callBackBalance(data, mess, args){
    if(data.length != 0) {
        mess.channel.send(`${mess.author}У тебя есть целых: ${data[0].coins} СорзКойнов`);
        return;  
    }
    mess.channel.send(`Ты кто вообще такой? Иди регайся!`);
}


function callBackSpin(data, mess, args){
    if(data.length != 0) {
        if(data[0].coins < parseInt(args[1])){
            mess.channel.send(`У тебя столько денег нет!`);
            return;
        }
        else
        {
            speenTheWheel(data, mess, args);
        }
        return;
    }
    mess.channel.send(`Ты кто вообще такой? Иди регайся!`);
}

function callBackLooser(data, mess, args){
    if(data.length != 0) {
        var time = mess.createdAt - data[0].time;
        if(time > 3600000)
        {
            const user = [mess.createdAt, mess.author.id];
            const sql = "UPDATE `botbd`.`users` SET `coins` = CASE WHEN `coins` < '1' THEN '1000' END, `time` = ? WHERE (`id` = ?);";
            connection.query(sql, user, function(err, results) {
                if(err)
                {
                    console.log(err);
                    
                } 
                else{
                    console.log("Данные обновлены");
                    mess.channel.send(`${mess.author} Ну... Вроде тебе пришел бонус в размере 1000 СорзКойнов`);
                } 
            });
        }
        else
        {
            var minutes = Math.floor((3600000-time)/60000);
            var seconds = Math.ceil(((3600000-time)%60000)/1000);
            mess.channel.send(`${mess.author} Подожди: ${minutes} минут и ${seconds} секунд`);
        }

        return; 
    }
    mess.channel.send(`Ты кто вообще такой? Иди регайся!`);
}

function speenTheWheel(data, mess, args){
    var imageResult = [];
    var idResult = "";
    var coins = 0;
    var star = 0;


    for(let i = 0; i < 3; i++){
        let res = getRandomInRange(0, 7);
        if(res == 1)
            star++;
        imageResult.push(elements.logo[res]);
        idResult+=res;
    }

    if(star > 0)
        coins = elements.starCoef[star-1];

    for(let i = 0; i < elements.combo.length; i++){
        if(idResult == elements.combo[i])
            coins = elements.comboCoef[i];    
    }

     mess.channel.send(`${mess.author} \nТвой результат: ${imageResult} \nTы выиграл: ${coins*parseInt(args[1])} СорзКойнов`);
    
     UpdateData(mess.author.id, data[0].coins + coins*parseInt(args[1]) - parseInt(args[1]));
}


function reg(client, mess, args) {
    console.log(mess.author.id);
    getData(callBackReg, mess, args);
}

function coins(client, mess, args) {
    getData(callBackBalance, mess, args);
}

function spin(client, mess, args){
    if(isNaN(parseInt(args[1])))
        mess.channel.send(`Ты дурачок? Ставка должна быть числом!`);
    else
        getData(callBackSpin, mess, args);
}
function help(client, mess, args){
    mess.channel.send("АЗАРТНЫЕ ИГРЫ ЭТО ЗЛО! \n!reg - Зарегистрироваться;\n!combo - Посмотреть комбинации; \n!coins - Узнать баланс; \n!i-am-looser - Получить бонусные 1000 СорзКойнов (Если у вас баланс 0) \n!spin {ставка} - Играть.");
}
function looser(client, mess, args){

    console.log(mess.createdAt);
    getData(callBackLooser, mess, args);
}
function combo(client, mess, args){
    var combo = [
        `${elements.logo[1]}{any}{any}`,
        `${elements.logo[1]}${elements.logo[1]}{any}`,
        `${elements.logo[1]}${elements.logo[1]}${elements.logo[1]}`,
        `${elements.logo[2]}${elements.logo[2]}${elements.logo[2]}`,
        `${elements.logo[3]}${elements.logo[3]}${elements.logo[3]}`,
        `${elements.logo[4]}${elements.logo[4]}${elements.logo[4]}`,
        `${elements.logo[5]}${elements.logo[5]}${elements.logo[5]}`,
        `${elements.logo[6]}${elements.logo[6]}${elements.logo[6]}`,
        `${elements.logo[7]}${elements.logo[7]}${elements.logo[7]}`

    ];
    mess.channel.send(`${combo[0]}: x2\n${combo[1]}: x5\n${combo[2]}: x10\n${combo[3]}: x20\n${combo[4]}: x50\n${combo[5]}: x75\n${combo[6]}: x100\n${combo[7]}: x250\n${combo[8]}: x1000\n`);
}

function role(client, mess, args){
    var roleId = 812331004931866644;
    var rMember = mess.guild.member(mess.mentions.users.first());
    rMember.addRole(roleId);
}
// Список команд //

var comms_list = [
{
    name: "reg",
    out: reg,
    about: "Регистрация"
},
{
    name: "role",
    out: role,
    about: "Выдача роли"
},
{
    name: "combo",
    out: combo,
    about: "Комбинации"
},
{
    name: "coins",
    out: coins,
    about: "Количество монет"
},
{
    name: "help",
    out: help,
    about: "Вывод команд"
},
{
    name: "i-am-looser",
    out: looser,
    about: "Добавление монет"
},
{
    name:"spin",
    out: spin,
    about: "Игровой автомат"
}
];

module.exports.comms = comms_list;