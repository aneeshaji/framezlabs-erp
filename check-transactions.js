const mongoose = require('mongoose');

async function checkTransactions() {
    try {
        const uri = 'mongodb+srv://framezlabs_admin:bjOB4rkeoDiXO9Xm@framezlabs-cluster.aqsd3ff.mongodb.net/framezlabs_db';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const transactions = await mongoose.connection.db.collection('transactions').find({}).sort({ createdAt: -1 }).limit(5).toArray();
        console.log('Last 5 transactions:', JSON.stringify(transactions, null, 2));

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkTransactions();
