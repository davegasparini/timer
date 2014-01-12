 <?php
$timerState = $_POST['timerState']."";
$updateTimerStateQuery = "UPDATE simulation SET State=" . $timerState . " WHERE ID='1' ";

// update
include 'sqlConnect.php';
mysqli_query($con, $updateTimerStateQuery);
 ?>