# Website Status Monitoring App

A real-time uptime monitoring tool with automated health checks and live WebSocket updates.

**[Live Demo](https://statuspage-frontend.onrender.com/)** | **[GitHub](https://github.com/erkhtuguldur/StatusPage)**

## Overview

A full-stack web application that monitors website availability and performance in real-time. Features automated health checks, instant status updates via WebSocket, and uptime analytics with historical data visualization.

## Features

- **Real-time Updates** - WebSocket integration provides instant status changes without page refresh
- **Interactive Dashboard** - Expandable status cards with detailed metrics and response time charts
- **Customizable Monitoring** - Set check intervals (60-300 seconds) per website
- **Admin Panel** - Password-protected interface for managing monitored sites
- **Uptime Analytics** - 24-hour uptime percentage with historical data
- **Automated Cleanup** - Maintains rolling 24-hour data window

## Tech Stack

**Frontend:** React, Vite, Socket.IO Client, Recharts, CSS3

**Backend:** Node.js, Express, Socket.IO, PostgreSQL, node-cron, axios

**Deployment:** Render

## How It Works

1. Cron job runs every minute checking websites based on their custom intervals
2. HTTP requests sent via axios (10s timeout) to monitor availability
3. Results saved to PostgreSQL and emitted via WebSocket to all connected clients
4. Frontend receives real-time updates and displays status changes instantly
5. Historical data maintained in 24-hour rolling window with automated cleanup
---
