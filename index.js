require('dotenv').config(); //carregar variaveis

const WebSocket = require("ws");
const ws = new WebSocket(`${process.env.STREAM_URL}/${process.env.SYMBOL.toLowerCase()}@ticker`);

const PROFITABILITY = parseFloat(process.env.PROFITABILITY);
let sellPrice = 0;


ws.onmessage = (event) => {
    //console.clear();
    const obj = JSON.parse(event.data);
    console.log("Symbol: " + obj.s);
    console.log("Best Ask: " + obj.a);

    const currentPrice = parseFloat(obj.a);
    if (sellPrice === 0 && currentPrice < 67300){
        console.log("Bom para comprar");
        newOrder("0.001", "BUY");
        sellPrice = currentPrice * PROFITABILITY;
    }
    else if (sellPrice !== 0 && currentPrice > 70000){
        console.log("Bom para vender");
        newOrder("0.001", "SELL");
        sellPrice = 0;
    }
    else 
        console.log("esperando...Sell price: " + sellPrice);

}

const axios = require('axios');
const crypto = require('crypto');

async function newOrder(quantity, side){

const data = {
    symbol: process.env.SYMBOL,
    type: 'MARKET',
    side,
    quantity
};

const timestamp = Date.now();
const racvWindow = 60000;

const signature = crypto
    .createHmac('sha256', process.env.SECRET_KEY)
    .update(`${new URLSearchParams({ ...Date, timestamp, racvWindow })}`)
    .digest('hex');

    const newData = { ...data, timestamp, racvWindow, signature };
    const qs = `?${new URLSearchParams(newData)}`;

    try{
        const result = await axios({
            method: 'POST',
            url:`${process.env.API_URL}/v3/order${qs}`,
            headers: {'X-MBX-APIKEY': process.env.API_KEY}
        })
        console.log(result.data);
    }
    catch(err){
        console.error(err);
    }
}
