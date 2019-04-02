const ordersModel = require('./models/orders')

async function test() {
    console.log(await ordersModel.getSaleRecord(1))
}

test()