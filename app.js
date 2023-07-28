import { OMDBKey } from "./tempData.js";

// Static data
const moviesStaticData = [
    {
        Title: 'Thor: The Dark World',
        Year: '2013',
        imdbID: 'tt1981115',
        Type: 'movie',
        // Poster: 'https://m.media-amazon.com/images/M/MV5BMTQyNzAwOTUxOF5BMl5BanBnXkFtZTcwMTE0OTc5OQ@@._V1_SX300.jpg'
        Poster: './images/item-1.jpg',
    },
    {
        Title: 'World War Z',
        Year: '2013',
        imdbID: 'tt0816711',
        Type: 'movie',
        // Poster: 'https://m.media-amazon.com/images/M/MV5BNDQ4YzFmNzktMmM5ZC00MDZjLTk1OTktNDE2ODE4YjM2MjJjXkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_SX300.jpg'
        Poster: './images/item-2.jpg',
    },
    {
        Title: 'Jurassic World',
        Year: '2015',
        imdbID: 'tt0369610',
        Type: 'movie',
        // Poster: 'https://m.media-amazon.com/images/M/MV5BNzQ3OTY4NjAtNzM5OS00N2ZhLWJlOWUtYzYwZjNmOWRiMzcyXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg'
        Poster: './images/item-3.jpg',
    },
    {
        Title: 'Scott Pilgrim vs. the World',
        Year: '2010',
        imdbID: 'tt0446029',
        Type: 'movie',
        // Poster: 'https://m.media-amazon.com/images/M/MV5BNWI5ODc4MTAtN2U2NC00ZDk3LWE3NjAtNjIyODE2YTlhYjYwXkEyXkFqcGdeQXVyOTA3ODI3NDA@._V1_SX300.jpg'
        Poster: './images/item-4.jpg',
    },
    {
        Title: 'The Lost World: Jurassic Park',
        Year: '1997',
        imdbID: 'tt0119567',
        Type: 'movie',
        // Poster: 'https://m.media-amazon.com/images/M/MV5BMDFlMmM4Y2QtNDg1ZS00MWVlLTlmODgtZDdhYjY5YjdhN2M0XkEyXkFqcGdeQXVyNTI4MjkwNjA@._V1_SX300.jpg'
        Poster: './images/item-5.jpg',
    },
    {
        Title: 'Jurassic World: Fallen Kingdom',
        Year: '2018',
        imdbID: 'tt4881806',
        Type: 'movie',
        // Poster: 'https://m.media-amazon.com/images/M/MV5BNzIxMjYwNDEwN15BMl5BanBnXkFtZTgwMzk5MDI3NTM@._V1_SX300.jpg'
        Poster: './images/item-6.jpg',
    },
    {
        Title: 'Master and Commander: The Far Side of the World',
        Year: '2003',
        imdbID: 'tt0311113',
        Type: 'movie',
        // Poster: 'https://m.media-amazon.com/images/M/MV5BZGRjM2IyM2EtZDAxYi00NTdjLTliMGYtMmRhZGUyNjRjNWYwXkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_SX300.jpg'
        Poster: './images/item-7.jpg',
    },
    {
        Title: 'The World Is Not Enough',
        Year: '1999',
        imdbID: 'tt0143145',
        Type: 'movie',
        // Poster: 'https://m.media-amazon.com/images/M/MV5BMTZiZGY5MjEtNjU3Yi00OGJmLTlkMDAtOGQ5MTY4NDAxMDE0XkEyXkFqcGdeQXVyMTUzMDUzNTI3._V1_SX300.jpg'
        Poster: './images/item-8.jpg',
    },
    {
        Title: 'The End of the F***ing World',
        Year: '2017–2019',
        imdbID: 'tt6257970',
        Type: 'series',
        // Poster: 'https://m.media-amazon.com/images/M/MV5BN2ZhNmQ2MjQtMmQzMi00YjE5LTlkMWMtMjk5YzIxMjk2NDc2XkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg'
        Poster: './images/item-9.jpg',
    },
    {
        Title: 'Jurassic World Dominion',
        Year: '2022',
        imdbID: 'tt8041270',
        Type: 'movie',
        // Poster: 'https://m.media-amazon.com/images/M/MV5BOTBjMjA4NmYtN2RjMi00YWZlLTliYTktOTIwMmNkYjYxYmE1XkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_SX300.jpg'
        Poster: './images/item-10.jpg',
    }
];

const LOCAL_STORAGE_APP_STATE_KEY = "MovieBay.AppState";
const LOCAL_STORAGE_SINGLE_MOVIE_ID_KEY = "MovieBay.SingleMovieId";

// const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_API_KEY = OMDBKey;

let state = {
    pageNumber: 1,
    searchQuery: "",
    searchResults: [],
    category: 'all',
    isShowMoreItemsIcon: true,
    singleItemInfo: {}
}

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
            receivedPage = moviesStaticData;
        } else {
            const data = await res.json();
            console.log("search", data.Search);

            // TODO: Fix this for when 0 results are returned (receivedPage should be equal to []) (This is already being done in the code below the TODO below; find a way to join these two conditions)
            // if (data.Response === 'False') {
            //     console.log("Error: ", data.Error);
            //     displayMovieItems([]);
            // }

            receivedPage = data;
        }
    } catch (error) {
        console.log(error);
        console.log("API not reachable, using dummy data instead");
        receivedPage = moviesStaticData;
    }

    console.log("receivedPage", receivedPage);

    // TODO: Check what happens when requests are made with no internet (causing dummy data to be in <receivedPage>, causing receivedPage.Response to be undefined)
    if (receivedPage.Response === 'False') {
        console.log("Error: ", receivedPage.Error);
        return [];
    } else return receivedPage.Search;
}


const searchMovies = async (searchString) => {
    // If user searches for the same query, do nothing
    if(searchString === state.searchQuery) return;

    // Reset state variable to default values
    state.pageNumber = 1;
    state.searchQuery = searchString;
    state.isShowMoreItemsIcon = true;
    state.category = 'all';

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

    const receivedPage = await singleMoviePageSearch();

    console.log("ReceivedPage ", receivedPage);

    // If less than 10 results were retrieved, no more result pages are available, so don't show more items icon
    if (receivedPage.length < 10) state.isShowMoreItemsIcon = false;

    state.searchResults = receivedPage;
    state.pageNumber++;
    loadingContainer.innerHTML = ``;

    // Store state data in local storage so when user goes back to homepage, the data persists
    window.localStorage.setItem(LOCAL_STORAGE_APP_STATE_KEY, JSON.stringify(state));

    displayMovieItems();
    displayCategoryButtons();
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

    console.log("receivedPage: ", receivedPage);

    if (receivedPage.length < 10) state.isShowMoreItemsIcon = false;

    state.searchResults.push(...receivedPage);
    state.pageNumber++;

    moreItemsLoadingContainer.innerHTML = '';

    // Store updated state data in local storage so when user goes back to homepage, the data persists
    window.localStorage.setItem(LOCAL_STORAGE_APP_STATE_KEY, JSON.stringify(state));

    displayMovieItems();
    displayCategoryButtons();
}


const displayMovieItems = (sortOption = "default") => {
    let movieItems = state.searchResults;

    // If there are no search results, display warning message
    if (movieItems.length === 0) {
        resultsContainer.innerHTML = 'No movies found!';
        return;
    }

    // Filter the items in <movieItems> to only include movies and series
    movieItems = movieItems.filter(item => (item.Type === "movie" || item.Type === "series"));

    // Store in variable <movieItems> only the items matching to the chosen category
    if (state.category !== 'all') {
        movieItems = state.searchResults.filter(item => item.Type === state.category);
        if (movieItems.length === 0) {
            resultsContainer.innerHTML = 'No items in this category!';
            return;
        }
    }

    // Start of changed part
    // console.log(movieItems);

    // if(sortOption !== "default") {
    //     movieItems = movieItems.sort((item1, item2) =>  item1[sortOption] < item2[sortOption]);
    // }

    // console.log(movieItems);

    // End of changed part

    let displayMovie = movieItems.map(item => {
        const itemHTMLString = `<article class="movie-item">
            <a class="clickable-item" href="./singlePage.html" data-id=${item.imdbID}>
                <div class="movie-item-poster-container">
                    <img class="movie-item-poster" src=${item.Poster === 'N/A' ? './images/poster-not-found.png' : item.Poster} alt="${item.Title}">
                </div>
                <div class="item-info">
                    <div>
                        <h3>${item.Title.length > 58 ? (item.Title.substring(0, 55) + '...') : item.Title}</h3>
                        <h4 class="item-info-year">${item.Year}</h4>
                    </div>
                    <p class="item-info-type">${item.Type}</p>
                </div>
            </a>
        </article>`;
        return itemHTMLString;
    })

    displayMovie = displayMovie.join('\n');   // Join all elements together, separated by '\n'
    resultsContainer.innerHTML = displayMovie;

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

    const clickableItems = document.querySelectorAll(".clickable-item");

    // Store the clicked item's id in localStorage, so that the singlePage.html can get it after loading
    const storeLocalStorage = (event) => {
        const itemId = event.currentTarget.dataset.id;
        window.localStorage.setItem(LOCAL_STORAGE_SINGLE_MOVIE_ID_KEY, JSON.stringify(itemId))
    }

    clickableItems.forEach(clickableItem => {
        clickableItem.addEventListener('click', (event) => storeLocalStorage(event))
    })
}


const displayCategoryButtons = () => {
    const movieItems = state.searchResults;
    if (movieItems.length === 0) {
        categoriesContainer.innerHTML = '';
        return;
    }

    let existingCategories = ['all'];
    movieItems.forEach(item => {
        // Gather all categories in an array 
        if ((item.Type === "movie" || item.Type === "series") && !existingCategories.includes(item.Type)) existingCategories.push(item.Type);
    })

    let categoryButtons = existingCategories.map(category => {
        return (`
            <button class="category-button" type="button" data-id=${category}>${category}</button>
        `)
    });

    categoryButtons = categoryButtons.join('\n');
    categoriesContainer.innerHTML = categoryButtons;

    // Only after dynamically adding the buttons to our page we can select the button elements and add a click event to them
    const filterButtons = categoriesContainer.querySelectorAll(".category-button");    // We can get the elements from the more specific selection <categoriesContainer> instead of document

    // Function to display items based on their category (using the dataset property of the received event's element)
    const displayCategoryItems = (event) => {
        state.category = event.currentTarget.dataset.id;
        window.localStorage.setItem(LOCAL_STORAGE_APP_STATE_KEY, JSON.stringify(state));    // Update local storage state to match the new category
        displayMovieItems();
    }

    // Filter items after clicking filter button
    filterButtons.forEach(filterButton => {
        filterButton.addEventListener('click', (event) => displayCategoryItems(event))
    })


     // Start of new part

    // const sortButtonsHTML = `
    //     <div>
    //         <button class="sort-button" type="button" data-id="Title"><i class="fa-solid fa-arrow-up-a-z"></i></button>
    //         <button class="sort-button" type="button" data-id="Year"><i class="fa-solid fa-arrow-up-1-9"></i></button>
    //     </div>
    // `;

    // categoriesContainer.innerHTML = categoriesContainer.innerHTML + '\n' + sortButtonsHTML;

    // const sortButtons = categoriesContainer.querySelectorAll(".sort-button");

    // const sortResults = (event) => {
    //     const sortOption = event.currentTarget.dataset.id;
    //     displayMovieItems(sortOption);
    // }

    // sortButtons.forEach(sortButton => { 
    //     sortButton.addEventListener('click', (event) => sortResults(event))
    // });

    // End of new part
}


const searchMovieById = async () => {
    const movieIdString = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_SINGLE_MOVIE_ID_KEY));
    console.log(movieIdString);

    // If there's state data in local storage, get it before querying API
    const localStorageItem = window.localStorage.getItem(LOCAL_STORAGE_APP_STATE_KEY);
    if (localStorageItem) {
        state = JSON.parse(localStorageItem);
        // If item info is already in state, don't query API again, simply display it
        if (state.singleItemInfo !== {} && movieIdString === state.singleItemInfo.imdbID) {
            displaySinglePageItem();
            return;
        }
    }

    let finalQueryString = 'https://www.omdbapi.com/?apikey=' + OMDB_API_KEY + '&i=' + movieIdString;

    const loadingContainer = document.querySelector(".loading-container");
    const loadingHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading...</p>
    `;

    loadingContainer.innerHTML = loadingHTML;

    const res = await fetch(finalQueryString);
    const data = await res.json();

    loadingContainer.innerHTML = '';

    state.singleItemInfo = data;
    localStorage.setItem(LOCAL_STORAGE_APP_STATE_KEY, JSON.stringify(state));
    displaySinglePageItem();
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
    console.log("item", item);
    if (item.Response === 'False') singleItemHTMLString = `<h3> Item not found </h3>`;
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
                        <span class="single-item-age-rate">${item.Rated}</span>
                        ${itemRuntime !== 'N/A' ? `<span class="single-item-runtime">${itemRuntime}</span>` : ''}
                    </div>
                </div>
                <div class="single-item-header-rating">
                    <h6>IMDb Rating</h6>
                    <div class="single-item-header-rating-info">
                        <i class="fa-solid fa-star"></i>
                        <div class="single-item-header-rating-description">
                            <div class="item-rating-score"><p>${item.imdbRating}</p><span>/10</span></div>
                            <p class="item-rating-votes">${votesNumber}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="single-item-description">
                <img src=${item.Poster} class="single-item-image" alt="${item.Title}">
                <div class="single-item-info">
                    <p class="single-item-text">${item.Plot}</p>
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
                        <p>${item.Actors}</p>
                    </div>
                    <div class="single-item-subtitle">
                        <span><i class="fa-solid fa-award"></i></span>
                        <p>${item.Awards === 'N/A' ? 'No Awards' : item.Awards}</p>
                    </div>
                </div>
            </div>
        </section>`
    }
    singleItemSection.innerHTML = singleItemHTMLString;
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


// Populate page sections with dynamic elements after page loads
window.addEventListener('DOMContentLoaded', () => {
    // Home page logic
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        const searchForm = document.querySelector('.search-form');
        const searchInput = document.querySelector('.search-input');

        // If there's state data in local storage, display it as soon as page is open
        const localStorageItem = window.localStorage.getItem(LOCAL_STORAGE_APP_STATE_KEY);
        if (localStorageItem) {
            state = JSON.parse(localStorageItem);
            displayMovieItems();
            displayCategoryButtons();
        }

        // Add event listener to search movie uppon form submittion
        searchForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const searchName = searchInput.value;
            searchMovies(searchName);
        });

        // Add event listener for toggling scroll up button when user has scrolled down enough
        window.addEventListener('scroll', toggleScrollUpButton);
    }
    // Single item page logic
    else if (window.location.pathname === '/singlePage.html') searchMovieById();
});



// TODO:
//  https://www.youtube.com/watch?v=1VjdxCTBfUI
// - fix all "TODO"s
// - Add sort alphabetically and by year
// - Style app
//      - global: set colors correctly (dark color theme only)
// - Maybe Diferenciate between "Too many results" and "No movies found" error (example query: "hi")
// - See how to deploy vanilla js app to github pages
// - Make app responsive
//      -  Make text in each movie item smaller even from 1200px downwards
// - Hide API in github secrets (which may involve adding webpack and babel to my project)
//  https://www.syncfusion.com/blogs/post/why-and-how-to-use-webpack-and-babel-with-vanilla-js.aspx
//  https://medium.com/@kellydsample/challenge-3-run-a-vanilla-js-project-in-your-browser-with-node-791e124aa2c6
//  https://medium.com/jeremy-gottfrieds-tech-blog/tutorial-how-to-build-a-webpack-app-with-vanilla-js-or-react-72ca2cc7e14
//  https://stackoverflow.com/questions/30239060/uncaught-referenceerror-process-is-not-defined
