<?php
// setup connection to database
include 'sqlConnect.php';

// retrieve
$query = "SELECT StartTime FROM `simulation` WHERE ID=1";
$result = $con->query($query) or die($con->error.__LINE__);
$row = mysqli_fetch_array($result);

// show
$startTime = $row['StartTime'];
echo strtotime($startTime);


?>