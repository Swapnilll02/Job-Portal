<?php
include 'db.php';
session_start();
$employer_id = $_SESSION['user_id'];
$job_title = $_POST['job_title'];
$job_desc = $_POST['job_desc'];
$location = $_POST['location'];
$salary = $_POST['salary'];
$deadline = $_POST['deadline'];
$sql = "INSERT INTO jobs (employer_id, job_title, job_desc, location, salary, deadline) VALUES ($employer_id, '$job_title', '$job_desc', '$location', $salary, '$deadline')";
if (mysqli_query($conn, $sql)) {
    header("Location: jobs.php");
} else {
    echo "Job posting failed.";
}
?>
