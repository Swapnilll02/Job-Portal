<?php
include 'db.php';
session_start();
$username = $_POST['username'];
$password = $_POST['password'];

$sql = "SELECT * FROM users WHERE username='$username'";
$result = mysqli_query($conn, $sql);
$user = mysqli_fetch_assoc($result);
if ($user && password_verify($password, $user['password'])) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['role'] = $user['role'];
    header("Location: jobs.php");
} else {
    echo "Invalid login. <a href='index.html'>Try again</a>";
}
?>
