import { useEffect } from "react";
import { useState } from "react";
import { io } from 'socket.io-client';
function Dashboard(){
    const [websites,setWebsites]=useState([]);
    const [isAdmin,setIsAdmin]=useState(false);
    const [password,setPassword]=useState("");
    const [newName, setNewName] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newInterval, setNewInterval] = useState(60);


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
            if(data.valid){setIsAdmin(true);}
            else{}
        } catch (error) {
            console.log("Invalid password")
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
        } catch (error) {
            console.log("Error adding website", error);
        }
    }

    async function handleDelete(id) {
        try {
            await fetch(`http://localhost:5000/api/websites/${id}`, {
                method: "DELETE"
            });
            setWebsites(websites.filter(site => site.id !== id));
        } catch (error) {
            console.log("Error deleting website", error);
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
        <div>
            <h1>Status dashboard</h1>
            {
                isAdmin&&
                <div>
                    <h2>Add Website</h2>
                    <div>
                        <label htmlFor="nameInput">Website name:</label>
                        <input 
                            type="text" 
                            id="nameInput" 
                            value={newName} 
                            onChange={(e) => setNewName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="urlInput">Website url:</label>
                        <input 
                            type="text" 
                            id="urlInput" 
                            value={newUrl} 
                            onChange={(e) => setNewUrl(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="intervalInput">Check interval (seconds):</label>
                        <input 
                            type="number" 
                            id="intervalInput" 
                            value={newInterval} 
                            onChange={(e) => setNewInterval(Number(e.target.value))}
                        />
                    </div>
                    <button onClick={handleAddWebsite}>Add Website</button>
                </div>
            }
            {
                (!isAdmin)&&
                <div>
                    <label htmlFor="passwordInput">Enter admin password to log in</label>
                    <input type="password" id="passwordInput" value={password} onChange={(e)=>setPassword(e.target.value)}/>
                    <button type="submit" onClick={handlePasswordSubmit}>Submit</button>
                </div>
            }
            {websites.map(website=>(
                <div key={website.id}>
                    {website.name} : {website.status||"No data"}
                    {isAdmin && <button onClick={() => handleDelete(website.id)}>Delete</button>}
                </div>
            ))}
            {
                fetchError && <div>fetchError</div>
            }
        </div>
    )

}
export default Dashboard;