import TOKEN from './config.js'
document.getElementById("getWeather").addEventListener("click", async function(event) {
	event.preventDefault();
	// navigator.vibrate(20);
	const city = document.getElementById("city").value;
	const weatherApiBaseUrl = `https://api.weatherapi.com/v1/current.json?`;
	const weatherApiIpUrl = `https://api.weatherapi.com/v1/ip.json?`;
	if (city === "") {
		let searchParams = new URLSearchParams({
			key: TOKEN,
			q: 'auto:ip',
		})
		const locationData = await getWeather(weatherApiIpUrl, searchParams);
		searchParams['q'] = locationData.city + locationData.region;
		searchParams.append('aqi', 'yes');
		const weatherData = await getWeather(weatherApiBaseUrl, searchParams);
		displayWeather(weatherData);
	} else {
		let searchParams = new URLSearchParams({
			key: TOKEN,
			q: city,
			aqi: 'yes'
		})
		const weatherData = await getWeather(weatherApiBaseUrl, searchParams);
		try {
			displayWeather(weatherData);
		} catch (error) {
			displayError("Not a proper city name")
		}
	}
	const wttr = `https://wttr.in/${city}?format=v2`
	// fetch(wttr)
	// 	.then(response => response.text())
	// 	.then(html => {
	// 		const parser = new DOMParser();
	// 		const doc = parser.parseFromString(html, 'text/html');
	// 		const images = doc.querySelector('img');
	// 		img = 'https://wttr.in/' + images.src.split("/")[3];
	// 		console.log(img);
	// 	})
	// 	.catch(error => console.error('Error fetching HTML:', error));
});

async function getWeather(baseUrl, searchParams) {
	try {
		const url = new URL(baseUrl);
		url.search = new URLSearchParams(searchParams).toString();
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		return await response.json();
	} catch (error) {
		console.error("Error fetching JSON:", error);
		displayError('Not a proper city name');
		return null;
	}
}

function displayWeather(data) {
	document.getElementById("errorMessage").textContent = "";
	document.getElementById("weather-details").style.display = "block";
	document.getElementById("weatherTitle").textContent = `Current weather for ${data.location.name}, ${data.location.region}, ${data.location.country}: `;
	document.getElementById("conditionText").textContent = `Condition: ${data.current.condition.text}`;
	document.getElementById("conditionImage").src = data.current.condition.icon;
	document.getElementById("temperature").innerHTML = `Temperature: ${data.current.temp_c}°C. Feels like ${data.current.feelslike_c}°C`;
	document.getElementById("aqi").innerHTML = `US EPA index: ${data.current.air_quality['us-epa-index']}`;
	document.getElementById("humidity").innerHTML = `Humidity: ${data.current.humidity}%`;
	var time = new Date();
	time.setUTCMilliseconds(data.current.last_updated_epoch);
	document.getElementById("time").innerHTML = `Last updated: ${time.toLocaleTimeString()}`
	document.getElementById("wind").textContent = `Wind: ${data.current.wind_kph} km/h ${data.current.wind_dir}`;
	document.getElementById("visibility").textContent = `Visibility: ${data.current.vis_km} km`;
	document.getElementById("pressure").textContent = `Pressure: ${data.current.pressure_in} inches`;
}

function displayError(message) {
	document.getElementById("errorMessage").textContent = message;
	document.getElementById("weather-details").style.display = "none";
}
