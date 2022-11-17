const AWS = require("aws-sdk");

const region = "us-east-1";

console.log("Inside Lambda function");

exports.handler = function handler(event, context, callback) {
  console.log("Message from SNS....");

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
    // secretaccesskey: process.env.AWS_SECRET_ACCESS_KEY,
    // accesskey: process.env.AWS_ACCESS_KEY_ID,
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

  console.log("checking from username dynamo DB table", tokenparams);

  // declaring the email parameters

  var emailParams = {
    Destination: {
      ToAddresses: [msg],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data:
            "Hello! Click on this link to verify " +
            "http://dev.parthk117.me/v1/verifyEmail?email=" +
            msg +
            "&token=" +
            token,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Link to verify email address",
      },
    },
    Source: "csye6225parth@parthk117.me",
  };

  //Adding to UsernameDynamoDB

  var paramsDB = {
    Item: {
      EmailID: { S: msg },
    },
    TableName: "myDynamoUsernameTable",
  };

  dynamodb.getItem(tokenparams, (error, data) => {
    console.log("Test here!!");
    if (error) {
      console.log("Right heree!!!1");
      console.log(error);
    } else {
      console.log("Correct!!");
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
                });
            } else {
              console.log("testing here, error error!!");
            }
          })
        );
      }
    }
  });
};
