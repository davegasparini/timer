 <?php
$gameState = $_POST['gameState']."";
$updateGameStateQuery = "UPDATE simulation SET State=" . $gameState . " WHERE ID='1' ";

// update
include 'sqlConnect.php';
mysqli_query($con, $updateGameStateQuery);
 ?>