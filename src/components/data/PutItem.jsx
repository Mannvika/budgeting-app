import React, { useState } from 'react'
import { auth } from "../../firebase"
import AWS from 'aws-sdk';

AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: "us-east-2"
  });
  
var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

const PutItem = () => {

    const [purchaseName, setPurchaseName] = useState('Test');
    const [purchasePrice, setPurchasePrice] = useState(420.69);
    const [purchaseType, setPurchaseType] = useState('TestPurchase');

    const getNumberFormatFromDate = (timestamp) => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        const hours = ('0' + date.getHours()).slice(-2);
        const minutes = ('0' + date.getMinutes()).slice(-2);
        return parseInt(`${year}${month}${day}${hours}${minutes}`);
    };

    const putItem = (e) => {
        e.preventDefault();
        const timestamp = Date.now();
        const purchaseTimestamp = getNumberFormatFromDate(timestamp);

        var params = {
            TableName: "Purchases",
            Item:{
                userID: { S: auth.currentUser.uid},
                purchaseTimestamp: { N: purchaseTimestamp.toString()},
                PURCHASE_NAME: { S: purchaseName},
                PURCHASE_PRICE: { N: purchasePrice.toString()},
                PURCHASE_TYPE: { S: purchaseType},
            }
        }

        ddb.putItem(params, function(err, data){
            if(err){
                console.log("Error", err);
            }
            else{
                console.log("Success", data);
            }
        })
    }
    return (
        <div className='put-item-container'>
            <form onSubmit={putItem}>
                <h1>Create an Account</h1>
                <input 
                    type='text' 
                    placeholder='Enter purchase name' 
                    value={purchaseName}
                    onChange={(e)=> setPurchaseName(e.target.value)}
                />
                <input 
                    type='number' 
                    placeholder='Enter purchase price' 
                    value={purchasePrice}
                    onChange={(e)=> setPurchasePrice(e.target.value)}
                />
                <input 
                    type='text' 
                    placeholder='Enter purchase type' 
                    value={purchaseType}
                    onChange={(e)=> setPurchaseType(e.target.value)}
                />
                <button type='submit'>Add Purchase</button>
            </form>
        </div>
    );
};

export default PutItem;