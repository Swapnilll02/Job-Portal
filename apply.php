<?php
include 'db.php';
session_start();
$user_id = $_SESSION['user_id'];
$job_id = $_POST['job_id'];
$resume = $_FILES['resume']['name'];
move_uploaded_file($_FILES['resume']['tmp_name'], "uploads/".$resume);
$sql = "INSERT INTO applications (job_id, user_id, resume, status) VALUES ($job_id, $user_id, '$resume', 'Applied')";
if (mysqli_query($conn, $sql)) {
    header("Location: jobs.php");
} else {
    echo "Application failed.";
}
header("Location: jobs.php?applied=1");
exit();
?>
