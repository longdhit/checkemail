const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const port = process.env.PORT||80
const server = require("http").Server(app);
app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('./public'));
server.listen(port);
app.get("/", function(req, res){
    res.render("index");
});
app.post("/",function(req,res){
    
    email = req.body.email
    password = req.body.password
    let r = mail_config.find(mail => mail.domain === getDomain(email));
    if (r) {
       if(r.method==1) check_imap(email,password,r.host,r.port,r.tls).then(result => res.send(result)).catch(error => res.send({stt:-1,ret:"Error|"+err.message+"|"+email+"|"+password}))
       else check_pop3(email,password,r.host,r.port,r.tls).then(result => res.send(result)).catch(error => res.send(error))
    }
    else{
        res.send({stt:-1,ret:"Not support|"+email+"|"+password})
    }
})
const mail_config = [
    {domain:"hotmail.com",host:"imap-mail.outlook.com",port:993,tls:true,method:1},
    {domain:"msn.com",host:"imap-mail.outlook.com",port:993,tls:true,method:1},
    {domain:"live.com",host:"imap-mail.outlook.com",port:993,tls:true,method:1},
    {domain:"outlook.com",host:"imap-mail.outlook.com",port:993,tls:true,method:1},
    {domain:"gmail.com",host:"imap.gmail.com",port:993,tls:true,method:1},
    {domain:"att.net",host:"imap.mail.yahoo.com",port:993,tls:true,method:1},
    {domain:"yahoo.com",host:"imap.mail.yahoo.com",port:993,tls:true,method:1},
    {domain:"ymail.com",host:"imap.mail.yahoo.com",port:993,tls:true,method:1},
    {domain:"rr.com",host:"mail.twc.com",port:993,tls:true,method:1},
    {domain:"adelphia.net",host:"mail.twc.com",port:993,tls:true,method:1},
    {domain:"wanadoo.fr",host:"imap.orange.fr",port:993,tls:true,method:1},
    {domain:"cox.net",host:"imap.cox.net",port:993,tls:true,method:1},
    {domain:"charter.net",host:"mobile.charter.net",port:993,tls:true,method:1},
    {domain:"sbcglobal.net",host:"imap.mail.yahoo.com",port:993,tls:true,method:1},
    {domain:"aol.com",host:"imap.aol.com",port:993,tls:true,method:1},
    {domain:"mail.com",host:"imap.mail.com",port:993,tls:true,method:1},
    {domain:"email.com",host:"imap.mail.com",port:993,tls:true,method:1},
    {domain:"optonline.net",host:"mail.optonline.net",port:993,tls:true,method:1},
    {domain:"bigpond.com",host:"imap.telstra.com",port:993,tls:true,method:1},
    {domain:"telstra.com",host:"imap.telstra.com",port:993,tls:true,method:1},
    {domain:"q.com",host:"mail.q.com",port:993,tls:true,method:1},
    {domain:"comcast.net",host:"mail.comcast.net",port:995,tls:true,method:2},
    {domain:"wowway.com",host:"pop3.mail.wowway.com",port:110,tls:false,method:2},
    {domain:"netscape.com",host:"pop3.isp.netscape.com",port:110,tls:false,method:2},
];
function check_imap(email,password,host,port,tls){
    return new Promise((resolve, reject) => {
        const imaps = require('imap-simple');
        let config = {
            imap: {
                user: email,
                password: password,
                host: host,
                port: port,
                tls: tls,
                connectTimeout: 30000,
                authTimeout: 30000
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
    })
}
function check_pop3(email,password,host,port,tls){
    return new Promise((resolve, reject) => {
        var POP3Client = require("poplib");
        var client = new POP3Client(port, host, {
                tlserrs: false,
                enabletls: tls,
                debug: false
        });
        client.on("error", function(err) {
            if (err.errno === 111) reject({stt:-1,ret:"Error|Unable to connect to server|"+email+"|"+password});
            else reject({stt:-1,ret:"Error|Server error occurred|"+email+"|"+password});
            reject({stt:-1,ret:"Error|"+err+"|"+email+"|"+password});
    });
        client.on("connect", function() {
            client.login(email, password);
        });
        client.on("login", function(status, rawdata) {
            if (status) {
                client.quit();
                resolve({stt:1,ret:"Live|"+email+"|"+password})
                client.list();
            } else {
                client.quit();
                resolve({stt:0,ret:"Die|"+email+"|"+password})
            }
        });
    });
}

function getDomain(email){
    let res
    let matches = email.match(/^[^@]+@([a-zA-Z0-9._-]+\.[a-zA-Z]+)$/);
    if(matches){
        if(email.match(/[a-zA-Z0-9._-]+.rr.com/)) return "rr.com"
        else res = matches[1]
    }
    return res
}
