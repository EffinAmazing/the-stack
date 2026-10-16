const mongoose = require('mongoose');

const URI = process.env.TEST_MONGOURI || 'mongodb://localhost:27017/';

async function connect(suite) {
    const name = 'marchtach_test_' + suite;
    if (!/^marchtach_test_[a-z_]+$/.test(name)) throw new Error('Refusing to use database ' + name);
    mongoose.set('useCreateIndex', true);
    mongoose.set('useFindAndModify', false);
    await mongoose.connect(URI + name, { useNewUrlParser: true, useUnifiedTopology: true });
    await mongoose.connection.db.dropDatabase();
}

async function disconnect() {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
}

module.exports = { connect, disconnect };
