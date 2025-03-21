import TOKEN from './config.js'
document.getElementById("getWeather").addEventListener("click", function(event) {
	event.preventDefault();
	// navigator.vibrate(20);
	const city = document.getElementById("city").value;
	if (city === "") {
		displayError("Please enter a city name.");
		return;
	}
	const url2 = `https://api.weatherapi.com/v1/current.json?`;
	const url = `https://wttr.in/${city}?format=v2`
	let img = ""
	const options = {
		method: 'GET'
	}
	fetch(url)
		.then(response => response.text())
		.then(html => {
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');
			const images = doc.querySelector('img');
			img = 'https://wttr.in/' + images.src.split("/")[3];
			console.log(img);
		})
		.catch(error => console.error('Error fetching HTML:', error));
	fetch(url2 + new URLSearchParams({
		key: TOKEN,
		q: city,
		aqi: 'yes'
	}).toString())
		.then(function(response) {
			return response.json().then(data => {
				if(!response.ok) {
					displayError(data.error.message);
					console.log(data.error.message);
					throw new Error(data.message);
				}
				return data;
			})
		})
		.then(data => {
			displayWeather(data, img);
		})
		.catch(error => {
			// displayError("Error fetching the weather data.");
			console.log(error);
		})
});

function displayWeather(data, img) {
	// Hide the error message, if any
	document.getElementById("errorMessage").textContent = "";

	// Display the weather details
	document.getElementById("weather-details").style.display = "block";
	document.getElementById("weatherTitle").textContent = `Current weather for ${data.location.name}, ${data.location.region}, ${data.location.country}: `;
	document.getElementById("conditionText").textContent = `Condition: ${data.current.condition.text}`;
	document.getElementById("conditionImage").src = img;
	document.getElementById("temperature").innerHTML = `Temperature: ${data.current.temp_c}°C. Feels like ${data.current.feelslike_c}°C`;
	document.getElementById("aqi").innerHTML = `US EPA index: ${data.current.air_quality['us-epa-index']}`;
	document.getElementById("humidity").innerHTML = `Humidity: ${data.current.humidity}%`;
	var time = new Date();
	time.setUTCMilliseconds(data.current.last_updated_epoch);
	document.getElementById("time").innerHTML = `Last updated: ${time.toLocaleTimeString()}`
	document.getElementById("wind").textContent = `Wind: ${data.current.wind_kph} km/h ${data.current.wind_dir}`;
	document.getElementById("visibility").textContent = `Visibility: ${data.current.vis_km} km`;
}

function displayError(message) {
	// Show the error message
	document.getElementById("errorMessage").textContent = message;
	document.getElementById("weather-details").style.display = "none";
}
