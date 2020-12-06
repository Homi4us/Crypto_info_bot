const format = require('accounting');
const Bot = require('node-telegram-bot-api');
const token = '1320932102:AAGjVQd4PWcV6-_mJ32-4wHn5MmDag9NzgQ';
const password = '07057412';

const TronWeb = require('tronweb');
const fullNode = 'https://api.trongrid.io';
const solidityNode = 'https://api.trongrid.io';
const eventServer = 'https://api.trongrid.io';
const tron = new TronWeb(fullNode,solidityNode,eventServer);
var express = require('express');
  var app = express();
  const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});

const mongoose = require('mongoose');
const bot = new Bot(token, {polling: true});

const axios = require('axios');

//Models
const project = require('./models/projects');
const projects = require('./models/projects');

//Connect mongo
const url = 'mongodb://Alex:19121402@cluster0-shard-00-00.8l0a4.mongodb.net:27017,cluster0-shard-00-01.8l0a4.mongodb.net:27017,cluster0-shard-00-02.8l0a4.mongodb.net:27017/test?ssl=true&replicaSet=messenger-shard-0&authSource=admin&retryWrites=true&w=majority';
const settings = {
  useNewUrlParser: true,
  useUnifiedTopology:true
};
const connect = mongoose.connect(url,settings);


connect.then((db)=>{
  console.log('connected correctly!');
  
},(err)=>{
  console.log(err);
})

bot.onText(/\/add (.+)/, (msg, match) => {
   
    const chatId = msg.chat.id;
    var arr = match[1].split(' ');

    var name = arr[0]; // the name of project
    var address = arr[1] // address of project
    var pass = arr[2] // password  

    if(password == pass){
      axios.get(`https://apilist.tronscan.org/api/account?address=${address}`).then((res)=>{
        var balance = res.data.balance;
        project.create({name: name,address: address,balance_1h: balance, balance_24h: balance}).then((project)=>{
          bot.sendMessage(chatId,`Проект ${name} был добавлен в список`);

        }).catch((err)=>{
          bot.sendMessage(chatId,`Ошибка: ${err}`)
        })
      })

    } else {
        bot.sendMessage(chatId,'токен указан неверно!')
    }

    
  });

  bot.onText(/\/remove (.+)/, (msg, match) => {
   
    const chatId = msg.chat.id;
    var arr = match[1].split(' ');

    var name = arr[0]; // the name of project 
    var pass = arr[1] // password 

    if(pass == '19121402'){
        project.remove({name: name}).then((project)=>{
            bot.sendMessage(chatId,`Проект ${name} был удален из списка`);
          }).catch((err)=>{
            bot.sendMessage(chatId,`Ошибка: ${err}`)
          })
    } else {
        bot.sendMessage(chatId,'токен указан неверно!')
    }

    
  });

bot.onText(/\/price (.+)/, (msg, match) => {
    const chatId = msg.chat.id;

    if(match[1] == 'top'){
        axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple,link,litecoin,tron&vs_currencies=usd&include_24hr_change=true`, {
        })
        .then((res)=>{
          var btc = coinInfo('BTC',res.data.bitcoin);
          var eth = coinInfo('ETH',res.data.ethereum);
          var xrp = coinInfo('XRP',res.data.ripple);
          var ltc = coinInfo('LTC',res.data.litecoin);
          var tron = coinInfo('TRX',res.data.tron);
          var link = coinInfo('LINK',res.data.link);
        
          var text = btc +'\n'+ eth +'\n'+xrp+'\n'+ltc+'\n'+tron+'\n'+link;
          bot.sendMessage(chatId,text,{parse_mode: 'HTML'});
        })
        .catch((err)=>{
            
        })
    } else {
        var coin = match[1];
        axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd&include_24hr_change=true`, {
          })
          .then((res)=>{
            var symbol;
            var sign = '';
            var values = Object.values(res.data)[0];
            if(values.usd_24h_change<0){
                symbol = '🔴';
            } else {
                symbol = '🟢';
                sign = '+'
            }
            var text = `${symbol} <b>${ucFirst(coin)} price</b>: ${values.usd.toFixed(4)} USD (${sign}${values.usd_24h_change.toFixed(3)}%)`;
            bot.sendMessage(chatId,text,{parse_mode: 'HTML'});
            
          })
          .catch((err)=>{
              bot.sendMessage(chatId,'Неверное название монеты')
          })
    }
    

});

bot.onText(/\/balance (.+)/, (msg, match) => {
   
    const chatId = msg.chat.id;
    if(match[1]=='list'){

    } else {
        project.find({name:match[1]}).then((proj)=>{
            if(proj[0]!=undefined){
                axios.get(`https://apilist.tronscan.org/api/account?address=${proj[0].address}`).then((res)=>{
                  console.log(res.data.tokenBalances)
                  console.log(res.data.balances)
                    var balance = format.formatNumber(res.data.balance/1000000, 3, " ").split('.')[0];
                    var sms = `Баланс контракта ${ucFirst(match[1])}:\n`;
                    var coef = res.data.balance/proj[0].balance_1h;
                    var coef2 = res.data.balance/proj[0].balance_24h;
                    var percent1;
                    var percent2;
                    if(balance != 0){
                      sms+= `💎 <b>${balance} TRX</b> \n`
                      if(proj[0].name != 'sunex'){
                        if(coef > 1){
                          percent1 = (coef-1)*100;
                          sms+=`+${percent1.toFixed(3)}% за час\n`
                        } else {
                          percent1 = (1-coef)*100;
                          sms+=`-${percent1.toFixed(3)}% за час\n`
                        }
  
                        if(coef2 > 1){
                          percent2 = (coef2-1)*100;
                          sms+=`+${percent2.toFixed(3)}% за день\n`
                        } else {
                          percent2 = (1-coef2)*100;
                          sms+=`-${percent2.toFixed(3)}% за день\n`
                        }
  
                      }
                    }
                        
                        res.data.trc20token_balances.forEach((el)=>{
                            if(el.name == "SUN"){
                            sms+=`💎 <b>${format.formatNumber(el.balance/Math.pow(10,el.decimals), 3, " ").split('.')[0]} ${el.name}</b>\n`;
                            }
                        })
                        bot.sendMessage(chatId,sms,{parse_mode: 'HTML'});
                    
                    
    
                })
            } else {
                bot.sendMessage(chatId,'Такого проекта нет в списке');
            }
        }).catch((err)=>{

        })
    }
    

    
  });

  bot.onText(/\/contracts/, (msg, match) => {
   
    const chatId = msg.chat.id;

    projects.find().then((res)=>{
        var sms = 'Доступные контракты для просмотра:\n';
        res.forEach((el,index)=>{
            sms+= `${ucFirst(el.name)}\n`
        })
        sms+=`\nЧтобы проверить баланс контракта наберите команду /balance название_проекта`
        bot.sendMessage(chatId,sms,{parse_mode: 'HTML'})
    })

    
  });

  bot.onText(/\/help crypto/, (msg, match) => {
   
    const chatId = msg.chat.id;
    
    var sms = `Доступные команды:\n\n`;
    sms+='/price название_криптовалюты - актуальный курс указанной монеты (Пример - bitcoin, ethereum, tron...)\n\n';
    sms+='/price top - актуальный курс топовых монет\n\n';
    sms+= '/contracts - список доступных контрактов для просмотра\n\n';
    sms+='/balance название_проекта - баланс контракта в реальном времени';

    bot.sendMessage(chatId,sms);
  });

var ucFirst =(str)=> {
    if (!str) return str;
  
    return str[0].toUpperCase() + str.slice(1);
  }

  var coinInfo = (coin,s)=>{
    var sign = '';
    if(s.usd_24h_change>0){
        sign = '+'
    } 
        return `💰<b>${coin} price</b>: ${s.usd.toFixed(4)} USD (${sign}${s.usd_24h_change.toFixed(3)}%)`;
  }

  setInterval(() => {
    bot.sendMessage(700061010,'Я не сплю')
  }, 1000*60*5);

setInterval(() => {
  projects.find().then((res)=>{
    res.forEach((el,index)=>{
        axios.get(`https://apilist.tronscan.org/api/account?address=${el.address}`).then((resp)=>{
            if(resp.data.balance == 0){
              el.balance_1h = 0;
              el.save()
            } else {
              el.balance_1h = resp.data.balance
              el.save()
            }
        })
    })
  })
}, 1000*60*59);

setInterval(() => {
  projects.find().then((res)=>{
    res.forEach((el,index)=>{
        axios.get(`https://apilist.tronscan.org/api/account?address=${el.address}`).then((resp)=>{
            if(resp.data.balance == 0){
              el.balance_24h = 0;
              el.save()
            } else {
              el.balance_24h = resp.data.balance
              el.save()
            }
        })
    })
  })
}, 1000*60*60*24);