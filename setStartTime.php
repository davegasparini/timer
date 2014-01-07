 <?php
$startTime = $_POST['startTime']."";
$updateStartTimeQuery = "UPDATE simulation SET StartTime='" . $startTime . "' WHERE ID='1'";
// Update db.
include 'sqlConnect.php';
mysqli_query($con, $updateStartTimeQuery);
 ?>