import React, { useState, useEffect } from 'react'
import { auth } from "../../firebase"
import { signOut } from 'firebase/auth';
import {getItem, putItem, deleteItem } from "../../dynamodb";
import { Chart } from 'react-google-charts';

const Dashboard = () => {
    const [purchaseName, setPurchaseName] = useState('Test');
    const [purchasePrice, setPurchasePrice] = useState(420.69);
    const [purchaseType, setPurchaseType] = useState('TestPurchase');
    const [dateStart, setDateStart] = useState('2024-01-01');
    const [dateEnd, setDateEnd] = useState('2024-02-01');
    const[items, setItems] = useState([]);
    const[chartData, setChartData] = useState([]);
    const [showOverlay, setShowOverlay] = useState(false);    

    useEffect(() => {
        loadItems();
    }, [dateStart, dateEnd]);

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

    const formatDateForHeader = (numberDate) => {
        const dateString = numberDate.toString();
        const year = dateString.slice(0, 4);
        const monthNumber = dateString.slice(5, 7);
        const day = dateString.slice(8, 10);
    
        const monthName = new Date(`${monthNumber}-01`).toLocaleString('default', { month: 'short' });
    
        const formattedDate = `${monthName} ${parseInt(day)}${getOrdinalSuffix(parseInt(day))} ${year}`;
    
        return formattedDate;
    };

    const getOrdinalSuffix = (day) => {
        if (day === 1 || day === 21 || day === 31) {
            return "st";
        } else if (day === 2 || day === 22) {
            return "nd";
        } else if (day === 3 || day === 23) {
            return "rd";
        } else {
            return "th";
        }
    };

    const onStartDateChanged = (startDate) => {
        if (startDate > dateEnd) {
            setDateEnd(startDate);
        }
        setDateStart(startDate);
    }

    const getStartDate = (startDate) => {
        const dateString = startDate.toString();
        const year = dateString.slice(0, 4);
        const month = dateString.slice(5, 7);
        const day = dateString.slice(8, 10);
        return `${year}${month}${day}000000`;
    };

    const getEndDate = (endDate) => {
        const dateString = endDate.toString();
        const year = dateString.slice(0, 4);
        const month = dateString.slice(5, 7);
        const day = dateString.slice(8, 10);
        return `${year}${month}${day}999999`;
    };

    const loadItems = () => {
        getItem(auth.currentUser.uid, getStartDate(dateStart), getEndDate(dateEnd), function(err, data){
            if(err){
                console.log("Error", err);
            }
            else{
                console.log("Success", data);
                setItems(data.Items);
                generateChartData(data.Items)
            }
        });
    };

    const uploadItem = (e) => {
        e.preventDefault();
        putItem(auth.currentUser.uid, purchaseName, purchasePrice, purchaseType, function(err, data){
            if(err){
                console.log("Error", err);
            }
            else{
                console.log("Success", data);
                loadItems();
            }
        });
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
        console.log(dateStart);
        console.log(dateEnd);
        console.log(getStartDate(dateStart));
        console.log(getEndDate(dateEnd));
        setShowOverlay(!showOverlay);
    };

    const removeItem = (item) => {
        console.log(item);
        console.log(item.purchaseTimestamp);
        deleteItem(auth.currentUser.uid, item.purchaseTimestamp.N, function(err, data){
            if(err){
                console.log("Error", err);
            }
            else{
                console.log("Success", data);
                loadItems();
            }
        });
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
            </div>
            <h1>Dashboard</h1>
            <h2>{`${formatDateForHeader(dateStart)} - ${formatDateForHeader(dateEnd)}`}</h2>
            <div className='date-container'>
            <input type="date" id="start" name="range-start" value={dateStart} min="2000-01-01" max="2100-12-01" onChange={(e)=>onStartDateChanged(e.target.value)}/>
            <input type="date" id="end" name="range-end" value={dateEnd} min={dateStart} max="2100-12-31"onChange={(e)=>setDateEnd(e.target.value)}/>
            </div>
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
                <form onSubmit={uploadItem}>
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
                        <h2>Remove an Item</h2>
                        <ul>
                            {items.map((item, index) => (
                                <li key={index}>
                                    {item.PURCHASE_NAME.S} - {item.PURCHASE_PRICE.N} - {formatDateFromNumber(item.purchaseTimestamp.N)}
                                    <button onClick={() => removeItem(item)}>Remove</button>
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