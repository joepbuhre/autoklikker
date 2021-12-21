<?php
$env = file_get_contents(".env");
$env = explode("\n", $env);
foreach ($env as $en) {
    $vars = explode("=", $en);
    $_ENV[trim($vars[0])] = trim($vars[1]);
}


?>
<?php
$servername = $_ENV['DB_HOST'];
$username = $_ENV['DB_USER'];
$password = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_DATABASE'];
try {
    $conn = new PDO("mysql:host=localhost:3306;dbname=$dbname", $username, '8yD1_vs6');
    // set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}

$query = $conn->query("SELECT id,urls,count,created_at,bg_image FROM data WHERE count > 0 ORDER BY created_at DESC");
$res = $query->fetchAll();

$last_updated = $conn->query("SELECT created_at,message FROM `data` ORDER BY created_at DESC LIMIT 1;")->fetch();

function date_formatted(string $date, string $format = null)
{
    if ($format === null) {
        $format = 'd F Y H:i:s';
    }
    $time = strtotime($date);
    return date($format, $time);
}

?>
<!DOCTYPE html>
<html>

<head>
    <title>Autoklikker voor Klikvoorwonen</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link id="The Stylesheet" rel="stylesheet" href="css/style.css">
    <link id="bootstrap" rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css">
    <script id="jQuery" src="//code.jquery.com/jquery-3.5.1.min.js"></script>
    <style>
        h6 {
            font-style: italic;
            color: grey
        }

        section img {
            width: 100%;
            height: 250px;
            object-fit: cover;
            object-position: center;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="row">
            <div class="col">
                <h1>Bekijk hieronder op welke huizen je hebt geklikt</h1>
                <p>Laatste update: <span class="lead"><?php echo date_formatted($last_updated['created_at']) ?></span></p>
            </div>
        </div>
        <div class="row g-4">
            <?php foreach ($res as $result) : ?>

                <section class="col-sm-4">
                    <div data-id="<?php echo $result['id'] ?>" class="card">
                        <div class="card-header">
                            <h5>Op <?php echo $result['count'] ?> <?php echo ((int)$result['count'] === 1) ? 'huis' : 'huizen' ?> gereageerd.</h5>
                        </div>
                        <div class="card-body">
                            <ul>
                                <?php foreach (json_decode($result['urls'], true) as $url) :  ?>
                                    <li><a target="_blank" href="<?php echo $url ?>"><?php echo $url; ?></a></li>
                                <?php endforeach ?>
                            </ul>
                        </div>
                        <div class="img-container row">
                            <?php foreach (json_decode($result['bg_image'], true) as $key => $image) :?>
                                <div class="col">
                                    <a href="<?php echo $image ?>" class="js-smartphoto" data-group="'<?php echo $result['id'] ?>" data-caption="<?php echo $image ?>">
                                        <img src="<?php echo $image ?>" alt="">
                                    </a>
                                </div>
                            <?php endforeach ?>
                        </div>
                        <div class="card-footer text-muted">
                            Datum: <?php echo date_formatted($result['created_at'], "d-m-Y H:i") ?>
                        </div>

                    </div>
                </section>
            <?php endforeach ?>

        </div>
    </div>
    <footer>
        <script src="https://unpkg.com/smartphoto@1.1.0/js/smartphoto.min.js"></script>
        <link rel="stylesheet" href="https://unpkg.com/smartphoto@1.1.0/css/smartphoto.min.css" />
        <script src="js/script.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/js/bootstrap.bundle.min.js"></script>
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                new SmartPhoto(".js-smartphoto");
            });
        </script>
    </footer>
</body>

</html>