import { useEffect } from "react";
import { useState } from "react";
import { io } from 'socket.io-client';
function Dashboard(){
    const [websites,setWebsites]=useState([]);


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
            {websites.map(website=>(
                <div key={website.id}>
                    {website.name} : {website.status||"No data"}
                </div>
            ))}
            {
                fetchError && <div>fetchError</div>
            }
        </div>
    )

}
export default Dashboard;