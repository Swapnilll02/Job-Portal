# 💼 Job Portal

A full-stack **Job Portal Web Application** built with **PHP, MySQL, HTML, CSS, and JavaScript**, featuring user authentication for jobseekers and employers, job postings, resume uploads, and interactive job listings with sorting, search, and filtering.  

---

## 🚀 Features

### 👥 User Management
- Secure login and registration system (Jobseeker / Employer roles)
- Session-based authentication
- Role-based UI controls

### 💼 Employer Functionality
- Post new jobs with title, description, salary, location, and deadline  
- View all posted jobs  
- Receive applications from jobseekers

### 👨‍💻 Jobseeker Functionality
- Browse all available jobs  
- Upload resume (PDF, DOC, DOCX) and apply directly  
- See application confirmation messages on success

### 🔍 Job Listings Page
- Beautiful responsive card layout  
- Real-time search and sorting (title, location, salary, deadline)  
- Smart file validation and progress feedback  
- Clean “Apply Successfully” notifications after submission

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla JS) |
| **Backend** | PHP (Procedural) |
| **Database** | MySQL |
| **Styling** | Custom CSS, modern UI |
| **Version Control** | Git + GitHub |

---

## 🛠️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-username>/job-portal.git
cd job-portal
2️⃣ Setup the Database
Create a new MySQL database (e.g., job_portal).

Import your SQL schema file if provided:

bash
Copy code
mysql -u root -p job_portal < schema.sql
Configure your credentials inside db.php:

php
Copy code
<?php
$conn = mysqli_connect("localhost", "root", "", "job_portal");
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
?>
3️⃣ Configure the Project
Ensure your PHP environment (e.g., XAMPP, WAMP, or Laragon) is running.

Place the project folder inside the web root:

makefile
Copy code
C:\xampp\htdocs\job-portal
Visit:

arduino
Copy code
http://localhost/job-portal/

Install dependencies
bash
Copy code
pip install streamlit mysql-connector-python pandas plotly python-dotenv
Run the dashboard
bash
Copy code
cd dashboard
streamlit run streamlit_app.py
View it
Open: http://localhost:8501

To embed it inside your PHP dashboard page:

html
Copy code
<iframe src="http://localhost:8501" width="100%" height="800" style="border:0;border-radius:12px;"></iframe>

---

📁 Folder Structure
bash
Copy code
job-portal/
│
├── index.html              # Login Page
├── register.html           # Registration Page
├── jobs.php                # Job Listings (main page after login)
├── postjob.html            # Employer: Post Job
├── apply.php               # Handles job applications
├── db.php                  # Database connection (not committed)
│
├── loginandregister.js     # JS for login/register UI
├── loginandregister.css    # Styles for login/register
├── listing.js              # JS for job listings page
├── listing.css             # Styles for job listings
├── postjob.js              # JS for posting job page
├── postjob.css             # Styles for post job page
│
├── .gitignore
└── README.md

---

🔐 Security Notes
Never commit db.php or .env files (they contain credentials).

Always validate and sanitize file uploads on the backend.

Use prepared statements for database queries to prevent SQL injection.

Restrict file uploads to .pdf, .doc, .docx and limit file size.


markdown
Copy code
![Login Page](screenshots/login.png)
![Job Listings](screenshots/listings.png)

---

🤝 Contributing
Pull requests are welcome!
If you'd like to contribute:

Fork the repo

Create a new branch (feature/your-feature-name)

Commit your changes

Push to your fork and open a PR

🧑‍💻 Author
SWAPNIL KUMAR

📧 swapnilforinfo@gmail.com

🪪 License
This project is licensed under the MIT License — you’re free to use, modify, and distribute with attribution.
MIT License © 2025 Swapnil Kumar