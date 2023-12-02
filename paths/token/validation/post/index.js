const vandium = require('vandium');
const mysql  = require('mysql');

exports.handler = vandium.generic()
  .handler( (event, context, callback) => {

    var connection = mysql.createConnection({
    host     : process.env.host,
    user     : process.env.user,
    password : process.env.password,
    database : process.env.database
    });
    
    var token = event.token;

    var path = '/user';
    const options = {
        hostname: 'api.github.com',
        method: 'GET',
        path: path,
        headers: {
          "Accept": "application/vnd.github+json",
          "User-Agent": "apis-io-search",
          "Authorization": 'Bearer ' + token
      }
    };

    https.get(options, (res) => {

        var body = '';
        res.on('data', (chunk) => {
            body += chunk;
        });

        res.on('end', () => {

          var github_results = JSON.parse(body);
          
          var response = {};
          response['pulling'] = "No more to publish.";            
          callback( null, github_results );  
          connection.end();  

        });
        
    });        

});