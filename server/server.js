const express = require('express')
const app = express()
const cors = require('cors')
const compression = require('compression')
const path = require('path')
const Sequelize = require('sequelize')
const axios = require('axios').create({
    headers: {
        'content-type': 'application/json'
    },
    timeout: 5000
})
const cluster = require('cluster');
const totalCPUs = require('os').cpus().length;
const { bootServer } = require('./routes/bootServer');
const { getUser, updateUser } = require('./routes/user');
const { updateLeaguesUser, updateLeague } = require('./routes/leagues');
const { sync_daily, sync_15min } = require('./routes/sync');

app.use(compression())
app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../client/build')));

const connectionString = process.env.DATABASE_URL || 'postgres://dev:password123@localhost:5432/dev'
const ssl = process.env.HEROKU ? { rejectUnauthorized: false } : false
const db = new Sequelize(connectionString, { dialect: 'postgres', dialectOptions: { ssl: ssl } })

bootServer(app, axios, db)

sync_daily(axios, app.get('leagues_table'))

sync_15min(app, axios)

app.get('/user', async (req, res, next) => {
    const user = await getUser(axios, req.query.username)
    if (user?.user_id) {
        req.user = user
        next()
    } else {
        res.send(user)
    }
}, async (req, res, next) => {
    const user_db = await updateUser(axios, app.get('users_table'), req.user, app.get('state').season)
    req.user_db = user_db.user
    req.leagues = user_db.leagues
    next()
}, async (req, res, next) => {
    const leagues_user = await updateLeaguesUser(axios, app.get('leagues_table'), req.leagues, req.user_db.user_id)
    res.send({
        user: req.user_db,
        leagues: leagues_user
    })
})

app.get('/syncleague', async (req, res) => {
    const league_id = req.query.league_id
    const user_id = req.query.user_id
    const league = await updateLeague(axios, app.get('leagues_table'), league_id, user_id)
    res.send(league)
})

app.get('/allplayers', (req, res) => {
    const allplayers = app.get('allplayers')
    res.send(allplayers)
})

app.get('*', async (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});