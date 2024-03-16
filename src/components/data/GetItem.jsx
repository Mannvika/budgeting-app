import React, { useState } from 'react'
import { auth } from "../../firebase"

var AWS = require("aws-sdk");

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-2"
});
var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

const GetItem = () => {
    const[items, setItems] = useState([]);

    const formatDateFromNumber = (numberDate) => {
        const dateString = numberDate.toString();
        const year = dateString.slice(0, 4);
        const month = dateString.slice(4, 6);
        const day = dateString.slice(6, 8);
        const hours = dateString.slice(8, 10);
        const minutes = dateString.slice(10, 12);
        return `${month}/${day}/${year} ${hours}:${minutes}`;
    };

    const getItem = () => {
        var params = {
            ExpressionAttributeValues: {
              ":u": { S: auth.currentUser.uid }
            },
            KeyConditionExpression: "userID = :u",
            TableName: "Purchases",
        };

        ddb.query(params, function(err, data){
            if(err){
                console.log("Error", err);
            }
            else{
                console.log("Success", data);
                setItems(data.Items);
            }
        })
    }
    return (
        <div className='get-item-container'>
            <h1>Your Purchases</h1>
            <button onClick={getItem}>Get Items</button>
            <ul>
                {items.map((purchase, index) => (
                <li key={index}>
                    <p>Purchase Date: {formatDateFromNumber(purchase.purchaseTimestamp.N)}</p>
                    <p>Price: ${purchase.PURCHASE_PRICE ? parseFloat(purchase.PURCHASE_PRICE.N).toFixed(2) : 'N/A'}</p>
                    <p>Type: {purchase.PURCHASE_TYPE ? purchase.PURCHASE_TYPE.S : 'N/A'}</p>
                    <p>Name: {purchase.PURCHASE_NAME ? purchase.PURCHASE_NAME.S : 'N/A'}</p>
                </li>
                ))}
            </ul>
        </div>
    );
};

export default GetItem;