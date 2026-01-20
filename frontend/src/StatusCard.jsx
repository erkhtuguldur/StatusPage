import { useState } from "react";
import "./StatusCard.css"
import { useEffect } from "react";
function StatusCard({ website, isAdmin, onDelete,isExpanded,onToggleExpand }) {
    const isUp = website.status ==="up";
    const statusText = website.status || "No data";
    const responseTime = website.response_time ? `${website.response_time}ms` : "N/A";
    const [uptime,setUptime]=useState(null);
    const [History,setHistory]=useState([]);


    return (
        <div className={`card ${isUp ? "green" : "red"}`}>
            <div className="info">
                <h3 style={{ margin: "0 0 10px 0" }}>{website.name}</h3>
                <p style={{ margin: "5px 0" }}>Status: {statusText}</p>
                <p style={{ margin: "5px 0" }}>Response Time: {responseTime}</p>
                {website.url && <p style={{ margin: "5px 0", fontSize: "14px" }}>{website.url}</p>}
            </div>
            {isAdmin && (
                <button 
                    onClick={() => onDelete(website.id)}
                    className="deleteButton"
                >
                    Delete
                </button>
            )}
        </div>
    );
}

export default StatusCard;
