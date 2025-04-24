const { JWT } = require("google-auth-library");

const getAccessToken = () => {
  return new Promise(function (resolve, reject) {
    //todo sửa thành file của gshop
    const key = require("../utils/demos-1cf27-firebase-adminsdk-fbsvc-c85c970230.json");
    const jwtClient = new JWT(
      key.client_email,
      null,
      key.private_key,
      ["https://www.googleapis.com/auth/cloud-platform"],
      null
    );
    jwtClient.authorize(function (err, tokens) {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token);
    });
  });
};

const handleSendNotification = async ({ token, title, subtitle, body, data }) => {
  var request = require("request");
  var options = {
    method: "POST",
    //todo sửa thành tên project của gshop
    url: "http://fcm.googleapis.com/v1/projects/demos-1cf27/messages:send",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    body: JSON.stringify({
      message: {
        token,
        notification: {
          title,
          subtitle,
          body,
        },
        data,
      },
    }),
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });
};
