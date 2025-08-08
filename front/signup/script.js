$(document).ready(function () {
    // Initialize alert box
    const alertBox = $("#alertBox");
    
    // Show alert function
    function showAlert(type, message) {
        alertBox.removeClass("success error").addClass(type).text(message).fadeIn();
        setTimeout(() => {
            alertBox.fadeOut();
        }, 5000);
    }

    // Toggle between login and signup forms
    $(".switchButtonOuter").on("click", function () {
        const form = $(this).parents(".loginOrSignupField");
        form.toggleClass("signup_ON");

        setTimeout(function () {
            // Update button text
            if (form.hasClass("signup_ON")) {
                $("#submit").val("Sign up");
                $("#rememberMeField").hide();
            } else {
                $("#submit").val("Login");
                $("#rememberMeField").show();
            }

            // Shake animation
            $("#email, #submit, .socialButton.twitter")
                .animate({"left": "-10px"}, 50)
                .animate({"left": "10px"}, 50)
                .animate({"left": "-5px"}, 50)
                .animate({"left": "5px"}, 50)
                .animate({"left": "0"}, 50);
                
            $("#password, .socialButton.facebook, .socialButton.googleplus")
                .animate({"left": "10px"}, 50)
                .animate({"left": "-10px"}, 50)
                .animate({"left": "5px"}, 50)
                .animate({"left": "-5px"}, 50)
                .animate({"left": "0"}, 50);
        }, 200);
    });

    // Form submission
    $("#authForm").on("submit", function(e) {
        e.preventDefault();
        
        const isSignup = $(".loginOrSignupField").hasClass("signup_ON");
        
        if (isSignup) {
            // Sign up validation
            if ($("#password").val() !== $("#confirmPassword").val()) {
                showAlert("error", "Passwords don't match!");
                return;
            }
            
            if ($("#password").val().length < 6) {
                showAlert("error", "Password must be at least 6 characters");
                return;
            }
            
            const userData = {
                email: $("#email").val(),
                password: $("#password").val(),
                fullName: $("#fullName").val(),
                phoneNumber: $("#phoneNumber").val(),
                position: $("input[name='position']:checked").val()
            };
            
            // Here you would make an AJAX call to your backend
            console.log("Sign up data:", userData);
            
            // Simulate successful signup
            setTimeout(() => {
                showAlert("success", "Account created successfully!");
                // Switch to login form after successful registration
                $(".switchButtonOuter").click();
            }, 1000);
            
        } else {
            // Login validation
            const loginData = {
                email: $("#email").val(),
                password: $("#password").val(),
                rememberMe: $("#rememberMe").is(":checked")
            };
            
            // Here you would make an AJAX call to your backend
            console.log("Login data:", loginData);
            
            // Simulate successful login
            setTimeout(() => {
                showAlert("success", "Login successful! Redirecting...");
                // Redirect to dashboard after login
                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 1500);
            }, 1000);
        }
    });

    // Input validation on submit hover
    $("#submit").on("mouseover", function() {
        if ($("#email").val() === "") {
            $("#email")
                .animate({"left": "-10px"}, 50)
                .animate({"left": "10px"}, 50)
                .animate({"left": "-5px"}, 50)
                .animate({"left": "5px"}, 50)
                .animate({"left": "0"}, 50);
        }
        if ($("#password").val() === "") {
            $("#password")
                .animate({"left": "10px"}, 50)
                .animate({"left": "-10px"}, 50)
                .animate({"left": "5px"}, 50)
                .animate({"left": "-5px"}, 50)
                .animate({"left": "0"}, 50);
        }
    });

    // Initial animation
    setTimeout(function () {
        $(".loginOrSignupField").css({
            "opacity": "1",
            "transform": "translateY(-50%) translateX(-50%) scale(1.008)"
        });
    }, 500);

    // Mode switching
    $(".normal, .mode01, .mode02").on("click", function () {
        if ($(this).is(".normal")) {
            $("body").removeClass("mode01_ON mode02_ON");
        } else if ($(this).is(".mode01")) {
            $("body").removeClass("mode02_ON").addClass("mode01_ON");
        } else if ($(this).is(".mode02")) {
            $("body").removeClass("mode01_ON").addClass("mode02_ON");
        }
    });
});