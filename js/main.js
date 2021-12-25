const form = document.querySelector(`#formJoke`),
	jokeContainer = document.querySelector(`#jokeContainer`),
	categoriesType = document.querySelector(`#categpriesType`),
	jokeCategories = document.querySelectorAll(`input[name="jokeType"]`),
	categoriesList = document.querySelector(`#categoriesList`),
	searchJoke = document.querySelector(`#searchJoke`),
	favoriteJokes = document.querySelector(`#jokesFav`),
	DOMAIN = `https://api.chucknorris.io`;

const getCategoriesList = () => {
	let xhr = new XMLHttpRequest();
	xhr.open(`GET`, `${DOMAIN}/jokes/categories`);
	xhr.send();

	xhr.addEventListener(`readystatechange`, () => {
		if(xhr.readyState === 4 && xhr.status === 200){
			let categories = JSON.parse(xhr.responseText); 
			renderCategoriesList(categories);
		}
	})
}
getCategoriesList();

const renderCategoriesList = data => {
	let renderLI = data.map((cat,index) => {
		if(index<5){
			return `<li class="categories__list-li">
						<label for="categoryList${cat}">
							${cat.toUpperCase()}
							<input class="input__list" type="radio" value="${cat}" name="categoryList" id="categoryList${cat}" ${!index ? 'checked' : ''} data-index="${index}">
						</label>
					</li>`;
		}
	})
	.join(``);
	categoriesList.innerHTML = renderLI;
}

jokeCategories.forEach(input => {
	input.addEventListener(`change`, ()=>{
		input.id === `categoriesType` ? categoriesList.classList.add(`show`) : categoriesList.classList.remove(`show`);
		let categoriesLI = categoriesList.querySelectorAll(`.categories__list-li`);
		categoriesLI.forEach((e, index) => {
			index === 0 ? e.classList.add(`pressed`) : ``
			e.addEventListener(`click`, () => {
				currentPressed = document.querySelector('.pressed');
				currentPressed && currentPressed.classList.remove(`pressed`);
				e.classList.add(`pressed`);
			});
		});

		input.id === `categoriesSearch` ? searchJoke.classList.add(`show`) : searchJoke.classList.remove(`show`);

	});
});

class Render {
	constructor(el){
		this.getFavJoke();
		el.addEventListener(`submit`, e => {
			e.preventDefault();
			this.submitForm();
		});
	}

	getJoke = url => {
		let xhr = new XMLHttpRequest();
		xhr.open(`GET`, url);
		xhr.send();

		xhr.addEventListener(`readystatechange`, () => {
			if(xhr.readyState === 4 && xhr.status === 200){
				let joke = JSON.parse(xhr.responseText);

				jokeContainer.innerHTML = '';
				if(joke.result && joke.result.length){
					joke.result.forEach(joke => this.renderJoke(joke, jokeContainer, true));
				} else if(!joke.result) {
					this.renderJoke(joke, jokeContainer);
				}
			}
		});
	}

	submitForm = () => {
		let type = form.querySelector(`input[name="jokeType"]:checked`).value;

		if(type === 'random'){
			this.getJoke(`${DOMAIN}/jokes/random`);
		} else if (type === `categories`){
			let cat = categoriesList.querySelector(`input[name="categoryList"]:checked`).value;
			this.getJoke(`${DOMAIN}/jokes/random?category=${cat.toLowerCase()}`);
		} else if(type === `search`){
			this.getJoke(`${DOMAIN}/jokes/search?query=${searchJoke.value}`);
		}
	}

	getLocalJokes = () => {
		let favJokes = localStorage.getItem(`favJokes`);
		return favJokes ? JSON.parse(favJokes) : new Array();
	}

	setLocalJokes = arr => {
		localStorage.setItem(`favJokes`, JSON.stringify(arr));
	}

	getFavJoke = () => {
		favoriteJokes.innerHTML = ``;
		let localStorageJokes = this.getLocalJokes();
		localStorageJokes.forEach(joke => this.renderJoke(joke, favoriteJokes, `checked`, true))
	}

	renderJoke = (jokeData, container, checked=``, multiply=false) => {

		let favBlock = document.createElement(`div`);
		favBlock.classList.add(`joke__block-fav`);
		favBlock.innerHTML = `<label for="jokeFav${jokeData.id}" class="joke__label" id="favBtn">
								<input type="checkbox" name="favBtn" id="jokeFav${jokeData.id}" class="joke__block--input" ${checked}>
							</label>`;
		let jokeFav = favBlock.querySelector(`input[name="favBtn"]`);
		jokeFav.addEventListener(`change`, ()=>{

			let localJokes = this.getLocalJokes();

			 if(checked === `checked`){
			 	let favJokeIndex = localJokes.findIndex(localJokes => localJokes.id === jokeData.id)
			 	localJokes.splice(favJokeIndex, 1);
			 	this.setLocalJokes(localJokes);
			 	this.getFavJoke();
			 } else {
			 	let existJoke = localJokes.find(localJokes => localJokes.id === jokeData.id);
				!existJoke && localJokes.push(jokeData) && this.setLocalJokes(localJokes);
				!existJoke && this.getFavJoke();
			 }
		})

		let jokeBlock = document.createElement(`div`);
		jokeBlock.classList.add(`joke__block`);
		jokeBlock.innerHTML += `<div class="joke__block-container">
									<img src="${jokeData.icon_url}" class="joke__icon" alt="joke icon" width="30" height="30" loading="lazy">
									<div class="joke__body">
										<p class="joke__block--id">ID:<a href="${jokeData.url}" target="_blank"> ${jokeData.id}</a></p>
										<p class="joke__block--text">${jokeData.value}</p>
									</div>
								</div>

								<div class="joke__block-footer">
									<p class="joke__block--date">${jokeData.updated_at}</p>
									${jokeData.categories.length ? `<p class="joke__categorie">${jokeData.categories[0].toUpperCase()}</p>` : ``}
								</div>`;

		jokeBlock.prepend(favBlock);

		if(multiply){
			container.append(jokeBlock);
		} else {
			container.prepend(jokeBlock);
		}
	}
}

let finalRender = new Render(form);

















