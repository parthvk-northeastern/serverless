const AWS = require("aws-sdk");

const region = "us-east-1";

console.log("Lambda function starts");

exports.handler = function handler(event, context, callback) {
  console.log("sns triggered the function");

  var msg = event.Records[0].Sns.Message;

  var token = event.Records[0].Sns.Subject;

  var dynamodb = new AWS.DynamoDB({
    apiVersion: "2012-08-10",
    region: "us-east-1",
  });
  var sendingEmail = new AWS.SES({
    apiVersion: "2010-12-01",
    region: "us-east-1",
  });
  AWS.config.update({
    region: "us-east-1",
  });

  //To check if Email ID exists

  var tokenparams = {
    Key: {
      EmailID: { S: msg },
    },
    TableName: "myDynamoUsernameTable",
    ProjectionExpression: "EmailID",
  };

  console.log("checking inside username dynamo DB table", tokenparams);

  // defining the email parameters

  var emailParams = {
    Destination: {
      ToAddresses: [msg],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data:
            "Hey!. This is the update for cloud demo. Please click on this link to verify your email address. Link valid for 5 minutes " +
            "https://parthk117.me/v1/verifyEmail?email=" +
            msg +
            "&token=" +
            token,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Email Address verification for webapp",
      },
    },
    Source: "csye6225parth@parthk117.me",
  };

  var paramsDB = {
    Item: {
      EmailID: { S: msg },
    },
    TableName: "myDynamoUsernameTable",
  };

  dynamodb.getItem(tokenparams, (error, data) => {
    if (error) {
      console.log(error);
    } else {
      console.log(data);
      if (data.Item == undefined) {
        dynamodb.putItem(
          paramsDB,
          (error,
          (data) => {
            if (!error) {
              var emailCapture = sendingEmail.sendEmail(emailParams).promise();
              emailCapture
                .then(function (data) {
                  console.log("Email sent");
                })
                .catch(function (error) {
                  console.log("Error ocurred!!");
                  console.log(error);
                });
            } else {
              console.log("error error!!");
              console.log(error);
            }
          })
        );
      }
    }
  });
};
