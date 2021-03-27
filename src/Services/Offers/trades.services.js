const db = require('../../utils/firebase');
const C = require('../../utils/Constant');

module.exports = {
    getAllTrades,
    getOneTradeById,
    createNewTrade,
    updateTradeById,
    deleteTradeById,
    refuseTrade,
    acceptTrade
};

async function getAllTrades(req, res) {
    const data = db.collection('offers').doc(req.params.offerId).collection('trades');
    let response = [];
    await data.get().then(querySnapshot => {
        let trades = querySnapshot.docs;
        for (let trade of trades) {
            response.push(trade.data());
        }
    });

    return res.status(200).send(response);
}

async function createNewTrade(req, res) {
    if(!req.body.trader_id){
        return res.status(400).json({ "code": 400, "message": "Bad request", "reason": "trader_id is required" });
    }
    if(!req.body.buyer_id){
        return res.status(400).json({ "code": 400, "message": "Bad request", "reason": "buyer_id is required" });
    }
    if(!req.body.type){
        return res.status(400).json({ "code": 400, "message": "Bad request", "reason": "type is required" });
    }

    await db.collection('offers').doc(req.params.offerId).collection('trades').add({
        trader_id: req.body.trader_id,
        buyer_id: req.body.buyer_id,
        status: C.STATUS_PENDING,
        value: req.body.value ? req.body.value : "",
        type: req.body.type,
        is_visible: true,
        date_of_trade: new Date(Date.now()),
        created_at: new Date(Date.now()),
        updated_at: new Date(Date.now())
    }).then(result =>{
        db.collection('offers').doc(req.params.offerId).collection('trades').doc(result.id).update({
            id: result.id
        });
        return res.status(202).send(' Successfully created a new trade : ' + result.id);
    }).catch(e => {
        return res.status(409).json({ e });
    });
}

async function updateTradeById(req, res) {
    const document = db.collection('offers').doc(req.params.offerId).collection('trades').doc(req.params.tradeId);
    let data = (await document.get()).data();

    if(!data){
        return res.status(404).send({code: 404, message: "following not found"});
    }

    let response = {
        trader_id: req.body.trader_id ? req.body.trader_id : data.trader_id,
        buyer_id: req.body.buyer_id ? req.body.buyer_id : data.buyer_id,
        status: req.body.status ? req.body.status : data.status,
        value: req.body.value ? req.body.value : data.value,
        type: req.body.type ? req.body.type : data.type,
        is_visible: req.body.is_visible ? req.body.is_visible : data.is_visible,
        date_of_trade: req.body.date_of_trade ? req.body.date_of_trade : data.req.body.date_of_trade,
        created_at: data.created_at,
        updated_at: new Date(Date.now())
    }

    await document.update(response)
        .then(result => {
            return res.status(200).send(response);
        })
        .catch(e => {
            return res.status(500).json({ "code": 500, "message": "Internal server error", "reason": "An unknown error was occurred", "details": error.message});
        })
}

async function deleteTradeById(req, res) {
    const document = db.collection('offers').doc(req.params.offerId).collection('trades').doc(req.params.tradeId);
    if(!document) {
        return res.status(404).json({ "code": 404, "message": "Trade not found", "reason": "The trade with this id or with this offerId is not found" });
    }
    await document.delete()
        .then(result => {
            return res.status(200).send('The trade was deleted with success !');
        })
        .catch(error => {
            return res.status(500).json({ "code": 500, "message": "Internal server error", "reason": "An unknown error was occurred", "details": error.message});
        })
}

async function getOneTradeById(req, res) {
    const document = db.collection('offers').doc(req.params.offerId).collection('trades').doc(req.params.tradeId);
    let response = (await document.get()).data();

    if(!response){
        return {code: 404, message: "Trade not found"}
    }

    return res.status(200).send(response);
}

async function acceptTrade(req, res) {
    const document = db.collection('offers').doc(req.params.offerId).collection('trades').doc(req.params.tradeId);
    await document.update({
        status: "accepted"
    })
        .then(result => {
            return res.status(200).send(result);
        })
        .catch(error => {
            return res.status(404).json({
                "code": 404,
                "message": "Trade not found",
                "reason": "The trade with this id or with this offerId is not found"
            });
        })
}

async function refuseTrade(req, res) {
    const document = db.collection('offers').doc(req.params.offerId).collection('trades').doc(req.params.tradeId);
    await document.update({
        status: "refused"
    })
        .then(result => {
            return res.status(200).send(result);
        })
        .catch(error => {
            return res.status(404).json({
                "code": 404,
                "message": "Trade not found",
                "reason": "The trade with this id or with this offerId is not found"
            });
        })
}