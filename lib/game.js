var express = require('express')
var port = process.env.PORT || 3000;
var app = express()
var path = require('path')
app.use(express.static('./public'))


app.route('/')
.get(function(req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
	//res.send("hell")
})

var srv = app.listen(port, function() {
	console.log('Listening on '+port)
})

app.use('/peerjs', require('peer').ExpressPeerServer(srv, {
	debug: true
}))
