import express from "express";
import dotenv from 'dotenv';
import {Pool} from "pg";
import cors from "cors";

dotenv.config();

const app=express();
const PORT = 5000;

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

app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`);
})

// pool.query("SELECT NOW()").then(res=>console.log(res));

