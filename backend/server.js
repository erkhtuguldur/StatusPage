import express from "express";
import dotenv from 'dotenv';
import {Pool} from "pg";
import cors from "cors";
import axios from "axios";
import cron from "node-cron";
import {createServer} from "http";
import {Server} from "socket.io";
import { timeStamp } from "console";

dotenv.config();

const app=express();
const PORT = 5000;
const httpServer=createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
httpServer.listen(5000);

const pool=new Pool({
    host:process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});


app.use(cors());
app.use(express.json());


app.get("/api/websites",async (req,res)=>{
    try {
        const result= await pool.query(`select * from websites 
                                        left join lateral (
                                            select * 
                                            from checks 
                                            where website_id=websites.id
                                            order by checked_at desc
                                            limit 1
                                        ) as c on true
                                        order by websites.id`);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({error:"Server error"});
    }   
})

app.post("/api/websites",async (req,res)=>{
    try {
        const {name,url,check_interval}=req.body;
        const queryText="insert into websites (name, url,check_interval) values ($1,$2,$3) returning *;";
        const result=await pool.query(queryText,[name,url,check_interval||60]);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({error:"Server error"});
    }
})

app.delete("/api/websites/:id",async(req,res)=>{
    try {
        const {id}=req.params;
        const queryText="delete from websites where id=$1";
        await pool.query(queryText,[id]);
        res.json({message:"Website deleted"});
    } catch (error) {
        res.status(500).json({error:"Server error"});
    }
});

app.get("/api/websites/:id/uptime",async (req,res)=>{
    try {
        const {id}=req.params;
        const queryText=`select 
                            count(*) as total_checks,
                            sum(case when status='up' THEN 1 ELSE 0 END) as up_checks
                         from checks 
                         where website_id=$1 and checked_at>now()-interval '24 hours'`;
        const result=await pool.query(queryText,[id]);
        const totalChecks=result.rows[0].total_checks;
        const upChecks=result.rows[0].up_checks;
        let upPercent= totalChecks===0 ? 0: (upChecks/totalChecks)*100;
        res.json({uptime:upPercent,totalChecks,upChecks});
    } catch (error) {
        res.status(500).json({error:"Server error"});
    }
})

async function checkWebsite(website) {
    const startTime=Date.now();
    try {
        const result= await axios.get(website.url,{
            timeout:10000,
            validateStatus:(status) => status < 500 
        });
        const queryText="insert into checks (website_id,status,response_time,status_code,error_message) values ($1,$2,$3,$4,$5)";
        const responseTime=Date.now()-startTime;
        const websiteStatus=(result.status>=200 &&result.status<=399) ? "up" : "down";
        console.log(`success ${website.name}: ${websiteStatus} (${responseTime}ms)`);
        await pool.query(queryText,[website.id,websiteStatus,responseTime,result.status,null]);

        io.emit("statusUpdate",{
            website:website.id,
            status:websiteStatus,
            responseTime:responseTime,
            statusCode:result.status,
            timeStamp:new Date()
        });

    } catch (error) {
        const responseTime=Date.now()-startTime;
        const queryText="insert into checks (website_id,status,response_time,status_code,error_message) values ($1,$2,$3,$4,$5)";
        console.log(`error ${website.name}: down (${error.message})`);
        await pool.query(queryText,[website.id,"down",responseTime,null,error.message]);
        io.emit("statusUpdate",{
            website:website.id,
            status:"down",
            responseTime:responseTime,
            statusCode:null,
            error:error.message,
            timeStamp:new Date()
        });
    }
    
}

async function checkAllWebsites() {
    try {
        const websites=await pool.query("select * from websites");
        console.log("Starting checks");
        const websitePromises=[];
        for(let website of websites.rows){
            websitePromises.push(checkWebsite({url:website.url,id:website.id,name:website.name,checkInterval:website.check_interval,createdAt:website.created_at }));
        }
        await Promise.all(websitePromises);
        
    } catch (error) {
        console.error("Error checking websites:", error);
    }
    
}

cron.schedule('* * * * *',()=>{
    checkAllWebsites();
})



httpServer.listen(PORT, ()=>{
    checkAllWebsites();
    console.log(`Server running on http://localhost:${PORT}`);
})

// pool.query("SELECT NOW()").then(res=>console.log(res));

