<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=2,12,20&height=200&section=header&text=SkillBarter&fontSize=52&fontColor=fff&fontAlignY=42&desc=A%20platform%20to%20exchange%20skills%20%E2%80%94%20teach%20what%20you%20know%2C%20learn%20what%20you%20don%27t&descAlignY=65&descSize=14&descColor=fff&animation=twinkling" width="100%"/>

<br/>

<img src="https://img.shields.io/badge/Author-Nevil%20Dhinoja-2196F3?style=for-the-badge&logo=github&logoColor=white&labelColor=0D1117"/>
<img src="https://img.shields.io/badge/Type-AWT%20College%20Project-22C55E?style=for-the-badge&labelColor=0D1117"/>
<img src="https://img.shields.io/badge/Stack-React%20%C2%B7%20Node.js%20%C2%B7%20Express%20%C2%B7%20MongoDB-FF9800?style=for-the-badge&labelColor=0D1117"/>
<img src="https://img.shields.io/badge/Type-Full%20Stack%20Web%20App-EF4444?style=for-the-badge&labelColor=0D1117"/>

</div>

---

## What It Does

SkillBarter is a full-stack web platform where users can offer skills they have and request skills they want to learn — creating a peer-to-peer skill exchange network.

No money changes hands. You teach what you know. You learn what you don't.

---

## The Problem It Solves

Online learning platforms charge money. Tutors charge money. But there are millions of people who have valuable skills and are willing to trade them for other skills they need.

SkillBarter connects those people directly.

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐    │
│  │  Browse  │  │  Profile │  │  Offers  │  │  Chat  │    │
│  │  Skills  │  │  Setup   │  │ & Matches│  │        │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘    │
└───────┼─────────────┼─────────────┼─────────────┼───────┘
        │             │  REST API   │             │
        └─────────────┴─────────────┴─────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                  Node.js + Express Backend              │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Auth Routes  │  │ Skill Routes │  │ Match Routes  │  │
│  │ JWT + bcrypt │  │ CRUD skills  │  │ Request/Accept│  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬─────── ┘  │
└─────────┼────────────────┼──────────────────┼───────────┘
          │                │                  │
          └────────────────┴──────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │       MongoDB         │
                    │  Users · Skills ·     │
                    │  Matches · Sessions   │
                    └───────────────────────┘
```

---

## Features

- **User registration + login** — JWT-based authentication
- **Skill profile** — list skills you offer and skills you want
- **Browse skills** — search and filter other users by skill
- **Match requests** — send and receive barter requests
- **Accept / decline** — manage incoming skill exchange requests
- **Session tracking** — keep track of active and completed exchanges

---

## Project Structure

```
SkillBarter/
├── SkillBarter-frontend/       # React app
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── pages/              # Route pages
│   │   ├── context/            # Auth context
│   │   └── services/           # API call functions
│   └── package.json
│
├── skillbarter-backend/        # Node.js + Express API
│   ├── routes/                 # Auth, skills, matches
│   ├── models/                 # Mongoose schemas
│   ├── middleware/             # JWT verification
│   └── server.js
│
└── package.json
```

---

## Getting Started

### Backend
```bash
cd skillbarter-backend
npm install

# Add your MongoDB URI to .env
echo "MONGO_URI=your_mongodb_connection_string" > .env
echo "JWT_SECRET=your_secret_key" >> .env

npm start
# Runs on http://localhost:5000
```

### Frontend
```bash
cd SkillBarter-frontend
npm install
npm start
# Runs on http://localhost:3000
```

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Styling | CSS |

---

## Built For

This project was built as part of my **Advanced Web Technologies (AWT)** coursework — a full-stack web application from scratch covering REST APIs, authentication, and database design.

---

<div align="center">

<br/>

<table border="0" cellspacing="0" cellpadding="0">
<tr>
<td width="180" align="center" valign="top">

<img src="https://github.com/Nevil-Dhinoja.png" width="120" style="border-radius:50%"/>

</td>
<td width="30"></td>
<td valign="middle">

<h2 align="left">Nevil Dhinoja</h2>
<p align="left"><i>AI / ML Engineer &nbsp;·&nbsp; Full-Stack Developer &nbsp;·&nbsp; Gujarat, India</i></p>
<p align="left">
I build AI systems that are practical, deployable, and free to run.<br/>
This project is part of a larger series of open-source AI tools — each one<br/>
designed to teach a real concept through a working, shippable product.
</p>

</td>
</tr>
</table>

<br/>

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Nevil%20Dhinoja-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/nevil-dhinoja)
[![GitHub](https://img.shields.io/badge/GitHub-Nevil--Dhinoja-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Nevil-Dhinoja)
[![Gmail](https://img.shields.io/badge/Email-nevil%40email.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:dhinoja.nevil@email.com)

<br/>

If this project helped you or saved you time, a star on the repo goes a long way. &nbsp;
![Views](https://komarev.com/ghpvc/?username=Nevil-Dhinoja&repo=data-analyst-agent&color=blue)

<br/>

<br/>
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=2,12,20&height=120&section=footer" width="100%"/>
