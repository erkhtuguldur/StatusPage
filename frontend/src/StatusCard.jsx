import { useState, useEffect } from "react";
import "./StatusCard.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
function StatusCard({ website, isAdmin, onDelete,isExpanded,onToggleExpand }) {
    const isUp = website.status ==="up";
    const statusText = website.status || "No data";
    const responseTime = website.response_time ? `${website.response_time}ms` : "N/A";
    const [uptime,setUptime]=useState(null);
    const [history,setHistory]=useState([]);
    
    useEffect(() => {
        if (!isExpanded) return;
        
        async function fetchData(){
            try {
                const uptimeRes = await fetch(`${import.meta.env.VITE_API_URL}/api/websites/${website.id}/uptime`);
                const uptimeData = await uptimeRes.json();
                setUptime(uptimeData);
                console.log('Fetching for website ID:', website.id);
                const historyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/websites/${website.id}/history`);
                const historyData = await historyRes.json();
                setHistory(historyData);
            } catch (error) {
                console.log('Error fetching data:', error);
            }
        }
        fetchData();
    }, [isExpanded, website.id]);

    const chartData = history.map(check => ({
        time: new Date(check.checked_at).toLocaleTimeString(),
        responseTime: check.response_time,
        status: check.status === 'up' ? 1 : 0
    }));

    return (
        <div className={`card ${isUp ? "green" : "red"}` } onClick={() => onToggleExpand(website.id)}>
            <div className="info"  >
                <h3 style={{ margin: "0 0 10px 0" }}>{website.name}</h3>
                <p style={{ margin: "5px 0" }}>Status: {statusText}</p>
                <p style={{ margin: "5px 0" }}>Response Time: {responseTime}</p>
                {website.url && <p style={{ margin: "5px 0", fontSize: "14px" }}>{website.url}</p>}
            </div>
            {isAdmin && (
                <button 
                    onClick={()=>onDelete(website.id)}
                    className="deleteButton"
                >
                    Delete
                </button>
            )}
            
            {isExpanded && (
                <div className="expandedSection">
                    {uptime && (
                        <div className="uptimeContainer">
                            <h4>Uptime (Last 24h): {uptime.uptime}%</h4>
                            <p>Total Checks: {uptime.totalChecks} | Up: {uptime.upChecks}</p>
                        </div>
                    )}
                    
                    {history.length > 0 && (
                        <div className="graphContainer">
                            <h4 className="graphTitle">Response Time History</h4>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" label={{ value: "Time", position: "insideBottom", offset: -5 }} />
                                    <YAxis label={{ value: "(ms)", angle: -90, position: "insideLeft" }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="responseTime" stroke="#8884d8" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default StatusCard;
