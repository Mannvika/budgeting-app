import AWS from 'aws-sdk';
import Papa from 'papaparse';

AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: "us-east-2"
  });

const ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

export const getItem = (userId, dateStart, dateEnd, callback) => {
    const params = {
        ExpressionAttributeValues: {
            ":u": { S: userId },
            ":start": { N: dateStart.toString() },
            ":end": { N: dateEnd.toString() }
        },
        KeyConditionExpression: "userID = :u AND purchaseTimestamp BETWEEN :start AND :end",
        TableName: "Purchases",
    };

    ddb.query(params, callback);
};

export const putItem = (userId, purchaseName, purchasePrice, purchaseType, purchaseTimetampCount, callback) => {
    const timestamp = Date.now();
    const purchaseTimestamp = getNumberFormatFromDate(timestamp, 0);

    const params = {
        TableName: "Purchases",
        Item:{
            userID: { S: userId },
            purchaseTimestamp: { N: purchaseTimestamp.toString() },
            PURCHASE_NAME: { S: purchaseName },
            PURCHASE_PRICE: { N: purchasePrice.toString() },
            PURCHASE_TYPE: { S: purchaseType },
        }
    };

    ddb.putItem(params, callback);
};

export const putItemsFromFile = (userID, file, callback) =>{
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            console.log(results.data);
            let count = 0;
            let batchRequests = [];
            results.data.forEach(item => {
                const { Name, Type, Cost } = item;
                const purchaseTimestamp = getNumberFormatFromDate(Date.now(), count);
                const params = {
                    PutRequest: {
                        Item: {
                            userID: { S: userID },
                            purchaseTimestamp: { N: purchaseTimestamp.toString() },
                            PURCHASE_NAME: { S: Name },
                            PURCHASE_PRICE: { N: Cost.toString() },
                            PURCHASE_TYPE: { S: Type },
                        }
                    }
                };
                batchRequests.push(params);
                count++;
            });

            for (let i = 0; i < batchRequests.length; i += 25) {
                const batchSlice = batchRequests.slice(i, i + 25);
                const params = {
                    RequestItems: {
                        'Purchases': batchSlice
                    }
                };
                ddb.batchWriteItem(params, (err, data) => {
                    if (err) {
                        console.error("Unable to write items", JSON.stringify(err, null, 2));
                    } else {
                        console.log("Items written successfully", JSON.stringify(data, null, 2));
                    }
                });
            }
        },
    });
}

export const deleteItem = (userId, purchaseTimestamp, callback) => {
    const params = {
        TableName: "Purchases",
        Key: {
            "userID": { S: userId },
            "purchaseTimestamp": { N: purchaseTimestamp.toString() }
        }
    };

    ddb.deleteItem(params, callback);
};

const getNumberFormatFromDate = (timestamp, count) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    return parseInt(`${year}${month}${day}${hours}${minutes}${seconds}${count}`);
};

