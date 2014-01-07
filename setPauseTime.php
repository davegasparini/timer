 <?php
$pauseTime = $_POST['pauseTime']."";
$updatePauseTimeQuery = "UPDATE simulation SET PauseTime='" . $pauseTime . "' WHERE ID='1'";
// Update db.
include 'sqlConnect.php';
mysqli_query($con, $updatePauseTimeQuery);
 ?>