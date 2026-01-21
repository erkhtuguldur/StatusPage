import { useEffect } from "react";
import { useState } from "react";
import { io } from 'socket.io-client';
import StatusCard from './StatusCard';
import './App.css';
function Dashboard(){
    const [websites,setWebsites]=useState([]);
    const [isAdmin,setIsAdmin]=useState(false);
    const [password,setPassword]=useState("");
    const [newName, setNewName] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newInterval, setNewInterval] = useState(60);
    const [errorMessage, setErrorMessage]=useState("");
    const [expandedCard,setExpandedCard]=useState(null);
    useEffect(()=>{
        const socket=io("http://localhost:5000");
        socket.on("statusUpdate",(data)=>{
        
        setWebsites(websites => 
            websites.map(site => 
            site.id === data.website 
            ? { ...site, status: data.status, response_time: data.responseTime }
            : site
            )
        );
        });
        return () => socket.disconnect();
    },[]);

    useEffect(()=>{
        fetchWebsites();
    },[]);

    async function handlePasswordSubmit() {
        try {
            const response=await fetch("http://localhost:5000/api/auth/validate",{
                method:"POST",
                headers:{"Content-Type": "application/json"},
                body: JSON.stringify({
                    password
                })});
            const data=await response.json();
            if(data.valid){setIsAdmin(true);
                setErrorMessage("");
            }
            else{
                setErrorMessage("Invalid password");
            }
        } catch (error) {
            setErrorMessage(error);
        }
    }

    async function handleAddWebsite() {
        try {
            const response = await fetch("http://localhost:5000/api/websites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newName,
                    url: newUrl,
                    check_interval: newInterval
                })
            });
            const data = await response.json();
            setWebsites([...websites, data]);
            setNewName('');
            setNewUrl('');
            setNewInterval(60);
            setErrorMessage("");
        } catch (error) {
            setErrorMessage("Error adding website");
        }
    }

    async function handleDelete(id) {
        try {
            await fetch(`http://localhost:5000/api/websites/${id}`, {
                method: "DELETE"
            });
            setWebsites(websites.filter(site => site.id !== id));
            setErrorMessage("");
        } catch (error) {
            setErrorMessage("Error deleting website");
        }
    }

    let fetchError;
    async function fetchWebsites() {
        try {
            const response=await fetch("http://localhost:5000/api/websites");
            const data=await response.json();
            setWebsites(data);
        } catch (error) {
            fetchError="Unexpected error";
        }
        
    }

    return(
        <div className="dashboardContainer">
            <h1 className="dashboardTitle">Status Dashboard</h1>
            {
                isAdmin&&
                <div className="adminPanel">
                    <h2>Add Website</h2>
                    <div className="formGroup">
                        <label htmlFor="nameInput">Website name:</label>
                        <input 
                            type="text" 
                            id="nameInput" 
                            value={newName} 
                            onChange={(e) => setNewName(e.target.value)}
                        />
                    </div>
                    <div className="formGroup">
                        <label htmlFor="urlInput">Website url:</label>
                        <input 
                            type="text" 
                            id="urlInput" 
                            value={newUrl} 
                            onChange={(e) => setNewUrl(e.target.value)}
                        />
                    </div>
                    <div className="formGroup">
                        <label htmlFor="intervalInput">Check interval (seconds):</label>
                        <input 
                            type="number" 
                            id="intervalInput" 
                            value={newInterval} 
                            onChange={(e) => setNewInterval(Number(e.target.value))}
                        />
                    </div>
                    <button className="btnAdd" onClick={handleAddWebsite}>Add Website</button>
                    <button className="btnLogOut" onClick={()=>(setIsAdmin(false))}>Close and log</button>
                </div>
            }
            {
                (!isAdmin)&&
                <div className="loginContainer">
                    <label htmlFor="passwordInput">Enter admin password to log in</label>
                    <input type="password" id="passwordInput" value={password} onChange={(e)=>setPassword(e.target.value)}/>
                    <button type="submit" onClick={handlePasswordSubmit}>Submit</button>
                </div>
            }
            {
                errorMessage&&
                <div className="errorMessageContainer">
                    {errorMessage}
                </div>
            }
            <div className="websitesContainer">
                {isAdmin && websites.length > 0 && <h2 className="websitesTitle">Monitored Websites</h2>}
                {websites.map(website=>(
                    <StatusCard 
                        key={website.id} 
                        website={website} 
                        isAdmin={isAdmin}
                        onDelete={handleDelete}
                        isExpanded={expandedCard === website.id}
                        onToggleExpand={(id) => setExpandedCard(expandedCard === id ? null : id)}
                    />
                ))}
            </div>
            {
                fetchError && <div>fetchError</div>
            }
        </div>
    )

}
export default Dashboard;