import * as helpers from "./helpers.js";

const indexName = "Production";
const algoliaClient = algoliasearch("3VY17DELF4", "455080cdf8c3e2f23fd7d106fac363c7");
const searchClient = {
	...algoliaClient,
	search(requests) {
		// Detect empty search requests to prevent search request on every page load
		if (requests.every(({ params }) => !params.query)) {
			return Promise.resolve({
				results: requests.map(() => ({
					hits: [],
					nbHits: 0,
					nbPages: 0,
					page: 0,
					processingTimeMS: 0,
					hitsPerPage: 0,
					exhaustiveNbHits: false,
					query: "",
					params: ""
				}))
			});
		}

		return algoliaClient.search(requests);
	}
};

new Vue({
	el: "#search-app",
	data() {
		return {
			indexName,
			searchClient,
			maxRating: 5,
			defaultImage: "https://d30ec9xstuh8sw.cloudfront.net/nopictureicon.gif",
			routing: {
				stateMapping: {
					// Update URL parameters each time the application state changes
					stateToRoute(uiState) {
						const indexUiState = uiState[indexName];
						return {
							query: indexUiState.query,
							page: indexUiState.page,
							brands:
								indexUiState.refinementList &&
								indexUiState.refinementList.manufacturerName &&
								indexUiState.refinementList.manufacturerName.join("/"),
							category:
								indexUiState.hierarchicalMenu &&
								indexUiState.hierarchicalMenu["categories.lvl0"] &&
								indexUiState.hierarchicalMenu["categories.lvl0"].join("/"),
							// rating: indexUiState.numericMenu && String(indexUiState.numericMenu.avgRating),
							price: indexUiState.range && indexUiState.range.salePrice,
							sortBy: indexUiState.sortBy
							// hitsPerPage: (indexUiState.hitsPerPage && String(indexUiState.hitsPerPage)) || undefined
						};
					},

					// Set application state when the page loads based on URL parameters
					routeToState(routeState) {
						return {
							[indexName]: {
								query: routeState.query,
								page: routeState.page,
								hierarchicalMenu: {
									"categories.lvl0": (routeState.category && routeState.category.split("/")) || undefined
								},
								refinementList: {
									manufacturerName: (routeState.brands && routeState.brands.split("/")) || undefined
								},
								range: {
									salePrice: routeState.price
								},
								// numericMenu: {
								// 	avgRating: (routeState.rating && Number(routeState.rating)) || undefined
								// },
								sortBy: routeState.sortBy
								// hitsPerPage: Number(routeState.hitsPerPage)
							}
						};
					}
				}
			}
		};
	},
	created() {
		this.onKeyUp = event => {
			if (event.key !== "Escape") {
				return;
			}
			this.closeFilters();
		};

		this.onClick = event => {
			if (event.target !== this.header) {
				return;
			}

			this.closeFilters();
		};
	},
	mounted() {
		this.resultsContainer = document.querySelector(".container-results");
		this.header = document.querySelector("#header");
	},
	components: {
		vueSlider: window["vue-slider-component"]
	},
	methods: {
		refineSearch: helpers.debounce((refine, value) => {
			// Wait to search until after the user has stopped typing for 500ms
			refine(value);
		}),
		goToSearchPage(query) {
			location.href = "/search.aspx?query=" + query;
		},
		formatCurrency(value = 0, digits = 2) {
			return new Intl.NumberFormat("en-CA", {
				style: "currency",
				currency: "CAD",
				maximumFractionDigits: digits
			}).format(value);
		},
		formatNumber(value = 0, digits = 0) {
			return Number(value).toLocaleString("en-CA", {
				minimumFractionDigits: digits,
				maximumFractionDigits: digits
			});
		},
		toValue(value, range) {
			return [typeof value.min === "number" ? value.min : range.min, typeof value.max === "number" ? value.max : range.max];
		},
		openFilters() {
			document.body.classList.add("filtering");
			window.scrollTo(0, 0);
			window.addEventListener("keyup", this.onKeyUp);
			window.addEventListener("click", this.onClick);
		},
		closeFilters() {
			document.body.classList.remove("filtering");
			this.resultsContainer.scrollIntoView();
			window.removeEventListener("keyup", this.onKeyUp);
			window.removeEventListener("click", this.onClick);
		},
		getImageSrc(item) {
			return helpers.isProductVariant(item.recordType)
				? helpers.buildProductVariantImageSrc(item)
				: helpers.buildProductImageSrc(item);
		},
		getLinkUrl(item) {
			return helpers.isProductVariant(item.recordType)
				? helpers.buildProductVariantLinkUrl(item)
				: helpers.buildProductLinkUrl(item);
		},
		toDisplayLabel(str) {
			if (str.includes("manufacturername")) return "Brands";
			if (str.includes("avgrating")) return "Rating";
			if (str.includes("categories")) return "Category";
			if (str.includes("price")) return "Price";
		},
		handleImageError(event) {
			event.src = this.defaultImage;
		},
		svgFill(i, rating) {
			return i <= rating ? "#faa100" : "#eee";
		},
		svgColorStop(i, rating) {
			const full = i <= Math.floor(rating);
			const partial = i === Math.floor(rating) + 1;

			if (full) {
				// e.g. If rating is 3.55 then 4 flames will be 100% colored
				return 1;
			} else if (partial) {
				// e.g. If rating is 3.55 then the fourth flame will be 35% colored
				return rating % 1;
			} else {
				// e.g. If rating is 3.55 then the fifth flame will not be filled
				return 0;
			}
		}
	}
});
