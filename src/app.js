import { movieResultsDummyData, singleMovieDummyData } from './data/movieData.js';
import './styles.css';

const LOCAL_STORAGE_APP_STATE_KEY = "MovieBay.AppState";
const OMDB_API_KEY = process.env.OMDB_API_KEY;

let state = {
    appPageShowing: "homepage",
    pageNumber: 1,
    searchQuery: "",
    searchResults: [],
    category: 'all',
    sortOptions: { criteria: "default", direction: "descending" },
    isShowMoreItemsIcon: true,
    singleItemId: "",
    singleItemInfo: {}
}

const homepageContainer = document.querySelector(".homepage-container");
const singlePageContainer = document.querySelector(".single-page-container");

const resultsContainer = document.querySelector(".results-container");
const categoriesContainer = document.querySelector(".categories-container");
const singleItemSection = document.querySelector(".single-item-container");
const scrollUpContainer = document.querySelector(".scroll-up-container");

const singleMoviePageSearch = async () => {
    const movieStringParsed = state.searchQuery.replaceAll(' ', '+');
    const finalQueryString = 'https://www.omdbapi.com/?apikey=' + OMDB_API_KEY + '&s=' + movieStringParsed + '&page=' + state.pageNumber;
    let receivedPage;

    try {
        const res = await fetch(finalQueryString);
        if (res.status === 402 || res.status === 429) {
            console.log("API not reachable, using dummy data instead")
            receivedPage = movieResultsDummyData;
        } else {
            const data = await res.json();

            if (data.Response === 'False') {
                console.log("Error: ", data.Error);
                receivedPage = [];
            } else receivedPage = data.Search;
        }
    } catch (error) {
        // console.log(error);
        console.log("Error: API not reachable, using dummy data instead");
        receivedPage = movieResultsDummyData;
    }

    return receivedPage;
}


const searchMovies = async (searchString) => {
    // Remove focus from form input right after searching for movie
    const searchInput = document.querySelector('.search-input');
    searchInput.blur();

    // If user searches for the same query, do nothing
    if (searchString === "" || searchString === state.searchQuery) return;

    // Reset state variable to default values
    state.pageNumber = 1;
    state.searchQuery = searchString;
    state.isShowMoreItemsIcon = true;
    state.category = 'all';
    state.sortOptions = { criteria: "default", direction: "descending" };

    // Remove previous state data from localStorage
    window.localStorage.removeItem(LOCAL_STORAGE_APP_STATE_KEY);

    const loadingContainer = document.querySelector(".loading-container");
    const loadingHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading...</p>
    `;

    resultsContainer.innerHTML = '';
    categoriesContainer.innerHTML = '';
    loadingContainer.innerHTML = loadingHTML;
    loadingContainer.style.display = 'flex';

    const receivedPage = await singleMoviePageSearch();

    // If less than 10 results were retrieved, no more result pages are available, so don't show more items icon
    if (receivedPage.length < 10) state.isShowMoreItemsIcon = false;

    state.searchResults = receivedPage;
    state.pageNumber++;
    loadingContainer.innerHTML = ``;
    loadingContainer.style.display = 'none';

    // Store state data in local storage so when user refreshes page, the data persists
    window.localStorage.setItem(LOCAL_STORAGE_APP_STATE_KEY, JSON.stringify(state));
    displayAppPage();
}


const searchNextMoviePage = async () => {
    const moreItemsIconElement = document.querySelector(".more-items-container");
    const moreItemsLoadingContainer = document.querySelector(".more_items_loading_container");

    const loadingHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading...</p>
    `;

    moreItemsIconElement.remove();  // Remove more items icon from page
    moreItemsLoadingContainer.innerHTML = loadingHTML;  // Add loading spinner to page

    const receivedPage = await singleMoviePageSearch();

    if (receivedPage.length < 10) state.isShowMoreItemsIcon = false;

    state.searchResults.push(...receivedPage);
    state.pageNumber++;

    moreItemsLoadingContainer.innerHTML = '';

    window.localStorage.setItem(LOCAL_STORAGE_APP_STATE_KEY, JSON.stringify(state));
    displayAppPage();
}


const changeAppPage = () => {
    if (state.appPageShowing === "homepage") {
        homepageContainer.style.display = "flex";
        singlePageContainer.style.display = "none";
    } else if (state.appPageShowing === "singleItem") {
        singlePageContainer.style.display = "block";
        homepageContainer.style.display = "none";
    }
}


const displayAppPage = () => {
    changeAppPage();

    if (state.appPageShowing === "homepage") {
        displayMovieItems();
        displayCategoryButtons();
    } else if (state.appPageShowing === "singleItem") displaySinglePageItem();
}


const displayMovieItems = () => {
    let movieItems = state.searchResults;

    // If there are no search results, display warning message
    if (movieItems.length === 0) {
        resultsContainer.innerHTML = '<div class="error-results-container">No movies found!</div>';
        return;
    }

    // Filter the items in <movieItems> to only include movies and series
    movieItems = movieItems.filter(item => (item.Type === "movie" || item.Type === "series"));

    // Store in variable <movieItems> only the items matching to the chosen category
    if (state.category !== 'all') {
        movieItems = state.searchResults.filter(item => item.Type === state.category);
        if (movieItems.length === 0) {
            resultsContainer.innerHTML = '<div class="error-results-container">No items in this category!</div>';
            return;
        }
    }

    // Sort items in <movieItems> based on state.sortOptions
    const [sortCriteria, sortDirection] = [state.sortOptions.criteria, state.sortOptions.direction];
    if (sortCriteria !== "default") {
        if (sortDirection === "descending") movieItems.sort((item1, item2) => item1[sortCriteria] <= item2[sortCriteria] ? -1 : 1);
        else movieItems.sort((item1, item2) => item1[sortCriteria] <= item2[sortCriteria] ? 1 : -1);
    }

    let displayMovies = movieItems.map(item => {
        const itemHTMLString = `<article class="movie-item">
            <div class="clickable-item" data-id=${item.imdbID}>
                <div class="movie-item-poster-container">
                    <img class="movie-item-poster" src=${item.Poster === 'N/A' ? require('./images/poster-not-found.png') : item.Poster} alt="${item.Title}">
                </div>
                <div class="item-info">
                    <div>
                        <h3>${item.Title.length > 55 ? (item.Title.substring(0, 53) + '...') : item.Title}</h3>
                        <h4 class="item-info-year">${item.Year}</h4>
                    </div>
                    <p class="item-info-type">${item.Type}</p>
                </div>
            </div>
        </article>`;
        return itemHTMLString;
    })

    displayMovies = displayMovies.join('\n');   // Join all elements together, separated by '\n'
    resultsContainer.innerHTML = displayMovies;

    // If user is in category "all", show the "+" (more items) icon and set an observer on it to query the API for one more page of items when the icon gets into view
    if (state.isShowMoreItemsIcon && state.category === 'all') {
        const moreItemsIcon = `
            <div class="more-items-wrapper">
                <div class="more-items-container">
                    <i class="fa-solid fa-plus"></i>
                </div>
            </div>
        `;
        resultsContainer.innerHTML = resultsContainer.innerHTML + '\n' + moreItemsIcon;

        const moreItemsIconElement = document.querySelector(".more-items-container");

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) searchNextMoviePage();
        }, { threshold: 1.0 }); // The threshold option parameter allows us to specific the percentage of the element's body that needs to be visible to trigger the function (1.0 is 100%)
        if (moreItemsIconElement) observer.observe(moreItemsIconElement);
    }

    // If poster image can't be found, load the default poster image instead
    const loadErrorImage = (event) => {
        const image = event.target;
        image.removeEventListener('error', loadErrorImage);
        image.src = require('./images/poster-not-found.png');
    }
    const imageElements = resultsContainer.querySelectorAll('img');
    imageElements.forEach(image => image.addEventListener('error', loadErrorImage));

    const clickableItems = document.querySelectorAll(".clickable-item");
    // Store the clicked item's id in state and load single item page
    const getSingleItemPage = (event) => {
        const itemId = event.currentTarget.dataset.id;
        state.singleItemId = itemId;
        state.appPageShowing = "singleItem";

        if (state.singleItemInfo !== {} && state.singleItemId === state.singleItemInfo.imdbID) {
            // Store state data in local storage before returning out of the function
            window.localStorage.setItem(LOCAL_STORAGE_APP_STATE_KEY, JSON.stringify(state));
            displayAppPage();
            return;
        }

        state.singleItemInfo = {};
        singleItemSection.innerHTML = '';
        changeAppPage();

        // Store state data in local storage so when user refreshes app, the data persists
        window.localStorage.setItem(LOCAL_STORAGE_APP_STATE_KEY, JSON.stringify(state));
        searchMovieById();
    }

    clickableItems.forEach(clickableItem => {
        clickableItem.addEventListener('click', (event) => getSingleItemPage(event))
    })
}


const displayCategoryButtons = () => {
    const movieItems = state.searchResults;
    if (movieItems.length === 0) {
        categoriesContainer.innerHTML = '';
        return;
    }

    let existingCategories = ['all'];
    for (let i = 0; i < movieItems.length; i++) {
        const item = movieItems[i];
        // Gather all categories in an array 
        if ((item.Type === "movie" || item.Type === "series") && !existingCategories.includes(item.Type)) {
            existingCategories.push(item.Type);
            // If there's already both categories in the array, stop looping for performance improvement
            if (existingCategories.includes("movie") && existingCategories.includes("series")) break;
        }
    }

    let categoryButtons = existingCategories.map(category => {
        return (`
            <button class="category-button ${state.category === category ? 'category-button-active' : ''}" type="button" data-id=${category}>${category}</button>
        `)
    });
    categoryButtons = categoryButtons.join('\n');

    const sortButtonsHTML = `
        <div class="sort-buttons-container">
            <button class="sort-button ${state.sortOptions.criteria === "Title" ? 'sort-button-active' : ''}" type="button" data-id="Title">
                ${(state.sortOptions.criteria === "Title" && state.sortOptions.direction === "ascending") ? '<i class="fa-solid fa-arrow-up-z-a"></i>' : '<i class="fa-solid fa-arrow-up-a-z"></i>'}
            </button>
            <button class="sort-button ${state.sortOptions.criteria === "Year" ? 'sort-button-active' : ''}" type="button" data-id="Year">
                ${(state.sortOptions.criteria === "Year" && state.sortOptions.direction === "ascending") ? '<i class="fa-solid fa-arrow-up-9-1"></i>' : '<i class="fa-solid fa-arrow-up-1-9"></i>'}
            </button>
        </div>
    `;

    categoriesContainer.innerHTML = categoryButtons + '\n' + sortButtonsHTML;

    // Only after dynamically adding the buttons to our page we can select the button elements and add a click event to them
    const filterButtons = categoriesContainer.querySelectorAll(".category-button");

    // Function to display items based on their category (using the dataset property of the received event's element)
    const displayCategoryItems = (event) => {
        state.category = event.currentTarget.dataset.id;
        window.localStorage.setItem(LOCAL_STORAGE_APP_STATE_KEY, JSON.stringify(state));    // Update local storage state to match the new category
        displayAppPage();
    }

    // Filter items after clicking filter button
    filterButtons.forEach(filterButton => {
        filterButton.addEventListener('click', (event) => displayCategoryItems(event))
    })

    const sortButtons = categoriesContainer.querySelectorAll(".sort-button");

    const sortResults = (event) => {
        const sortCriteria = event.currentTarget.dataset.id;
        if (sortCriteria !== state.sortOptions.criteria) state.sortOptions = { criteria: sortCriteria, direction: "descending" };
        else if (state.sortOptions.direction === "descending") state.sortOptions = { ...state.sortOptions, direction: "ascending" };
        else state.sortOptions = { ...state.sortOptions, criteria: "default" };

        window.localStorage.setItem(LOCAL_STORAGE_APP_STATE_KEY, JSON.stringify(state));    // Update local storage state to match the new sort options
        displayAppPage();
    }

    sortButtons.forEach(sortButton => {
        sortButton.addEventListener('click', (event) => sortResults(event))
    });
}


const searchMovieById = async () => {
    const movieIdString = state.singleItemId;
    let finalQueryString = 'https://www.omdbapi.com/?apikey=' + OMDB_API_KEY + '&i=' + movieIdString;

    const loadingContainer = document.querySelector(".loading-container-single-item-page");
    const loadingHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading...</p>
    `;
    loadingContainer.innerHTML = loadingHTML;
    loadingContainer.style.display = 'flex';

    let receivedData;
    try {
        const res = await fetch(finalQueryString);
        if (res.status === 402 || res.status === 429) {
            console.log("API not reachable, using dummy data instead")
            receivedData = singleMovieDummyData;
        } else {
            const data = await res.json();

            if (data.Response === 'False') {
                console.log("Error: ", data.Error);
                receivedData = {};
            } else receivedData = data;
        }
    } catch (error) {
        // console.log(error);
        console.log("Error: API not reachable, using dummy data instead");
        receivedData = singleMovieDummyData;
    }

    loadingContainer.innerHTML = '';
    loadingContainer.style.display = 'none';
    state.singleItemInfo = receivedData;
    localStorage.setItem(LOCAL_STORAGE_APP_STATE_KEY, JSON.stringify(state));
    displayAppPage();
}


const parseRuntimeString = (runtimeString) => {
    let runtimeNumber = Number(runtimeString.substring(0, runtimeString.indexOf(" ")));

    if (runtimeNumber < 60) return runtimeString;
    else {
        let runtimeHours = 0;
        while (runtimeNumber >= 60) {
            runtimeHours++;
            runtimeNumber = runtimeNumber - 60;
        }
        const parsedRuntimeString = runtimeHours + "h " + runtimeNumber + "min";
        return parsedRuntimeString;
    }
}


// Function to compact number of votes into 4 character string
const parseVotesNumber = (votesNumber) => {
    var s = ["", "k", "M", "B"]; // Array with number suffixes
    if (votesNumber > 10000000000) return ">10B";

    let counter = 0;
    while (votesNumber > 999) {
        const value = votesNumber / 1000;
        if (value < 10) votesNumber = Math.trunc(value * 10) / 10; // Prevent rounding number up
        else votesNumber = Math.floor(value);
        counter++;
    }
    return votesNumber + s[counter];
};


const displaySinglePageItem = () => {
    const item = state.singleItemInfo;
    let singleItemHTMLString;
    if (Object.keys(item).length === 0) singleItemHTMLString = `<div class="error-single-item-container">Item not found</div>`;
    else {
        let itemRuntime = item.Runtime;
        if (itemRuntime !== "N/A") itemRuntime = parseRuntimeString(item.Runtime);
        const votesNumberString = item.imdbVotes.replace(',', '');
        const votesNumber = parseVotesNumber(votesNumberString);

        singleItemHTMLString = `<section class="single-item-section">
            <div class="single-item-header">
                <div class="single-item-header-info">
                    <h2>${item.Title.length >= 68 ? (item.Title.substring(0, 65) + '...') : item.Title}</h2>
                    <div class="single-item-header-details">
                        <span class="single-item-type">${item.Type}</span>
                        <span class="single-item-year">${item.Year}</span>
                        <span class="single-item-age-rate">${item.Rated !== "N/A" ? item.Rated : "Not Rated"}</span>
                        ${itemRuntime !== 'N/A' ? `<span class="single-item-runtime">${itemRuntime}</span>` : ''}
                    </div>
                </div>
                <div class="single-item-header-rating">
                    <h6>IMDb Rating</h6>
                    <div class="single-item-header-rating-info">
                        <i class="fa-solid fa-star"></i>
                        <div class="single-item-header-rating-description">
                            <div class="item-rating-score"><p>${item.imdbRating !== "N/A" ? item.imdbRating : '-'}</p><span>/10</span></div>
                            <p class="item-rating-votes">${votesNumber !== "N/A" ? votesNumber : '-'}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="single-item-description">
                <img src=${item.Poster} class="single-item-image" alt="${item.Title}">
                <div class="single-item-info">
                    <p class="single-item-text">${item.Plot !== "N/A" ? (item.Plot.length > 230 ? item.Plot.substring(0, 227) + '...' : item.Plot) : "(No synopsis)"}</p>
                    <div class="single-item-genres">
                        ${item.Genre.split(',').map(genre => `<p>${genre.trim()}</p>`).join('\n')}
                    </div>
                    ${item.Director !== 'N/A' ? `<div class="single-item-subtitle">
                        <span>Director${item.Director.search(',') !== -1 ? 's' : ''}</span>
                        <p>${item.Director}</p>
                    </div>` : ''}
                    ${item.Writer !== 'N/A' ? `<div class="single-item-subtitle">
                        <span>Writer${item.Writer.search(',') !== -1 ? 's' : ''}</span>
                        <p>${item.Writer}</p>
                    </div>` : ''}
                    <div class="single-item-subtitle">
                        <span>Actor${item.Actors.search(',') !== -1 ? 's' : ''}</span>
                        <p>${item.Actors !== "N/A" ? item.Actors : '-'}</p>
                    </div>
                    <div class="single-item-subtitle single-item-subtitle-awards">
                        <span><i class="fa-solid fa-award"></i></span>
                        <p>${item.Awards === 'N/A' ? 'No Awards' : item.Awards}</p>
                    </div>
                </div>
            </div>
        </section>`
    }
    singleItemSection.innerHTML = singleItemHTMLString;

    // If poster image can't be found, load the default poster image instead
    const loadErrorImage = (event) => {
        const image = event.target;
        image.removeEventListener('error', loadErrorImage);
        image.src = require('./images/poster-not-found.png');
    }
    const imageElements = singleItemSection.querySelectorAll('img');
    imageElements.forEach(image => image.addEventListener('error', loadErrorImage));
}


const toggleScrollUpButton = () => {
    if (window.scrollY > window.innerHeight) {
        const scrollUpContainerHTML = `<button class="back-to-top">
            <i class="fa-solid fa-turn-up"></i>
        </button>`;
        if (scrollUpContainer.innerHTML === scrollUpContainerHTML) return;
        scrollUpContainer.innerHTML = scrollUpContainerHTML
        scrollUpContainer.addEventListener("click", () => window.scrollTo(0, 0));
    } else scrollUpContainer.innerHTML = '';
}


// Right after page loads, add event listener and, if necessary, populate page sections with existing data from local storage
window.addEventListener('DOMContentLoaded', () => {
    // If there's state data in local storage, display it as soon as page is open
    const localStorageItem = window.localStorage.getItem(LOCAL_STORAGE_APP_STATE_KEY);
    if (localStorageItem) {
        state = JSON.parse(localStorageItem);
        displayAppPage();
    }

    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');
   
    // Add event listener to search movie upon form submittion
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const searchName = searchInput.value;
        searchMovies(searchName);
    });

    // When user clicks back button, go back to homepage
    const backButton = document.querySelector(".back-button-link");
    const handleBackButton = () => {
        state.appPageShowing = "homepage";

        // Store state data in local storage so when user refreshes app, the data persists
        window.localStorage.setItem(LOCAL_STORAGE_APP_STATE_KEY, JSON.stringify(state));
        displayAppPage();
    }
    backButton.addEventListener('click', handleBackButton);

    // Add event listener for toggling scroll up button when user has scrolled down enough
    window.addEventListener('scroll', toggleScrollUpButton);

    // Set <minHeight> of app_container dynamically upon resize
    const handleResize = () => {
        const appContainerElement = document.querySelector(".app_container");
        if (appContainerElement) appContainerElement.style.minHeight = `${window.innerHeight}px`;
    }
    window.addEventListener('resize', handleResize);
    handleResize();
});
