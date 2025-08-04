// API Key
const API_KEY = "168771779c71f3d64106d8a88376808a";

// Tab Switching 
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const searchForm = document.querySelector("[data-searchForm]");
const userInfoContainer = document.querySelector(".userInfoContainer");
const grantAccessContainer = document.querySelector(
    ".grantLocationContainer"
);
const loadingContainer = document.querySelector('.loadingContainer');

const notFound = document.querySelector('.errorContainer');
const errorBtn = document.querySelector('[data-errorButton]');
const errorText = document.querySelector('[data-errorText]');
const errorImage = document.querySelector('[data-errorImg]');

let currentTab = userTab;
currentTab.classList.add("currentTab");
getFromSessionStorage();
// console.log(userTab);
// console.log(searchTab);

function switchTab(newTab) {
    notFound.classList.remove("active");
    // check if newTab is already selected or not 
    if (currentTab != newTab) {
        currentTab.classList.remove("currentTab");
        currentTab = newTab;
        currentTab.classList.add("currentTab");

        // Check which TAb is Selected - search / your

        // If Search Form not contains active class then add  [Search Weather]
        if (!searchForm.classList.contains("active")) {
            searchForm.classList.add("active");
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
        }
        // Your Weather
        else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getFromSessionStorage();
        }
    }
}

userTab.addEventListener('click', () => {
    switchTab(userTab);
});

searchTab.addEventListener('click', () => {
    switchTab(searchTab);
});


function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("userCoordinates");
    // console.log(localCoordinates);

    // Local Coordinates Not present - Grant Access Container
    if (!localCoordinates) {
        grantAccessContainer.classList.add('active');
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchWeatherInfo(coordinates);
    }
}

async function fetchWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;
    // Remove Active Class from the Grant access Container
    grantAccessContainer.classList.remove('active');

    // loading 
    loadingContainer.classList.add('active');

    // try - catch Block
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);

        const data = await response.json();
        if (!data.sys) {
            throw data;
        }
        loadingContainer.classList.remove('active');
        userInfoContainer.classList.add('active');
        renderWeatherInfo(data);
    }
    catch (err) {
        loadingContainer.classList.remove('active');
        notFound.classList.add('active');
        errorImage.style.display = 'none';
        errorText.innerText = `Error: ${err?.message}`;
        errorBtn.style.display = 'block';
        errorBtn.addEventListener("click", fetchWeatherInfo);
    }
}

// Render Weather On UI
function animateInfoItem(item) {
    item.classList.add("animate");
    setTimeout(() => {
        item.classList.remove("animate");
    }, 600); // match CSS transition time
}

function renderWeatherInfo(weatherInfo) {
    const cityName = document.querySelector('[data-cityName]');
    const countryFlag = document.querySelector('[data-countryFlag]');
    const description = document.querySelector('[data-weatherDesc]');
    const weatherIcon = document.querySelector('[data-weatherIcon]');
    const temp = document.querySelector('[data-temp]');
    
    const windspeed = document.querySelector('[data-windspeed]');
    const humidity = document.querySelector('[data-humidity]');
    const clouds = document.querySelector('[data-clouds]');

    cityName.innerText = weatherInfo?.name;cityName.classList.add("city-animate");
    countryFlag.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    description.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    // Animate temperature digits
    const rawTemp = `${weatherInfo?.main?.temp.toFixed(2)} °C`;
    temp.innerHTML = ''; // clear previous content

    let i = 0;
    for (let char of rawTemp) {
        const span = document.createElement('span');
        span.classList.add('temp-bounce');
        span.style.animationDelay = `${i * 0.1}s`;
        span.textContent = char;
        temp.appendChild(span);
        i++;
    }


    humidity.textContent = `${weatherInfo?.main?.humidity} %`;
humidity.classList.add("pulse-animate");

clouds.textContent = `${weatherInfo?.clouds?.all} %`;
clouds.classList.add("pulse-animate");

windspeed.textContent = `${weatherInfo?.wind?.speed} m/s`;
windspeed.classList.add("pulse-animate");

    [windspeed, humidity, clouds].forEach(elem => {
    elem.classList.remove('animate-data'); // reset if already there
    void elem.offsetWidth; // trigger reflow
    elem.classList.add('animate-data'); // apply animation
});

    // Animate the sections
    animateInfoItem(windspeed);
    animateInfoItem(humidity);
    animateInfoItem(clouds);
}

const grantAccessButton = document.querySelector('[data-grantAccess]');

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        grantAccessButton.style.display = 'none';
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    };
    sessionStorage.setItem("userCoordinates", JSON.stringify(userCoordinates));
    fetchWeatherInfo(userCoordinates);
}

grantAccessButton.addEventListener('click', getLocation);


// Search for weather
const searchInput = document.querySelector('[data-searchInput]');

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (searchInput.value === "") {
        return;
    }
    // console.log(searchInput.value);
    fetchSearchWeatherInfo(searchInput.value);
    searchInput.value = "";
});


async function fetchSearchWeatherInfo(city) {
    loadingContainer.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    notFound.classList.remove("active");
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);

        const data = await response.json();
        if (!data.sys) {
            throw data;
        }
        loadingContainer.classList.remove('active');
        userInfoContainer.classList.add('active');
        renderWeatherInfo(data);
        setBackgroundImage(city);

    }
    catch (err) {
    loadingContainer.classList.remove('active');
    userInfoContainer.classList.remove('active');
    notFound.classList.add('active');

    // Error text message
    errorText.innerText = `The city you are looking for: "${city}" is not found, we are sorry.`;

    // Remove and re-add animation class to trigger every time
    errorText.classList.remove("animate-error");
    void errorText.offsetWidth; // this resets animation
    errorText.classList.add("animate-error");

    errorBtn.style.display = "none";
}
}
async function setBackgroundImage(city) {
    const accessKey = "b2LFD-g16zFe3cV8PWOhojjCwouvR7GUWRvWr52pGRE";
    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${city}&client_id=${accessKey}&orientation=landscape`
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            const imageUrl = data.results[0].urls.full;
            const video = document.getElementById("bg-video");
      if (video) video.style.display = "none";
            document.body.style.backgroundImage = `url(${imageUrl})`;
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundPosition = "center";
            document.body.style.backgroundRepeat = "no-repeat";
        }
    } catch (error) {
        console.error("Background image fetch failed:", error);
    }
}
