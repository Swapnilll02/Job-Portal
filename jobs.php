<?php
session_start();
include 'db.php';

// Redirect to login if not logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: index.html");
    exit();
}

$user_id = $_SESSION['user_id'];
$role = $_SESSION['role'];

?>
<!DOCTYPE html>
<html>
<head>
    <title>Job Listings - Job Portal</title>
    <link rel="stylesheet" href="listing.css">
    <script src="listing.js" defer></script>

</head>
<body>

<h2>Job Listings</h2>

<?php
// If employer, show link to post new job
if ($role === 'employer') {
    echo '<p><a href="postjob.html">Post a New Job</a></p>';
}

// Fetch all jobs from database
$sql = "SELECT * FROM jobs ORDER BY deadline ASC";
$result = mysqli_query($conn, $sql);

if (!$result) {
    die("Database query failed: " . mysqli_error($conn));
}

// Check if any jobs found
if (mysqli_num_rows($result) > 0) {
    // Loop through jobs and display
    while ($job = mysqli_fetch_assoc($result)) {
        echo "<div>";
        echo "<h3>" . htmlspecialchars($job['job_title']) . "</h3>";
        echo "<p>" . nl2br(htmlspecialchars($job['job_desc'])) . "</p>";
        echo "<p><strong>Location:</strong> " . htmlspecialchars($job['location']) . "</p>";
        echo "<p><strong>Salary:</strong> $" . htmlspecialchars($job['salary']) . "</p>";
        echo "<p><strong>Apply Before:</strong> " . htmlspecialchars($job['deadline']) . "</p>";

        // If logged-in user is a jobseeker, show apply form
        if ($role === 'jobseeker') {
            echo '<form action="apply.php" method="POST" enctype="multipart/form-data">';
            echo '<input type="hidden" name="job_id" value="' . $job['job_id'] . '">';
            echo '<input type="file" name="resume" accept=".pdf,.doc,.docx" required>';
            echo '<button type="submit">Apply</button>';
            echo '</form>';
        }
        echo "</div><hr>";
    }
} else {
    echo "<p>No jobs posted yet.</p>";
}

?>

<p><a href="logout.php">Logout</a></p>

</body>
</html>
