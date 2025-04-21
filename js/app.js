import TOKEN from './config.js'
let searchParams = new URLSearchParams({
	key: TOKEN,
	q: 'auto:ip'
})
let data = await getData('https://api.weatherapi.com/v1/ip.json?', searchParams);
document.getElementById('location').innerHTML = `Location: ${data.city}, ${data.region}, ${data.country_name}`;

document.getElementById("getWeather").addEventListener("click", async function(event) {
	event.preventDefault();
	// navigator.vibrate(20);
	const city = document.getElementById("city").value;
	const weatherApiBaseUrl = `https://api.weatherapi.com/v1/current.json?`;
	const weatherApiIpUrl = `https://api.weatherapi.com/v1/ip.json?`;
	const wttr = `https://wttr.in/${city}?format=v2`
	let weatherData;
	if (city === "") {
		let searchParams = new URLSearchParams({
			key: TOKEN,
			q: 'auto:ip',
		})
		let locationData = await getData(weatherApiIpUrl, searchParams);
		searchParams['q'] = locationData.city + locationData.region;
		searchParams.append('aqi', 'yes');
		weatherData = await getData(weatherApiBaseUrl, searchParams);
		displayWeather(weatherData);
		document.getElementById("weatherapi-weather-widget-3").style.display  = 'block';
	} else {
		let searchParams = new URLSearchParams({
			key: TOKEN,
			q: city,
			aqi: 'yes'
		})
		weatherData = await getData(weatherApiBaseUrl, searchParams);
		try {
			displayWeather(weatherData);
		} catch (error) {
			displayError("Not a proper city name")
		}
		document.getElementById("weatherapi-weather-widget-3").style.display  = 'none';
	}

	document.getElementById('location').innerHTML = `Location: ${weatherData.location.name}, ${weatherData.location.region}, ${weatherData.location.country}`;
	// let img;
	// fetch(wttr)
	// 	.then(response => response.text())
	// 	.then(html => {
	// 		const parser = new DOMParser();
	// 		const doc = parser.parseFromString(html, 'text/html');
	// 		const images = doc.querySelector('img');
	// 		img = 'https://wttr.in/' + images.src.split("/")[3];
	// 		console.log(img);
	// 		document.getElementById('weather-map').src = img;
	// 	})
	// 	.catch(error => console.error('Error fetching HTML:', error));
});

async function getData(baseUrl, searchParams) {
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
		displayError('Error: ' + error);
		return null;
	}
}

async function displayWeather(data) {
	document.getElementById("errorMessage").textContent = "";
	// console.log(data);

	const weatherDetails = document.getElementById("weather-details");
	const cards = document.getElementsByClassName('weather-card');
	const rows = document.getElementsByClassName('row');
	weatherDetails.style.display = "flex";

	for (const card of cards) {
		card.style.display = "flex";
	}

	for (const row of rows) {
		row.style.display = "flex";
	}

	document.querySelector('#wind .value').textContent = `${data.current.wind_kph} km/h`;
	document.querySelector('#wind .unit').textContent = `From ${data.current.wind_dir}`;
	console.log(data.current.wind_dir);

	document.querySelector('#humidity .value').textContent = `${data.current.humidity}%`;
	document.querySelector('#humidity .unit').textContent = `Dewpoint: ${data.current.dewpoint_c} C`;

	document.querySelector('#pollution .value').textContent = `${data.current.air_quality['gb-defra-index']}%`;
	updatePollutionMeter(data.current.air_quality['gb-defra-index']);
	document.querySelector('#pollution .unit').textContent = `Dewpoint: ${data.current.dewpoint_c} C`;

	document.querySelector('#pressure .value').textContent = `${data.current.pressure_in}`;
	document.querySelector('#pressure .unit').textContent = `inches`;

	document.querySelector('#uv .value').textContent = `${data.current.uv}`;
	// document.querySelector('#uv .unit').textContent = `inches`;


	let astronomyData = await getData('http://api.weatherapi.com/v1/astronomy.json?', new URLSearchParams({
		key: TOKEN,
		q: 'auto:ip'
	}))
	document.querySelector('#sunrise-sunset .value').textContent = `Sunrise: ${astronomyData.astronomy.astro.sunrise}\nSunset: ${astronomyData.astronomy.astro.sunset}`;
	// document.querySelector('#sunrise-sunset .unit').textContent = `inches`;
	console.log(astronomyData);

	// document.getElementById("humidity").innerHTML = `Humidity: ${data.current.humidity}%`;

	// document.getElementById("weatherTitle").textContent = `Current weather for ${data.location.name}, ${data.location.region}, ${data.location.country}: `;
	// document.getElementById("conditionText").textContent = `Condition: ${data.current.condition.text}`;
	// document.getElementById("conditionImage").src = data.current.condition.icon;
	// document.getElementById("temperature").innerHTML = `Temperature: ${data.current.temp_c}°C. Feels like ${data.current.feelslike_c}°C`;
	// document.getElementById("aqi").innerHTML = `US EPA index: ${data.current.air_quality['us-epa-index']}`;
	// console.log(data.current.air_quality['us-epa-index'])
	// document.getElementById("humidity").innerHTML = `Humidity: ${data.current.humidity}%`;
	// var time = new Date();
	// time.setUTCMilliseconds(data.current.last_updated_epoch);
	// document.getElementById("time").innerHTML = `Last updated: ${time.toLocaleTimeString()}`
	// document.getElementById("wind").textContent = `Wind: ${data.current.wind_kph} km/h ${data.current.wind_dir}`;
	// document.getElementById("visibility").textContent = `Visibility: ${data.current.vis_km} km`;
	// document.getElementById("pressure").textContent = `Pressure: ${data.current.pressure_in} inches`;
}

function displayError(message) {
	document.getElementById("errorMessage").textContent = message;
	document.getElementById("weather-details").style.display = "none";
}

function updatePollutionMeter(aqiValue) {
	// AQI scale typically goes from 0-500
	// 0-50: Good (green)
	// 51-100: Moderate (yellow)
	// 101-150: Unhealthy for Sensitive Groups (orange)
	// 151-200: Unhealthy (red)
	// 201-300: Very Unhealthy (purple)
	// 301-500: Hazardous (maroon)

	const maxAQI = 10;
	const percentage = (aqiValue / maxAQI) * 100;

	const indicator = document.querySelector('.meter-indicator');
	if (indicator) {
		indicator.style.left = `${percentage}%`;
	}

	// Update text values
	const valueElement = document.querySelector('#pollution .value');
	const unitElement = document.querySelector('#pollution .unit');

	if (valueElement) {
		valueElement.textContent = aqiValue;
	}

	if (unitElement) {
		// Set appropriate description based on AQI value
		if (aqiValue <= 3) {
			unitElement.textContent = 'Good';
			unitElement.style.color = '#1ed01e';
		} else if (3 < aqiValue <= 6) {
			unitElement.textContent = 'Moderate';
			unitElement.style.color = '#ffff00';
		} else if (6 < aqiValue <= 9) {
			unitElement.textContent = 'High';
			unitElement.style.color = '#ffc000';
		} else if (aqiValue <= 10) {
			unitElement.textContent = 'Very high';
			unitElement.style.color = '#7030a0';
		}
	}
}