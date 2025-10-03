import { createContext, useContext, useEffect } from "react";
import { useReducer } from "react";

const BASE_URL = "http://localhost:8000";

// STEP 1: First Create a new Context and context is a Component
const CitiesContext = createContext();

const initialState = {
	cities: [],
	isLoading: false,
	currentCity: {},
	error: "",
};

function reducer(state, action) {
	switch (action.type) {
		case "loading":
			return { ...state, isLoading: true };

		case "cities/loaded":
			return {
				...state,
				isLoading: false,
				cities: action.payload,
			};

		case "city/loaded":
			return { ...state, isLoading: false, currentCity: action.payload };

		case "cities/created":
			return {
				...state,
				isLoading: false,
				cities: [...state.cities, action.payload],
				currentCity: action.payload,
			};

		case "cities/deleted":
			return {
				...state,
				isLoading: false,
				cities: state.cities.filter(
					(city) => city.id !== action.payload
				),
				currentCity: {},
			};

		case "rejected":
			return { ...state, error: action.payload, isLoading: false };

		default:
			throw new Error("Unknown Action");
	}
}

function CitiesProvider({ children }) {
	const [{ cities, isLoading, currentCity }, dispatch] = useReducer(
		reducer,
		initialState
	);

	useEffect(function () {
		async function fetchCities() {
			dispatch({ type: "loading" });
			try {
				const res = await fetch(`${BASE_URL}/cities`);
				const data = await res.json();
				dispatch({ type: "cities/loaded", payload: data });
			} catch (err) {
				dispatch({
					type: "rejected",
					payload: "There is an error loading cities",
				});
			}
		}
		fetchCities();
	}, []);

	async function getCity(id) {
		if (Number(id) === currentCity.id) return;

		dispatch({ type: "loading" });
		try {
			const res = await fetch(`${BASE_URL}/cities/${id}`);
			const data = await res.json();
			dispatch({ type: "city/loaded", payload: data });
		} catch (error) {
			dispatch({
				type: "rejected",
				payload: "There is an error loading city",
			});
		}
	}

	async function createCity(newCity) {
		dispatch({ type: "loading" });
		try {
			const res = await fetch(`${BASE_URL}/cities/`, {
				method: "POST",
				body: JSON.stringify(newCity),
				headers: {
					"Content-Type": "application/json",
				},
			});
			const data = await res.json();
			dispatch({ type: "cities/created", payload: data });
		} catch (error) {
			dispatch({
				type: "rejected",
				payload: "There is an error creating city",
			});
		}
	}

	async function deleteCity(id) {
		dispatch({ type: "loading" });

		try {
			await fetch(`${BASE_URL}/cities/${id}`, {
				method: "DELETE",
			});
			dispatch({ type: "cities/deleted", payload: id });
		} catch (error) {
			dispatch({
				type: "rejected",
				payload: "There is an error deleting city",
			});
		}
	}

	return (
		<CitiesContext.Provider
			value={{
				cities,
				isLoading,
				currentCity,
				getCity,
				createCity,
				deleteCity,
			}}
		>
			{children}
		</CitiesContext.Provider>
	);
}

function useCities() {
	const context = useContext(CitiesContext);

	if (context === undefined)
		throw new Error("Cities Context was used OutSide the CitiesProvider");

	return context;
}

export { CitiesProvider, useCities };
