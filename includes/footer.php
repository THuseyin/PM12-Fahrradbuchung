<?php
function renderFooter() {
    // Define style variables
    $backgroundColor = "#222";
    $textColor = "#fff";
    $linkColor = "#f0f0f0";
    $hoverLinkColor = "#00bcd4"; // Color when link is hovered
    $fontFamily = "Arial, sans-serif";

    echo '
    <footer style="background-color: ' . $backgroundColor . '; color: ' . $textColor . '; padding: 20px 0; text-align: center; font-family: ' . $fontFamily . ';">
        <div style="max-width: 1200px; margin: 0 auto; padding: 10px;">
            <!-- Navigation Links -->
            <div style="margin-bottom: 15px;">
                <a href="/about.php" style="color: ' . $linkColor . '; margin: 0 15px; text-decoration: none; font-size: 14px; transition: color 0.3s ease;">About Us</a>
                <a href="/services.php" style="color: ' . $linkColor . '; margin: 0 15px; text-decoration: none; font-size: 14px; transition: color 0.3s ease;">Services</a>
                <a href="/contact.php" style="color: ' . $linkColor . '; margin: 0 15px; text-decoration: none; font-size: 14px; transition: color 0.3s ease;">Contact</a>
                <a href="/privacy.php" style="color: ' . $linkColor . '; margin: 0 15px; text-decoration: none; font-size: 14px; transition: color 0.3s ease;">Privacy Policy</a>
            </div>

            <!-- Social Media Links -->
            <div style="margin-bottom: 15px;">
                <a href="https://facebook.com" target="_blank" style="color: ' . $linkColor . '; margin: 0 10px; text-decoration: none; font-size: 18px; transition: color 0.3s ease;">
                    <i class="fab fa-facebook" style="font-size: 24px;"></i>
                </a>
                <a href="https://twitter.com" target="_blank" style="color: ' . $linkColor . '; margin: 0 10px; text-decoration: none; font-size: 18px; transition: color 0.3s ease;">
                    <i class="fab fa-twitter" style="font-size: 24px;"></i>
                </a>
                <a href="https://instagram.com" target="_blank" style="color: ' . $linkColor . '; margin: 0 10px; text-decoration: none; font-size: 18px; transition: color 0.3s ease;">
                    <i class="fab fa-instagram" style="font-size: 24px;"></i>
                </a>
                <a href="https://linkedin.com" target="_blank" style="color: ' . $linkColor . '; margin: 0 10px; text-decoration: none; font-size: 18px; transition: color 0.3s ease;">
                    <i class="fab fa-linkedin" style="font-size: 24px;"></i>
                </a>
            </div>

            <!-- Copyright Section -->
            <div style="font-size: 13px; color: #aaa;">
                &copy; ' . date("Y") . ' Call a Bike. All rights reserved.
            </div>
        </div>
    </footer>

    <script src="https://kit.fontawesome.com/a076d05399.js"></script>';
}
?>
