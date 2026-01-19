import express from "express";
import dotenv from 'dotenv';

dotenv.config();

const app=express();
const PORT = 5000;

app.listen(PORT, ()=>{
    console.log(`Server running on hhtp://localhost:${PORT}`);
})