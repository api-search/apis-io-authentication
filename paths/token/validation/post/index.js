const vandium = require('vandium');
const mysql  = require('mysql');
const https  = require('https');
const yaml = require('js-yaml');
const { APIGatewayClient, CreateApiKeyCommand } = require("@aws-sdk/client-api-gateway");

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
          
          if(github_results.login){
          
            // API Gateway
            const client = new APIGatewayClient({region: 'us-east-1'});

            const input1 = {
              name: github_results.login,
              description: "Trading in GitHub Personal Access Token for API Key.",
              enabled: true,
              generateDistinctId: false,
              value: token,

              customerId: github_results.login,
              tags: {
                "domain": "apis.io",
              },
            };

            (async function () {

                  try {
                    const command = new CreateApiKeyCommand(input1);
                    const response = await client.send(command);

                    var key_id = response.id;

                    const input2 = {
                      usagePlanId: "ql1nic",
                      keyId: key_id, 
                      keyType: "API_KEY",
                    };

                    console.log(input2);
       
                    callback( null, input2 );  
                    connection.end();                     
                    

                } catch (err) {
                    console.error(err)
                }
            })();            


          }else{
            var response = {};
            response['username'] = "none";            
            callback( null, github_results );  
            connection.end();             
          }

        });
        
    });        

});