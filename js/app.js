import TOKEN from './config.js'
let searchParams = new URLSearchParams({
	key: TOKEN,
	q: 'auto:ip'
})
let currentLocation = await getData('https://api.weatherapi.com/v1/ip.json?', searchParams);

document.getElementById('location').innerHTML = `Location: ${currentLocation.city}, ${currentLocation.region}, ${currentLocation.country_name}`;

document.getElementById("getWeather").addEventListener("click", async function(event) {
	event.preventDefault();
	// navigator.vibrate(20);
	const city = document.getElementById("city").value;
	const weatherApiBaseUrl = `https://api.weatherapi.com/v1/current.json?`;
	const weatherApiIpUrl = `https://api.weatherapi.com/v1/ip.json?`;
	const wttr = `https://wttr.in/${city}?format=v2`
	let weatherData;
	if (city == "") {
		let currentLocation = await getData(weatherApiIpUrl, searchParams);
		searchParams['q'] = currentLocation.city + currentLocation.region;
		updateForecastTable(currentLocation.city + currentLocation.region);
		searchParams.append('aqi', 'yes');
		weatherData = await getData(weatherApiBaseUrl, searchParams);
		displayWeather(weatherData);
		document.getElementById('location').innerHTML = `Current location: ${weatherData.location.name}, ${weatherData.location.region}, ${weatherData.location.country}`;
	} else {
		updateForecastTable(city);
		let searchParams = new URLSearchParams({
			key: TOKEN,
			q: city,
			aqi: 'yes'
		})
		weatherData = await getData(weatherApiBaseUrl, searchParams);
		try {
			displayWeather(weatherData);
			document.getElementById('location').innerHTML = `Location: ${weatherData.location.name}, ${weatherData.location.region}, ${weatherData.location.country}`;
		} catch (error) {
			displayError("Not a proper city name");
			document.getElementById('location').innerHTML = `Current location: ${weatherData.location.name}, ${weatherData.location.region}, ${weatherData.location.country}`;
		}
	}
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
		displayError(error);
		return null;
	}
}

async function displayWeather(data) {
	document.getElementById("errorMessage").textContent = "";

	const weatherDetails = document.getElementById("weather-details");
	const cards = document.getElementsByClassName('weather-card');
	const rows = document.getElementsByClassName('row');
	weatherDetails.style.display = "flex";
	document.getElementById('big-weather-card').style.display = 'flex';

	for (const card of cards) {
		card.style.display = "flex";
	}

	for (const row of rows) {
		row.style.display = "flex";
	}

	document.querySelector('#wind .value').textContent = `${data.current.wind_kph} km/h`;
	document.querySelector('#wind .unit').textContent = `From ${data.current.wind_dir}`;

	document.querySelector('#humidity .value').textContent = `${data.current.humidity}%`;
	document.querySelector('#humidity .unit').textContent = `Dewpoint: ${data.current.dewpoint_c} C`;
	console.log(data);

	document.querySelector('#pollution .value').textContent = `${data.current.air_quality['gb-defra-index']}%`;
	updatePollutionMeter(data.current.air_quality['gb-defra-index']);

	document.querySelector('#pressure .value').textContent = `${data.current.pressure_in}`;
	document.querySelector('#pressure .unit').textContent = `inches`;

	document.querySelector('#uv .value').textContent = `${data.current.uv}`;
	// document.querySelector('#uv .unit').textContent = `inches`;

	document.querySelector('#big-weather-card #condition').textContent = `${data.current.condition.text}`;
	document.querySelector('#big-weather-card #temperature').textContent = `${data.current.temp_c}° C`;
	document.querySelector('#big-weather-card #feels-like').textContent = `Feels like ${data.current.feelslike_c}° C`;
	document.querySelector('#big-weather-card #weather-icon').src = data.current.condition.icon;

	let astronomyData = await getData('https://api.weatherapi.com/v1/astronomy.json?', new URLSearchParams({
		key: TOKEN,
		q: 'auto:ip'
	}))
	document.querySelector('#sunrise-sunset .value').textContent = `Sunrise: ${astronomyData.astronomy.astro.sunrise}\nSunset: ${astronomyData.astronomy.astro.sunset}`;
}

function displayError(message) {
	document.getElementById("errorMessage").style.display = "block";
	document.getElementById("errorMessage").textContent = message;
	document.getElementById("weather-details").style.display = "none";
	document.getElementById("forecast").style.display = "none";
}

function updatePollutionMeter(aqiValue) {
	const indicator = document.getElementById('pollution-meter');
	// if (indicator) {
	// 	indicator.style.left = `${percentage}%`;
	// }
	indicator.value = aqiValue;

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
		} else if (aqiValue <= 6) {
			unitElement.textContent = 'Moderate';
			unitElement.style.color = '#ffff00';
		} else if (aqiValue <= 9) {
			unitElement.textContent = 'High';
			unitElement.style.color = '#ffc000';
		} else if (aqiValue <= 10) {
			unitElement.textContent = 'Very high';
			unitElement.style.color = '#7030a0';
		}
	}
}

async function updateForecastTable(location) {
	// Fetch 10-day forecast data
	const forecastApiUrl = `https://api.weatherapi.com/v1/forecast.json?`;
	let searchParams = new URLSearchParams({
		key: TOKEN,
		q: location,
		days: 3,
		aqi: 'yes'
	});

	try {
		const forecastData = await getData(forecastApiUrl, searchParams);
		if (!forecastData || !forecastData.forecast || !forecastData.forecast.forecastday) {
			console.error("Invalid forecast data received");
			return;
		}

		const forecast = forecastData.forecast.forecastday;

		// Get all table rows
		document.getElementById('forecast').style.display = 'table';
		const tableRows = document.querySelectorAll('table tr');
		if (tableRows.length < 2) return; // Ensure table exists

		// Update the header row with correct dates
		const headerRow = tableRows[0];
		const headerCells = headerRow.querySelectorAll('th');

		// Skip the first header cell (it's the label column)
		for (let i = 1; i < headerCells.length && i <= forecast.length; i++) {
			const date = new Date(forecast[i-1].date);
			const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });

			// Keep "Today" and "Tomorrow" for first two columns if applicable
			if (i === 1) {
				headerCells[i].innerHTML = 'Today';
			} else if (i === 2) {
				headerCells[i].innerHTML = 'Tomorrow';
			} else {
				headerCells[i].innerHTML = dayOfWeek;
			}
		}

		// Update weather icons
		const weatherRow = tableRows[1];
		const weatherCells = weatherRow.querySelectorAll('td');

		for (let i = 1; i < weatherCells.length && i <= forecast.length; i++) {
			const condition = forecast[i-1].day.condition;
			weatherCells[i].innerHTML = `<img src="${condition.icon}" alt="${condition.text}" title="${condition.text}" width="28" height="28">`;
		}

		// Update max temperature
		const maxTempRow = tableRows[2];
		const maxTempCells = maxTempRow.querySelectorAll('td');
		for (let i = 1; i < maxTempCells.length && i <= forecast.length; i++) {
			const maxTemp = forecast[i-1].day.maxtemp_f;
			maxTempCells[i].textContent = `${maxTemp.toFixed(1)}°f`;

			// Apply styling based on temperature
			if (maxTemp >= 95) {
				maxTempCells[i].className = 'max-temp';
			} else {
				maxTempCells[i].className = 'high-temp';
			}
		}

		// Update min temperature
		const minTempRow = tableRows[3];
		const minTempCells = minTempRow.querySelectorAll('td');
		for (let i = 1; i < minTempCells.length && i <= forecast.length; i++) {
			const minTemp = forecast[i-1].day.mintemp_f;
			minTempCells[i].textContent = `${minTemp.toFixed(1)}°f`;
			minTempCells[i].className = 'min-temp';
		}

		// Update wind
		const windRow = tableRows[4];
		const windCells = windRow.querySelectorAll('td');
		for (let i = 1; i < windCells.length && i <= forecast.length; i++) {
			const maxWind = forecast[i-1].day.maxwind_mph;
			windCells[i].textContent = `${maxWind.toFixed(1)} mph`;
			windCells[i].className = 'wind-row';
		}

		// Update precipitation
		const precipRow = tableRows[5];
		const precipCells = precipRow.querySelectorAll('td');
		for (let i = 1; i < precipCells.length && i <= forecast.length; i++) {
			const precip = forecast[i-1].day.totalprecip_in;
			precipCells[i].textContent = `${precip.toFixed(2)} in`;
		}

		// Update humidity
		const humidityRow = tableRows[6];
		const humidityCells = humidityRow.querySelectorAll('td');
		for (let i = 1; i < humidityCells.length && i <= forecast.length; i++) {
			const humidity = forecast[i-1].day.avghumidity;
			humidityCells[i].textContent = `${Math.round(humidity)}%`;
		}

		// Update sunrise and sunset
		const sunriseRow = tableRows[7];
		const sunriseCells = sunriseRow.querySelectorAll('td');
		const sunsetRow = tableRows[8];
		const sunsetCells = sunsetRow.querySelectorAll('td');

		for (let i = 1; i < sunriseCells.length && i <= forecast.length; i++) {
			const sunrise = forecast[i-1].astro.sunrise;
			const sunset = forecast[i-1].astro.sunset;
			sunriseCells[i].textContent = sunrise;
			sunsetCells[i].textContent = sunset;
		}

		// Update UV
		const uvRow = tableRows[9];
		const uvCells = uvRow.querySelectorAll('td');
		for (let i = 1; i < uvCells.length && i <= forecast.length; i++) {
			const uv = forecast[i-1].day.uv;
			uvCells[i].textContent = uv;
		}

	} catch (error) {
		displayError("Not a proper city name");
	}
}