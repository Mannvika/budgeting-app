import React, { useState } from 'react'
import { auth } from "../../firebase"
import AWS from 'aws-sdk';
import { Chart } from 'react-google-charts';

AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: "us-east-2"
  });
  
var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

const GetItem = () => {
    const[items, setItems] = useState([]);
    const[chartData, setChartData] = useState([]);

    const formatDateFromNumber = (numberDate) => {
        const dateString = numberDate.toString();
        const year = dateString.slice(0, 4);
        const month = dateString.slice(4, 6);
        const day = dateString.slice(6, 8);
        return `${month}/${day}/${year}`;
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
                generateChartData(data.Items)
            }
        })

    }

    const generateChartData = (items) => {
        const chartData = items.map(item => {
            return [item.PURCHASE_NAME.S, parseFloat(item.PURCHASE_PRICE.N)];
        });
        setChartData([['Name', 'Price'], ...chartData]);
    };

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
            <div className='chart-container'>
            <Chart
                chartType="PieChart"
                data={chartData}
                options={{
                    legend: {position: 'none'},
                    backgroundColor: {fill:'transparent'},
                    pieHole: 0.4,
                    pieSliceTextStyle: {
                        color: 'black',
                      },
                      'width':400,
                      'height':900,
                }}
            />
            </div>
        </div>
    );
};

export default GetItem;