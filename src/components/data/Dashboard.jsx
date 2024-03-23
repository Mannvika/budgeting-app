import React, { useState, useEffect } from 'react'
import { auth } from "../../firebase"
import { signOut } from 'firebase/auth';
import AWS from 'aws-sdk';
import { Chart } from 'react-google-charts';

AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: "us-east-2"
  });
  
var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

const Dashboard = () => {
    const [purchaseName, setPurchaseName] = useState('Test');
    const [purchasePrice, setPurchasePrice] = useState(420.69);
    const [purchaseType, setPurchaseType] = useState('TestPurchase');
    const[items, setItems] = useState([]);
    const[chartData, setChartData] = useState([]);
    const [showOverlay, setShowOverlay] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    

    useEffect(() => {
        getItem();
    }, []);

    const userSignOut = () =>{
        signOut(auth).then(() => {
            console.log("Signed out")
        }).catch(error => console.log(error));
    }

    const formatDateFromNumber = (numberDate) => {
        const dateString = numberDate.toString();
        const year = dateString.slice(0, 4);
        const month = dateString.slice(4, 6);
        const day = dateString.slice(6, 8);
        return `${month}/${day}/${year}`;
    };

    const getNumberFormatFromDate = (timestamp) => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        const hours = ('0' + date.getHours()).slice(-2);
        const minutes = ('0' + date.getMinutes()).slice(-2);
        const seconds = ('0' + date.getSeconds()).slice(-2);
        return parseInt(`${year}${month}${day}${hours}${minutes}${seconds}`);
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
                getItem();
            }
        })

    };

    const generateChartData = (items) => {
        const chartData = items.reduce((accumulator, item) => {
            const type = item.PURCHASE_TYPE.S;
            const price = parseFloat(item.PURCHASE_PRICE.N);
            
            if (accumulator[type]) {
                accumulator[type] += price;
            } else {
                accumulator[type] = price;
            }
            
            return accumulator;
        }, {});
    
        const formattedData = Object.entries(chartData).map(([type, totalPrice]) => [type, totalPrice]);
        setChartData([['Type', 'Total Price'], ...formattedData]);
    };

    const toggleOverlay = () => {
        setShowOverlay(!showOverlay);
    };

    const selectDataToRemove = (data) => {
        setSelectedData(data);
    };

    const removeSelectedData = () => {
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
        ddb.deleteItem(params, function(err, data){
            if(err){
                console.log("Error", err);
            }
            else{
                console.log("Success", data);
            }
        })
        toggleOverlay();
    };
    

    return (
        <div className='dashboard-container'>
            <div  className='top-left-buttons'>
            <button class="button" onClick={toggleOverlay}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"></path>
                </svg>
                <div class="text">
                Settings
                </div>
            </button>
            <button class="button" onClick={userSignOut}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"></path>
                </svg>
                <div class="text">
                Log Out
                </div>
            </button>
            </div>
            <h1>Dashboard</h1>
            <h2>Jan 1st - Feb 1st</h2>
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
                        'width':600,
                        'height':500,
                    }}
                />
            </div>
                <div className='put-item-container'>
                <form onSubmit={putItem}>
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
                {showOverlay && (
                <div className="overlay">
                    <div className="overlay-content">
                        <h2>Data List</h2>
                        <ul>
                            {items.map((item, index) => (
                                <li key={index}>
                                    {item.PURCHASE_NAME.S} - {item.PURCHASE_PRICE.N}
                                    <button onClick={() => selectDataToRemove(item)}>Remove</button>
                                </li>
                            ))}
                        </ul>
                        <button onClick={toggleOverlay}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;