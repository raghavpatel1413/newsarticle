//Declaration
const express = require('express');
const app = express();
const bodyParser= require('body-parser')
const MongoClient = require('mongodb').MongoClient
const cookieParser = require('cookie-parser');
const session = require('express-session');
var db

//Initlization
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.set('view engine', 'ejs')
app.use(cookieParser());
app.use(session({secret: "india123"}));
app.use("/public",express.static(__dirname + '/public'));
MongoClient.connect('mongodb://raghavpatel1413:Raghav74@ds125574.mlab.com:25574/news', (err, client) => {
	if (err) return console.log(err)
	db = client.db('news') // whatever your database name is
	app.listen(process.env.PORT || 3000, () => {
	console.log('listening on 3000')
	})
})

//Routing
//Guest
app.get('/', (req, res) => {
	db.collection('news').find().toArray((err, result) => {
	if (err) return console.log(err)
	res.cookie('user', 'guest')
	res.render('showNews.ejs', {news: result})
	})
})

//Login
app.get('/login', (req, res) => {
	if(req.session.usr == 1)
	{
		res.render('editor/index.ejs')
	}
	else if(req.session.usr == 2)
	{
		res.render('reporter/index.ejs')
	}
	else
	{
		res.render('login.ejs');
	}
})

app.post('/loginCon', (req, res) => {
	req.session.usr = 0;
	db.collection('user').find().toArray((err, result) => {
		if (err) return console.log(err)
		else
		{
			for (var i = 0, len = result.length; i < len; i++) {
				if(result[i].email == req.body.email && result[i].password == req.body.password && result[i].type == 1)
				{
					req.session.usr = 1;
					res.render('editor/index.ejs')
				}
				else if(result[i].email == req.body.email && result[i].password == req.body.password && result[i].type == 2)
				{
					req.session.usr = 2;
					res.redirect('/manageNews');
				}
			}
		}
		return 0;
		})
})

//Logout
app.get('/logout', (req,res) =>{
	req.session.usr = 0
	res.render('login.ejs')
})

//Reporter
app.get('/manageNews', (req, res) => {
	if(req.session.usr == 2)
	{
		db.collection('news').find().toArray((err, result) => {
		if (err) return console.log(err)
		res.render('reporter/index.ejs', {news: result})
		})
	}
	else
	{
		res.redirect('/login');
	}
})

app.post('/addNews', (req, res) => {
  db.collection('news').save(req.body, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/manageNews')
  })
})

app.delete('/deleteNews/', (req, res) => {
  db.collection('news').findOneAndDelete({title},
  (err, result) => {
    if (err) return res.send(500, err)
    res.redirect('/manageNews')
  })
})

//Editor