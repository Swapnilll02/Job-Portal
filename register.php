<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

include 'db.php';

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';
$role = $_POST['role'] ?? '';

if ($username && $password && $role) {
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $sql = "INSERT INTO users (username, password, role) VALUES ('$username', '$hash', '$role')";
    if (mysqli_query($conn, $sql)) {
        header("Location: index.html");
        exit();
    } else {
        echo "Registration failed: " . mysqli_error($conn);
    }
} else {
    echo "Please fill all fields.";
}
?>
