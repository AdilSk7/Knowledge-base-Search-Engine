
### Workflow

1. **Frontend (client)** handles user interaction, form submission, and UI rendering.  
2. **Backend (server)** manages API routes, data storage, and logic.  
3. Communication happens via RESTful APIs with JSON responses.  
4. Files can be uploaded to the server for temporary or persistent use.

---

## ✨ Features

- 📄 **File Upload System** – upload, preview, and process files through a seamless interface  
- ⚙️ **RESTful API Integration** – clean client-server communication  
- 🧭 **Modular Folder Structure** – easy to navigate and extend  
- 🌐 **Responsive UI** – modern design using React and CSS custom properties  
- 🔄 **Real-Time Interaction** – instant feedback using asynchronous requests  
- 🧹 **Environment Variables** – secure API key and configuration handling  

---

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite  
- CSS / custom styling  
- Axios (for API calls)  

### Backend
- Node.js  
- Express.js  
- Multer (for file uploads)  
- dotenv (for environment configuration)

---

## ⚡ Quick Start

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/unthinkable-demo.git
cd unthinkable-demo
```

### 2️⃣ Backend Setup
```bash
cd server
npm install
# Set environment variables (see .env.example)
npm start
```

### 3️⃣ Frontend Setup
```bash
cd client
npm install
npm run dev

```

### 📚 Usage

   - Upload PDFs via the frontend
   - Ask questions about your documents
   - View answers with references and page images
   - Reset the database as needed if need be to work with a different set of documents


## 📁 Project Structure Overview
```bash

unthinkable-demo/
│
├── server/
│   ├── src/
│   ├── uploads/
│   ├── package.json
│   └── .env.example
│
├── client/
│   ├── src/
│   ├── vite.config.js
│   └── package.json
│
└── package.json
```


### 📞 Contact

For queries or support, please reach out via issues tab or email adilshaik2004@gmail.com.
