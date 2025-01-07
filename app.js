document.getElementById("getWeather").addEventListener("click", function() {
    const city = document.getElementById("city").value;
    if (city === "") {
        displayError("Please enter a city name.");
        return;
    }

    const apiKey = 'YOUR_API_KEY'; // Get an API key from OpenWeatherMap or another service
    // const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const url = `https://wttr.in/${city}?format=j1`

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === "404") {
                displayError("City not found. Please try again.");
            } else {
                displayWeather(data);
                console.log(data.current_condition[0].FeelsLikeC);
            }
        })
        .catch(error => {
            displayError("Error fetching the weather data.");
            console.log(error);
        });
});

function displayWeather(data) {
    // Hide the error message, if any
    document.getElementById("errorMessage").textContent = "";

    // Display the weather details
    document.getElementById("weatherDetails").style.display = "block";
    // document.getElementById("cityName").textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById("temperature").innerHTML = `Temperature: ${data.current_condition[0].FeelsLikeC}°C`;
    document.getElementById("humidity").innerHTML = `Humidity: ${data.current_condition[0].humidity}%`;
    document.getElementById("windSpeed").textContent = `Wind Speed: ${data.current_condition[0].windspeedKmph} m/s`;
}

function displayError(message) {
    // Show the error message
    document.getElementById("errorMessage").textContent = message;
    document.getElementById("weatherDetails").style.display = "none";
}
