<?php
    ini_set('display_errors', 1);
    error_reporting(E_ALL);

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = trim($_POST["name"]);
    $email = filter_var($_POST["email"], FILTER_VALIDATE_EMAIL);
    $phone = trim($_POST["phone"]);
    $comments = trim($_POST["comments"]);
    $appointment = trim($_POST["appointment"]);

    $to = "amaramosespinosa@gmail.com";
    $subject = "New Contact from customer $name";
    $message = "Name: $name\nEmail: $email\nPhone: $phone\nAppointment: $appointment\n\n$comments";
    $headers = "From: amaramosespinosa@gmail.com\r\n";
    $headers .= "Reply-To: $email\r\n";

    if (mail($to, $subject, $message, $headers)) {
        echo "Thank you! Your message was sent.";
    } else {
        echo "Sorry, there was an error sending your message.";
    }
    }
?>